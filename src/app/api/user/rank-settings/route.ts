import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { getRankSettings } from "@/lib/rewards/rank-settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await resolveTenantId();
  const [settings, user] = await Promise.all([
    getRankSettings(prisma, tenantId),
    prisma.user.findFirst({
      where: { id: session.user.id, tenantId },
      select: { rank: true, totalCharged: true },
    }),
  ]);

  return NextResponse.json({
    user,
    settings: settings.map((row) => ({
      rank: row.rank,
      chargeThreshold: row.chargeThreshold,
      coinReturnRate: row.coinReturnRate,
      mileReturnRate: row.mileReturnRate,
      rankUpBonus: row.rankUpBonus,
      sortOrder: row.sortOrder,
    })),
  });
}
