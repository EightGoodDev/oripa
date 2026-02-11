import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";

const TAB_BG_KEY_PREFIX = "pack-category-tab-bg:";
const TAB_TEXT_KEY_PREFIX = "pack-category-tab-text:";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

const updateCategoryStyleSchema = z.object({
  tabBackgroundColor: z
    .string()
    .trim()
    .max(16)
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (value) =>
        !normalizeOptionalText(value) ||
        HEX_COLOR_PATTERN.test(normalizeOptionalText(value)!),
      {
        message: "背景色は #RRGGBB 形式で入力してください",
      },
    ),
  tabTextColor: z
    .string()
    .trim()
    .max(16)
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (value) =>
        !normalizeOptionalText(value) ||
        HEX_COLOR_PATTERN.test(normalizeOptionalText(value)!),
      {
        message: "文字色は #RRGGBB 形式で入力してください",
      },
    ),
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
  const tenantId = await resolveTenantId();

  const { id } = await params;
  const body = await req.json();
  const parsed = updateCategoryStyleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const category = await prisma.packCategory.findFirst({
    where: { id, tenantId },
    select: { id: true, name: true },
  });
  if (!category) {
    return NextResponse.json(
      { error: "カテゴリが見つかりません" },
      { status: 404 },
    );
  }

  const tabBackgroundColor = normalizeOptionalText(parsed.data.tabBackgroundColor);
  const tabTextColor = normalizeOptionalText(parsed.data.tabTextColor);
  const bgKey = `${TAB_BG_KEY_PREFIX}${category.name}`;
  const textKey = `${TAB_TEXT_KEY_PREFIX}${category.name}`;

  await prisma.$transaction(async (tx) => {
    if (tabBackgroundColor) {
      await tx.tenantContentOverride.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: bgKey,
          },
        },
        update: {
          value: tabBackgroundColor,
          isPublished: true,
        },
        create: {
          tenantId,
          key: bgKey,
          value: tabBackgroundColor,
          isPublished: true,
        },
      });
    } else {
      await tx.tenantContentOverride.deleteMany({
        where: { tenantId, key: bgKey },
      });
    }

    if (tabTextColor) {
      await tx.tenantContentOverride.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: textKey,
          },
        },
        update: {
          value: tabTextColor,
          isPublished: true,
        },
        create: {
          tenantId,
          key: textKey,
          value: tabTextColor,
          isPublished: true,
        },
      });
    } else {
      await tx.tenantContentOverride.deleteMany({
        where: { tenantId, key: textKey },
      });
    }
  });

  return NextResponse.json({
    success: true,
    tabBackgroundColor,
    tabTextColor,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = await resolveTenantId();

  const { id } = await params;

  const category = await prisma.packCategory.findFirst({
    where: { id, tenantId },
    select: { id: true, name: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: "カテゴリが見つかりません" },
      { status: 404 },
    );
  }

  const usedCount = await prisma.oripaPack.count({
    where: { tenantId, category: category.name },
  });

  if (usedCount > 0) {
    return NextResponse.json(
      { error: "このカテゴリはパックで使用中のため削除できません" },
      { status: 400 },
    );
  }

  await prisma.packCategory.delete({
    where: { id: category.id },
  });

  await prisma.tenantContentOverride.deleteMany({
    where: {
      tenantId,
      key: {
        in: [
          `${TAB_BG_KEY_PREFIX}${category.name}`,
          `${TAB_TEXT_KEY_PREFIX}${category.name}`,
        ],
      },
    },
  });

  return NextResponse.json({ success: true });
}
