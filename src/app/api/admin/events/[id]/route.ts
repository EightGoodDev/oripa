import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isAllowedLinkUrl(value: string) {
  if (value.startsWith("/")) return !value.startsWith("//");
  return isHttpUrl(value);
}

function normalizeDateInput(value: string | null | undefined) {
  if (value === undefined) return { ok: true as const, value: undefined };
  if (value === null || value === "") return { ok: true as const, value: null as Date | null };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { ok: false as const };
  return { ok: true as const, value: date };
}

function uniqueOrderedIds(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const id = value.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

const optionalImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .or(z.literal(""))
  .refine((value) => !normalizeOptionalText(value) || isHttpUrl(normalizeOptionalText(value)!), {
    message: "画像URLは http(s) 形式で入力してください",
  });

const optionalLinkUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .or(z.literal(""))
  .refine((value) => !normalizeOptionalText(value) || isAllowedLinkUrl(normalizeOptionalText(value)!), {
    message: "リンクURLは https://... または /path 形式で入力してください",
  });

const optionalHexColorSchema = z
  .string()
  .trim()
  .max(16)
  .optional()
  .nullable()
  .or(z.literal(""))
  .refine((value) => !normalizeOptionalText(value) || HEX_COLOR_PATTERN.test(normalizeOptionalText(value)!), {
    message: "カラーコードは #RRGGBB 形式で入力してください",
  });

const updateSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    subtitle: z.string().trim().max(120).optional().nullable().or(z.literal("")),
    description: z.string().trim().max(500).optional(),
    displayType: z.enum(["IMAGE", "TEXT_FRAME"]).optional(),
    imageUrl: optionalImageUrlSchema,
    linkUrl: optionalLinkUrlSchema,
    backgroundColor: optionalHexColorSchema,
    borderColor: optionalHexColorSchema,
    textColor: optionalHexColorSchema,
    startsAt: z.string().optional().nullable().or(z.literal("")),
    endsAt: z.string().optional().nullable().or(z.literal("")),
    newUserOnly: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    packIds: z.array(z.string().min(1)).optional(),
  })
  .superRefine((value, ctx) => {
    const startsAt = normalizeDateInput(value.startsAt);
    const endsAt = normalizeDateInput(value.endsAt);
    if (!startsAt.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "開始日時の形式が不正です",
      });
    }
    if (!endsAt.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "終了日時の形式が不正です",
      });
    }

    if (startsAt.ok && endsAt.ok && startsAt.value && endsAt.value && startsAt.value > endsAt.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "終了日時は開始日時より後にしてください",
      });
    }
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
  const existing = await prisma.homeEvent.findFirst({
    where: { id, tenantId },
    include: {
      packs: {
        orderBy: { sortOrder: "asc" },
        select: { packId: true },
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  const row = parsed.data;
  const displayType = row.displayType ?? existing.displayType;
  const imageUrl = row.imageUrl !== undefined ? normalizeOptionalText(row.imageUrl) : existing.imageUrl;
  const linkUrl = row.linkUrl !== undefined ? normalizeOptionalText(row.linkUrl) : existing.linkUrl;
  const backgroundColor =
    row.backgroundColor !== undefined
      ? normalizeOptionalText(row.backgroundColor)
      : existing.backgroundColor;
  const borderColor =
    row.borderColor !== undefined
      ? normalizeOptionalText(row.borderColor)
      : existing.borderColor;
  const textColor =
    row.textColor !== undefined ? normalizeOptionalText(row.textColor) : existing.textColor;

  if (displayType === "IMAGE" && !imageUrl) {
    return NextResponse.json(
      { error: { imageUrl: ["IMAGEタイプでは画像URLが必須です"] } },
      { status: 400 },
    );
  }

  const startsAtNormalized = normalizeDateInput(row.startsAt);
  const endsAtNormalized = normalizeDateInput(row.endsAt);
  if (!startsAtNormalized.ok || !endsAtNormalized.ok) {
    return NextResponse.json({ error: "日付形式が不正です" }, { status: 400 });
  }
  const startsAt = startsAtNormalized.value !== undefined ? startsAtNormalized.value : existing.startsAt;
  const endsAt = endsAtNormalized.value !== undefined ? endsAtNormalized.value : existing.endsAt;
  if (startsAt && endsAt && startsAt > endsAt) {
    return NextResponse.json(
      { error: { endsAt: ["終了日時は開始日時より後にしてください"] } },
      { status: 400 },
    );
  }

  let orderedPackIds = existing.packs.map((pack) => pack.packId);
  if (row.packIds !== undefined) {
    const requestedPackIds = uniqueOrderedIds(row.packIds);
    const validPacks =
      requestedPackIds.length > 0
        ? await prisma.oripaPack.findMany({
            where: { tenantId, id: { in: requestedPackIds } },
            select: { id: true },
          })
        : [];
    const validPackIdSet = new Set(validPacks.map((pack) => pack.id));
    orderedPackIds = requestedPackIds.filter((packId) => validPackIdSet.has(packId));
  }

  if (!linkUrl && orderedPackIds.length === 0) {
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
        ...(row.subtitle !== undefined ? { subtitle: normalizeOptionalText(row.subtitle) } : {}),
        ...(row.description !== undefined ? { description: row.description } : {}),
        ...(row.displayType !== undefined ? { displayType: row.displayType } : {}),
        ...(row.imageUrl !== undefined ? { imageUrl } : {}),
        ...(row.linkUrl !== undefined ? { linkUrl } : {}),
        ...(row.backgroundColor !== undefined ? { backgroundColor } : {}),
        ...(row.borderColor !== undefined ? { borderColor } : {}),
        ...(row.textColor !== undefined ? { textColor } : {}),
        ...(row.startsAt !== undefined ? { startsAt } : {}),
        ...(row.endsAt !== undefined ? { endsAt } : {}),
        ...(row.newUserOnly !== undefined ? { newUserOnly: row.newUserOnly } : {}),
        ...(row.sortOrder !== undefined ? { sortOrder: row.sortOrder } : {}),
        ...(row.isActive !== undefined ? { isActive: row.isActive } : {}),
        ...(row.isPublished !== undefined ? { isPublished: row.isPublished } : {}),
      },
    });

    if (row.packIds !== undefined) {
      await tx.homeEventPack.deleteMany({ where: { homeEventId: id, tenantId } });

      if (orderedPackIds.length > 0) {
        await tx.homeEventPack.createMany({
          data: orderedPackIds.map((packId, index) => ({
            tenantId,
            homeEventId: id,
            packId,
            sortOrder: index,
          })),
        });
      }
    }

    return item;
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
