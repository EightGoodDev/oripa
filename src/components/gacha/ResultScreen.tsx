"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import type { DrawResultResponse } from "@/types";
import { RARITY_CONFIG } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";

interface ResultScreenProps {
  results: DrawResultResponse[];
  isTrial: boolean;
  onClose: () => void;
}

const RARITY_ORDER = ["UR", "SSR", "SR", "R", "N"];

export default function ResultScreen({
  results,
  isTrial,
  onClose,
}: ResultScreenProps) {
  // Sort results: highest rarity first
  const sorted = useMemo(
    () =>
      [...results].sort(
        (a, b) =>
          RARITY_ORDER.indexOf(a.prize.rarity) -
          RARITY_ORDER.indexOf(b.prize.rarity),
      ),
    [results],
  );

  const bestRarity = sorted[0]?.prize.rarity;
  const hasSuperRare = bestRarity === "SSR" || bestRarity === "UR";
  const totalValue = results.reduce((s, r) => s + r.prize.marketPrice, 0);

  return (
    <div className="bg-gray-900/95 backdrop-blur rounded-2xl p-5 max-h-[85vh] overflow-y-auto relative">
      {/* Top glow for high rarity results */}
      {hasSuperRare && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-2xl"
          style={{
            background: `radial-gradient(ellipse at top, ${RARITY_CONFIG[bestRarity].color}30 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <motion.h3
        className="text-xl font-black text-white text-center mb-1 relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isTrial ? "お試し結果" : "抽選結果"}
      </motion.h3>

      {isTrial && (
        <p className="text-xs text-center text-gray-400 mb-2">
          ※ お試しのためアイテムは獲得されません
        </p>
      )}

      {/* Total value banner */}
      {results.length > 1 && !isTrial && (
        <motion.div
          className="text-center mb-4 py-2 px-4 rounded-lg bg-gray-800/80 border border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-gray-400 text-xs">合計価値</span>
          <p className="text-yellow-400 text-lg font-bold">
            {formatPrice(totalValue)}
          </p>
        </motion.div>
      )}

      <div
        className={`grid gap-2.5 mb-5 ${results.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-[200px] mx-auto"}`}
      >
        {sorted.map((result, i) => {
          const cfg = RARITY_CONFIG[result.prize.rarity];
          const isHigh =
            result.prize.rarity === "SSR" || result.prize.rarity === "UR";

          return (
            <motion.div
              key={result.id}
              className="rounded-xl border p-3 flex flex-col items-center gap-2 relative overflow-hidden"
              style={{
                borderColor: cfg.color + "60",
                background: cfg.bg + "40",
                boxShadow: isHigh ? cfg.glow : "none",
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                type: "spring",
                duration: 0.4,
              }}
            >
              {/* Shimmer on high rarity results */}
              {isHigh && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(105deg, transparent 30%, ${cfg.color}15 45%, ${cfg.color}25 50%, ${cfg.color}15 55%, transparent 70%)`,
                  }}
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                />
              )}

              <Badge rarity={result.prize.rarity} />
              <div className="relative w-20 h-20 rounded bg-gray-800 overflow-hidden">
                <Image
                  src={result.prize.image}
                  alt={result.prize.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="text-white text-xs font-medium text-center leading-tight">
                {result.prize.name}
              </p>
              <p className="text-yellow-400/80 text-[10px]">
                {formatPrice(result.prize.marketPrice)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <Button variant="gold" size="md" className="w-full relative" onClick={onClose}>
        OK
      </Button>
    </div>
  );
}
