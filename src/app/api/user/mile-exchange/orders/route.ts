import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { getLegalConsentStatus } from "@/lib/user/legal-consent";

const createOrderSchema = z.object({
  itemId: z.string().min(1),
  shippingAddressId: z.string().min(1).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;

  try {
    const legal = await getLegalConsentStatus({ tenantId, userId });
    if (legal.needsTermsAcceptance || legal.needsPrivacyAcceptance) {
      return NextResponse.json(
        {
          error:
            "利用規約・プライバシーポリシーの同意が必要です。内容を確認してからご利用ください。",
        },
        { status: 403 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const [item, user] = await Promise.all([
        tx.mileRewardItem.findFirst({
          where: {
            id: parsed.data.itemId,
            tenantId,
            isActive: true,
            isPublished: true,
          },
        }),
        tx.user.findFirst({
          where: { id: userId, tenantId },
          select: { id: true, miles: true },
        }),
      ]);

      if (!item) throw new Error("交換アイテムが見つかりません");
      if (!user) throw new Error("ユーザーが見つかりません");
      if (item.stock !== null && item.stock <= 0) {
        throw new Error("在庫がありません");
      }
      if (user.miles < item.requiredMiles) {
        throw new Error("マイルが不足しています");
      }

      const newMiles = user.miles - item.requiredMiles;

      await tx.user.update({
        where: { id: user.id },
        data: { miles: newMiles },
      });

      if (item.stock !== null) {
        await tx.mileRewardItem.update({
          where: { id: item.id },
          data: { stock: { decrement: 1 } },
        });
      }

      const order = await tx.mileExchangeOrder.create({
        data: {
          tenantId,
          userId,
          itemId: item.id,
          requiredMiles: item.requiredMiles,
          shippingAddressId: parsed.data.shippingAddressId,
          note: parsed.data.note,
          status: "REQUESTED",
        },
      });

      await tx.mileageTransaction.create({
        data: {
          tenantId,
          userId,
          amount: -item.requiredMiles,
          balance: newMiles,
          type: "MILE_EXCHANGE",
          description: `交換申請: ${item.name}`,
          referenceId: order.id,
        },
      });

      return { orderId: order.id, remainingMiles: newMiles };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "交換に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
