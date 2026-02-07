import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

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
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.chargeOrder.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.draw.count({
      where: { createdAt: { gte: todayStart }, isTrial: false },
    }),
    prisma.oripaPack.count({
      where: { status: "ACTIVE" },
    }),
    prisma.oripaPack.count({
      where: { status: "SOLD_OUT" },
    }),
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT
        DATE("createdAt") AS date,
        COUNT(*)::int AS count
      FROM "Draw"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        AND "isTrial" = false
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;

  return NextResponse.json({
    totalUsers,
    newUsersToday,
    totalRevenue,
    drawsToday,
    activePacks,
    soldOutPacks,
    dailyDraws,
  });
}
