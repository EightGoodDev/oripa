import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";

const VALID_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
const VALID_RANKS = ["BEGINNER", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "VIP"] as const;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role");
  const rank = searchParams.get("rank");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    where.role = role;
  }

  if (rank && VALID_RANKS.includes(rank as typeof VALID_RANKS[number])) {
    where.rank = rank;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      rank: true,
      coins: true,
      isActive: true,
      createdAt: true,
      _count: { select: { draws: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
