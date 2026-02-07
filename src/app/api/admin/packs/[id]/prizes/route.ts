import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { z } from "zod";

const addPrizeSchema = z.object({
  prizeId: z.string().min(1),
  weight: z.coerce.number().int().min(1, "1以上を入力"),
  totalQuantity: z.coerce.number().int().min(1, "1以上を入力"),
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

  const { id: packId } = await params;
  const { searchParams } = new URL(req.url);
  const packPrizeId = searchParams.get("packPrizeId");

  if (!packPrizeId) {
    return NextResponse.json(
      { error: "packPrizeId is required" },
      { status: 400 },
    );
  }

  const pack = await prisma.oripaPack.findUnique({
    where: { id: packId },
    select: { status: true },
  });

  if (pack?.status !== "DRAFT") {
    return NextResponse.json(
      { error: "DRAFTステータスのパックのみ景品を削除できます" },
      { status: 400 },
    );
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
