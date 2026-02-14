import { NextRequest, NextResponse } from "next/server";
import { ChargeStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { parseChargeRefundSummary } from "@/lib/payments/refund-metadata";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const VALID_STATUSES: ChargeStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
];

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const intValue = Math.floor(parsed);
  if (intValue < min) return min;
  if (intValue > max) return max;
  return intValue;
}

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = session.user.tenantId;
  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), DEFAULT_PAGE, 1, 10_000);
  const pageSize = clampInt(
    searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
    1,
    MAX_PAGE_SIZE,
  );
  const search = (searchParams.get("search") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();

  const where: Prisma.ChargeOrderWhereInput = {
    tenantId,
  };

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { stripePaymentId: { contains: search, mode: "insensitive" } },
      { stripeSessionId: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status && status !== "ALL" && VALID_STATUSES.includes(status as ChargeStatus)) {
    where.status = status as ChargeStatus;
  }

  const [total, orders] = await Promise.all([
    prisma.chargeOrder.count({ where }),
    prisma.chargeOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chargePlan: {
          select: {
            id: true,
            coins: true,
            bonus: true,
            price: true,
          },
        },
      },
    }),
  ]);

  const items = orders.map((order) => {
    const refundSummary = parseChargeRefundSummary(order.metadata);
    const refundableAmount = Math.max(order.amount - refundSummary.refundedAmount, 0);
    const canRefund =
      !!order.stripePaymentId &&
      order.status !== "FAILED" &&
      refundableAmount > 0;

    return {
      id: order.id,
      user: order.user,
      plan: order.chargePlan,
      amount: order.amount,
      coins: order.coins,
      bonus: order.bonus,
      status: order.status,
      paymentMethod: order.paymentMethod,
      stripePaymentId: order.stripePaymentId,
      stripeSessionId: order.stripeSessionId,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      refundedAmount: refundSummary.refundedAmount,
      refundedCoins: refundSummary.refundedCoins,
      refundedMiles: refundSummary.refundedMiles,
      refundLogs: refundSummary.logs,
      refundableAmount,
      canRefund,
    };
  });

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
