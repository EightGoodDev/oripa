import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const bannerSchema = z.object({
  title: z.string().max(120).optional().nullable(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  startsAt: z.string().optional().nullable().or(z.literal("")),
  endsAt: z.string().optional().nullable().or(z.literal("")),
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
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const existing = await prisma.homeBanner.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "バナーが見つかりません" }, { status: 404 });
  }

  const row = parsed.data;
  const updated = await prisma.homeBanner.update({
    where: { id },
    data: {
      ...(row.title !== undefined ? { title: row.title || null } : {}),
      ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
      ...(row.linkUrl !== undefined ? { linkUrl: row.linkUrl || null } : {}),
      ...(row.startsAt !== undefined ? { startsAt: row.startsAt ? new Date(row.startsAt) : null } : {}),
      ...(row.endsAt !== undefined ? { endsAt: row.endsAt ? new Date(row.endsAt) : null } : {}),
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

  const existing = await prisma.homeBanner.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "バナーが見つかりません" }, { status: 404 });
  }

  await prisma.homeBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
