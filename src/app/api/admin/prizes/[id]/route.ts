import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
const VALID_RARITIES = ["N", "R", "SR", "SSR", "UR"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { id } = await params;

    const prize = await prisma.prize.findUnique({
      where: { id },
      include: {
        _count: { select: { packPrizes: true } },
        packPrizes: {
          include: {
            pack: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!prize) {
      return NextResponse.json(
        { error: "景品が見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(prize);
  } catch (error) {
    console.error("[Prize Get Error]", error);
    return NextResponse.json(
      { error: "景品の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, image, rarity, marketPrice, coinValue } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "名前を入力してください" },
        { status: 400 },
      );
    }

    if (!rarity || !VALID_RARITIES.includes(rarity as typeof VALID_RARITIES[number])) {
      return NextResponse.json(
        { error: "有効なレアリティを選択してください" },
        { status: 400 },
      );
    }

    if (typeof marketPrice !== "number" || marketPrice < 0) {
      return NextResponse.json(
        { error: "市場価格は0以上の数値を入力してください" },
        { status: 400 },
      );
    }

    if (typeof coinValue !== "number" || coinValue < 0) {
      return NextResponse.json(
        { error: "コイン価値は0以上の数値を入力してください" },
        { status: 400 },
      );
    }

    const existing = await prisma.prize.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "景品が見つかりません" },
        { status: 404 },
      );
    }

    const updated = await prisma.prize.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description ?? "",
        image,
        rarity,
        marketPrice,
        coinValue,
      },
    });

    await logAdminAction(session.user!.id!, "UPDATE", "prize", id);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Prize Update Error]", error);
    return NextResponse.json(
      { error: "景品の更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { id } = await params;

    const prize = await prisma.prize.findUnique({
      where: { id },
      include: {
        _count: { select: { packPrizes: true } },
      },
    });

    if (!prize) {
      return NextResponse.json(
        { error: "景品が見つかりません" },
        { status: 404 },
      );
    }

    if (prize._count.packPrizes > 0) {
      return NextResponse.json(
        { error: "この景品はパックで使用中のため削除できません" },
        { status: 400 },
      );
    }

    await prisma.prize.delete({ where: { id } });

    await logAdminAction(session.user!.id!, "DELETE", "prize", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Prize Delete Error]", error);
    return NextResponse.json(
      { error: "景品の削除に失敗しました" },
      { status: 500 },
    );
  }
}
