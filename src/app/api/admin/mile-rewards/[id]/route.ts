import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const itemSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  requiredMiles: z.coerce.number().int().min(1).optional(),
  stock: z.coerce.number().int().min(0).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const existing = await prisma.mileRewardItem.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "景品が見つかりません" }, { status: 404 });
  }

  const row = parsed.data;
  const updated = await prisma.mileRewardItem.update({
    where: { id },
    data: {
      ...(row.name !== undefined ? { name: row.name } : {}),
      ...(row.description !== undefined ? { description: row.description } : {}),
      ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
      ...(row.requiredMiles !== undefined ? { requiredMiles: row.requiredMiles } : {}),
      ...(row.stock !== undefined ? { stock: row.stock } : {}),
      ...(row.sortOrder !== undefined ? { sortOrder: row.sortOrder } : {}),
      ...(row.isActive !== undefined ? { isActive: row.isActive } : {}),
      ...(row.isPublished !== undefined ? { isPublished: row.isPublished } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await params;
  const tenantId = await resolveTenantId();

  const existing = await prisma.mileRewardItem.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "景品が見つかりません" }, { status: 404 });
  }

  await prisma.mileRewardItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
