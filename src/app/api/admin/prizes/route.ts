import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { resolveTenantId } from "@/lib/tenant/context";
const VALID_RARITIES = ["N", "R", "SR", "SSR", "UR"] as const;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const rarity = searchParams.get("rarity");
    const genre = searchParams.get("genre");

    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (rarity && VALID_RARITIES.includes(rarity as typeof VALID_RARITIES[number])) {
      where.rarity = rarity;
    }

    if (genre) {
      where.genre = genre;
    }

    const prizes = await prisma.prize.findMany({
      where,
      include: {
        _count: { select: { packPrizes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prizes);
  } catch (error) {
    console.error("[Prize List Error]", error);
    return NextResponse.json(
      { error: "景品一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  try {
    const body = await req.json();
    const { name, description, image, genre, rarity, marketPrice, costPrice, coinValue } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "名前を入力してください" },
        { status: 400 },
      );
    }

    if (!rarity || !VALID_RARITIES.includes(rarity)) {
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

    if (typeof costPrice !== "number" || costPrice < 0) {
      return NextResponse.json(
        { error: "原価は0以上の数値を入力してください" },
        { status: 400 },
      );
    }

    if (typeof coinValue !== "number" || coinValue < 0) {
      return NextResponse.json(
        { error: "コイン価値は0以上の数値を入力してください" },
        { status: 400 },
      );
    }

    const normalizedGenre =
      typeof genre === "string" && genre.trim().length > 0 ? genre.trim() : "other";

    if (normalizedGenre.length > 40) {
      return NextResponse.json(
        { error: "ジャンルは40文字以内で入力してください" },
        { status: 400 },
      );
    }

    const newPrize = await prisma.prize.create({
      data: {
        tenantId,
        name: name.trim(),
        description: description ?? "",
        image,
        genre: normalizedGenre,
        rarity,
        marketPrice,
        costPrice,
        coinValue,
      },
    });

    await logAdminAction(session.user!.id!, "CREATE", "prize", newPrize.id);

    return NextResponse.json(newPrize, { status: 201 });
  } catch (error) {
    console.error("[Prize Create Error]", error);
    return NextResponse.json(
      { error: "景品の作成に失敗しました" },
      { status: 500 },
    );
  }
}
