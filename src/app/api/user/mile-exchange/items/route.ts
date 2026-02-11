import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await resolveTenantId();

  const [items, user] = await Promise.all([
    prisma.mileRewardItem.findMany({
      where: {
        tenantId,
        isActive: true,
        isPublished: true,
        OR: [{ stock: null }, { stock: { gt: 0 } }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { miles: true },
    }),
  ]);

  const miles = user?.miles ?? 0;

  return NextResponse.json(
    items.map((item) => ({
      ...item,
      canExchange: miles >= item.requiredMiles,
    })),
  );
}
