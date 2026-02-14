import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { prisma } from "@/lib/db/prisma";
import { getStripeServerClient } from "@/lib/payments/stripe";
import {
  mergeChargeRefundSummary,
  parseChargeRefundSummary,
} from "@/lib/payments/refund-metadata";
import { calcRankByTotalCharged, getRankSettings } from "@/lib/rewards/rank-settings";

const refundSchema = z.object({
  amount: z.coerce.number().int().min(1).optional(),
  reason: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
});

function prorateRevocation(
  totalGranted: number,
  orderAmount: number,
  refundAmount: number,
  alreadyRevoked: number,
  isFinalRefund: boolean,
) {
  const remainingGrant = Math.max(totalGranted - alreadyRevoked, 0);
  if (remainingGrant === 0) return 0;
  if (isFinalRefund) return remainingGrant;

  const prorated = Math.floor((totalGranted * refundAmount) / orderAmount);
  return Math.max(0, Math.min(remainingGrant, prorated));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const adminId = session.user.id;
  const tenantId = session.user.tenantId;
  const { id } = await params;

  const parsed = refundSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const order = await prisma.chargeOrder.findFirst({
    where: { id, tenantId },
    include: {
      user: {
        select: {
          id: true,
          coins: true,
          miles: true,
          totalCharged: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "決済データが見つかりません" },
      { status: 404 },
    );
  }

  if (!order.stripePaymentId) {
    return NextResponse.json(
      { error: "Stripe決済IDがないため返金できません" },
      { status: 400 },
    );
  }

  if (order.status !== "COMPLETED" && order.status !== "REFUNDED") {
    return NextResponse.json(
      { error: "この決済状態では返金できません" },
      { status: 400 },
    );
  }

  const summary = parseChargeRefundSummary(order.metadata);
  const remainingAmount = Math.max(order.amount - summary.refundedAmount, 0);
  if (remainingAmount <= 0) {
    return NextResponse.json(
      { error: "返金可能額が残っていません" },
      { status: 400 },
    );
  }

  const refundAmount = parsed.data.amount ?? remainingAmount;
  if (refundAmount > remainingAmount) {
    return NextResponse.json(
      { error: "返金額が返金可能残額を超えています" },
      { status: 400 },
    );
  }

  const [coinSumResult, mileSumResult] = await Promise.all([
    prisma.coinTransaction.aggregate({
      where: {
        tenantId,
        userId: order.userId,
        referenceId: order.id,
        type: "CHARGE",
      },
      _sum: { amount: true },
    }),
    prisma.mileageTransaction.aggregate({
      where: {
        tenantId,
        userId: order.userId,
        referenceId: order.id,
        type: "CHARGE_MILE",
      },
      _sum: { amount: true },
    }),
  ]);

  const totalGrantedCoins = Math.max(
    coinSumResult._sum.amount ?? 0,
    order.coins + order.bonus,
  );
  const totalGrantedMiles = Math.max(mileSumResult._sum.amount ?? 0, 0);
  const isFinalRefund = refundAmount === remainingAmount;

  const coinsToRevoke = prorateRevocation(
    totalGrantedCoins,
    order.amount,
    refundAmount,
    summary.refundedCoins,
    isFinalRefund,
  );
  const milesToRevoke = prorateRevocation(
    totalGrantedMiles,
    order.amount,
    refundAmount,
    summary.refundedMiles,
    isFinalRefund,
  );

  if (order.user.coins < coinsToRevoke) {
    return NextResponse.json(
      {
        error:
          `ユーザーのコイン残高が不足しています。必要: ${coinsToRevoke.toLocaleString()} / 現在: ${order.user.coins.toLocaleString()}`,
      },
      { status: 400 },
    );
  }

  if (order.user.miles < milesToRevoke) {
    return NextResponse.json(
      {
        error:
          `ユーザーのマイル残高が不足しています。必要: ${milesToRevoke.toLocaleString()} / 現在: ${order.user.miles.toLocaleString()}`,
      },
      { status: 400 },
    );
  }

  const stripe = getStripeServerClient();
  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentId,
    amount: refundAmount,
    reason: "requested_by_customer",
    metadata: {
      tenantId,
      chargeOrderId: order.id,
      adminId,
      reason: parsed.data.reason ?? "requested_by_customer",
      note: parsed.data.note ?? "",
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.chargeOrder.findFirst({
      where: { id: order.id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            coins: true,
            miles: true,
            totalCharged: true,
          },
        },
      },
    });

    if (!latestOrder) {
      throw new Error("決済データが見つかりません");
    }

    const latestSummary = parseChargeRefundSummary(latestOrder.metadata);
    if (latestSummary.logs.some((row) => row.refundId === refund.id)) {
      return {
        refundedAmount: latestSummary.refundedAmount,
        refundedCoins: latestSummary.refundedCoins,
        refundedMiles: latestSummary.refundedMiles,
        refundableAmount: Math.max(
          latestOrder.amount - latestSummary.refundedAmount,
          0,
        ),
        orderStatus: latestOrder.status,
      };
    }

    const latestRemainingAmount = Math.max(
      latestOrder.amount - latestSummary.refundedAmount,
      0,
    );
    if (refundAmount > latestRemainingAmount) {
      throw new Error("返金競合が発生しました。再読み込みして再実行してください");
    }

    const latestIsFinalRefund = refundAmount === latestRemainingAmount;
    const latestCoinsToRevoke = prorateRevocation(
      totalGrantedCoins,
      latestOrder.amount,
      refundAmount,
      latestSummary.refundedCoins,
      latestIsFinalRefund,
    );
    const latestMilesToRevoke = prorateRevocation(
      totalGrantedMiles,
      latestOrder.amount,
      refundAmount,
      latestSummary.refundedMiles,
      latestIsFinalRefund,
    );

    if (latestOrder.user.coins < latestCoinsToRevoke) {
      throw new Error("返金処理中にユーザーのコイン残高が不足しました");
    }
    if (latestOrder.user.miles < latestMilesToRevoke) {
      throw new Error("返金処理中にユーザーのマイル残高が不足しました");
    }

    const newCoinBalance = latestOrder.user.coins - latestCoinsToRevoke;
    const newMileBalance = latestOrder.user.miles - latestMilesToRevoke;
    const newTotalCharged = Math.max(
      latestOrder.user.totalCharged - refundAmount,
      0,
    );
    const rankSettings = await getRankSettings(tx, tenantId);
    const newRank = calcRankByTotalCharged(newTotalCharged, rankSettings);

    await tx.user.update({
      where: { id: latestOrder.user.id },
      data: {
        coins: newCoinBalance,
        miles: newMileBalance,
        totalCharged: newTotalCharged,
        rank: newRank,
      },
    });

    if (latestCoinsToRevoke > 0) {
      await tx.coinTransaction.create({
        data: {
          tenantId,
          userId: latestOrder.user.id,
          amount: -latestCoinsToRevoke,
          balance: newCoinBalance,
          type: "REFUND",
          description: `チャージ返金: ¥${refundAmount.toLocaleString()}`,
          referenceId: latestOrder.id,
        },
      });
    }

    if (latestMilesToRevoke > 0) {
      await tx.mileageTransaction.create({
        data: {
          tenantId,
          userId: latestOrder.user.id,
          amount: -latestMilesToRevoke,
          balance: newMileBalance,
          type: "ADMIN_ADJUST",
          description: `チャージ返金に伴うマイル減算: ¥${refundAmount.toLocaleString()}`,
          referenceId: latestOrder.id,
        },
      });
    }

    const updatedSummary = {
      refundedAmount: latestSummary.refundedAmount + refundAmount,
      refundedCoins: latestSummary.refundedCoins + latestCoinsToRevoke,
      refundedMiles: latestSummary.refundedMiles + latestMilesToRevoke,
      logs: [
        {
          refundId: refund.id,
          amount: refundAmount,
          coinsRevoked: latestCoinsToRevoke,
          milesRevoked: latestMilesToRevoke,
          reason: parsed.data.reason ?? "requested_by_customer",
          note: parsed.data.note ?? null,
          adminId,
          status: refund.status ?? "unknown",
          createdAt: new Date().toISOString(),
        },
        ...latestSummary.logs,
      ],
    };

    const nextStatus =
      updatedSummary.refundedAmount >= latestOrder.amount
        ? "REFUNDED"
        : "COMPLETED";

    await tx.chargeOrder.update({
      where: { id: latestOrder.id },
      data: {
        status: nextStatus,
        metadata: mergeChargeRefundSummary(latestOrder.metadata, updatedSummary),
      },
    });

    return {
      refundedAmount: updatedSummary.refundedAmount,
      refundedCoins: updatedSummary.refundedCoins,
      refundedMiles: updatedSummary.refundedMiles,
      refundableAmount: Math.max(
        latestOrder.amount - updatedSummary.refundedAmount,
        0,
      ),
      orderStatus: nextStatus,
    };
  });

  await logAdminAction(adminId, "REFUND", "chargeOrder", order.id, {
    stripeRefundId: refund.id,
    amount: refundAmount,
    reason: parsed.data.reason ?? null,
    note: parsed.data.note ?? null,
  });

  return NextResponse.json({
    success: true,
    stripeRefundId: refund.id,
    stripeRefundStatus: refund.status,
    ...result,
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
