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

const eventSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  linkUrl: optionalLinkUrlSchema,
  startsAt: z.string().optional().nullable().or(z.literal("")),
  endsAt: z.string().optional().nullable().or(z.literal("")),
  newUserOnly: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  packIds: z.array(z.string().min(1)).default([]),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const events = await prisma.homeEvent.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      packs: {
        orderBy: { sortOrder: "asc" },
        include: {
          pack: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const row = parsed.data;
  const requestedPackIds = Array.from(new Set(row.packIds));
  const validPacks =
    requestedPackIds.length > 0
      ? await prisma.oripaPack.findMany({
          where: {
            tenantId,
            id: { in: requestedPackIds },
          },
          select: { id: true },
        })
      : [];
  const validPackIdSet = new Set(validPacks.map((pack) => pack.id));
  const orderedPackIds = requestedPackIds.filter((packId) =>
    validPackIdSet.has(packId),
  );

  if (!row.linkUrl && orderedPackIds.length === 0) {
    return NextResponse.json(
      { error: "対象パックまたはリンクURLのいずれかを指定してください" },
      { status: 400 },
    );
  }

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.homeEvent.create({
      data: {
        tenantId,
        title: row.title,
        subtitle: row.subtitle || null,
        description: row.description,
        imageUrl: row.imageUrl,
        linkUrl: row.linkUrl || null,
        startsAt: row.startsAt ? new Date(row.startsAt) : null,
        endsAt: row.endsAt ? new Date(row.endsAt) : null,
        newUserOnly: row.newUserOnly,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        isPublished: row.isPublished,
      },
    });

    if (orderedPackIds.length > 0) {
      await tx.homeEventPack.createMany({
        data: orderedPackIds.map((packId, index) => ({
          tenantId,
          homeEventId: created.id,
          packId,
          sortOrder: index,
        })),
      });
    }

    return created;
  });

  return NextResponse.json(event, { status: 201 });
}
