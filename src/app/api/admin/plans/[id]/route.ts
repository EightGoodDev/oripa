import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { z } from "zod";

const updatePlanSchema = z.object({
  coins: z.coerce.number().int().min(1, "1以上を入力"),
  price: z.coerce.number().int().min(1, "1以上を入力"),
  bonus: z.coerce.number().int().min(0).default(0),
  isPopular: z.boolean().default(false),
  firstTimeOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

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

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const plan = await prisma.chargePlan.update({
    where: { id },
    data: {
      coins: data.coins,
      price: data.price,
      bonus: data.bonus,
      isPopular: data.isPopular,
      firstTimeOnly: data.firstTimeOnly,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  await logAdminAction(session.user!.id, "UPDATE", "chargePlan", id, data);

  return NextResponse.json(plan);
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

  const { id } = await params;

  const plan = await prisma.chargePlan.findUnique({
    where: { id },
    include: { _count: { select: { chargeOrders: true } } },
  });

  if (!plan) {
    return NextResponse.json(
      { error: "プランが見つかりません" },
      { status: 404 },
    );
  }

  if (plan._count.chargeOrders > 0) {
    await prisma.chargePlan.update({
      where: { id },
      data: { isActive: false },
    });
    await logAdminAction(session.user!.id, "DELETE", "chargePlan", id, {
      softDelete: true,
      reason: "注文履歴あり",
    });

    return NextResponse.json({ success: true, softDeleted: true });
  }

  await prisma.chargePlan.delete({ where: { id } });
  await logAdminAction(session.user!.id, "DELETE", "chargePlan", id);

  return NextResponse.json({ success: true });
}
