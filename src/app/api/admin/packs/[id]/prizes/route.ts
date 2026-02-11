import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { resolveTenantId } from "@/lib/tenant/context";
import { z } from "zod";

const addPrizeSchema = z.object({
  prizeId: z.string().min(1),
  weight: z.coerce.number().int().min(1, "1以上を入力"),
  totalQuantity: z.coerce.number().int().min(1, "1以上を入力"),
});

const bulkUpdateSchema = z.object({
  rows: z.array(
    z.object({
      packPrizeId: z.string().min(1),
      weight: z.coerce.number().int().min(1),
      totalQuantity: z.coerce.number().int().min(1),
    }),
  ).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const { id: packId } = await params;
  const body = await req.json();
  const parsed = addPrizeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { prizeId, weight, totalQuantity } = parsed.data;
  const pack = await prisma.oripaPack.findFirst({
    where: { id: packId, tenantId },
    select: { id: true, status: true },
  });

  if (!pack) {
    return NextResponse.json({ error: "パックが見つかりません" }, { status: 404 });
  }

  if (pack.status !== "DRAFT") {
    return NextResponse.json(
      { error: "DRAFTステータスのパックのみ景品を追加できます" },
      { status: 400 },
    );
  }

  const existing = await prisma.packPrize.findUnique({
    where: { packId_prizeId: { packId, prizeId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "この景品はすでにパックに追加されています" },
      { status: 400 },
    );
  }

  const packPrize = await prisma.packPrize.create({
    data: {
      tenantId,
      packId,
      prizeId,
      weight,
      totalQuantity,
      remainingQuantity: totalQuantity,
    },
    include: { prize: true },
  });

  await logAdminAction(session.user!.id, "ADD_PRIZE", "oripaPack", packId, {
    prizeId,
    weight,
    totalQuantity,
  });

  return NextResponse.json(packPrize, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const { id: packId } = await params;
  const { searchParams } = new URL(req.url);
  const packPrizeId = searchParams.get("packPrizeId");

  if (!packPrizeId) {
    return NextResponse.json(
      { error: "packPrizeId is required" },
      { status: 400 },
    );
  }

  const pack = await prisma.oripaPack.findFirst({
    where: { id: packId, tenantId },
    select: { status: true },
  });

  if (pack?.status !== "DRAFT") {
    return NextResponse.json(
      { error: "DRAFTステータスのパックのみ景品を削除できます" },
      { status: 400 },
    );
  }

  const target = await prisma.packPrize.findFirst({
    where: { id: packPrizeId, tenantId, packId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "景品行が見つかりません" }, { status: 404 });
  }

  await prisma.packPrize.delete({ where: { id: packPrizeId } });

  await logAdminAction(
    session.user!.id,
    "REMOVE_PRIZE",
    "oripaPack",
    packId,
    { packPrizeId },
  );

  return NextResponse.json({ success: true });
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
  const tenantId = await resolveTenantId();

  const { id: packId } = await params;
  const body = await req.json();
  const parsed = bulkUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const pack = await prisma.oripaPack.findFirst({
    where: { id: packId, tenantId },
    select: { id: true, status: true },
  });

  if (!pack) {
    return NextResponse.json({ error: "パックが見つかりません" }, { status: 404 });
  }

  if (pack.status !== "DRAFT") {
    return NextResponse.json(
      { error: "DRAFTステータスのパックのみ更新できます" },
      { status: 400 },
    );
  }

  const ids = parsed.data.rows.map((row) => row.packPrizeId);
  const existingRows = await prisma.packPrize.findMany({
    where: {
      tenantId,
      packId,
      id: { in: ids },
    },
    select: {
      id: true,
      totalQuantity: true,
      remainingQuantity: true,
    },
  });

  if (existingRows.length !== ids.length) {
    return NextResponse.json({ error: "更新対象が不正です" }, { status: 400 });
  }

  const map = new Map(existingRows.map((row) => [row.id, row]));

  for (const row of parsed.data.rows) {
    const existing = map.get(row.packPrizeId)!;
    const soldCount = existing.totalQuantity - existing.remainingQuantity;
    if (row.totalQuantity < soldCount) {
      return NextResponse.json(
        { error: `販売済み数量(${soldCount})より少ない総数にはできません` },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(
    parsed.data.rows.map((row) => {
      const existing = map.get(row.packPrizeId)!;
      const soldCount = existing.totalQuantity - existing.remainingQuantity;
      return prisma.packPrize.update({
        where: { id: row.packPrizeId },
        data: {
          weight: row.weight,
          totalQuantity: row.totalQuantity,
          remainingQuantity: row.totalQuantity - soldCount,
        },
      });
    }),
  );

  await logAdminAction(session.user!.id, "UPDATE_PACK_PRIZES", "oripaPack", packId, {
    rows: parsed.data.rows,
  });

  return NextResponse.json({ success: true });
}
