import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { getLegalConsentStatus } from "@/lib/user/legal-consent";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const tenantId = await resolveTenantId();

  const { itemId } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "アイテムIDが必要です" }, { status: 400 });
  }

  try {
    const legal = await getLegalConsentStatus({ tenantId, userId: session.user.id });
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
      const item = await tx.ownedItem.findUnique({
        where: { id: itemId },
        include: { prize: { select: { coinValue: true, name: true } } },
      });

      if (
        !item ||
        item.tenantId !== tenantId ||
        item.userId !== session.user.id
      ) {
        throw new Error("交換可能なアイテムが見つかりません");
      }

      const user = await tx.user.findFirst({
        where: {
          id: session.user.id,
          tenantId,
        },
        select: { id: true },
      });

      if (!user) {
        throw new Error("ユーザーが見つかりません");
      }

      if (item.status !== "OWNED") {
        throw new Error("交換可能なアイテムが見つかりません");
      }

      // Update item status
      await tx.ownedItem.update({
        where: { id: itemId },
        data: { status: "EXCHANGED" },
      });

      // Add coins to user
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { coins: { increment: item.prize.coinValue } },
        select: { coins: true },
      });

      // Create coin transaction
      await tx.coinTransaction.create({
        data: {
          tenantId,
          userId: session.user.id,
          amount: item.prize.coinValue,
          balance: updatedUser.coins,
          type: "EXCHANGE",
          description: `${item.prize.name}のコイン還元`,
          referenceId: itemId,
        },
      });

      return { newBalance: updatedUser.coins, coinsAdded: item.prize.coinValue };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "交換に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
