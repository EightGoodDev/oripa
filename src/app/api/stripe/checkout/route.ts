import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getStripeServerClient } from "@/lib/payments/stripe";
import { resolveTenantId } from "@/lib/tenant/context";

const checkoutSchema = z.object({
  planId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;
  const planId = parsed.data.planId;

  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return NextResponse.json(
        { error: "STRIPE_PUBLISHABLE_KEY is not configured" },
        { status: 500 },
      );
    }

    const [user, plan, completedChargeCount] = await Promise.all([
      prisma.user.findFirst({
        where: { id: userId, tenantId },
        select: { id: true, email: true },
      }),
      prisma.chargePlan.findFirst({
        where: { id: planId, tenantId, isActive: true },
      }),
      prisma.chargeOrder.count({
        where: { tenantId, userId, status: "COMPLETED" },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }
    if (!plan) {
      return NextResponse.json(
        { error: "チャージプランが見つかりません" },
        { status: 404 },
      );
    }
    if (plan.firstTimeOnly && completedChargeCount > 0) {
      return NextResponse.json(
        { error: "このプランは初回チャージ限定です" },
        { status: 400 },
      );
    }

    const stripe = getStripeServerClient();

    const pendingOrder = await prisma.chargeOrder.create({
      data: {
        tenantId,
        userId,
        chargePlanId: plan.id,
        coins: plan.coins,
        amount: plan.price,
        bonus: plan.bonus,
        status: "PENDING",
        paymentMethod: "CREDIT_CARD",
        metadata: {
          source: "stripe_payment_intent",
        } as Prisma.InputJsonValue,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: "jpy",
      payment_method_types: ["card"],
      receipt_email: user.email ?? undefined,
      description: `${plan.coins.toLocaleString()}コインチャージ`,
      metadata: {
        tenantId,
        userId,
        planId: plan.id,
        chargeOrderId: pendingOrder.id,
      },
    });

    await prisma.chargeOrder.update({
      where: { id: pendingOrder.id },
      data: {
        stripePaymentId: paymentIntent.id,
      },
    });

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "決済フォームの初期化に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      chargeOrderId: pendingOrder.id,
    });
  } catch (error) {
    console.error("[stripe][checkout] create failed", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 },
    );
  }
}
