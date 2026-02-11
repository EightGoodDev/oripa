import type { PrismaClient, Prisma, RankSetting, UserRank } from "@prisma/client";

export const RANK_ORDER: UserRank[] = [
  "BEGINNER",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "VIP",
];

export type RankSettingSeed = {
  rank: UserRank;
  chargeThreshold: number;
  coinReturnRate: number;
  mileReturnRate: number;
  rankUpBonus: number;
  sortOrder: number;
};

export const DEFAULT_RANK_SETTINGS: RankSettingSeed[] = [
  { rank: "BEGINNER", chargeThreshold: 0, coinReturnRate: 0, mileReturnRate: 0.004, rankUpBonus: 0, sortOrder: 0 },
  { rank: "BRONZE", chargeThreshold: 100000, coinReturnRate: 0.01, mileReturnRate: 0.004, rankUpBonus: 1000, sortOrder: 1 },
  { rank: "SILVER", chargeThreshold: 300000, coinReturnRate: 0.02, mileReturnRate: 0.004, rankUpBonus: 5000, sortOrder: 2 },
  { rank: "GOLD", chargeThreshold: 800000, coinReturnRate: 0.03, mileReturnRate: 0.006, rankUpBonus: 15000, sortOrder: 3 },
  { rank: "PLATINUM", chargeThreshold: 2000000, coinReturnRate: 0.04, mileReturnRate: 0.007, rankUpBonus: 25000, sortOrder: 4 },
  { rank: "DIAMOND", chargeThreshold: 4500000, coinReturnRate: 0.05, mileReturnRate: 0.01, rankUpBonus: 50000, sortOrder: 5 },
  { rank: "VIP", chargeThreshold: 8000000, coinReturnRate: 0.06, mileReturnRate: 0.015, rankUpBonus: 100000, sortOrder: 6 },
];

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function ensureDefaultRankSettings(prisma: PrismaLike, tenantId: string) {
  const count = await prisma.rankSetting.count({ where: { tenantId } });
  if (count > 0) return;

  await prisma.rankSetting.createMany({
    data: DEFAULT_RANK_SETTINGS.map((row) => ({
      tenantId,
      rank: row.rank,
      chargeThreshold: row.chargeThreshold,
      coinReturnRate: row.coinReturnRate,
      mileReturnRate: row.mileReturnRate,
      rankUpBonus: row.rankUpBonus,
      sortOrder: row.sortOrder,
      isActive: true,
      isPublished: true,
    })),
  });
}

export async function getRankSettings(prisma: PrismaLike, tenantId: string) {
  await ensureDefaultRankSettings(prisma, tenantId);

  const rows = await prisma.rankSetting.findMany({
    where: { tenantId, isActive: true, isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { chargeThreshold: "asc" }],
  });

  if (rows.length > 0) return rows;

  // Fallback safety for partially seeded states.
  return DEFAULT_RANK_SETTINGS.map(
    (row): RankSetting => ({
      id: `default-${row.rank}`,
      tenantId,
      rank: row.rank,
      chargeThreshold: row.chargeThreshold,
      coinReturnRate: row.coinReturnRate,
      mileReturnRate: row.mileReturnRate,
      rankUpBonus: row.rankUpBonus,
      sortOrder: row.sortOrder,
      isActive: true,
      isPublished: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }),
  );
}

export function calcRankByTotalCharged(totalCharged: number, settings: Pick<RankSetting, "rank" | "chargeThreshold">[]): UserRank {
  let current: UserRank = "BEGINNER";

  for (const row of [...settings].sort((a, b) => a.chargeThreshold - b.chargeThreshold)) {
    if (totalCharged >= row.chargeThreshold) {
      current = row.rank;
    }
  }

  return current;
}

export function getRankSetting(
  settings: Pick<RankSetting, "rank" | "coinReturnRate" | "mileReturnRate" | "rankUpBonus">[],
  rank: UserRank,
) {
  return settings.find((row) => row.rank === rank);
}

export function getRankIndex(rank: UserRank): number {
  return RANK_ORDER.indexOf(rank);
}

export function getCumulativeRankBonus(
  settings: Pick<RankSetting, "rank" | "rankUpBonus">[],
  rank: UserRank,
): number {
  const target = getRankIndex(rank);
  return settings.reduce((sum, row) => {
    return getRankIndex(row.rank) <= target ? sum + row.rankUpBonus : sum;
  }, 0);
}

export function listRanksUpTo(rank: UserRank): UserRank[] {
  const target = getRankIndex(rank);
  return RANK_ORDER.filter((item) => getRankIndex(item) <= target);
}
