"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import type { Rarity } from "@/types";
import { RARITY_CONFIG } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/format";

interface CardRevealProps {
  prize: {
    name: string;
    image: string;
    rarity: Rarity;
    marketPrice: number;
  };
  onComplete: () => void;
  index?: number;
}

const RARITY_FLASH: Record<string, string> = {
  N: "",
  R: "",
  SR: "rgba(167,139,250,0.3)",
  SSR: "rgba(251,191,36,0.5)",
  UR: "rgba(244,114,182,0.6)",
};

const RARITY_LABEL: Record<string, string> = {
  SSR: "SUPER RARE!",
  UR: "ULTRA RARE!!",
};

export default function CardReveal({
  prize,
  onComplete,
  index = 0,
}: CardRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const cfg = RARITY_CONFIG[prize.rarity];
  const isHighRarity = prize.rarity === "SSR" || prize.rarity === "UR";
  const isSR = prize.rarity === "SR";

  const handleClick = () => {
    if (!revealed) {
      setRevealed(true);
      setTimeout(onComplete, isHighRarity ? 1800 : 1000);
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-4 relative"
      onClick={handleClick}
    >
      {/* Full-screen flash on high rarity reveal */}
      {revealed && isHighRarity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, times: [0, 0.1, 1] }}
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ background: RARITY_FLASH[prize.rarity] }}
        />
      )}

      {/* Rarity callout text */}
      {revealed && RARITY_LABEL[prize.rarity] && (
        <motion.p
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 0.8], y: [20, -20, -30, -40] }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute -top-6 z-50 text-lg font-black tracking-wider whitespace-nowrap"
          style={{
            color: cfg.color,
            textShadow: `0 0 20px ${cfg.color}, 0 0 40px ${cfg.color}`,
          }}
        >
          {RARITY_LABEL[prize.rarity]}
        </motion.p>
      )}

      {/* Burst light rays behind card */}
      {revealed && (isHighRarity || isSR) && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.7, 0.3],
            scale: [0, 1.8, 1.4],
            rotate: [0, 90],
          }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${cfg.color}30, transparent, ${cfg.color}20, transparent, ${cfg.color}30, transparent, ${cfg.color}20, transparent)`,
          }}
        />
      )}

      {/* Radial glow */}
      {revealed && isHighRarity && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.9, 0.5],
            scale: [0, 2, 1.6],
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${cfg.color}50 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Sparkle particles around card */}
      {revealed && isHighRarity && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                style={{
                  background:
                    prize.rarity === "UR"
                      ? `hsl(${i * 30}, 100%, 70%)`
                      : cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      )}

      <div className="relative w-56 h-72 z-10" style={{ perspective: "1000px" }}>
        <motion.div
          initial={{ rotateY: 0 }}
          animate={revealed ? { rotateY: 180 } : {}}
          transition={{
            duration: isHighRarity ? 0.8 : 0.6,
            delay: index * 0.1,
            ease: isHighRarity ? [0.25, 0.8, 0.25, 1] : "easeInOut",
          }}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back of card */}
          <div
            className="absolute inset-0 rounded-xl border-2 border-gray-600 flex items-center justify-center overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          >
            {/* Shimmer effect on card back */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
              }}
              animate={{ x: ["-200%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
            />
            <div className="text-center">
              <p className="text-4xl mb-2">❓</p>
              <p className="text-gray-400 text-sm">タップして開封</p>
            </div>
          </div>

          {/* Front of card */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-3 p-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: cfg.color,
              background: `linear-gradient(135deg, ${cfg.bg} 0%, #0a0a0a 100%)`,
              boxShadow: isHighRarity
                ? `${cfg.glow}, inset 0 0 30px ${cfg.color}20`
                : cfg.glow,
            }}
            animate={
              revealed && isHighRarity
                ? {
                    boxShadow: [
                      cfg.glow,
                      `0 0 60px ${cfg.color}90, 0 0 120px ${cfg.color}40`,
                      cfg.glow,
                    ],
                  }
                : {}
            }
            transition={
              revealed && isHighRarity
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : {}
            }
          >
            {/* Holographic shimmer on card face for UR */}
            {prize.rarity === "UR" && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 30%, rgba(244,114,182,0.1) 40%, rgba(167,139,250,0.15) 45%, rgba(251,191,36,0.1) 50%, rgba(96,165,250,0.15) 55%, rgba(244,114,182,0.1) 60%, transparent 70%)",
                  mixBlendMode: "screen",
                }}
                animate={{ x: ["-150%", "150%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut",
                }}
              />
            )}

            <Badge rarity={prize.rarity} />
            <motion.div
              className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800"
              animate={
                revealed && isHighRarity
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={prize.image}
                alt={prize.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </motion.div>
            <p className="text-white text-sm font-bold text-center leading-tight">
              {prize.name}
            </p>
            <p className="text-yellow-400 text-xs font-medium">
              {formatPrice(prize.marketPrice)}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
