import type { PrismaClient, Prisma } from "@prisma/client";

const REFERRAL_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function randomCode(length = 8) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * REFERRAL_CODE_CHARS.length);
    result += REFERRAL_CODE_CHARS[index];
  }
  return result;
}

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function generateUniqueReferralCode(prisma: PrismaLike): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = randomCode(8);
    const exists = await prisma.user.findFirst({
      where: { referralCode: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  throw new Error("招待コードの生成に失敗しました");
}

export async function ensureUserReferralCode(
  prisma: PrismaLike,
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (!user) throw new Error("ユーザーが見つかりません");
  if (user.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode(prisma);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
    select: { referralCode: true },
  });

  return updated.referralCode ?? code;
}
