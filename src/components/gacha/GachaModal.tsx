"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import CardReveal from "./CardReveal";
import ResultScreen from "./ResultScreen";
import type { DrawResultResponse } from "@/types";

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: DrawResultResponse[];
  isTrial: boolean;
}

export default function GachaModal({
  isOpen,
  onClose,
  results,
  isTrial,
}: GachaModalProps) {
  const [phase, setPhase] = useState<"countdown" | "reveal" | "result">(
    "countdown",
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [highestRarity, setHighestRarity] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMulti = results.length > 1;

  // Determine the highest rarity in results for background effects
  useEffect(() => {
    if (results.length === 0) return;
    const rarityOrder = ["N", "R", "SR", "SSR", "UR"];
    let best = 0;
    for (const r of results) {
      const idx = rarityOrder.indexOf(r.prize.rarity);
      if (idx > best) best = idx;
    }
    setHighestRarity(rarityOrder[best]);
  }, [results]);

  // Reset state on open
  useEffect(() => {
    if (isOpen && results.length > 0) {
      setPhase("countdown");
      setRevealedCount(0);
    }
  }, [isOpen, results.length]);

  // Countdown → reveal transition
  useEffect(() => {
    if (phase === "countdown" && isOpen) {
      const timer = setTimeout(
        () => setPhase("reveal"),
        isMulti ? 2000 : 800,
      );
      return () => clearTimeout(timer);
    }
  }, [phase, isOpen, isMulti]);

  const handleRevealComplete = useCallback(
    (revealedRarity: string) => {
      setRevealedCount((c) => {
        const next = c + 1;
        if (next >= results.length) {
          setTimeout(() => setPhase("result"), 600);
        }
        return next;
      });

      // Screen shake on high rarity
      if (
        (revealedRarity === "SSR" || revealedRarity === "UR") &&
        containerRef.current
      ) {
        containerRef.current.classList.add("screen-shake");
        setTimeout(
          () => containerRef.current?.classList.remove("screen-shake"),
          500,
        );
      }
    },
    [results.length],
  );

  const handleClose = () => {
    setPhase("countdown");
    setRevealedCount(0);
    onClose();
  };

  if (results.length === 0) return null;

  // Background gradient based on highest rarity found
  const bgMap: Record<string, string> = {
    N: "radial-gradient(ellipse at center, rgba(30,30,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
    R: "radial-gradient(ellipse at center, rgba(20,40,80,0.95) 0%, rgba(0,0,0,0.98) 100%)",
    SR: "radial-gradient(ellipse at center, rgba(50,20,100,0.95) 0%, rgba(0,0,0,0.98) 100%)",
    SSR: "radial-gradient(ellipse at center, rgba(80,50,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
    UR: "radial-gradient(ellipse at center, rgba(100,10,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background:
                bgMap[highestRarity || "N"] || bgMap.N,
            }}
          />

          {/* Floating particles */}
          {phase !== "countdown" && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background:
                      highestRarity === "UR"
                        ? `hsl(${(i * 36) % 360}, 100%, 70%)`
                        : highestRarity === "SSR"
                          ? "#fbbf24"
                          : "#ffffff40",
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -200 - Math.random() * 400],
                    x: [0, (Math.random() - 0.5) * 100],
                    opacity: [0, 1, 0],
                    scale: [0, 1 + Math.random(), 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Countdown phase */}
          {phase === "countdown" && (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isMulti ? (
                <>
                  <motion.p
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600"
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    10連
                  </motion.p>
                  <motion.p
                    className="text-2xl font-bold text-white mt-2 tracking-widest"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    ガチャスタート！
                  </motion.p>
                  {/* Burst rings */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border-2 border-yellow-400/50"
                      initial={{ width: 0, height: 0, opacity: 1 }}
                      animate={{
                        width: 400 + i * 100,
                        height: 400 + i * 100,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.2 + i * 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              ) : (
                <motion.div
                  className="w-24 h-24 rounded-full border-4 border-yellow-400 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <span className="text-3xl">🎰</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Reveal phase */}
          {phase === "reveal" && (
            <motion.div
              className="relative z-10 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {!isMulti ? (
                <div className="flex justify-center">
                  <CardReveal
                    prize={results[0].prize}
                    onComplete={() =>
                      handleRevealComplete(results[0].prize.rarity)
                    }
                  />
                </div>
              ) : (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                  <p className="text-center text-gray-300 text-sm mb-3 font-medium">
                    タップして開封{" "}
                    <span className="text-yellow-400 font-bold">
                      {revealedCount}
                    </span>
                    <span className="text-gray-500">/{results.length}</span>
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {results.map((r, i) => (
                      <div key={r.id} className="flex justify-center">
                        <div className="scale-[0.38] origin-top -mb-28">
                          <CardReveal
                            prize={r.prize}
                            onComplete={() =>
                              handleRevealComplete(r.prize.rarity)
                            }
                            index={i}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Result phase */}
          {phase === "result" && (
            <motion.div
              className="relative z-10 w-full max-w-sm mx-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <ResultScreen
                results={results}
                isTrial={isTrial}
                onClose={handleClose}
              />
            </motion.div>
          )}

          {/* Screen shake CSS */}
          <style jsx global>{`
            @keyframes shake {
              0%,
              100% {
                transform: translate(0);
              }
              10% {
                transform: translate(-8px, 4px);
              }
              20% {
                transform: translate(8px, -4px);
              }
              30% {
                transform: translate(-6px, 6px);
              }
              40% {
                transform: translate(6px, -6px);
              }
              50% {
                transform: translate(-4px, 2px);
              }
              60% {
                transform: translate(4px, -2px);
              }
              70% {
                transform: translate(-2px, 4px);
              }
              80% {
                transform: translate(2px, -4px);
              }
              90% {
                transform: translate(-1px, 1px);
              }
            }
            .screen-shake {
              animation: shake 0.5s ease-in-out;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
