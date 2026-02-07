import { prisma } from "./prisma";
import type { PackListItem, PackDetail, RankingEntry } from "@/types";

export async function getActivePacks(): Promise<PackListItem[]> {
  const packs = await prisma.oripaPack.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      image: true,
      category: true,
      pricePerDraw: true,
      totalStock: true,
      remainingStock: true,
      featured: true,
      lastOnePrizeId: true,
      endsAt: true,
    },
  });

  return packs.map((p) => ({
    id: p.id,
    title: p.title,
    image: p.image,
    category: p.category,
    pricePerDraw: p.pricePerDraw,
    totalStock: p.totalStock,
    remainingStock: p.remainingStock,
    featured: p.featured,
    hasLastOnePrize: !!p.lastOnePrizeId,
    endsAt: p.endsAt?.toISOString() ?? null,
  }));
}

export async function getPackDetail(id: string): Promise<PackDetail | null> {
  const pack = await prisma.oripaPack.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      lastOnePrize: {
        select: {
          id: true,
          name: true,
          image: true,
          rarity: true,
          marketPrice: true,
        },
      },
      packPrizes: {
        include: {
          prize: true,
        },
        orderBy: [{ prize: { rarity: "desc" } }, { weight: "asc" }],
      },
    },
  });

  if (!pack) return null;

  const totalWeight = pack.packPrizes.reduce((sum, pp) => sum + pp.weight, 0);

  return {
    id: pack.id,
    title: pack.title,
    description: pack.description,
    image: pack.image,
    category: pack.category,
    pricePerDraw: pack.pricePerDraw,
    totalStock: pack.totalStock,
    remainingStock: pack.remainingStock,
    featured: pack.featured,
    limitPerUser: pack.limitPerUser,
    endsAt: pack.endsAt?.toISOString() ?? null,
    lastOnePrize: pack.lastOnePrize,
    prizes: pack.packPrizes.map((pp) => ({
      id: pp.id,
      prizeId: pp.prizeId,
      name: pp.prize.name,
      image: pp.prize.image,
      rarity: pp.prize.rarity,
      marketPrice: pp.prize.marketPrice,
      coinValue: pp.prize.coinValue,
      weight: pp.weight,
      totalQuantity: pp.totalQuantity,
      remainingQuantity: pp.remainingQuantity,
    })),
    totalWeight,
  };
}

export async function getRecentWinners(limit = 30): Promise<RankingEntry[]> {
  const draws = await prisma.draw.findMany({
    where: {
      isTrial: false,
      prize: {
        rarity: { in: ["SR", "SSR", "UR"] },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, image: true } },
      prize: {
        select: { name: true, image: true, rarity: true },
      },
      pack: { select: { title: true } },
    },
  });

  return draws.map((d) => ({
    id: d.id,
    userName: d.user?.name ?? "匿名",
    userImage: d.user?.image ?? null,
    prizeName: d.prize.name,
    prizeImage: d.prize.image,
    prizeRarity: d.prize.rarity,
    oripaTitle: d.pack.title,
    drawnAt: d.createdAt.toISOString(),
  }));
}

export async function getChargePlans() {
  return prisma.chargePlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
