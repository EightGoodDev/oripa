import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

function isAllowedLinkUrl(value: string) {
  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalLinkUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .or(z.literal(""))
  .refine((value) => !value || isAllowedLinkUrl(value), {
    message: "リンクURLは https://... または /path 形式で入力してください",
  });

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  subtitle: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: optionalLinkUrlSchema,
  startsAt: z.string().optional().nullable().or(z.literal("")),
  endsAt: z.string().optional().nullable().or(z.literal("")),
  newUserOnly: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  packIds: z.array(z.string().min(1)).optional(),
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
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const existing = await prisma.homeEvent.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  const row = parsed.data;
  const requestedPackIds = row.packIds
    ? Array.from(new Set(row.packIds))
    : undefined;
  const orderedPackIds =
    requestedPackIds !== undefined
      ? (() => {
          const ids = new Set<string>();
          return requestedPackIds.filter((packId) => {
            if (ids.has(packId)) return false;
            ids.add(packId);
            return true;
          });
        })()
      : undefined;

  const finalLinkUrl =
    row.linkUrl !== undefined ? row.linkUrl || null : existing.linkUrl;

  if (orderedPackIds !== undefined) {
    const validPacks =
      orderedPackIds.length > 0
        ? await prisma.oripaPack.findMany({
            where: { tenantId, id: { in: orderedPackIds } },
            select: { id: true },
          })
        : [];
    const validPackIdSet = new Set(validPacks.map((pack) => pack.id));
    const validOrderedPackIds = orderedPackIds.filter((packId) =>
      validPackIdSet.has(packId),
    );

    if (!finalLinkUrl && validOrderedPackIds.length === 0) {
      return NextResponse.json(
        { error: "対象パックまたはリンクURLのいずれかを指定してください" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.homeEvent.update({
        where: { id },
        data: {
          ...(row.title !== undefined ? { title: row.title } : {}),
          ...(row.subtitle !== undefined ? { subtitle: row.subtitle || null } : {}),
          ...(row.description !== undefined ? { description: row.description } : {}),
          ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
          ...(row.linkUrl !== undefined ? { linkUrl: row.linkUrl || null } : {}),
          ...(row.startsAt !== undefined ? { startsAt: row.startsAt ? new Date(row.startsAt) : null } : {}),
          ...(row.endsAt !== undefined ? { endsAt: row.endsAt ? new Date(row.endsAt) : null } : {}),
          ...(row.newUserOnly !== undefined ? { newUserOnly: row.newUserOnly } : {}),
          ...(row.sortOrder !== undefined ? { sortOrder: row.sortOrder } : {}),
          ...(row.isActive !== undefined ? { isActive: row.isActive } : {}),
          ...(row.isPublished !== undefined ? { isPublished: row.isPublished } : {}),
        },
      });

      await tx.homeEventPack.deleteMany({ where: { homeEventId: id, tenantId } });

      if (validOrderedPackIds.length > 0) {
        await tx.homeEventPack.createMany({
          data: validOrderedPackIds.map((packId, index) => ({
            tenantId,
            homeEventId: id,
            packId,
            sortOrder: index,
          })),
        });
      }

      return item;
    });

    return NextResponse.json(updated);
  }

  if (row.linkUrl !== undefined && !finalLinkUrl) {
    const existingPackCount = await prisma.homeEventPack.count({
      where: { tenantId, homeEventId: id },
    });
    if (existingPackCount === 0) {
      return NextResponse.json(
        { error: "対象パックまたはリンクURLのいずれかを指定してください" },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.homeEvent.update({
    where: { id },
    data: {
      ...(row.title !== undefined ? { title: row.title } : {}),
      ...(row.subtitle !== undefined ? { subtitle: row.subtitle || null } : {}),
      ...(row.description !== undefined ? { description: row.description } : {}),
      ...(row.imageUrl !== undefined ? { imageUrl: row.imageUrl } : {}),
      ...(row.linkUrl !== undefined ? { linkUrl: row.linkUrl || null } : {}),
      ...(row.startsAt !== undefined ? { startsAt: row.startsAt ? new Date(row.startsAt) : null } : {}),
      ...(row.endsAt !== undefined ? { endsAt: row.endsAt ? new Date(row.endsAt) : null } : {}),
      ...(row.newUserOnly !== undefined ? { newUserOnly: row.newUserOnly } : {}),
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

  const existing = await prisma.homeEvent.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  await prisma.homeEvent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
