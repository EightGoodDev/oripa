import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const tenantId = await resolveTenantId();

  const draws = await prisma.draw.findMany({
    where: { tenantId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      isTrial: true,
      createdAt: true,
      prize: { select: { name: true, rarity: true } },
      pack: { select: { title: true } },
    },
  });

  return NextResponse.json(draws);
}
