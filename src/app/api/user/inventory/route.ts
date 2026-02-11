import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const tenantId = await resolveTenantId();

  const statusParam = req.nextUrl.searchParams.get("status");

  const items = await prisma.ownedItem.findMany({
    where: {
      tenantId,
      userId: session.user.id,
      ...(statusParam ? { status: statusParam as "OWNED" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      prize: {
        select: {
          name: true,
          image: true,
          rarity: true,
          coinValue: true,
        },
      },
    },
  });

  return NextResponse.json(items);
}
