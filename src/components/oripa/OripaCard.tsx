"use client";

import Link from "next/link";
import Image from "next/image";
import type { PackListItem } from "@/types";
import RemainingBar from "./RemainingBar";
import { formatCoins } from "@/lib/utils/format";

export default function OripaCard({ pack }: { pack: PackListItem }) {
  const isAlmostGone = pack.remainingStock / pack.totalStock < 0.15;

  return (
    <Link href={`/oripa/${pack.id}`} className="block group">
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <div className="relative aspect-square bg-gray-800">
          <Image
            src={pack.image}
            alt={pack.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
          {pack.featured && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              注目
            </span>
          )}
          {isAlmostGone && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
              残りわずか
            </span>
          )}
          {pack.hasLastOnePrize && (
            <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              ラストワン賞
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">
            {pack.title}
          </h3>
          <p className="text-yellow-400 font-bold text-sm mt-1">
            🪙 {formatCoins(pack.pricePerDraw)} / 回
          </p>
          <div className="mt-2">
            <RemainingBar
              remaining={pack.remainingStock}
              total={pack.totalStock}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
