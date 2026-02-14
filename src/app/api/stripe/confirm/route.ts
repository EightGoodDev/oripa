import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { completeCharge } from "@/lib/payments/complete-charge";
import { getStripeServerClient } from "@/lib/payments/stripe";
import { resolveTenantId } from "@/lib/tenant/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const confirmSchema = z
  .object({
    paymentIntentId: z.string().min(1).optional(),
    chargeOrderId: z.string().min(1).optional(),
  })
  .refine((data) => !!data.paymentIntentId || !!data.chargeOrderId, {
    message: "paymentIntentId または chargeOrderId が必要です",
  });

function requireString(value: string | undefined, field: string) {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} is missing`);
  }
  return value;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = confirmSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;
  const stripe = getStripeServerClient();

  try {
    let paymentIntentId = parsed.data.paymentIntentId;

    if (!paymentIntentId && parsed.data.chargeOrderId) {
      const order = await prisma.chargeOrder.findFirst({
        where: {
          id: parsed.data.chargeOrderId,
          tenantId,
          userId,
        },
        select: {
          stripePaymentId: true,
        },
      });
      paymentIntentId = order?.stripePaymentId ?? undefined;
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "決済情報が見つかりませんでした" },
        { status: 404 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const metadata = paymentIntent.metadata ?? {};
    const metadataTenantId = requireString(metadata.tenantId, "metadata.tenantId");
    const metadataUserId = requireString(metadata.userId, "metadata.userId");
    const planId = requireString(metadata.planId, "metadata.planId");
    const chargeOrderId = requireString(
      metadata.chargeOrderId,
      "metadata.chargeOrderId",
    );

    if (metadataTenantId !== tenantId || metadataUserId !== userId) {
      return NextResponse.json(
        { error: "この決済情報にはアクセスできません" },
        { status: 403 },
      );
    }

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      });
    }

    const result = await completeCharge({
      tenantId,
      userId,
      planId,
      chargeOrderId,
      paymentMethod: "CREDIT_CARD",
      externalPaymentId: paymentIntent.id,
      metadata: {
        source: "stripe_confirm_api",
        stripePaymentIntent: paymentIntent.id,
      },
    });

    return NextResponse.json({
      status: "succeeded",
      paymentIntentId: paymentIntent.id,
      result,
    });
  } catch (error) {
    console.error("[stripe][confirm] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "決済確認に失敗しました" },
      { status: 400 },
    );
  }
}
