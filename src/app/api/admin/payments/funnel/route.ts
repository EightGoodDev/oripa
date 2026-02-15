import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { parseChargeRefundSummary } from "@/lib/payments/refund-metadata";
import { readStripePaymentIntentStatus } from "@/lib/payments/stripe-metadata";

export const dynamic = "force-dynamic";

function parseSince(value: string | null): Date {
  const now = new Date();
  if (!value) return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Relative format: 7d / 24h
  const m = value.trim().match(/^(\d+)\s*([dh])$/i);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const ms = unit === "d" ? n * 24 * 60 * 60 * 1000 : n * 60 * 60 * 1000;
    return new Date(now.getTime() - ms);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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
  const since = parseSince(searchParams.get("since"));

  const orders = await prisma.chargeOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: since },
    },
    select: {
      status: true,
      amount: true,
      metadata: true,
    },
  });

  const buckets: Record<string, number> = {
    created: orders.length,
    pending: 0,
    completed: 0,
    failed: 0,
    refunded: 0,
    stripe_requires_payment_method: 0,
    stripe_requires_action: 0,
    stripe_processing: 0,
    stripe_succeeded: 0,
    stripe_canceled: 0,
    stripe_unknown: 0,
  };

  for (const o of orders) {
    if (o.status === "PENDING") buckets.pending++;
    if (o.status === "COMPLETED") buckets.completed++;
    if (o.status === "FAILED") buckets.failed++;

    const refundSummary = parseChargeRefundSummary(o.metadata);
    if (refundSummary.refundedAmount > 0 || o.status === "REFUNDED") {
      buckets.refunded++;
    }

    const s = readStripePaymentIntentStatus(o.metadata);
    if (!s) {
      buckets.stripe_unknown++;
      continue;
    }

    switch (s) {
      case "requires_payment_method":
        buckets.stripe_requires_payment_method++;
        break;
      case "requires_action":
        buckets.stripe_requires_action++;
        break;
      case "processing":
        buckets.stripe_processing++;
        break;
      case "succeeded":
        buckets.stripe_succeeded++;
        break;
      case "canceled":
        buckets.stripe_canceled++;
        break;
      default:
        buckets.stripe_unknown++;
        break;
    }
  }

  const created = buckets.created || 1;
  const rates = {
    completedRate: buckets.completed / created,
    failedRate: buckets.failed / created,
    refundedRate: buckets.refunded / created,
  };

  return NextResponse.json({
    since: since.toISOString(),
    buckets,
    rates,
  });
}

