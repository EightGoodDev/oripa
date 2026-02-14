import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { completeCharge } from "@/lib/payments/complete-charge";
import { getStripeServerClient } from "@/lib/payments/stripe";

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

  await prisma.chargeOrder.updateMany({
    where: {
      OR: whereOr,
      status: "PENDING",
    },
    data: {
      status: "FAILED",
      metadata: {
        source: "stripe_webhook",
        stripePaymentFailed: true,
        stripeEventId: eventId,
        stripePaymentIntent: paymentIntent.id,
        stripeFailureCode: paymentIntent.last_payment_error?.code ?? null,
      },
    },
  });
}

async function handleCheckoutExpired(checkout: Stripe.Checkout.Session) {
  await prisma.chargeOrder.updateMany({
    where: {
      OR: [
        {
          id: checkout.metadata?.chargeOrderId ?? undefined,
        },
        {
          stripeSessionId: checkout.id,
        },
      ],
      status: "PENDING",
    },
    data: {
      status: "FAILED",
      metadata: {
        source: "stripe_webhook",
        stripeExpired: true,
        stripeSessionId: checkout.id,
      },
    },
  });
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
