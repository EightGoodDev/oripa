import type { UserRank } from "@prisma/client";
import { prisma } from "./prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { getRankIndex } from "@/lib/rewards/rank-settings";
import type {
  PackListItem,
  PackDetail,
  RankingEntry,
  HomeBannerItem,
  HomeEventItem,
} from "@/types";

function canViewRankLimitedContent(userRank: UserRank, minRank: UserRank) {
  return getRankIndex(userRank) >= getRankIndex(minRank);
}

function toPackListItem(pack: {
  id: string;
  title: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  featured: boolean;
  lastOnePrizeId: string | null;
  endsAt: Date | null;
}) {
  return {
    id: pack.id,
    title: pack.title,
    image: pack.image,
    category: pack.category,
    pricePerDraw: pack.pricePerDraw,
    totalStock: pack.totalStock,
    remainingStock: pack.remainingStock,
    featured: pack.featured,
    hasLastOnePrize: !!pack.lastOnePrizeId,
    endsAt: pack.endsAt?.toISOString() ?? null,
  } satisfies PackListItem;
}

export async function getActivePacks(
  userRank: UserRank = "BEGINNER",
): Promise<PackListItem[]> {
  const tenantId = await resolveTenantId();

  const packs = await prisma.oripaPack.findMany({
    where: { tenantId, status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      image: true,
      category: true,
      minRank: true,
      pricePerDraw: true,
      totalStock: true,
      remainingStock: true,
      featured: true,
      lastOnePrizeId: true,
      endsAt: true,
    },
  });

  return packs
    .filter((pack) => canViewRankLimitedContent(userRank, pack.minRank))
    .map((pack) => toPackListItem(pack));
}

export async function getHomePageData(options?: {
  userId?: string;
  userRank?: UserRank;
}): Promise<{ packs: PackListItem[]; banners: HomeBannerItem[]; events: HomeEventItem[] }> {
  const tenantId = await resolveTenantId();
  const userRank = options?.userRank ?? "BEGINNER";

  const [packs, now, user] = await Promise.all([
    getActivePacks(userRank),
    Promise.resolve(new Date()),
    options?.userId
      ? prisma.user.findUnique({
          where: { id: options.userId },
          select: { firstDrawAt: true },
        })
      : Promise.resolve(null),
  ]);

  const [bannersRaw, eventsRaw] = await Promise.all([
    prisma.homeBanner.findMany({
      where: {
        tenantId,
        isActive: true,
        isPublished: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
      },
    }),
    prisma.homeEvent.findMany({
      where: {
        tenantId,
        isActive: true,
        isPublished: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        packs: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          include: {
            pack: {
              select: {
                id: true,
                title: true,
                image: true,
                category: true,
                minRank: true,
                pricePerDraw: true,
                totalStock: true,
                remainingStock: true,
                featured: true,
                lastOnePrizeId: true,
                endsAt: true,
                status: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const isNewUser = !user || !user.firstDrawAt;

  const events = eventsRaw
    .filter((event) => (event.newUserOnly ? isNewUser : true))
    .map((event) => {
      const eventPacks = event.packs
        .map((link) => link.pack)
        .filter((pack) => pack.status === "ACTIVE")
        .filter((pack) => canViewRankLimitedContent(userRank, pack.minRank))
        .map((pack) => toPackListItem(pack));

      return {
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        imageUrl: event.imageUrl,
        linkUrl: event.linkUrl,
        packs: eventPacks,
      } satisfies HomeEventItem;
    })
    .filter((event) => event.packs.length > 0 || Boolean(event.linkUrl));

  return {
    packs,
    banners: bannersRaw,
    events,
  };
}

export async function getPackDetail(
  id: string,
  userRank: UserRank = "BEGINNER",
): Promise<PackDetail | null> {
  const tenantId = await resolveTenantId();

  const pack = await prisma.oripaPack.findFirst({
    where: { id, tenantId, status: "ACTIVE" },
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
  if (!canViewRankLimitedContent(userRank, pack.minRank)) return null;

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
  const tenantId = await resolveTenantId();

  const draws = await prisma.draw.findMany({
    where: {
      tenantId,
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

export async function getChargePlans(userId?: string) {
  const tenantId = await resolveTenantId();

  let hasCompletedCharge = false;
  if (userId) {
    const count = await prisma.chargeOrder.count({
      where: {
        tenantId,
        userId,
        status: "COMPLETED",
      },
    });
    hasCompletedCharge = count > 0;
  }

  return prisma.chargePlan.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(hasCompletedCharge ? { firstTimeOnly: false } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
}
