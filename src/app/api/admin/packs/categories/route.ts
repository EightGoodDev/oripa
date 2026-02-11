import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { z } from "zod";

const DEFAULT_CATEGORIES = ["sneaker", "card", "figure", "game", "other"];

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "カテゴリ名を入力してください")
    .max(40, "カテゴリ名は40文字以内で入力してください"),
});

async function ensureDefaultCategories(tenantId: string) {
  await prisma.packCategory.updateMany({
    where: { tenantId, name: { in: DEFAULT_CATEGORIES } },
    data: { isActive: true },
  });

  const existingDefaults = await prisma.packCategory.findMany({
    where: { tenantId, name: { in: DEFAULT_CATEGORIES } },
    select: { name: true },
  });
  const existingNames = new Set(existingDefaults.map((category) => category.name));
  const missingDefaults = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));

  if (missingDefaults.length === 0) return;

  const maxSort = await prisma.packCategory.aggregate({
    where: { tenantId },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  await prisma.$transaction(
    missingDefaults.map((name, index) =>
      prisma.packCategory.create({
        data: {
          tenantId,
          name,
          isActive: true,
          sortOrder: nextSortOrder + index,
        },
      }),
    ),
  );
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  await ensureDefaultCategories(tenantId);

  const categories = await prisma.packCategory.findMany({
    where: { tenantId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      createdAt: true,
    },
  });

  const usage = await prisma.oripaPack.groupBy({
    where: { tenantId },
    by: ["category"],
    _count: { _all: true },
  });
  const usageMap = new Map(usage.map((item) => [item.category, item._count._all]));

  return NextResponse.json(
    categories.map((category) => ({
      ...category,
      packCount: usageMap.get(category.name) ?? 0,
    })),
  );
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const name = parsed.data.name;

  const exists = await prisma.packCategory.findFirst({
    where: {
      tenantId,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true, name: true },
  });

  if (exists) {
    return NextResponse.json(
      { error: { name: ["同じカテゴリ名がすでに存在します"] } },
      { status: 409 },
    );
  }

  const maxSort = await prisma.packCategory.aggregate({
    where: { tenantId },
    _max: { sortOrder: true },
  });

  const category = await prisma.packCategory.create({
    data: {
      tenantId,
      name,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      createdAt: true,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
