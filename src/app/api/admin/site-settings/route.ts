import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings, SITE_SETTING_KEYS } from "@/lib/tenant/site-settings";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const siteSettingsSchema = z.object({
  operatorName: z.string().trim().min(1, "運営者名は必須です").max(120),
  operatorCompany: z.string().trim().max(200).optional().default(""),
  operatorAddress: z.string().trim().max(300).optional().default(""),
  operatorPhone: z.string().trim().max(64).optional().default(""),
  secondhandDealerApproved: z.boolean().optional().default(false),
  secondhandDealerLicenseNumber: z.string().trim().max(64).optional().default(""),
  secondhandDealerIssuingAuthority: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default(""),
  supportEmail: z
    .string()
    .trim()
    .min(1, "問い合わせメールは必須です")
    .email("問い合わせメール形式が不正です")
    .max(320),
  supportHours: z.string().trim().max(200).optional().default(""),
  representativeName: z.string().trim().max(120).optional().default(""),
  businessDescription: z.string().trim().max(400).optional().default(""),
  paymentMethods: z.string().trim().max(400).optional().default(""),
  servicePriceNote: z.string().trim().max(400).optional().default(""),
  additionalFees: z.string().trim().max(400).optional().default(""),
  deliveryTime: z.string().trim().max(400).optional().default(""),
  returnPolicy: z.string().trim().max(500).optional().default(""),
  termsText: z.string().trim().min(1, "利用規約本文は必須です").max(20000),
  termsUpdatedAt: z
    .string()
    .trim()
    .regex(DATE_PATTERN, "利用規約の更新日は YYYY-MM-DD 形式で入力してください"),
  privacyText: z
    .string()
    .trim()
    .min(1, "プライバシーポリシー本文は必須です")
    .max(20000),
  privacyUpdatedAt: z
    .string()
    .trim()
    .regex(
      DATE_PATTERN,
      "プライバシーポリシーの更新日は YYYY-MM-DD 形式で入力してください",
    ),
});

function toOverrideEntries(value: z.infer<typeof siteSettingsSchema>) {
  return [
    [SITE_SETTING_KEYS.operatorName, value.operatorName],
    [SITE_SETTING_KEYS.operatorCompany, value.operatorCompany],
    [SITE_SETTING_KEYS.operatorAddress, value.operatorAddress],
    [SITE_SETTING_KEYS.operatorPhone, value.operatorPhone],
    [SITE_SETTING_KEYS.secondhandDealerApproved, value.secondhandDealerApproved ? "true" : "false"],
    [SITE_SETTING_KEYS.secondhandDealerLicenseNumber, value.secondhandDealerLicenseNumber],
    [
      SITE_SETTING_KEYS.secondhandDealerIssuingAuthority,
      value.secondhandDealerIssuingAuthority,
    ],
    [SITE_SETTING_KEYS.supportEmail, value.supportEmail],
    [SITE_SETTING_KEYS.supportHours, value.supportHours],
    [SITE_SETTING_KEYS.representativeName, value.representativeName],
    [SITE_SETTING_KEYS.businessDescription, value.businessDescription],
    [SITE_SETTING_KEYS.paymentMethods, value.paymentMethods],
    [SITE_SETTING_KEYS.servicePriceNote, value.servicePriceNote],
    [SITE_SETTING_KEYS.additionalFees, value.additionalFees],
    [SITE_SETTING_KEYS.deliveryTime, value.deliveryTime],
    [SITE_SETTING_KEYS.returnPolicy, value.returnPolicy],
    [SITE_SETTING_KEYS.termsText, value.termsText],
    [SITE_SETTING_KEYS.termsUpdatedAt, value.termsUpdatedAt],
    [SITE_SETTING_KEYS.privacyText, value.privacyText],
    [SITE_SETTING_KEYS.privacyUpdatedAt, value.privacyUpdatedAt],
  ] as const;
}

export async function GET() {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = session.user.tenantId;
  const settings = await getSiteSettings(tenantId);
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }
  const tenantId = session.user.tenantId;

  const parsed = siteSettingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const entries = toOverrideEntries(parsed.data);

  await prisma.$transaction(async (tx) => {
    for (const [key, value] of entries) {
      const normalized = value.trim();
      if (!normalized) {
        await tx.tenantContentOverride.deleteMany({
          where: { tenantId, key },
        });
        continue;
      }

      await tx.tenantContentOverride.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key,
          },
        },
        create: {
          tenantId,
          key,
          value: normalized,
          isPublished: true,
        },
        update: {
          value: normalized,
          isPublished: true,
        },
      });
    }
  });

  const settings = await getSiteSettings(tenantId);
  return NextResponse.json(settings);
}
