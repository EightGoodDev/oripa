import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  drawsToday: number;
  activePacks: number;
  soldOutPacks: number;
  dailyDraws: { date: string; count: number }[];
}

export async function getAdminDashboardStats(tenantId: string): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersToday,
    revenueAgg,
    drawsToday,
    activePacks,
    soldOutPacks,
    dailyDraws,
  ] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({
      where: { tenantId, createdAt: { gte: todayStart } },
    }),
    prisma.chargeOrder.aggregate({
      _sum: { amount: true },
      where: { tenantId, status: "COMPLETED" },
    }),
    prisma.draw.count({
      where: { tenantId, createdAt: { gte: todayStart }, isTrial: false },
    }),
    prisma.oripaPack.count({
      where: { tenantId, status: "ACTIVE" },
    }),
    prisma.oripaPack.count({
      where: { tenantId, status: "SOLD_OUT" },
    }),
    prisma.$queryRaw<{ date: string; count: number }[]>(
      Prisma.sql`
        SELECT
          DATE("createdAt") AS date,
          COUNT(*)::int AS count
        FROM "Draw"
        WHERE "tenantId" = ${tenantId}
          AND "createdAt" >= NOW() - INTERVAL '7 days'
          AND "isTrial" = false
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ),
  ]);

  return {
    totalUsers,
    newUsersToday,
    totalRevenue: revenueAgg._sum.amount ?? 0,
    drawsToday,
    activePacks,
    soldOutPacks,
    dailyDraws,
  };
}
