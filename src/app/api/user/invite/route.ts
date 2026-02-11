import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { ensureUserReferralCode } from "@/lib/rewards/referral";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;

  const code = await ensureUserReferralCode(prisma, userId);

  const [links, user] = await Promise.all([
    prisma.inviteLink.findMany({
      where: {
        tenantId,
        inviterId: userId,
      },
      select: {
        id: true,
        invitedUserId: true,
        createdAt: true,
        phoneVerifiedRewardedAt: true,
        firstChargeRewardedAt: true,
        invited: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { miles: true },
    }),
  ]);

  return NextResponse.json({
    referralCode: code,
    miles: user?.miles ?? 0,
    invitedCount: links.length,
    limit: 100,
    phoneVerifiedRewardedCount: links.filter((link) => !!link.phoneVerifiedRewardedAt).length,
    firstChargeRewardedCount: links.filter((link) => !!link.firstChargeRewardedAt).length,
    links: links.map((link) => ({
      id: link.id,
      name: link.invited.name ?? "ユーザー",
      createdAt: link.createdAt,
      phoneVerifiedRewarded: !!link.phoneVerifiedRewardedAt,
      firstChargeRewarded: !!link.firstChargeRewardedAt,
    })),
  });
}
