import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { normalizePhone } from "@/lib/rewards/otp";

const verifySchema = z.object({
  phone: z.string().min(8).max(30),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const userId = session.user.id;
  const phone = normalizePhone(parsed.data.phone);

  if (!phone) {
    return NextResponse.json(
      { error: "電話番号の形式が正しくありません" },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const challenge = await tx.phoneOtpChallenge.findFirst({
        where: {
          tenantId,
          userId,
          phone,
          verifiedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!challenge) {
        throw new Error("認証コードが見つかりません");
      }

      if (challenge.expiresAt.getTime() < Date.now()) {
        throw new Error("認証コードの有効期限が切れています");
      }

      if (challenge.attempts >= 5) {
        throw new Error("認証試行回数の上限に達しました");
      }

      if (challenge.code !== parsed.data.code) {
        await tx.phoneOtpChallenge.update({
          where: { id: challenge.id },
          data: { attempts: { increment: 1 } },
        });
        throw new Error("認証コードが一致しません");
      }

      await Promise.all([
        tx.phoneOtpChallenge.update({
          where: { id: challenge.id },
          data: { verifiedAt: new Date() },
        }),
        tx.user.update({
          where: { id: userId },
          data: {
            phone,
            phoneVerified: true,
          },
        }),
      ]);

      const inviteLink = await tx.inviteLink.findFirst({
        where: {
          tenantId,
          invitedUserId: userId,
          phoneVerifiedRewardedAt: null,
        },
      });

      if (inviteLink) {
        const reward = 50;
        const [inviter, invited] = await Promise.all([
          tx.user.findUnique({
            where: { id: inviteLink.inviterId },
            select: { id: true, miles: true },
          }),
          tx.user.findUnique({
            where: { id: inviteLink.invitedUserId },
            select: { id: true, miles: true },
          }),
        ]);

        if (inviter && invited) {
          const inviterMiles = inviter.miles + reward;
          const invitedMiles = invited.miles + reward;

          await Promise.all([
            tx.user.update({
              where: { id: inviter.id },
              data: { miles: inviterMiles },
            }),
            tx.user.update({
              where: { id: invited.id },
              data: { miles: invitedMiles },
            }),
            tx.mileageTransaction.create({
              data: {
                tenantId,
                userId: inviter.id,
                amount: reward,
                balance: inviterMiles,
                type: "INVITE_PHONE_BONUS",
                description: "招待ユーザーの電話認証達成",
                referenceId: inviteLink.id,
              },
            }),
            tx.mileageTransaction.create({
              data: {
                tenantId,
                userId: invited.id,
                amount: reward,
                balance: invitedMiles,
                type: "INVITE_PHONE_BONUS",
                description: "電話認証完了ボーナス",
                referenceId: inviteLink.id,
              },
            }),
            tx.inviteLink.update({
              where: { id: inviteLink.id },
              data: { phoneVerifiedRewardedAt: new Date() },
            }),
          ]);
        }
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "認証に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
