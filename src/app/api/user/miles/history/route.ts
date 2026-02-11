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

  const history = await prisma.mileageTransaction.findMany({
    where: {
      tenantId,
      userId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      amount: true,
      balance: true,
      type: true,
      description: true,
      referenceId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(history);
}
