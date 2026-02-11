import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const bannerSchema = z.object({
  title: z.string().max(120).optional().nullable(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  startsAt: z.string().optional().nullable().or(z.literal("")),
  endsAt: z.string().optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const banners = await prisma.homeBanner.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const body = await req.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const banner = await prisma.homeBanner.create({
    data: {
      tenantId,
      title: parsed.data.title || null,
      imageUrl: parsed.data.imageUrl,
      linkUrl: parsed.data.linkUrl || null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
      isPublished: parsed.data.isPublished,
    },
  });

  return NextResponse.json(banner, { status: 201 });
}
