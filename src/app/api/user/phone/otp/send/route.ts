import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";
import { generateOtpCode, normalizePhone, sendOtpSms } from "@/lib/rewards/otp";

const sendSchema = z.object({
  phone: z.string().min(8).max(30),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);

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

  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const sentCount = await prisma.phoneOtpChallenge.count({
    where: {
      tenantId,
      userId,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (sentCount >= 5) {
    return NextResponse.json(
      { error: "短時間に送信しすぎています。しばらく待ってから再試行してください" },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  await prisma.phoneOtpChallenge.create({
    data: {
      tenantId,
      userId,
      phone,
      code,
      expiresAt,
    },
  });

  try {
    await sendOtpSms(phone, code);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SMS送信に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    expiresAt,
    ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
  });
}
