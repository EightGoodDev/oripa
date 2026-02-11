import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const itemSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  requiredMiles: z.coerce.number().int().min(1),
  stock: z.coerce.number().int().min(0).nullable().optional(),
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
  const items = await prisma.mileRewardItem.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const body = await req.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const row = parsed.data;

  const item = await prisma.mileRewardItem.create({
    data: {
      tenantId,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      requiredMiles: row.requiredMiles,
      stock: row.stock ?? null,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      isPublished: row.isPublished,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
