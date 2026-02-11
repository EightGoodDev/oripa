import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import {
  calcRankByTotalCharged,
  getRankSetting,
  getRankSettings,
  listRanksUpTo,
} from "@/lib/rewards/rank-settings";

const completeSchema = z.object({
  planId: z.string().min(1),
  chargeOrderId: z.string().min(1).optional(),
  paymentMethod: z.enum(["CREDIT_CARD", "CONVENIENCE_STORE", "BANK_TRANSFER", "PAYPAY"]).optional(),
  externalPaymentId: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;
  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, tenantId },
        select: {
          id: true,
          coins: true,
          miles: true,
          rank: true,
          totalCharged: true,
        },
      });

      if (!user) {
        throw new Error("ユーザーが見つかりません");
      }

      const plan = await tx.chargePlan.findFirst({
        where: {
          id: data.planId,
          tenantId,
          isActive: true,
        },
      });

      if (!plan) {
        throw new Error("チャージプランが見つかりません");
      }

      const alreadyCompletedChargeCount = await tx.chargeOrder.count({
        where: {
          tenantId,
          userId,
          status: "COMPLETED",
        },
      });

      if (plan.firstTimeOnly && alreadyCompletedChargeCount > 0) {
        throw new Error("このプランは初回チャージ限定です");
      }

      let order = data.chargeOrderId
        ? await tx.chargeOrder.findFirst({
            where: {
              id: data.chargeOrderId,
              userId,
              tenantId,
            },
          })
        : null;

      if (!order && data.externalPaymentId) {
        order = await tx.chargeOrder.findFirst({
          where: {
            stripeSessionId: data.externalPaymentId,
            userId,
            tenantId,
          },
        });
      }

      if (order?.status === "COMPLETED") {
        return {
          alreadyCompleted: true,
          newBalance: user.coins,
          newMiles: user.miles,
          rank: user.rank,
        };
      }

      if (!order) {
        order = await tx.chargeOrder.create({
          data: {
            tenantId,
            userId,
            chargePlanId: plan.id,
            coins: plan.coins,
            amount: plan.price,
            bonus: plan.bonus,
            status: "PENDING",
            paymentMethod: data.paymentMethod ?? "CREDIT_CARD",
            stripeSessionId: data.externalPaymentId,
            metadata: data.metadata as Prisma.InputJsonValue | undefined,
          },
        });
      }

      const settings = await getRankSettings(tx, tenantId);
      const currentRank = calcRankByTotalCharged(user.totalCharged, settings);
      const currentRankSetting = getRankSetting(settings, currentRank);

      const rankCoinReturn = Math.floor(plan.coins * (currentRankSetting?.coinReturnRate ?? 0));
      const chargeMileGrant = Math.floor(plan.coins * (currentRankSetting?.mileReturnRate ?? 0));
      const chargeCoinGrant = plan.coins + plan.bonus + rankCoinReturn;

      const totalChargedAfter = user.totalCharged + plan.price;
      const recalculatedRank = calcRankByTotalCharged(totalChargedAfter, settings);

      let rollingCoinBalance = user.coins + chargeCoinGrant;
      let rollingMileBalance = user.miles + chargeMileGrant;

      await tx.user.update({
        where: { id: user.id },
        data: {
          coins: rollingCoinBalance,
          miles: rollingMileBalance,
          totalCharged: totalChargedAfter,
          rank: recalculatedRank,
        },
      });

      await tx.coinTransaction.create({
        data: {
          tenantId,
          userId,
          amount: chargeCoinGrant,
          balance: rollingCoinBalance,
          type: "CHARGE",
          description: `チャージ: ${plan.price.toLocaleString()}円`,
          referenceId: order.id,
        },
      });

      if (chargeMileGrant > 0) {
        await tx.mileageTransaction.create({
          data: {
            tenantId,
            userId,
            amount: chargeMileGrant,
            balance: rollingMileBalance,
            type: "CHARGE_MILE",
            description: `チャージによるマイル付与 (${(currentRankSetting?.mileReturnRate ?? 0) * 100}%)`,
            referenceId: order.id,
          },
        });
      }

      const reachableRanks = listRanksUpTo(recalculatedRank);
      for (const rank of reachableRanks) {
        if (rank === "BEGINNER") continue;

        const setting = settings.find((row) => row.rank === rank);
        if (!setting || setting.rankUpBonus <= 0) continue;

        const exists = await tx.userRankBonusGrant.findFirst({
          where: {
            tenantId,
            userId,
            rank,
          },
          select: { id: true },
        });

        if (exists) continue;

        rollingCoinBalance += setting.rankUpBonus;

        await tx.userRankBonusGrant.create({
          data: {
            tenantId,
            userId,
            rank,
            amount: setting.rankUpBonus,
            reason: "RANK_UP",
          },
        });

        await tx.coinTransaction.create({
          data: {
            tenantId,
            userId,
            amount: setting.rankUpBonus,
            balance: rollingCoinBalance,
            type: "BONUS",
            description: `${rank}ランクアップボーナス`,
            referenceId: order.id,
          },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          coins: rollingCoinBalance,
        },
      });

      const inviteLink = await tx.inviteLink.findFirst({
        where: {
          tenantId,
          invitedUserId: userId,
        },
      });

      if (
        inviteLink &&
        !inviteLink.firstChargeRewardedAt &&
        alreadyCompletedChargeCount === 0
      ) {
        const reward = 250;

        const [inviter, invited] = await Promise.all([
          tx.user.findUnique({
            where: { id: inviteLink.inviterId },
            select: { id: true, miles: true },
          }),
          tx.user.findUnique({
            where: { id: inviteLink.invitedUserId },
            select: { id: true, miles: true },
          }),
        ]);

        if (inviter && invited) {
          const inviterNewMiles = inviter.miles + reward;
          const invitedNewMiles = invited.miles + reward;

          await Promise.all([
            tx.user.update({
              where: { id: inviter.id },
              data: { miles: inviterNewMiles },
            }),
            tx.user.update({
              where: { id: invited.id },
              data: { miles: invitedNewMiles },
            }),
            tx.mileageTransaction.create({
              data: {
                tenantId,
                userId: inviter.id,
                amount: reward,
                balance: inviterNewMiles,
                type: "INVITE_FIRST_CHARGE_BONUS",
                description: "招待ユーザーの初回チャージ達成",
                referenceId: inviteLink.id,
              },
            }),
            tx.mileageTransaction.create({
              data: {
                tenantId,
                userId: invited.id,
                amount: reward,
                balance: invitedNewMiles,
                type: "INVITE_FIRST_CHARGE_BONUS",
                description: "招待経由で初回チャージ達成",
                referenceId: inviteLink.id,
              },
            }),
            tx.inviteLink.update({
              where: { id: inviteLink.id },
              data: { firstChargeRewardedAt: new Date() },
            }),
          ]);

          if (invited.id === userId) {
            rollingMileBalance = invitedNewMiles;
          }
        }
      }

      await tx.chargeOrder.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          paymentMethod: data.paymentMethod ?? order.paymentMethod,
          metadata: ({
            ...((order.metadata &&
              typeof order.metadata === "object" &&
              !Array.isArray(order.metadata)
              ? order.metadata
              : {}) as Record<string, unknown>),
            ...(data.metadata ?? {}),
          }) as Prisma.InputJsonValue,
        },
      });

      return {
        alreadyCompleted: false,
        orderId: order.id,
        chargedCoins: chargeCoinGrant,
        rankCoinReturn,
        grantedMiles: chargeMileGrant,
        newBalance: rollingCoinBalance,
        newMiles: rollingMileBalance,
        rank: recalculatedRank,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "チャージ完了処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
