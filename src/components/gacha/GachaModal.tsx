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

type Phase = "opening" | "charging" | "colorHint" | "explosion" | "reveal" | "result";

const RARITY_ORDER = ["N", "R", "SR", "SSR", "UR"];

function getHighestRarity(results: DrawResultResponse[]): string {
  let best = 0;
  for (const r of results) {
    const idx = RARITY_ORDER.indexOf(r.prize.rarity);
    if (idx > best) best = idx;
  }
  return RARITY_ORDER[best];
}

const RARITY_COLOR: Record<string, string> = {
  N: "#94a3b8",
  R: "#60a5fa",
  SR: "#a78bfa",
  SSR: "#fbbf24",
  UR: "#f472b6",
};

const BG_MAP: Record<string, string> = {
  N: "radial-gradient(ellipse at center, rgba(30,30,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  R: "radial-gradient(ellipse at center, rgba(20,40,80,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  SR: "radial-gradient(ellipse at center, rgba(50,20,100,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  SSR: "radial-gradient(ellipse at center, rgba(80,50,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  UR: "radial-gradient(ellipse at center, rgba(100,10,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
};

export default function GachaModal({
  isOpen,
  onClose,
  results,
  isTrial,
}: GachaModalProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [revealedCount, setRevealedCount] = useState(0);
  const [skipEnabled, setSkipEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(false);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isMulti = results.length > 1;
  const highestRarity = results.length > 0 ? getHighestRarity(results) : "N";
  const rarityIdx = RARITY_ORDER.indexOf(highestRarity);
  const color = RARITY_COLOR[highestRarity] || RARITY_COLOR.N;

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    for (const t of phaseTimersRef.current) clearTimeout(t);
    phaseTimersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    phaseTimersRef.current.push(t);
    return t;
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen && results.length > 0) {
      setPhase("opening");
      setRevealedCount(0);
      setSkipEnabled(false);
      skipRef.current = false;
      clearTimers();

      // Enable skip after 3 seconds
      addTimer(() => setSkipEnabled(true), 3000);

      // Phase timing (total ~15s before reveal)
      // opening(3s) → charging(5s) → colorHint(4s) → explosion(2s) → reveal
      addTimer(() => {
        if (!skipRef.current) setPhase("charging");
      }, 3000);
      addTimer(() => {
        if (!skipRef.current) setPhase("colorHint");
      }, 8000);
      addTimer(() => {
        if (!skipRef.current) setPhase("explosion");
      }, 12000);
      addTimer(() => {
        if (!skipRef.current) setPhase("reveal");
      }, 14000);
    }

    return clearTimers;
  }, [isOpen, results.length, clearTimers, addTimer]);

  const handleSkip = useCallback(() => {
    if (!skipEnabled) return;
    skipRef.current = true;
    clearTimers();
    setPhase("reveal");
  }, [skipEnabled, clearTimers]);

  const handleRevealComplete = useCallback(
    (revealedRarity: string) => {
      setRevealedCount((c) => {
        const next = c + 1;
        if (next >= results.length) {
          setTimeout(() => setPhase("result"), 600);
        }
        return next;
      });

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
    clearTimers();
    setPhase("opening");
    setRevealedCount(0);
    onClose();
  };

  if (results.length === 0) return null;

  const isPreReveal = phase === "opening" || phase === "charging" || phase === "colorHint" || phase === "explosion";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          onClick={isPreReveal ? handleSkip : undefined}
        >
          {/* Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: phase === "reveal" || phase === "result"
                ? BG_MAP[highestRarity] || BG_MAP.N
                : "radial-gradient(ellipse at center, rgba(10,10,30,0.98) 0%, rgba(0,0,0,1) 100%)",
            }}
          />

          {/* ── Phase 1: Opening ── */}
          {phase === "opening" && (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.p
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600"
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {isMulti ? "10連ガチャ" : "ガチャ"}
              </motion.p>
              <motion.p
                className="text-xl text-white/80 mt-2 tracking-[0.3em]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                運命の一引き...
              </motion.p>

              {/* Expanding rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-yellow-400/30"
                  initial={{ width: 0, height: 0, opacity: 0.8 }}
                  animate={{
                    width: 300 + i * 150,
                    height: 300 + i * 150,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.8 + i * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* ── Phase 2: Charging ── */}
          {phase === "charging" && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Central orb */}
              <motion.div
                className="w-28 h-28 rounded-full relative"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(100,100,200,0.3) 50%, transparent 70%)",
                  boxShadow: "0 0 60px rgba(100,100,255,0.3), 0 0 120px rgba(100,100,255,0.1)",
                }}
                animate={{
                  scale: [1, 1.2, 1, 1.3, 1],
                  boxShadow: [
                    "0 0 60px rgba(100,100,255,0.3)",
                    "0 0 80px rgba(100,100,255,0.5)",
                    "0 0 60px rgba(100,100,255,0.3)",
                    "0 0 100px rgba(100,100,255,0.6)",
                    "0 0 60px rgba(100,100,255,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Converging particles */}
              {Array.from({ length: 40 }).map((_, i) => {
                const angle = (i / 40) * Math.PI * 2;
                const dist = 200 + Math.random() * 150;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-blue-300"
                    style={{
                      left: "50%",
                      top: "50%",
                      boxShadow: "0 0 6px rgba(147,197,253,0.8)",
                    }}
                    initial={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                    }}
                    animate={{
                      x: [Math.cos(angle) * dist, 0],
                      y: [Math.sin(angle) * dist, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0],
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeIn",
                    }}
                  />
                );
              })}

              {/* Pulsing text */}
              <motion.p
                className="absolute bottom-[-60px] text-sm text-white/60 tracking-widest"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                エネルギー充填中...
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 3: Color Hint ── */}
          {phase === "colorHint" && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Orb that shifts to rarity color */}
              <motion.div
                className="w-36 h-36 rounded-full"
                initial={{
                  background: "radial-gradient(circle, rgba(200,200,255,0.4) 0%, transparent 70%)",
                  boxShadow: "0 0 80px rgba(100,100,255,0.4)",
                }}
                animate={{
                  background: `radial-gradient(circle, ${color}80 0%, ${color}20 50%, transparent 70%)`,
                  boxShadow: [
                    "0 0 80px rgba(100,100,255,0.4)",
                    `0 0 120px ${color}60`,
                    `0 0 80px ${color}40`,
                    `0 0 150px ${color}70`,
                  ],
                  scale: [1, 1.15, 1, 1.2, 1.1],
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />

              {/* Rarity-colored lightning bolts */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 origin-center"
                    style={{
                      left: "50%",
                      top: "50%",
                      height: "100px",
                      background: `linear-gradient(to bottom, ${color}, transparent)`,
                      rotate: `${(angle * 180) / Math.PI}deg`,
                    }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0, 0.6, 0],
                      scaleY: [0, 1, 0, 0.8, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.5 + i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                );
              })}

              {/* Spinning ring */}
              <motion.div
                className="absolute w-52 h-52 rounded-full border-2"
                style={{ borderColor: `${color}40` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full border"
                style={{ borderColor: `${color}20` }}
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* "What rarity...?" text */}
              <motion.p
                className="absolute bottom-[-60px] text-base font-bold tracking-widest"
                style={{ color: `${color}cc` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {rarityIdx >= 4 ? "！？！？" : rarityIdx >= 3 ? "！？" : rarityIdx >= 2 ? "...！" : "..."}
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 4: Explosion ── */}
          {phase === "explosion" && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* White flash */}
              <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{ background: `${color}` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6, times: [0, 0.15, 1] }}
              />

              {/* Exploding particles */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * Math.PI * 2;
                const dist = 150 + Math.random() * 200;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      background: highestRarity === "UR"
                        ? `hsl(${i * 15}, 100%, 70%)`
                        : color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.1 + Math.random() * 0.2,
                      ease: "easeOut",
                    }}
                  />
                );
              })}

              {/* Expanding shock wave rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border-2"
                  style={{ borderColor: color }}
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{
                    width: 500 + i * 100,
                    height: 500 + i * 100,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Rarity text burst */}
              {rarityIdx >= 2 && (
                <motion.p
                  className="absolute text-4xl font-black z-20"
                  style={{
                    color,
                    textShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 1] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {highestRarity === "UR" ? "ULTRA RARE!!" : highestRarity === "SSR" ? "SUPER RARE!" : "RARE!"}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── Phase 5: Reveal ── */}
          {phase === "reveal" && (
            <>
              {/* Floating particles during reveal */}
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
            </>
          )}

          {/* ── Phase 6: Result ── */}
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

          {/* Skip button */}
          {isPreReveal && skipEnabled && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 right-6 z-50 text-xs text-gray-500 hover:text-gray-300 bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
            >
              スキップ &gt;&gt;
            </motion.button>
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
