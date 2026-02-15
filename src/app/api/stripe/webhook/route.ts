import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { completeCharge } from "@/lib/payments/complete-charge";
import { getStripeServerClient } from "@/lib/payments/stripe";
import { mergeStripeMetadata } from "@/lib/payments/stripe-metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireString(value: string | null | undefined, field: string) {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} is missing`);
  }
  return value;
}

async function handleCheckoutCompleted(
  checkout: Stripe.Checkout.Session,
  eventId: string,
) {
  if (checkout.mode !== "payment") return;
  if (checkout.payment_status !== "paid") return;

  const metadata = checkout.metadata ?? {};
  const tenantId = requireString(metadata.tenantId, "metadata.tenantId");
  const userId = requireString(metadata.userId, "metadata.userId");
  const planId = requireString(metadata.planId, "metadata.planId");
  const chargeOrderId = requireString(
    metadata.chargeOrderId,
    "metadata.chargeOrderId",
  );

  await completeCharge({
    tenantId,
    userId,
    planId,
    chargeOrderId,
    paymentMethod: "CREDIT_CARD",
    externalPaymentId: checkout.id,
    metadata: {
      source: "stripe_webhook",
      stripeEventId: eventId,
      stripeSessionId: checkout.id,
      stripePaymentIntent:
        typeof checkout.payment_intent === "string"
          ? checkout.payment_intent
          : null,
    },
  });
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string,
) {
  if (paymentIntent.status !== "succeeded") return;

  const metadata = paymentIntent.metadata ?? {};
  const tenantId = requireString(metadata.tenantId, "metadata.tenantId");
  const userId = requireString(metadata.userId, "metadata.userId");
  const planId = requireString(metadata.planId, "metadata.planId");
  const chargeOrderId = requireString(
    metadata.chargeOrderId,
    "metadata.chargeOrderId",
  );

  await completeCharge({
    tenantId,
    userId,
    planId,
    chargeOrderId,
    paymentMethod: "CREDIT_CARD",
    externalPaymentId: paymentIntent.id,
    metadata: {
      source: "stripe_webhook",
      stripeEventId: eventId,
      stripePaymentIntent: paymentIntent.id,
      stripePaymentIntentStatus: paymentIntent.status,
    },
  });
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string,
) {
  const whereOr: Array<{ id: string } | { stripePaymentId: string }> = [];
  if (paymentIntent.metadata?.chargeOrderId) {
    whereOr.push({ id: paymentIntent.metadata.chargeOrderId });
  }
  whereOr.push({ stripePaymentId: paymentIntent.id });

  const targets = await prisma.chargeOrder.findMany({
    where: { OR: whereOr, status: "PENDING" },
    select: { id: true, metadata: true },
  });

  for (const row of targets) {
    await prisma.chargeOrder.update({
      where: { id: row.id },
      data: {
        status: "FAILED",
        metadata: mergeStripeMetadata(row.metadata, {
          source: "stripe_webhook",
          paymentIntentId: paymentIntent.id,
          paymentIntentStatus: paymentIntent.status,
          paymentFailed: true,
          stripeEventId: eventId,
          failureCode: paymentIntent.last_payment_error?.code ?? null,
          updatedAt: new Date().toISOString(),
        }),
      },
    });
  }
}

async function handleCheckoutExpired(checkout: Stripe.Checkout.Session) {
  const targets = await prisma.chargeOrder.findMany({
    where: {
      OR: [
        { id: checkout.metadata?.chargeOrderId ?? undefined },
        { stripeSessionId: checkout.id },
      ],
      status: "PENDING",
    },
    select: { id: true, metadata: true },
  });

  for (const row of targets) {
    await prisma.chargeOrder.update({
      where: { id: row.id },
      data: {
        status: "FAILED",
        metadata: mergeStripeMetadata(row.metadata, {
          source: "stripe_webhook",
          checkoutSessionId: checkout.id,
          checkoutExpired: true,
          updatedAt: new Date().toISOString(),
        }),
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature is missing" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const stripe = getStripeServerClient();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[stripe][webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkout, event.id);
        break;
      }
      case "checkout.session.expired": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(checkout);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent, event.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent, event.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe][webhook] processing failed", {
      eventId: event.id,
      eventType: event.type,
      error,
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
