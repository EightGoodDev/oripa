"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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

type Phase =
  | "opening"
  | "charging"
  | "escalation"
  | "climax"
  | "explosion"
  | "reveal"
  | "result";

const RARITY_ORDER = ["N", "R", "SR", "SSR", "UR"];

function getHighestRarity(results: DrawResultResponse[]): string {
  let best = 0;
  for (const r of results) {
    const idx = RARITY_ORDER.indexOf(r.prize.rarity);
    if (idx > best) best = idx;
  }
  return RARITY_ORDER[best];
}

// Pachinko-style color escalation steps
// Each step: [color, label, borderColor]
const ESCALATION_COLORS: [string, string, string][] = [
  ["#3b82f6", "", "rgba(59,130,246,0.4)"],         // Blue - start
  ["#22c55e", "チャンス？", "rgba(34,197,94,0.5)"], // Green
  ["#ef4444", "リーチ!", "rgba(239,68,68,0.6)"],   // Red
  ["#fbbf24", "激アツ!!", "rgba(251,191,36,0.7)"], // Gold
];

const RARITY_COLOR: Record<string, string> = {
  N: "#94a3b8", R: "#60a5fa", SR: "#a78bfa", SSR: "#fbbf24", UR: "#f472b6",
};

const BG_MAP: Record<string, string> = {
  N: "radial-gradient(ellipse at center, rgba(30,30,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  R: "radial-gradient(ellipse at center, rgba(20,40,80,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  SR: "radial-gradient(ellipse at center, rgba(50,20,100,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  SSR: "radial-gradient(ellipse at center, rgba(80,50,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
  UR: "radial-gradient(ellipse at center, rgba(100,10,50,0.95) 0%, rgba(0,0,0,0.98) 100%)",
};

// How many escalation steps based on rarity
function getEscalationSteps(rarity: string): number {
  switch (rarity) {
    case "N": return 0;
    case "R": return 1;
    case "SR": return 2;
    case "SSR": return 4;
    case "UR": return 4; // same as SSR, but UR gets the fake-out + revival
    default: return 0;
  }
}

// Pre-generate random particle positions (avoid hydration mismatch)
function generateParticles(count: number, seed: number) {
  const particles = [];
  let s = seed;
  const next = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (i / count) * Math.PI * 2,
      dist: 150 + next() * 200,
      delay: next() * 2,
      duration: 1.5 + next(),
      x: next() * 100,
      y: next() * 100,
      scale: next(),
    });
  }
  return particles;
}

export default function GachaModal({
  isOpen,
  onClose,
  results,
  isTrial,
}: GachaModalProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [escalationStep, setEscalationStep] = useState(0);
  const [showFakeOut, setShowFakeOut] = useState(false);
  const [showRevival, setShowRevival] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [skipEnabled, setSkipEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState("transparent");
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isMulti = results.length > 1;
  const highestRarity = results.length > 0 ? getHighestRarity(results) : "N";
  const rarityIdx = RARITY_ORDER.indexOf(highestRarity);
  const color = RARITY_COLOR[highestRarity] || RARITY_COLOR.N;
  const isUR = highestRarity === "UR";
  const isSSR = highestRarity === "SSR";

  // Pre-generate particles
  const chargingParticles = useMemo(() => generateParticles(40, 42), []);
  const explosionParticles = useMemo(() => generateParticles(30, 99), []);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  const doFlash = useCallback((c: string, duration = 300) => {
    setFlashColor(c);
    setTimeout(() => setFlashColor(null), duration);
  }, []);

  const doShake = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.classList.add("screen-shake");
      setTimeout(() => containerRef.current?.classList.remove("screen-shake"), 500);
    }
  }, []);

  // Reset on open & schedule entire sequence
  useEffect(() => {
    if (!isOpen || results.length === 0) return;

    setPhase("opening");
    setEscalationStep(0);
    setShowFakeOut(false);
    setShowRevival(false);
    setRevealedCount(0);
    setSkipEnabled(false);
    setBorderColor("transparent");
    setFlashColor(null);
    skipRef.current = false;
    clearTimers();

    const steps = getEscalationSteps(highestRarity);
    const isQuick = rarityIdx <= 1; // N or R

    // Enable skip after 2 seconds
    addTimer(() => setSkipEnabled(true), 2000);

    let t = 0;

    // Phase 1: Opening
    const openingDur = isQuick ? 1500 : 2500;
    t += openingDur;

    // Phase 2: Charging
    addTimer(() => { if (!skipRef.current) setPhase("charging"); }, t);
    const chargingDur = isQuick ? 2000 : rarityIdx >= 3 ? 4000 : 3000;
    t += chargingDur;

    // Phase 3: Escalation (pachinko color steps)
    if (steps > 0) {
      addTimer(() => { if (!skipRef.current) setPhase("escalation"); }, t);

      for (let i = 0; i < steps; i++) {
        const stepDelay = t + i * (rarityIdx >= 3 ? 1800 : 1500);
        addTimer(() => {
          if (skipRef.current) return;
          setEscalationStep(i);
          setBorderColor(ESCALATION_COLORS[i][2]);
          if (ESCALATION_COLORS[i][1]) {
            doFlash(ESCALATION_COLORS[i][0], 200);
            if (i >= 2) doShake(); // Shake on red and gold
          }
        }, stepDelay);
      }

      t += steps * (rarityIdx >= 3 ? 1800 : 1500);

      // UR special: fake-out + revival
      if (isUR) {
        // Fake failure
        addTimer(() => {
          if (skipRef.current) return;
          setShowFakeOut(true);
          setBorderColor("transparent");
        }, t);
        t += 2000;

        // Revival!
        addTimer(() => {
          if (skipRef.current) return;
          setShowFakeOut(false);
          setShowRevival(true);
          setBorderColor("rgba(244,114,182,0.8)");
          doFlash("#f472b6", 400);
          doShake();
        }, t);
        t += 2500;

        addTimer(() => { if (!skipRef.current) setShowRevival(false); }, t);
      }
    }

    // Phase 4: Climax (dramatic pause before explosion)
    addTimer(() => {
      if (skipRef.current) return;
      setPhase("climax");
      if (rarityIdx >= 2) doShake();
    }, t);
    t += rarityIdx >= 3 ? 2000 : 1000;

    // Phase 5: Explosion
    addTimer(() => {
      if (skipRef.current) return;
      setPhase("explosion");
      doFlash(color, 400);
      doShake();
    }, t);
    t += rarityIdx >= 3 ? 2500 : 1500;

    // Phase 6: Reveal
    addTimer(() => { if (!skipRef.current) setPhase("reveal"); }, t);

    return clearTimers;
  }, [isOpen, results.length, highestRarity, rarityIdx, isUR, color, clearTimers, addTimer, doFlash, doShake]);

  const handleSkip = useCallback(() => {
    if (!skipEnabled) return;
    skipRef.current = true;
    clearTimers();
    setBorderColor("transparent");
    setFlashColor(null);
    setShowFakeOut(false);
    setShowRevival(false);
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
      if ((revealedRarity === "SSR" || revealedRarity === "UR") && containerRef.current) {
        containerRef.current.classList.add("screen-shake");
        setTimeout(() => containerRef.current?.classList.remove("screen-shake"), 500);
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

  const isPreReveal = phase !== "reveal" && phase !== "result";
  const currentEscColor = ESCALATION_COLORS[escalationStep]?.[0] || "#3b82f6";
  const currentEscLabel = ESCALATION_COLORS[escalationStep]?.[1] || "";

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
                : "radial-gradient(ellipse at center, rgba(5,5,20,0.99) 0%, rgba(0,0,0,1) 100%)",
            }}
          />

          {/* Animated border glow (pachinko-style) */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              boxShadow: borderColor !== "transparent"
                ? `inset 0 0 80px ${borderColor}, inset 0 0 160px ${borderColor}`
                : "none",
            }}
          />

          {/* Screen flash */}
          <AnimatePresence>
            {flashColor && (
              <motion.div
                className="fixed inset-0 z-[200] pointer-events-none"
                style={{ background: flashColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* 集中線 (speed lines) - shown during escalation/climax */}
          {(phase === "escalation" || phase === "climax") && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 origin-left"
                  style={{
                    width: "150vmax",
                    height: phase === "climax" ? "3px" : "1.5px",
                    background: `linear-gradient(to right, transparent, ${currentEscColor}30, transparent)`,
                    rotate: `${(i / 20) * 360}deg`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scaleX: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: phase === "climax" ? 0.4 : 0.8,
                    repeat: Infinity,
                    delay: (i / 20) * 0.5,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Phase 1: Opening ── */}
          {phase === "opening" && (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.p
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600"
                initial={{ scale: 4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {isMulti ? "10連ガチャ" : "ガチャ"}
              </motion.p>
              <motion.p
                className="text-xl text-white/80 mt-3 tracking-[0.3em]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                運命の一引き...
              </motion.p>

              {/* Burst rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-yellow-400/30"
                  initial={{ width: 0, height: 0, opacity: 0.8 }}
                  animate={{ width: 400 + i * 150, height: 400 + i * 150, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.6 + i * 0.2, ease: "easeOut" }}
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
              {/* Central orb with heartbeat */}
              <motion.div
                className="w-32 h-32 rounded-full relative"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(100,100,200,0.25) 50%, transparent 70%)",
                  boxShadow: "0 0 60px rgba(100,100,255,0.3)",
                }}
                animate={{
                  scale: [1, 1.15, 1, 1.2, 1, 1.25, 1],
                  boxShadow: [
                    "0 0 40px rgba(100,100,255,0.2)",
                    "0 0 80px rgba(100,100,255,0.5)",
                    "0 0 40px rgba(100,100,255,0.2)",
                    "0 0 100px rgba(100,100,255,0.6)",
                    "0 0 40px rgba(100,100,255,0.2)",
                    "0 0 120px rgba(100,100,255,0.7)",
                    "0 0 40px rgba(100,100,255,0.2)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Converging particles */}
              {chargingParticles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-300"
                  style={{
                    left: "50%", top: "50%",
                    boxShadow: "0 0 6px rgba(147,197,253,0.8)",
                  }}
                  initial={{ x: Math.cos(p.angle) * (200 + p.dist * 0.5), y: Math.sin(p.angle) * (200 + p.dist * 0.5), opacity: 0 }}
                  animate={{
                    x: [Math.cos(p.angle) * (200 + p.dist * 0.5), 0],
                    y: [Math.sin(p.angle) * (200 + p.dist * 0.5), 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0],
                  }}
                  transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeIn" }}
                />
              ))}

              {/* Pulsing heartbeat text */}
              <motion.p
                className="absolute bottom-[-60px] text-sm text-white/60 tracking-widest"
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ドキドキ...
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 3: Escalation (Pachinko color steps) ── */}
          {phase === "escalation" && !showFakeOut && !showRevival && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Main orb with escalating color */}
              <motion.div
                className="w-40 h-40 rounded-full"
                animate={{
                  background: `radial-gradient(circle, ${currentEscColor}80 0%, ${currentEscColor}20 50%, transparent 70%)`,
                  boxShadow: `0 0 100px ${currentEscColor}60, 0 0 200px ${currentEscColor}20`,
                  scale: [1, 1.1, 1, 1.15, 1],
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Spinning rings */}
              <motion.div
                className="absolute w-56 h-56 rounded-full border-2"
                style={{ borderColor: `${currentEscColor}50` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-48 h-48 rounded-full border"
                style={{ borderColor: `${currentEscColor}30` }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              {escalationStep >= 2 && (
                <motion.div
                  className="absolute w-64 h-64 rounded-full border-2"
                  style={{ borderColor: `${currentEscColor}40`, borderStyle: "dashed" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Lightning/energy bolts */}
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 origin-center"
                    style={{
                      left: "50%", top: "50%",
                      height: escalationStep >= 3 ? "140px" : "100px",
                      background: `linear-gradient(to bottom, ${currentEscColor}, transparent)`,
                      rotate: `${(a * 180) / Math.PI}deg`,
                    }}
                    animate={{
                      opacity: [0, 0.9, 0, 0.7, 0],
                      scaleY: [0, 1, 0, 0.8, 0],
                    }}
                    transition={{
                      duration: escalationStep >= 3 ? 0.6 : 0.8,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.2,
                    }}
                  />
                );
              })}

              {/* Escalation label */}
              <AnimatePresence mode="wait">
                {currentEscLabel && (
                  <motion.p
                    key={escalationStep}
                    className="absolute bottom-[-70px] text-2xl font-black tracking-wider"
                    style={{
                      color: currentEscColor,
                      textShadow: `0 0 20px ${currentEscColor}, 0 0 40px ${currentEscColor}`,
                    }}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: [0, 1.5, 1.2], opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {currentEscLabel}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* For SSR/UR: escalation step dots (trust meter) */}
              {rarityIdx >= 3 && (
                <div className="absolute bottom-[-100px] flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full border"
                      style={{
                        borderColor: i <= escalationStep ? ESCALATION_COLORS[i][0] : "#333",
                        background: i <= escalationStep ? ESCALATION_COLORS[i][0] : "transparent",
                        boxShadow: i <= escalationStep ? `0 0 8px ${ESCALATION_COLORS[i][0]}` : "none",
                      }}
                      animate={i === escalationStep ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── UR Fake-out (暗転) ── */}
          {phase === "escalation" && showFakeOut && !showRevival && (
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.p
                className="text-gray-600 text-lg"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ・・・
              </motion.p>
              {/* Dim everything */}
              <motion.div
                className="fixed inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}

          {/* ── UR Revival (復活!!) ── */}
          {phase === "escalation" && showRevival && (
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Rainbow orb */}
              <motion.div
                className="w-48 h-48 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa, #f472b6)",
                  filter: "blur(20px)",
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0, 1.5, 1.2],
                }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 0.8, ease: "easeOut" } }}
              />

              {/* 復活!! text */}
              <motion.p
                className="absolute text-4xl font-black text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 1.5], opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                復活!!
              </motion.p>

              {/* Rainbow particles burst */}
              {Array.from({ length: 20 }).map((_, i) => {
                const a = (i / 20) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: "50%", top: "50%",
                      background: `hsl(${i * 18}, 100%, 65%)`,
                      boxShadow: `0 0 8px hsl(${i * 18}, 100%, 65%)`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(a) * 180,
                      y: Math.sin(a) * 180,
                      opacity: [0, 1, 0],
                      scale: [0, 2, 0],
                    }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.03, ease: "easeOut" }}
                  />
                );
              })}

              {/* 確変!!! below */}
              <motion.p
                className="absolute bottom-[-70px] text-xl font-black tracking-widest"
                style={{
                  color: "#f472b6",
                  textShadow: "0 0 20px #f472b6, 0 0 40px #f472b6, 0 0 80px #f472b6",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                確変!!!
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 4: Climax (final tension) ── */}
          {phase === "climax" && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Rapidly pulsing orb */}
              <motion.div
                className="rounded-full"
                style={{
                  width: isUR ? 200 : rarityIdx >= 3 ? 160 : 120,
                  height: isUR ? 200 : rarityIdx >= 3 ? 160 : 120,
                  background: isUR
                    ? "conic-gradient(from 0deg, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa, #f472b6)"
                    : `radial-gradient(circle, ${color}90 0%, ${color}30 60%, transparent 80%)`,
                  boxShadow: `0 0 100px ${color}80`,
                }}
                animate={{
                  scale: [1, 1.3, 0.9, 1.4, 0.85, 1.5],
                  rotate: isUR ? [0, 360] : 0,
                }}
                transition={{
                  scale: { duration: rarityIdx >= 3 ? 1.5 : 0.8, ease: "easeIn" },
                  rotate: { duration: 1, ease: "linear" },
                }}
              />

              {/* Rapid heartbeat lines */}
              <motion.div
                className="absolute w-full h-0.5 max-w-xs"
                style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
                animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* ── Phase 5: Explosion ── */}
          {phase === "explosion" && (
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Massive flash */}
              <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{ background: isUR ? "white" : color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, rarityIdx >= 3 ? 1 : 0.6, 0] }}
                transition={{ duration: 0.8, times: [0, 0.1, 1] }}
              />

              {/* Explosion particles */}
              {explosionParticles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: "50%", top: "50%",
                    width: rarityIdx >= 3 ? 6 : 4,
                    height: rarityIdx >= 3 ? 6 : 4,
                    background: isUR ? `hsl(${i * 12}, 100%, 65%)` : color,
                    boxShadow: `0 0 10px ${isUR ? `hsl(${i * 12}, 100%, 65%)` : color}`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.dist * (rarityIdx >= 3 ? 1.5 : 1),
                    y: Math.sin(p.angle) * p.dist * (rarityIdx >= 3 ? 1.5 : 1),
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1.2, delay: p.delay * 0.1, ease: "easeOut" }}
                />
              ))}

              {/* Shock wave rings */}
              {[0, 1, 2, ...(rarityIdx >= 3 ? [3, 4] : [])].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    borderWidth: rarityIdx >= 3 ? 3 : 2,
                    borderStyle: "solid",
                    borderColor: isUR
                      ? `hsl(${i * 60}, 100%, 65%)`
                      : color,
                  }}
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{
                    width: 500 + i * 120,
                    height: 500 + i * 120,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.5, delay: i * 0.12, ease: "easeOut" }}
                />
              ))}

              {/* Rarity text */}
              {rarityIdx >= 2 && (
                <motion.p
                  className="absolute text-5xl font-black z-20"
                  style={{
                    color: isUR ? "transparent" : color,
                    backgroundImage: isUR
                      ? "linear-gradient(to right, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa)"
                      : undefined,
                    backgroundClip: isUR ? "text" : undefined,
                    WebkitBackgroundClip: isUR ? "text" : undefined,
                    textShadow: isUR
                      ? "0 0 30px #f472b6, 0 0 60px #fbbf24"
                      : `0 0 30px ${color}, 0 0 60px ${color}`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2.5, 1.8], opacity: [0, 1, 1] }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  {isUR ? "ULTRA RARE!!" : isSSR ? "SUPER RARE!" : highestRarity === "SR" ? "RARE!" : ""}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── Phase 6: Reveal ── */}
          {phase === "reveal" && (
            <>
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: rarityIdx >= 3 ? 40 : 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: rarityIdx >= 3 ? 3 : 2,
                      height: rarityIdx >= 3 ? 3 : 2,
                      background: isUR
                        ? `hsl(${(i * 36) % 360}, 100%, 70%)`
                        : isSSR
                          ? "#fbbf24"
                          : "#ffffff30",
                      left: `${(i * 37) % 100}%`,
                      top: `${(i * 53) % 100}%`,
                    }}
                    animate={{
                      y: [0, -300 - (i % 5) * 100],
                      x: [0, ((i % 10) - 5) * 20],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      delay: (i % 7) * 0.3,
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
                      onComplete={() => handleRevealComplete(results[0].prize.rarity)}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                    <p className="text-center text-gray-300 text-sm mb-3 font-medium">
                      タップして開封{" "}
                      <span className="text-yellow-400 font-bold">{revealedCount}</span>
                      <span className="text-gray-500">/{results.length}</span>
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {results.map((r, i) => (
                        <div key={r.id} className="flex justify-center">
                          <div className="scale-[0.38] origin-top -mb-28">
                            <CardReveal
                              prize={r.prize}
                              onComplete={() => handleRevealComplete(r.prize.rarity)}
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

          {/* ── Phase 7: Result ── */}
          {phase === "result" && (
            <motion.div
              className="relative z-10 w-full max-w-sm mx-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <ResultScreen results={results} isTrial={isTrial} onClose={handleClose} />
            </motion.div>
          )}

          {/* Skip button */}
          {isPreReveal && skipEnabled && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 right-6 z-50 text-xs text-gray-500 hover:text-gray-300 bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleSkip(); }}
            >
              スキップ &gt;&gt;
            </motion.button>
          )}

          {/* Screen shake CSS */}
          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translate(0); }
              10% { transform: translate(-10px, 5px); }
              20% { transform: translate(10px, -5px); }
              30% { transform: translate(-8px, 8px); }
              40% { transform: translate(8px, -8px); }
              50% { transform: translate(-5px, 3px); }
              60% { transform: translate(5px, -3px); }
              70% { transform: translate(-3px, 5px); }
              80% { transform: translate(3px, -5px); }
              90% { transform: translate(-1px, 2px); }
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
