import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { weightedDraw } from "@/lib/gacha/engine";
import { calcRank } from "@/lib/utils/rank";
import { Prisma } from "@prisma/client";

const ALLOWED_COUNTS = [1, 10];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packId, count = 1, isTrial = false } = body;

    if (!packId || !ALLOWED_COUNTS.includes(count)) {
      return NextResponse.json(
        { error: "不正なリクエストです" },
        { status: 400 },
      );
    }

    // 1. Session validation (trial draws don't require login)
    const session = await auth();
    if (!isTrial && !session?.user?.id) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    const userId = session?.user?.id ?? null;

    // 2-12. Everything inside a DB transaction with row locking
    const result = await prisma.$transaction(
      async (tx) => {
        // 3. Lock the pack row (SELECT FOR UPDATE)
        const [pack] = await tx.$queryRaw<
          {
            id: string;
            remainingStock: number;
            pricePerDraw: number;
            limitPerUser: number | null;
            status: string;
            lastOnePrizeId: string | null;
          }[]
        >(
          Prisma.sql`SELECT id, "remainingStock", "pricePerDraw", "limitPerUser", status, "lastOnePrizeId"
           FROM "OripaPack"
           WHERE id = ${packId}
           FOR UPDATE`,
        );

        if (!pack || pack.status !== "ACTIVE") {
          throw new Error("オリパが見つからないか、終了しています");
        }

        // 4. Stock verification
        if (pack.remainingStock < count) {
          throw new Error("在庫が不足しています");
        }

        // 5. User limit check
        if (!isTrial && userId && pack.limitPerUser) {
          const userDrawCount = await tx.draw.count({
            where: {
              userId,
              packId,
              isTrial: false,
            },
          });
          if (userDrawCount + count > pack.limitPerUser) {
            throw new Error(
              `このオリパは1人${pack.limitPerUser}回までです`,
            );
          }
        }

        // 6. Coin deduction (non-trial only)
        const totalCost = pack.pricePerDraw * count;
        let newBalance = 0;

        if (!isTrial && userId) {
          const user = await tx.user.findUniqueOrThrow({
            where: { id: userId },
            select: { coins: true, totalSpent: true },
          });

          if (user.coins < totalCost) {
            throw new Error("コインが不足しています");
          }

          const newTotalSpent = user.totalSpent + totalCost;
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              coins: { decrement: totalCost },
              totalSpent: newTotalSpent,
              rank: calcRank(newTotalSpent),
            },
            select: { coins: true },
          });
          newBalance = updatedUser.coins;
        }

        // Get pack prizes for drawing
        const packPrizes = await tx.packPrize.findMany({
          where: { packId },
          include: { prize: true },
        });

        const draws: {
          id: string;
          prize: {
            id: string;
            name: string;
            image: string;
            rarity: string;
            marketPrice: number;
            coinValue: number;
          };
          isTrial: boolean;
        }[] = [];

        let currentStock = pack.remainingStock;

        for (let i = 0; i < count; i++) {
          // 7. Last-one check
          let selectedPackPrizeId: string | null = null;

          if (currentStock === 1 && pack.lastOnePrizeId) {
            const lastOnePP = packPrizes.find(
              (pp) => pp.prizeId === pack.lastOnePrizeId,
            );
            if (lastOnePP) {
              selectedPackPrizeId = lastOnePP.id;
            }
          }

          // Server-side weighted draw (CSPRNG)
          if (!selectedPackPrizeId) {
            selectedPackPrizeId = weightedDraw(
              packPrizes.map((pp) => ({
                id: pp.id,
                weight: pp.weight,
                remainingQuantity: pp.remainingQuantity,
              })),
            );
          }

          if (!selectedPackPrizeId) {
            throw new Error("抽選に失敗しました");
          }

          const selectedPP = packPrizes.find(
            (pp) => pp.id === selectedPackPrizeId,
          )!;

          // 8. Decrement prize quantity (non-trial only)
          if (!isTrial) {
            await tx.packPrize.update({
              where: { id: selectedPackPrizeId },
              data: { remainingQuantity: { decrement: 1 } },
            });
            // Update local state for subsequent draws in this batch
            selectedPP.remainingQuantity--;
          }

          // 10. Create Draw record
          const draw = await tx.draw.create({
            data: {
              userId: isTrial ? null : userId,
              packId,
              packPrizeId: selectedPackPrizeId,
              prizeId: selectedPP.prizeId,
              coinsCost: isTrial ? 0 : pack.pricePerDraw,
              isTrial,
            },
          });

          // Create OwnedItem (non-trial only)
          if (!isTrial && userId) {
            await tx.ownedItem.create({
              data: {
                userId,
                prizeId: selectedPP.prizeId,
                drawId: draw.id,
              },
            });

            // Create CoinTransaction
            await tx.coinTransaction.create({
              data: {
                userId,
                amount: -pack.pricePerDraw,
                balance: newBalance + pack.pricePerDraw * (count - 1 - i),
                type: "DRAW",
                description: `${selectedPP.prize.name}の抽選`,
                referenceId: draw.id,
              },
            });
          }

          draws.push({
            id: draw.id,
            prize: {
              id: selectedPP.prize.id,
              name: selectedPP.prize.name,
              image: selectedPP.prize.image,
              rarity: selectedPP.prize.rarity,
              marketPrice: selectedPP.prize.marketPrice,
              coinValue: selectedPP.prize.coinValue,
            },
            isTrial,
          });

          if (!isTrial) {
            currentStock--;
          }
        }

        // 9. Decrement pack stock (non-trial only)
        if (!isTrial) {
          const updatedPack = await tx.oripaPack.update({
            where: { id: packId },
            data: {
              remainingStock: { decrement: count },
              // Auto-mark as SOLD_OUT
              ...(currentStock <= 0 ? { status: "SOLD_OUT" } : {}),
            },
            select: { remainingStock: true },
          });

          return {
            results: draws,
            remainingStock: updatedPack.remainingStock,
            coinsSpent: totalCost,
            newBalance,
          };
        }

        return {
          results: draws,
          remainingStock: pack.remainingStock,
          coinsSpent: 0,
          newBalance: 0,
        };
      },
      {
        isolationLevel: "Serializable",
        timeout: 10000,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    console.error("[Gacha Draw Error]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
