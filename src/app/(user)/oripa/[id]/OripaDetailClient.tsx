"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import type { PackDetail, DrawResultResponse, GachaDrawResponse } from "@/types";
import RemainingBar from "@/components/oripa/RemainingBar";
import PrizeList from "@/components/oripa/PrizeList";
import GachaModal from "@/components/gacha/GachaModal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCoins, formatDate } from "@/lib/utils/format";

export default function OripaDetailClient({ pack }: { pack: PackDetail }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [showGacha, setShowGacha] = useState(false);
  const [gachaResults, setGachaResults] = useState<DrawResultResponse[]>([]);
  const [isTrial, setIsTrial] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remainingStock, setRemainingStock] = useState(pack.remainingStock);

  const handleDraw = useCallback(
    async (count: number, trial: boolean) => {
      if (!trial && !session?.user) {
        router.push("/login");
        return;
      }

      setIsDrawing(true);
      try {
        const res = await fetch("/api/gacha/draw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packId: pack.id,
            count,
            isTrial: trial,
          }),
        });

        const data: GachaDrawResponse | { error: string } = await res.json();

        if ("error" in data) {
          toast.error(data.error);
          return;
        }

        setRemainingStock(data.remainingStock);
        setIsTrial(trial);
        setGachaResults(data.results);
        setShowGacha(true);
      } catch {
        toast.error("通信エラーが発生しました");
      } finally {
        setIsDrawing(false);
      }
    },
    [pack.id, session, router],
  );

  const soldOut = remainingStock <= 0;

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="relative aspect-[4/3] bg-gray-800">
        <Image
          src={pack.image}
          alt={pack.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {pack.featured && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
            注目
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-white">{pack.title}</h1>
        <p className="text-sm text-gray-400 mt-1">{pack.description}</p>

        <div className="flex items-center gap-4 mt-3">
          <p className="text-yellow-400 font-bold text-lg">
            🪙 {formatCoins(pack.pricePerDraw)} / 回
          </p>
          {pack.limitPerUser && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              1人{pack.limitPerUser}回まで
            </span>
          )}
        </div>

        {pack.endsAt && (
          <p className="text-xs text-red-400 mt-2">
            終了: {formatDate(pack.endsAt)}
          </p>
        )}

        <div className="mt-4">
          <RemainingBar
            remaining={remainingStock}
            total={pack.totalStock}
            size="md"
          />
        </div>

        {pack.lastOnePrize && (
          <div className="mt-4 p-3 bg-purple-900/40 border border-purple-700 rounded-xl">
            <p className="text-xs text-purple-300 font-bold mb-2">
              ラストワン賞
            </p>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded bg-gray-800 overflow-hidden">
                <Image
                  src={pack.lastOnePrize.image}
                  alt={pack.lastOnePrize.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <Badge rarity={pack.lastOnePrize.rarity} />
                <p className="text-sm text-white mt-0.5">
                  {pack.lastOnePrize.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Draw buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={soldOut || isDrawing}
            onClick={() => handleDraw(1, false)}
          >
            {soldOut
              ? "完売"
              : `1回引く（${formatCoins(pack.pricePerDraw)}コイン）`}
          </Button>
          {remainingStock >= 10 && (
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              disabled={isDrawing}
              onClick={() => handleDraw(10, false)}
            >
              10回引く（{formatCoins(pack.pricePerDraw * 10)}コイン）
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            className="w-full"
            disabled={isDrawing}
            onClick={() => handleDraw(1, true)}
          >
            お試し引き（無料）
          </Button>
        </div>
      </div>

      {/* Prize list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white px-4 mb-3">景品一覧</h2>
        <PrizeList prizes={pack.prizes} totalWeight={pack.totalWeight} />
      </div>

      {/* Probability disclosure (景表法) */}
      <div className="mt-6 px-4">
        <p className="text-xs text-gray-600">
          ※ 表示確率は各景品の当選確率を示しています。在庫状況により実際の確率は変動する場合があります。
        </p>
      </div>

      {/* Gacha modal */}
      <GachaModal
        isOpen={showGacha}
        onClose={() => {
          setShowGacha(false);
          router.refresh();
        }}
        results={gachaResults}
        isTrial={isTrial}
      />
    </div>
  );
}
