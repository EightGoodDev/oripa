import { Prisma } from "@prisma/client";

function isJsonObject(
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeChargeOrderMetadata(
  metadata: Prisma.JsonValue | null | undefined,
  patch: Record<string, Prisma.JsonValue>,
): Prisma.InputJsonValue {
  const base: Prisma.JsonObject = isJsonObject(metadata) ? { ...metadata } : {};
  return { ...base, ...patch } as Prisma.InputJsonValue;
}

export function mergeStripeMetadata(
  metadata: Prisma.JsonValue | null | undefined,
  stripePatch: Record<string, Prisma.JsonValue>,
): Prisma.InputJsonValue {
  const base: Prisma.JsonObject = isJsonObject(metadata) ? { ...metadata } : {};
  const existingStripe: Prisma.JsonObject = isJsonObject(base.stripe)
    ? { ...base.stripe }
    : {};
  base.stripe = { ...existingStripe, ...stripePatch } as Prisma.JsonValue;
  return base as Prisma.InputJsonValue;
}

export function readStripePaymentIntentStatus(
  metadata: Prisma.JsonValue | null | undefined,
): string | null {
  if (!isJsonObject(metadata)) return null;
  const stripe = metadata.stripe;
  if (!isJsonObject(stripe)) return null;
  const s = stripe.paymentIntentStatus;
  return typeof s === "string" ? s : null;
}
