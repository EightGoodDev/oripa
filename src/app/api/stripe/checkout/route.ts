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

function resolveBaseUrl(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

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

    const baseUrl = resolveBaseUrl(req);
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
          source: "stripe_checkout",
        } as Prisma.InputJsonValue,
      },
    });

    const sessionResult = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/charge?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/charge?status=cancel`,
      customer_email: user.email ?? undefined,
      payment_method_types: ["card"],
      locale: "ja",
      metadata: {
        tenantId,
        userId,
        planId: plan.id,
        chargeOrderId: pendingOrder.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "jpy",
            unit_amount: plan.price,
            product_data: {
              name: `${plan.coins.toLocaleString()}コインチャージ`,
              description:
                plan.bonus > 0
                  ? `ボーナス +${plan.bonus.toLocaleString()}コイン`
                  : undefined,
            },
          },
        },
      ],
    });

    await prisma.chargeOrder.update({
      where: { id: pendingOrder.id },
      data: {
        stripeSessionId: sessionResult.id,
      },
    });

    if (!sessionResult.url) {
      return NextResponse.json(
        { error: "Stripe Checkout URLの生成に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      checkoutUrl: sessionResult.url,
      sessionId: sessionResult.id,
    });
  } catch (error) {
    console.error("[stripe][checkout] create failed", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 },
    );
  }
}
