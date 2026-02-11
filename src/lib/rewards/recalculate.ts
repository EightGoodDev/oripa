import { prisma } from "@/lib/db/prisma";
import { calcRankByTotalCharged, getRankSettings, listRanksUpTo } from "@/lib/rewards/rank-settings";

export async function recalculateAllUserRanks(tenantId: string) {
  const settings = await getRankSettings(prisma, tenantId);

  const users = await prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      rank: true,
      totalCharged: true,
      coins: true,
    },
  });

  let rankUpdatedCount = 0;
  let bonusGrantedUsers = 0;
  let totalBonusDelta = 0;

  for (const user of users) {
    const newRank = calcRankByTotalCharged(user.totalCharged, settings);

    let coinDelta = 0;

    await prisma.$transaction(async (tx) => {
      if (user.rank !== newRank) {
        await tx.user.update({
          where: { id: user.id },
          data: { rank: newRank },
        });
        rankUpdatedCount += 1;
      }

      const reachableRanks = listRanksUpTo(newRank).filter((rank) => rank !== "BEGINNER");
      for (const rank of reachableRanks) {
        const setting = settings.find((row) => row.rank === rank);
        if (!setting || setting.rankUpBonus <= 0) continue;

        const granted = await tx.userRankBonusGrant.findFirst({
          where: {
            tenantId,
            userId: user.id,
            rank,
          },
        });

        if (!granted) {
          await tx.userRankBonusGrant.create({
            data: {
              tenantId,
              userId: user.id,
              rank,
              amount: setting.rankUpBonus,
              reason: "RANK_RECALCULATE",
            },
          });
          coinDelta += setting.rankUpBonus;
          totalBonusDelta += setting.rankUpBonus;
          continue;
        }

        const diff = setting.rankUpBonus - granted.amount;
        if (diff > 0) {
          await tx.userRankBonusGrant.update({
            where: { id: granted.id },
            data: { amount: setting.rankUpBonus },
          });
          coinDelta += diff;
          totalBonusDelta += diff;
        }
      }

      if (coinDelta > 0) {
        const updated = await tx.user.update({
          where: { id: user.id },
          data: { coins: { increment: coinDelta } },
          select: { coins: true },
        });

        await tx.coinTransaction.create({
          data: {
            tenantId,
            userId: user.id,
            amount: coinDelta,
            balance: updated.coins,
            type: "BONUS",
            description: "ランク設定変更による差額ボーナス",
            referenceId: null,
          },
        });

        bonusGrantedUsers += 1;
      }
    });
  }

  return {
    totalUsers: users.length,
    rankUpdatedCount,
    bonusGrantedUsers,
    totalBonusDelta,
  };
}
