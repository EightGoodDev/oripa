import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { generateUniqueReferralCode } from "@/lib/rewards/referral";
import { getSiteSettings } from "@/lib/tenant/site-settings";

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字を含めてください",
    ),
  name: z.string().min(1, "名前を入力してください").max(50),
  inviteCode: z.string().trim().min(4).max(20).optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "利用規約への同意が必要です",
  }),
  acceptPrivacy: z.boolean().refine((v) => v === true, {
    message: "プライバシーポリシーへの同意が必要です",
  }),
  termsUpdatedAt: z.string().trim().min(1).max(32),
  privacyUpdatedAt: z.string().trim().min(1).max(32),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, inviteCode, termsUpdatedAt, privacyUpdatedAt } =
      registerSchema.parse(body);
    const tenantId = await resolveTenantId();
    const settings = await getSiteSettings(tenantId);

    if (termsUpdatedAt !== settings.termsUpdatedAt) {
      return NextResponse.json(
        { error: "利用規約が更新されました。最新の利用規約を確認して同意してください。" },
        { status: 409 },
      );
    }
    if (privacyUpdatedAt !== settings.privacyUpdatedAt) {
      return NextResponse.json(
        {
          error:
            "プライバシーポリシーが更新されました。最新のプライバシーポリシーを確認して同意してください。",
        },
        { status: 409 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    const user = await prisma.$transaction(async (tx) => {
      let inviterId: string | null = null;

      if (inviteCode) {
        const inviter = await tx.user.findFirst({
          where: {
            tenantId,
            referralCode: inviteCode,
          },
          select: { id: true },
        });

        if (!inviter) {
          throw new Error("招待コードが無効です");
        }

        const inviteCount = await tx.inviteLink.count({
          where: {
            tenantId,
            inviterId: inviter.id,
          },
        });

        if (inviteCount >= 100) {
          throw new Error("この招待コードは上限に達しています");
        }

        inviterId = inviter.id;
      }

      const referralCode = await generateUniqueReferralCode(tx);

      const createdUser = await tx.user.create({
        data: {
          tenantId,
          email,
          name,
          hashedPassword,
          referralCode,
          invitedByUserId: inviterId,
          termsAcceptedVersion: settings.termsUpdatedAt,
          termsAcceptedAt: now,
          privacyAcceptedVersion: settings.privacyUpdatedAt,
          privacyAcceptedAt: now,
        },
        select: { id: true, email: true, name: true },
      });

      if (inviterId) {
        await tx.inviteLink.create({
          data: {
            tenantId,
            inviterId,
            invitedUserId: createdUser.id,
          },
        });
      }

      return createdUser;
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("招待コード")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("[Register Error]", error);
    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 },
    );
  }
}
