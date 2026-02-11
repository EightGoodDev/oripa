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

const createEventSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().max(120).optional().nullable().or(z.literal("")),
    description: z.string().trim().max(500).optional().default(""),
    displayType: z.enum(["IMAGE", "TEXT_FRAME"]).default("IMAGE"),
    imageUrl: optionalImageUrlSchema,
    linkUrl: optionalLinkUrlSchema,
    backgroundColor: optionalHexColorSchema,
    borderColor: optionalHexColorSchema,
    textColor: optionalHexColorSchema,
    startsAt: z.string().optional().nullable().or(z.literal("")),
    endsAt: z.string().optional().nullable().or(z.literal("")),
    newUserOnly: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
    isPublished: z.boolean().default(true),
    packIds: z.array(z.string().min(1)).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.displayType === "IMAGE" && !normalizeOptionalText(value.imageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageUrl"],
        message: "IMAGEタイプでは画像URLが必須です",
      });
    }

    const startsAt = normalizeDateInput(value.startsAt ?? "");
    const endsAt = normalizeDateInput(value.endsAt ?? "");
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
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const row = parsed.data;
  const requestedPackIds = uniqueOrderedIds(row.packIds);

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

  const linkUrl = normalizeOptionalText(row.linkUrl);
  if (!linkUrl && orderedPackIds.length === 0) {
    return NextResponse.json(
      { error: "対象パックまたはリンクURLのいずれかを指定してください" },
      { status: 400 },
    );
  }

  const startsAt = normalizeDateInput(row.startsAt ?? "");
  const endsAt = normalizeDateInput(row.endsAt ?? "");
  if (!startsAt.ok || !endsAt.ok) {
    return NextResponse.json({ error: "日付形式が不正です" }, { status: 400 });
  }

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.homeEvent.create({
      data: {
        tenantId,
        title: row.title.trim(),
        subtitle: normalizeOptionalText(row.subtitle),
        description: row.description.trim(),
        displayType: row.displayType,
        imageUrl: normalizeOptionalText(row.imageUrl),
        linkUrl,
        backgroundColor: normalizeOptionalText(row.backgroundColor),
        borderColor: normalizeOptionalText(row.borderColor),
        textColor: normalizeOptionalText(row.textColor),
        startsAt: startsAt.value ?? null,
        endsAt: endsAt.value ?? null,
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
