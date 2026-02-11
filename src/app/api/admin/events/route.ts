import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const eventSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
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

    if (row.packIds.length > 0) {
      const packs = await tx.oripaPack.findMany({
        where: {
          tenantId,
          id: { in: row.packIds },
        },
        select: { id: true },
      });

      await tx.homeEventPack.createMany({
        data: packs.map((pack, index) => ({
          tenantId,
          homeEventId: created.id,
          packId: pack.id,
          sortOrder: index,
        })),
      });
    }

    return created;
  });

  return NextResponse.json(event, { status: 201 });
}
