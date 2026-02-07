import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";

const VALID_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      rank: true,
      coins: true,
      totalSpent: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      draws: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          coinsCost: true,
          isTrial: true,
          createdAt: true,
          prize: { select: { id: true, name: true, rarity: true } },
          pack: { select: { id: true, title: true } },
        },
      },
      coinTransactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          balance: true,
          type: true,
          description: true,
          createdAt: true,
        },
      },
      _count: { select: { draws: true } },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません" },
      { status: 404 },
    );
  }

  void logAdminAction(session.user!.id!, "VIEW", "user", id);

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await params;
  const body = await req.json();
  const adminId = session.user!.id!;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません" },
      { status: 404 },
    );
  }

  // Coin adjustment
  if (body.coinAdjust) {
    const { amount, reason } = body.coinAdjust as {
      amount: number;
      reason?: string;
    };

    if (typeof amount !== "number" || amount === 0) {
      return NextResponse.json(
        { error: "調整額を正しく入力してください" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id },
        data: { coins: { increment: amount } },
      });
      await tx.coinTransaction.create({
        data: {
          userId: id,
          amount,
          balance: user.coins,
          type: "ADMIN_ADJUST",
          description: reason || "管理者による調整",
        },
      });
    });

    await logAdminAction(adminId, "COIN_ADJUST", "user", id, {
      amount,
      reason: reason || "管理者による調整",
    });
  }

  // Role change
  if (body.role) {
    const newRole = body.role as string;

    if (!VALID_ROLES.includes(newRole as typeof VALID_ROLES[number])) {
      return NextResponse.json(
        { error: "無効なロールです" },
        { status: 400 },
      );
    }

    if (session.user!.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "ロール変更にはSUPER_ADMIN権限が必要です" },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { role: newRole as any },
    });

    await logAdminAction(adminId, "ROLE_CHANGE", "user", id, {
      from: existing.role,
      to: newRole,
    });
  }

  // Active status
  if (typeof body.isActive === "boolean") {
    await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    await logAdminAction(adminId, "STATUS_CHANGE", "user", id, {
      isActive: body.isActive,
    });
  }

  const updated = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      rank: true,
      coins: true,
      totalSpent: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { draws: true } },
    },
  });

  return NextResponse.json(updated);
}
