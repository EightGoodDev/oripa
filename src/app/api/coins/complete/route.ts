import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { completeCharge } from "@/lib/payments/complete-charge";

const completeSchema = z.object({
  planId: z.string().min(1),
  chargeOrderId: z.string().min(1).optional(),
  paymentMethod: z
    .enum(["CREDIT_CARD", "CONVENIENCE_STORE", "BANK_TRANSFER", "PAYPAY"])
    .optional(),
  externalPaymentId: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const allowDirect =
    process.env.ALLOW_DIRECT_CHARGE_COMPLETION === "true" ||
    process.env.NODE_ENV !== "production";
  if (!allowDirect) {
    return NextResponse.json(
      {
        error:
          "直接チャージ確定APIは無効です。Stripe Checkout経由で決済を完了してください。",
      },
      { status: 403 },
    );
  }

  const parsed = completeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const data = parsed.data;

  try {
    const result = await completeCharge({
      tenantId,
      userId: session.user.id,
      planId: data.planId,
      chargeOrderId: data.chargeOrderId,
      paymentMethod: data.paymentMethod,
      externalPaymentId: data.externalPaymentId,
      metadata: data.metadata,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "チャージ完了処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
