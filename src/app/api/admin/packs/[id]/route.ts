import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { z } from "zod";

const updatePackSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  category: z.string().trim().min(1).optional(),
  minRank: z.enum(["BEGINNER", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "VIP"]).optional(),
  pricePerDraw: z.coerce.number().int().min(1).optional(),
  totalStock: z.coerce.number().int().min(1).optional(),
  limitPerUser: z.coerce.number().int().min(1).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ENDED", "SOLD_OUT"]).optional(),
  lastOnePrizeId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = session.user.tenantId;

  const { id } = await params;

  const pack = await prisma.oripaPack.findFirst({
    where: { id, tenantId },
    include: {
      packPrizes: {
        include: { prize: true },
      },
      lastOnePrize: true,
      _count: { select: { draws: true } },
    },
  });

  if (!pack) {
    return NextResponse.json({ error: "パックが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(pack);
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
  const tenantId = session.user.tenantId;

  const { id } = await params;
  const existingPack = await prisma.oripaPack.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      title: true,
      image: true,
      pricePerDraw: true,
      totalStock: true,
      remainingStock: true,
      packPrizes: {
        select: {
          id: true,
          weight: true,
          totalQuantity: true,
          remainingQuantity: true,
        },
      },
    },
  });

  if (!existingPack) {
    return NextResponse.json({ error: "パックが見つかりません" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updatePackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  const soldCount = existingPack.totalStock - existingPack.remainingStock;

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.category !== undefined) {
    const category = await prisma.packCategory.findFirst({
      where: {
        tenantId,
        name: data.category,
        isActive: true,
      },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: { category: ["カテゴリが未登録です。先にカテゴリを作成してください。"] } },
        { status: 400 },
      );
    }

    updateData.category = data.category;
  }
  if (data.minRank !== undefined) updateData.minRank = data.minRank;
  if (data.pricePerDraw !== undefined) updateData.pricePerDraw = data.pricePerDraw;
  if (data.limitPerUser !== undefined) updateData.limitPerUser = data.limitPerUser;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.lastOnePrizeId !== undefined) updateData.lastOnePrizeId = data.lastOnePrizeId;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.startsAt !== undefined)
    updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  if (data.endsAt !== undefined)
    updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;

  if (data.totalStock !== undefined) {
    if (data.totalStock < soldCount) {
      return NextResponse.json(
        {
          error: `販売済み数量(${soldCount})より少ない総在庫にはできません`,
        },
        { status: 400 },
      );
    }
    updateData.totalStock = data.totalStock;
    updateData.remainingStock = data.totalStock - soldCount;
  }

  if (data.status === "ACTIVE") {
    const effectiveTitle = (data.title ?? existingPack.title).trim();
    const effectiveImage = (data.image ?? existingPack.image).trim();
    const effectivePricePerDraw =
      data.pricePerDraw ?? existingPack.pricePerDraw;
    const effectiveTotalStock = data.totalStock ?? existingPack.totalStock;
    const effectiveRemainingStock =
      data.totalStock !== undefined
        ? data.totalStock - soldCount
        : existingPack.remainingStock;
    const totalPrizeQuantity = existingPack.packPrizes.reduce(
      (sum, row) => sum + row.totalQuantity,
      0,
    );
    const totalRemainingPrizeQuantity = existingPack.packPrizes.reduce(
      (sum, row) => sum + row.remainingQuantity,
      0,
    );

    if (existingPack.packPrizes.length === 0) {
      return NextResponse.json(
        { error: "景品が1つ以上登録されていないため公開できません" },
        { status: 400 },
      );
    }

    if (totalPrizeQuantity !== effectiveTotalStock) {
      return NextResponse.json(
        {
          error: `景品合計数(${totalPrizeQuantity})と総在庫数(${effectiveTotalStock})が一致しないため公開できません`,
        },
        { status: 400 },
      );
    }

    if (effectiveRemainingStock <= 0) {
      return NextResponse.json(
        { error: "残在庫が0のため公開できません" },
        { status: 400 },
      );
    }

    if (totalRemainingPrizeQuantity !== effectiveRemainingStock) {
      return NextResponse.json(
        {
          error: `景品残数合計(${totalRemainingPrizeQuantity})とパック残在庫(${effectiveRemainingStock})が一致しないため公開できません`,
        },
        { status: 400 },
      );
    }

    if (!effectiveImage || !effectiveImage.startsWith("http")) {
      return NextResponse.json(
        { error: "画像URLが未設定または不正なため公開できません" },
        { status: 400 },
      );
    }

    if (!effectiveTitle) {
      return NextResponse.json(
        { error: "タイトルが未設定のため公開できません" },
        { status: 400 },
      );
    }

    if (effectivePricePerDraw <= 0) {
      return NextResponse.json(
        { error: "価格が未設定のため公開できません" },
        { status: 400 },
      );
    }
  }

  const pack = await prisma.oripaPack.update({
    where: { id },
    data: updateData,
  });

  await logAdminAction(session.user!.id, "UPDATE", "oripaPack", id, data);

  return NextResponse.json(pack);
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
  const tenantId = session.user.tenantId;

  const { id } = await params;

  const pack = await prisma.oripaPack.findFirst({
    where: { id, tenantId },
    include: { _count: { select: { draws: true } } },
  });

  if (!pack) {
    return NextResponse.json({ error: "パックが見つかりません" }, { status: 404 });
  }

  if (pack.status !== "DRAFT" && pack.status !== "ENDED") {
    return NextResponse.json(
      { error: "DRAFTまたはENDEDステータスのパックのみ削除できます" },
      { status: 400 },
    );
  }

  if (pack._count.draws > 0) {
    return NextResponse.json(
      { error: "ガチャ履歴があるパックは削除できません" },
      { status: 400 },
    );
  }

  await prisma.oripaPack.delete({ where: { id } });
  await logAdminAction(session.user!.id, "DELETE", "oripaPack", id);

  return NextResponse.json({ success: true });
}
