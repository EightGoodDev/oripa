import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { DEFAULT_RANK_SETTINGS, getRankSettings } from "@/lib/rewards/rank-settings";
import { recalculateAllUserRanks } from "@/lib/rewards/recalculate";

const rowSchema = z.object({
  rank: z.enum(["BEGINNER", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "VIP"]),
  chargeThreshold: z.coerce.number().int().min(0),
  coinReturnRate: z.coerce.number().min(0).max(1),
  mileReturnRate: z.coerce.number().min(0).max(1),
  rankUpBonus: z.coerce.number().int().min(0),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});

const updateSchema = z.object({
  rows: z.array(rowSchema).length(7),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const settings = await getRankSettings(prisma, tenantId);

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const normalizedRows = DEFAULT_RANK_SETTINGS.map((defaultRow, idx) => {
    const incoming = parsed.data.rows.find((row) => row.rank === defaultRow.rank);
    return {
      rank: defaultRow.rank,
      chargeThreshold: incoming?.chargeThreshold ?? defaultRow.chargeThreshold,
      coinReturnRate: incoming?.coinReturnRate ?? defaultRow.coinReturnRate,
      mileReturnRate: incoming?.mileReturnRate ?? defaultRow.mileReturnRate,
      rankUpBonus: incoming?.rankUpBonus ?? defaultRow.rankUpBonus,
      sortOrder: incoming?.sortOrder ?? idx,
      isActive: incoming?.isActive ?? true,
    };
  });

  await prisma.$transaction(async (tx) => {
    for (const row of normalizedRows) {
      await tx.rankSetting.upsert({
        where: {
          tenantId_rank: {
            tenantId,
            rank: row.rank,
          },
        },
        update: {
          chargeThreshold: row.chargeThreshold,
          coinReturnRate: row.coinReturnRate,
          mileReturnRate: row.mileReturnRate,
          rankUpBonus: row.rankUpBonus,
          sortOrder: row.sortOrder,
          isActive: row.isActive,
          isPublished: true,
        },
        create: {
          tenantId,
          rank: row.rank,
          chargeThreshold: row.chargeThreshold,
          coinReturnRate: row.coinReturnRate,
          mileReturnRate: row.mileReturnRate,
          rankUpBonus: row.rankUpBonus,
          sortOrder: row.sortOrder,
          isActive: row.isActive,
          isPublished: true,
        },
      });
    }
  });

  const recalcSummary = await recalculateAllUserRanks(tenantId);

  return NextResponse.json({ success: true, recalcSummary });
}
