import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  calcRankByTotalCharged,
  getRankSetting,
  getRankSettings,
  listRanksUpTo,
} from "@/lib/rewards/rank-settings";

type PaymentMethod =
  | "CREDIT_CARD"
  | "CONVENIENCE_STORE"
  | "BANK_TRANSFER"
  | "PAYPAY";

export interface CompleteChargeInput {
  tenantId: string;
  userId: string;
  planId: string;
  chargeOrderId?: string;
  paymentMethod?: PaymentMethod;
  externalPaymentId?: string;
  metadata?: Record<string, unknown>;
}

export type CompleteChargeResult =
  | {
      alreadyCompleted: true;
      newBalance: number;
      newMiles: number;
      rank: string;
    }
  | {
      alreadyCompleted: false;
      orderId: string;
      chargedCoins: number;
      rankCoinReturn: number;
      grantedMiles: number;
      newBalance: number;
      newMiles: number;
      rank: string;
    };

export async function completeCharge(
  input: CompleteChargeInput,
): Promise<CompleteChargeResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: input.userId, tenantId: input.tenantId },
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
        id: input.planId,
        tenantId: input.tenantId,
        isActive: true,
      },
    });

    if (!plan) {
      throw new Error("チャージプランが見つかりません");
    }

    const alreadyCompletedChargeCount = await tx.chargeOrder.count({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        status: "COMPLETED",
      },
    });

    if (plan.firstTimeOnly && alreadyCompletedChargeCount > 0) {
      throw new Error("このプランは初回チャージ限定です");
    }

    let order = input.chargeOrderId
      ? await tx.chargeOrder.findFirst({
          where: {
            id: input.chargeOrderId,
            userId: input.userId,
            tenantId: input.tenantId,
          },
        })
      : null;

    if (!order && input.externalPaymentId) {
      order = await tx.chargeOrder.findFirst({
        where: {
          stripeSessionId: input.externalPaymentId,
          userId: input.userId,
          tenantId: input.tenantId,
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
          tenantId: input.tenantId,
          userId: input.userId,
          chargePlanId: plan.id,
          coins: plan.coins,
          amount: plan.price,
          bonus: plan.bonus,
          status: "PENDING",
          paymentMethod: input.paymentMethod ?? "CREDIT_CARD",
          stripeSessionId: input.externalPaymentId,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    }

    const settings = await getRankSettings(tx, input.tenantId);
    const currentRank = calcRankByTotalCharged(user.totalCharged, settings);
    const currentRankSetting = getRankSetting(settings, currentRank);

    const rankCoinReturn = Math.floor(
      plan.coins * (currentRankSetting?.coinReturnRate ?? 0),
    );
    const chargeMileGrant = Math.floor(
      plan.coins * (currentRankSetting?.mileReturnRate ?? 0),
    );
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
        tenantId: input.tenantId,
        userId: input.userId,
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
          tenantId: input.tenantId,
          userId: input.userId,
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
          tenantId: input.tenantId,
          userId: input.userId,
          rank,
        },
        select: { id: true },
      });

      if (exists) continue;

      rollingCoinBalance += setting.rankUpBonus;

      await tx.userRankBonusGrant.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          rank,
          amount: setting.rankUpBonus,
          reason: "RANK_UP",
        },
      });

      await tx.coinTransaction.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
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
        tenantId: input.tenantId,
        invitedUserId: input.userId,
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
              tenantId: input.tenantId,
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
              tenantId: input.tenantId,
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

        if (invited.id === input.userId) {
          rollingMileBalance = invitedNewMiles;
        }
      }
    }

    await tx.chargeOrder.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        paymentMethod: input.paymentMethod ?? order.paymentMethod,
        metadata: ({
          ...((order.metadata &&
            typeof order.metadata === "object" &&
            !Array.isArray(order.metadata)
            ? order.metadata
            : {}) as Record<string, unknown>),
          ...(input.metadata ?? {}),
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
}
