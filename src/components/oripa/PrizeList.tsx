"use client";

import { useState } from "react";
import Image from "next/image";
import type { Rarity, PackDetail } from "@/types";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import { formatPrice } from "@/lib/utils/format";
import { formatProbability } from "@/lib/gacha/engine";

const rarityTabs: { value: Rarity | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "UR", label: "UR" },
  { value: "SSR", label: "SSR" },
  { value: "SR", label: "SR" },
  { value: "R", label: "R" },
  { value: "N", label: "N" },
];

export default function PrizeList({
  prizes,
  totalWeight,
}: {
  prizes: PackDetail["prizes"];
  totalWeight: number;
}) {
  const [filter, setFilter] = useState<Rarity | "all">("all");

  const filtered =
    filter === "all" ? prizes : prizes.filter((p) => p.rarity === filter);

  return (
    <div>
      <Tabs tabs={rarityTabs} active={filter} onChange={setFilter} />
      <div className="space-y-2 px-4 mt-2">
        {filtered.map((prize) => (
          <div
            key={prize.id}
            className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800"
          >
            <div className="relative w-14 h-14 shrink-0 rounded bg-gray-800 overflow-hidden">
              <Image
                src={prize.image}
                alt={prize.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge rarity={prize.rarity} />
                <span className="text-xs text-gray-500">
                  {formatProbability(prize.weight, totalWeight)}
                </span>
              </div>
              <p className="text-sm text-white font-medium truncate mt-0.5">
                {prize.name}
              </p>
              <p className="text-xs text-gray-400">
                参考価格: {formatPrice(prize.marketPrice)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
