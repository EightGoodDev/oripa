"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import CardReveal from "./CardReveal";
import ResultScreen from "./ResultScreen";
import {
  seededRandom,
  StarField,
  ScreenVignette,
  ShockwaveRing,
  RadialBurst,
  Confetti,
} from "./GachaEffects";
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
  const rng = seededRandom(seed, count * 6);
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    dist: 150 + rng[i * 6] * 200,
    delay: rng[i * 6 + 1] * 2,
    duration: 1.5 + rng[i * 6 + 2],
    x: rng[i * 6 + 3] * 100,
    y: rng[i * 6 + 4] * 100,
    scale: rng[i * 6 + 5],
  }));
}

// Opening config per rarity
const OPENING_CONFIG: Record<string, {
  titleGradient: string;
  subtitle: string;
  ringCount: number;
  duration: number;
}> = {
  N:   { titleGradient: "from-gray-300 to-white",   subtitle: "運命の一引き...",  ringCount: 3, duration: 1200 },
  R:   { titleGradient: "from-gray-300 to-white",   subtitle: "運命の一引き...",  ringCount: 3, duration: 1200 },
  SR:  { titleGradient: "from-purple-400 to-purple-600", subtitle: "何が出るか...",   ringCount: 4, duration: 2000 },
  SSR: { titleGradient: "from-yellow-300 to-yellow-600", subtitle: "...覚悟はいいか？", ringCount: 5, duration: 2800 },
  UR:  { titleGradient: "from-pink-400 via-yellow-300 to-blue-400", subtitle: "...運命が動き出す", ringCount: 6, duration: 3000 },
};

// Charging config per rarity
const CHARGING_CONFIG: Record<string, {
  orbSize: number;
  particleCount: number;
  particleColors: string[];
  text: string;
  duration: number;
}> = {
  N:   { orbSize: 96,  particleCount: 15, particleColors: ["#93c5fd"], text: "", duration: 1500 },
  R:   { orbSize: 96,  particleCount: 15, particleColors: ["#93c5fd"], text: "", duration: 1500 },
  SR:  { orbSize: 128, particleCount: 30, particleColors: ["#93c5fd", "#c4b5fd"], text: "ドキドキ...", duration: 2500 },
  SSR: { orbSize: 144, particleCount: 50, particleColors: ["#93c5fd", "#fde68a"], text: "ドクン...ドクン...", duration: 3500 },
  UR:  { orbSize: 160, particleCount: 60, particleColors: ["#f9a8d4", "#fde68a", "#93c5fd", "#86efac", "#c4b5fd"], text: "ドクン→...!!", duration: 4500 },
};

// Climax config per rarity
const CLIMAX_CONFIG: Record<string, {
  orbSize: number;
  pulseCount: number;
  heartbeatLines: number;
  shake: "none" | "light" | "heavy" | "continuous";
  duration: number;
}> = {
  N:   { orbSize: 64,  pulseCount: 1, heartbeatLines: 1, shake: "none",       duration: 500 },
  R:   { orbSize: 64,  pulseCount: 1, heartbeatLines: 1, shake: "none",       duration: 500 },
  SR:  { orbSize: 96,  pulseCount: 3, heartbeatLines: 2, shake: "light",      duration: 800 },
  SSR: { orbSize: 160, pulseCount: 5, heartbeatLines: 4, shake: "heavy",      duration: 1500 },
  UR:  { orbSize: 224, pulseCount: 8, heartbeatLines: 8, shake: "continuous", duration: 2000 },
};

// Explosion config per rarity
const EXPLOSION_CONFIG: Record<string, {
  flashOpacity: number;
  particleCount: number;
  shockwaveCount: number;
  hasRadialBurst: boolean;
  hasDebris: boolean;
  rarityText: string;
}> = {
  N:   { flashOpacity: 0.3, particleCount: 15, shockwaveCount: 2, hasRadialBurst: false, hasDebris: false, rarityText: "" },
  R:   { flashOpacity: 0.4, particleCount: 20, shockwaveCount: 3, hasRadialBurst: false, hasDebris: false, rarityText: "R" },
  SR:  { flashOpacity: 0.5, particleCount: 35, shockwaveCount: 4, hasRadialBurst: true,  hasDebris: false, rarityText: "RARE!" },
  SSR: { flashOpacity: 0.8, particleCount: 50, shockwaveCount: 5, hasRadialBurst: true,  hasDebris: true,  rarityText: "SUPER RARE!" },
  UR:  { flashOpacity: 1.0, particleCount: 70, shockwaveCount: 7, hasRadialBurst: true,  hasDebris: true,  rarityText: "ULTRA RARE!!" },
};

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
  const [vignetteIntensity, setVignetteIntensity] = useState(0.3);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isMulti = results.length > 1;
  const highestRarity = results.length > 0 ? getHighestRarity(results) : "N";
  const rarityIdx = RARITY_ORDER.indexOf(highestRarity);
  const color = RARITY_COLOR[highestRarity] || RARITY_COLOR.N;
  const isUR = highestRarity === "UR";
  const isSSR = highestRarity === "SSR";

  // Pre-generate particles for various phases
  const chargingParticles = useMemo(
    () => generateParticles(CHARGING_CONFIG[highestRarity]?.particleCount ?? 40, 42),
    [highestRarity],
  );
  const explosionParticles = useMemo(
    () => generateParticles(EXPLOSION_CONFIG[highestRarity]?.particleCount ?? 30, 99),
    [highestRarity],
  );
  const debrisParticles = useMemo(() => {
    const rng = seededRandom(555, 30 * 5);
    return Array.from({ length: 15 }, (_, i) => ({
      x: (rng[i * 5] - 0.5) * 400,
      y: 200 + rng[i * 5 + 1] * 300,
      rotate: rng[i * 5 + 2] * 720,
      size: 3 + rng[i * 5 + 3] * 5,
      delay: rng[i * 5 + 4] * 0.5,
    }));
  }, []);

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

  const doShake = useCallback((intensity: "light" | "heavy" | "double" = "heavy") => {
    if (containerRef.current) {
      const cls = intensity === "double" ? "screen-shake-double" : intensity === "light" ? "screen-shake-light" : "screen-shake";
      containerRef.current.classList.add(cls);
      setTimeout(() => containerRef.current?.classList.remove(cls), intensity === "double" ? 800 : 500);
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
    setVignetteIntensity(0.3);
    skipRef.current = false;
    clearTimers();

    const steps = getEscalationSteps(highestRarity);
    const openCfg = OPENING_CONFIG[highestRarity] || OPENING_CONFIG.N;
    const chargeCfg = CHARGING_CONFIG[highestRarity] || CHARGING_CONFIG.N;
    const climaxCfg = CLIMAX_CONFIG[highestRarity] || CLIMAX_CONFIG.N;

    // Enable skip after 2 seconds
    addTimer(() => setSkipEnabled(true), 2000);

    let t = 0;

    // Phase 1: Opening
    t += openCfg.duration;

    // Phase 2: Charging
    addTimer(() => {
      if (!skipRef.current) {
        setPhase("charging");
        setVignetteIntensity(0.4);
      }
    }, t);
    t += chargeCfg.duration;

    // Phase 3: Escalation (pachinko color steps)
    if (steps > 0) {
      addTimer(() => {
        if (!skipRef.current) {
          setPhase("escalation");
          setVignetteIntensity(0.5);
        }
      }, t);

      for (let i = 0; i < steps; i++) {
        const stepDelay = t + i * (rarityIdx >= 3 ? 1800 : 1500);
        addTimer(() => {
          if (skipRef.current) return;
          setEscalationStep(i);
          setBorderColor(ESCALATION_COLORS[i][2]);
          if (i === 1) {
            // Green step: flash
            doFlash(ESCALATION_COLORS[i][0], 200);
          } else if (i === 2) {
            // Red step: intense flash + shake
            doFlash(ESCALATION_COLORS[i][0], 300);
            doShake("heavy");
            setVignetteIntensity(0.65);
          } else if (i === 3) {
            // Gold step: double flash + double shake
            doFlash(ESCALATION_COLORS[i][0], 200);
            setTimeout(() => doFlash(ESCALATION_COLORS[i][0], 200), 250);
            doShake("double");
            setVignetteIntensity(0.75);
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
          setVignetteIntensity(0.9);
        }, t);
        t += 2500;

        // Revival!
        addTimer(() => {
          if (skipRef.current) return;
          setShowFakeOut(false);
          setShowRevival(true);
          setBorderColor("rgba(244,114,182,0.8)");
          doFlash("white", 500);
          doShake("double");
          setVignetteIntensity(0.3);
        }, t);
        t += 2500;

        addTimer(() => { if (!skipRef.current) setShowRevival(false); }, t);
      }
    }

    // Phase 4: Climax
    addTimer(() => {
      if (skipRef.current) return;
      setPhase("climax");
      if (climaxCfg.shake === "heavy" || climaxCfg.shake === "continuous") doShake(climaxCfg.shake === "continuous" ? "double" : "heavy");
      else if (climaxCfg.shake === "light") doShake("light");
    }, t);
    t += climaxCfg.duration;

    // UR: 3-flash countdown before explosion
    if (isUR) {
      for (let i = 0; i < 3; i++) {
        addTimer(() => {
          if (!skipRef.current) doFlash("white", 100);
        }, t - 600 + i * 200);
      }
    }

    // Phase 5: Explosion
    addTimer(() => {
      if (skipRef.current) return;
      setPhase("explosion");
      doFlash(isUR ? "white" : color, 500);
      doShake(isUR || isSSR ? "double" : "heavy");
    }, t);
    t += rarityIdx >= 3 ? 2500 : rarityIdx >= 2 ? 2000 : 1500;

    // Phase 6: Reveal
    addTimer(() => { if (!skipRef.current) setPhase("reveal"); }, t);

    return clearTimers;
  }, [isOpen, results.length, highestRarity, rarityIdx, isUR, isSSR, color, clearTimers, addTimer, doFlash, doShake]);

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
        doShake("heavy");
      }
    },
    [results.length, doShake],
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
  const openCfg = OPENING_CONFIG[highestRarity] || OPENING_CONFIG.N;
  const chargeCfg = CHARGING_CONFIG[highestRarity] || CHARGING_CONFIG.N;
  const climaxCfg = CLIMAX_CONFIG[highestRarity] || CLIMAX_CONFIG.N;
  const explosionCfg = EXPLOSION_CONFIG[highestRarity] || EXPLOSION_CONFIG.N;

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

          {/* StarField background (all pre-reveal phases) */}
          {isPreReveal && (
            <StarField
              count={isUR ? 60 : rarityIdx >= 3 ? 50 : 30}
              seed={314}
              color={isUR ? undefined : color}
              speed={phase === "climax" ? 2 : 1}
            />
          )}

          {/* ScreenVignette */}
          {isPreReveal && <ScreenVignette intensity={vignetteIntensity} />}

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
              {Array.from({ length: escalationStep >= 2 ? 30 : 20 }).map((_, i) => {
                const total = escalationStep >= 2 ? 30 : 20;
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-left"
                    style={{
                      width: "150vmax",
                      height: phase === "climax" ? "3px" : escalationStep >= 2 ? "2.5px" : "1.5px",
                      background: `linear-gradient(to right, transparent, ${currentEscColor}30, transparent)`,
                      rotate: `${(i / total) * 360}deg`,
                    }}
                    animate={{
                      opacity: [0, 0.6, 0],
                      scaleX: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: phase === "climax" ? 0.4 : 0.8,
                      repeat: Infinity,
                      delay: (i / total) * 0.5,
                    }}
                  />
                );
              })}
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
                className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b ${openCfg.titleGradient}`}
                initial={{ scale: 4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {isMulti ? "10連ガチャ" : "ガチャ"}
              </motion.p>

              {/* Subtitle with per-character stagger */}
              <div className="flex mt-3">
                {openCfg.subtitle.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="text-xl text-white/80 tracking-[0.15em]"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Burst rings - rarity-branched count and color */}
              {Array.from({ length: openCfg.ringCount }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: isUR
                      ? `hsl(${(i / openCfg.ringCount) * 360}, 100%, 65%)`
                      : `${color}50`,
                  }}
                  initial={{ width: 0, height: 0, opacity: 0.8 }}
                  animate={{ width: 300 + i * 120, height: 300 + i * 120, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.6 + i * 0.15, ease: "easeOut" }}
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
                className="rounded-full relative"
                style={{
                  width: chargeCfg.orbSize,
                  height: chargeCfg.orbSize,
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

              {/* SSR/UR: Rotating rings around orb */}
              {rarityIdx >= 3 && (
                <>
                  <motion.div
                    className="absolute rounded-full border"
                    style={{
                      width: chargeCfg.orbSize + 40,
                      height: chargeCfg.orbSize + 40,
                      borderColor: `${color}40`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute rounded-full border"
                    style={{
                      width: chargeCfg.orbSize + 70,
                      height: chargeCfg.orbSize + 70,
                      borderColor: `${color}25`,
                      borderStyle: "dashed",
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  {isUR && (
                    <motion.div
                      className="absolute rounded-full border-2"
                      style={{
                        width: chargeCfg.orbSize + 100,
                        height: chargeCfg.orbSize + 100,
                        borderColor: `${color}15`,
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </>
              )}

              {/* Converging particles with varied sizes and colors */}
              {chargingParticles.map((p, i) => {
                const pColor = chargeCfg.particleColors[i % chargeCfg.particleColors.length];
                const size = 1 + (p.scale * 3);
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: "50%", top: "50%",
                      width: size,
                      height: size,
                      background: pColor,
                      boxShadow: `0 0 ${size * 2}px ${pColor}`,
                    }}
                    initial={{
                      x: Math.cos(p.angle) * (200 + p.dist * 0.5),
                      y: Math.sin(p.angle) * (200 + p.dist * 0.5),
                      opacity: 0,
                    }}
                    animate={{
                      x: [Math.cos(p.angle) * (200 + p.dist * 0.5), 0],
                      y: [Math.sin(p.angle) * (200 + p.dist * 0.5), 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.5, 0],
                    }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeIn" }}
                  />
                );
              })}

              {/* SSR/UR: Energy convergence streaks (spiral) */}
              {rarityIdx >= 3 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: isUR ? 8 : 5 }).map((_, i) => {
                    const a = (i / (isUR ? 8 : 5)) * Math.PI * 2;
                    return (
                      <motion.div
                        key={i}
                        className="absolute left-1/2 top-1/2"
                        style={{
                          width: 2,
                          height: 80 + i * 10,
                          background: `linear-gradient(to bottom, ${color}, transparent)`,
                          transformOrigin: "top center",
                        }}
                        animate={{
                          rotate: [a * (180 / Math.PI), a * (180 / Math.PI) + 360],
                          scaleY: [1, 0],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeIn",
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pulsing heartbeat text */}
              {chargeCfg.text && (
                <motion.p
                  className="absolute bottom-[-60px] text-sm text-white/60 tracking-widest"
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {chargeCfg.text}
                </motion.p>
              )}
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

              {/* Blue aura for step 0 */}
              {escalationStep === 0 && (
                <motion.div
                  className="absolute w-60 h-60 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Green step: floating "?" particles */}
              {escalationStep === 1 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-green-400 font-bold text-lg"
                      style={{
                        left: `${20 + i * 12}%`,
                        top: "60%",
                        textShadow: "0 0 10px #22c55e",
                      }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], y: -120 }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    >
                      ?
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Red step: screen crack effect */}
              {escalationStep >= 2 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Crack lines */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bg-white/20"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: 1,
                        height: 100 + i * 40,
                        transformOrigin: "top center",
                        rotate: `${-90 + i * 45}deg`,
                      }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: [0, 0.6, 0.3] }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              )}

              {/* Gold step: flame particles rising from bottom */}
              {escalationStep >= 3 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 4 + (i % 3) * 2,
                        height: 6 + (i % 4) * 3,
                        left: `${10 + (i * 7) % 80}%`,
                        bottom: 0,
                        background: i % 2 === 0
                          ? "linear-gradient(to top, #fbbf24, #ef4444)"
                          : "linear-gradient(to top, #fde68a, #fbbf24)",
                        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      }}
                      animate={{
                        y: [0, -300 - (i % 4) * 80],
                        opacity: [0.8, 0],
                        scale: [1, 0.3],
                      }}
                      transition={{
                        duration: 1.5 + (i % 3) * 0.3,
                        repeat: Infinity,
                        delay: (i % 5) * 0.15,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              )}

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
                      textShadow: escalationStep >= 3
                        ? `0 0 20px ${currentEscColor}, 0 0 40px ${currentEscColor}, 0 0 80px #ef4444`
                        : `0 0 20px ${currentEscColor}, 0 0 40px ${currentEscColor}`,
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

              {/* Trust meter: horizontal bar (replaces dots) */}
              {rarityIdx >= 3 && (
                <div className="absolute bottom-[-105px] w-48">
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${i * 25}%`,
                          width: "25%",
                          background: i <= escalationStep ? ESCALATION_COLORS[i][0] : "transparent",
                          borderRight: i < 3 ? "1px solid rgba(0,0,0,0.5)" : "none",
                        }}
                        initial={{ opacity: 0 }}
                        animate={
                          i <= escalationStep
                            ? {
                                opacity: 1,
                                boxShadow: i === escalationStep
                                  ? [`inset 0 0 10px ${ESCALATION_COLORS[i][0]}80`, `inset 0 0 20px ${ESCALATION_COLORS[i][0]}40`]
                                  : "none",
                              }
                            : { opacity: 0.2 }
                        }
                        transition={
                          i === escalationStep
                            ? { duration: 0.5, repeat: Infinity, repeatType: "reverse" as const }
                            : { duration: 0.3 }
                        }
                      />
                    ))}
                  </div>
                  {/* All lit: shatter particles */}
                  {escalationStep >= 3 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5"
                          style={{
                            left: `${12 + i * 10}%`,
                            top: "50%",
                            background: ESCALATION_COLORS[i % 4][0],
                          }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            y: [(i % 2 === 0 ? -1 : 1) * 5, (i % 2 === 0 ? -1 : 1) * 30],
                            x: (i - 4) * 8,
                            scale: [1, 0],
                          }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                        />
                      ))}
                    </div>
                  )}
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
              {/* Orb shrink → vanish */}
              <motion.div
                className="w-40 h-40 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${ESCALATION_COLORS[3][0]}60 0%, transparent 70%)`,
                }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
              />

              {/* "...はずれ？" text with tremble */}
              <motion.p
                className="absolute text-gray-500 text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0, 0.8],
                  x: [0, -2, 2, -1, 1, 0],
                }}
                transition={{
                  opacity: { duration: 1.5, times: [0, 0.4, 1] },
                  x: { duration: 0.3, delay: 1.2, repeat: Infinity },
                }}
              >
                ...はずれ？
              </motion.p>

              {/* Static/noise effect */}
              <motion.div
                className="fixed inset-0 pointer-events-none z-[5]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
                  backgroundSize: "150px 150px",
                }}
                animate={{ opacity: [0, 0.3, 0.1, 0.25, 0.15] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />

              {/* Dim everything */}
              <motion.div
                className="fixed inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
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
              {/* Small light point → crack → explosion */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{ boxShadow: "0 0 20px white, 0 0 40px white" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 3, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.5 }}
              />

              {/* Crack lines radiating out */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white/60"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: 1.5,
                    height: 120,
                    transformOrigin: "top center",
                    rotate: `${i * 45}deg`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
              ))}

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

              {/* 復活!! text - bigger scale */}
              <motion.p
                className="absolute text-4xl font-black text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 3, 1.8], opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                復活!!
              </motion.p>

              {/* Rainbow particles burst - 2 waves */}
              {/* Wave 1: fast small particles */}
              {Array.from({ length: 20 }).map((_, i) => {
                const a = (i / 20) * Math.PI * 2;
                return (
                  <motion.div
                    key={`w1-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      left: "50%", top: "50%",
                      background: `hsl(${i * 18}, 100%, 65%)`,
                      boxShadow: `0 0 6px hsl(${i * 18}, 100%, 65%)`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(a) * 200,
                      y: Math.sin(a) * 200,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.02, ease: "easeOut" }}
                  />
                );
              })}
              {/* Wave 2: slow large particles */}
              {Array.from({ length: 20 }).map((_, i) => {
                const a = (i / 20) * Math.PI * 2 + 0.15;
                return (
                  <motion.div
                    key={`w2-${i}`}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: "50%", top: "50%",
                      background: `hsl(${i * 18 + 10}, 100%, 70%)`,
                      boxShadow: `0 0 12px hsl(${i * 18 + 10}, 100%, 70%)`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(a) * 250,
                      y: Math.sin(a) * 250,
                      opacity: [0, 1, 0],
                      scale: [0, 2.5, 0],
                    }}
                    transition={{ duration: 1.2, delay: 0.6 + i * 0.03, ease: "easeOut" }}
                  />
                );
              })}

              {/* 5 shockwave rings (rainbow) */}
              {Array.from({ length: 5 }).map((_, i) => (
                <ShockwaveRing
                  key={i}
                  color={`hsl(${i * 72}, 100%, 65%)`}
                  size={400 + i * 100}
                  delay={0.4 + i * 0.1}
                  thickness={3}
                  duration={1.5}
                />
              ))}

              {/* 確変!!! + 超激レア確定!! */}
              <motion.div className="absolute bottom-[-70px] flex flex-col items-center gap-1">
                <motion.p
                  className="text-xl font-black tracking-widest"
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
                <motion.p
                  className="text-sm font-bold tracking-wider"
                  style={{
                    color: "#fbbf24",
                    textShadow: "0 0 10px #fbbf24",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0, 1.3, 1] }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  超激レア確定!!
                </motion.p>
              </motion.div>

              {/* Rainbow starfield revival */}
              <StarField count={40} seed={999} speed={2} />
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
              {/* SSR/UR: Screen breathing scale */}
              {rarityIdx >= 3 && (
                <motion.div
                  className="fixed inset-0 pointer-events-none"
                  animate={{ scale: [1, 1.015, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Rapidly pulsing orb */}
              <motion.div
                className="rounded-full"
                style={{
                  width: climaxCfg.orbSize,
                  height: climaxCfg.orbSize,
                  background: isUR
                    ? "conic-gradient(from 0deg, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa, #f472b6)"
                    : `radial-gradient(circle, ${color}90 0%, ${color}30 60%, transparent 80%)`,
                  boxShadow: `0 0 100px ${color}80`,
                }}
                animate={{
                  scale: climaxCfg.pulseCount >= 8
                    ? [1, 1.3, 0.85, 1.4, 0.8, 1.5, 0.9, 1.6, 0.85, 1.7]
                    : climaxCfg.pulseCount >= 5
                      ? [1, 1.3, 0.9, 1.4, 0.85, 1.5]
                      : [1, 1.3, 0.9, 1.4],
                  rotate: isUR ? [0, 360] : 0,
                }}
                transition={{
                  scale: { duration: climaxCfg.duration / 1000, ease: "easeIn" },
                  rotate: isUR
                    ? {
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                      }
                    : undefined,
                }}
              />

              {/* UR: Orb rotation acceleration */}
              {isUR && (
                <motion.div
                  className="absolute rounded-full border-2"
                  style={{
                    width: climaxCfg.orbSize + 20,
                    height: climaxCfg.orbSize + 20,
                    borderColor: `${color}40`,
                    borderTopColor: color,
                  }}
                  animate={{ rotate: [0, 3600] }}
                  transition={{ duration: climaxCfg.duration / 1000, ease: "easeIn" }}
                />
              )}

              {/* Heartbeat lines (rarity-based count and layout) */}
              {Array.from({ length: climaxCfg.heartbeatLines }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute max-w-xs"
                  style={{
                    width: "100%",
                    height: climaxCfg.heartbeatLines >= 4 ? "2px" : "1px",
                    background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                    rotate: climaxCfg.heartbeatLines >= 8
                      ? `${(i / climaxCfg.heartbeatLines) * 360}deg`
                      : climaxCfg.heartbeatLines >= 4
                        ? `${i * 45}deg`
                        : climaxCfg.heartbeatLines >= 2
                          ? `${i * 90}deg`
                          : "0deg",
                  }}
                  animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
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
                animate={{ opacity: [0, explosionCfg.flashOpacity, 0] }}
                transition={{ duration: 0.8, times: [0, 0.1, 1] }}
              />

              {/* RadialBurst for SR+ */}
              {explosionCfg.hasRadialBurst && (
                <RadialBurst
                  color={isUR ? "#f472b6" : color}
                  rayCount={isUR ? 16 : 12}
                  spin
                  pulse={false}
                  size={700}
                />
              )}

              {/* Explosion particles */}
              {explosionParticles.map((p, i) => {
                const isWave2 = isUR && i >= 35;
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%", top: "50%",
                      width: rarityIdx >= 3 ? 6 : 4,
                      height: rarityIdx >= 3 ? (i % 3 === 0 ? 12 : 6) : 4,
                      borderRadius: i % 3 === 0 ? "1px" : "50%",
                      background: isUR ? `hsl(${i * 5}, 100%, 65%)` : color,
                      boxShadow: `0 0 10px ${isUR ? `hsl(${i * 5}, 100%, 65%)` : color}`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(p.angle) * p.dist * (rarityIdx >= 3 ? 1.5 : 1),
                      y: Math.sin(p.angle) * p.dist * (rarityIdx >= 3 ? 1.5 : 1),
                      opacity: 0,
                      scale: 0,
                      rotate: i % 3 === 0 ? 360 : 0,
                    }}
                    transition={{
                      duration: isWave2 ? 1.8 : 1.2,
                      delay: isWave2 ? 0.3 + p.delay * 0.1 : p.delay * 0.1,
                      ease: "easeOut",
                    }}
                  />
                );
              })}

              {/* Shock wave rings */}
              {Array.from({ length: explosionCfg.shockwaveCount }).map((_, i) => (
                <ShockwaveRing
                  key={i}
                  color={isUR ? `hsl(${i * (360 / explosionCfg.shockwaveCount)}, 100%, 65%)` : color}
                  size={500 + i * 120}
                  delay={i * 0.12}
                  thickness={rarityIdx >= 3 ? 3 : 2}
                />
              ))}

              {/* Debris (SSR/UR only) */}
              {explosionCfg.hasDebris && debrisParticles.map((d, i) => (
                <motion.div
                  key={`debris-${i}`}
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: d.size,
                    height: d.size,
                    background: isUR ? `hsl(${i * 24}, 80%, 60%)` : color,
                    borderRadius: 1,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: d.x,
                    y: d.y,
                    opacity: 0,
                    rotate: d.rotate,
                  }}
                  transition={{ duration: 2, delay: d.delay, ease: "easeOut" }}
                />
              ))}

              {/* Rarity text - enhanced per rarity */}
              {explosionCfg.rarityText && (
                <>
                  {highestRarity === "R" && (
                    <motion.p
                      className="absolute text-2xl font-bold z-20"
                      style={{ color: "#60a5fa" }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 0.8, 0.6], scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      R
                    </motion.p>
                  )}
                  {highestRarity === "SR" && (
                    <motion.p
                      className="absolute text-4xl font-black z-20"
                      style={{
                        color: "#a78bfa",
                        textShadow: "0 0 20px #a78bfa, 0 0 40px #a78bfa",
                      }}
                      initial={{ scale: 0, opacity: 0, y: 30 }}
                      animate={{ scale: [0, 2.5, 1.5], opacity: 1, y: [30, -10, 0] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      RARE!
                    </motion.p>
                  )}
                  {highestRarity === "SSR" && (
                    <div className="absolute z-20 flex gap-2">
                      {["SUPER", " ", "RARE!"].map((word, wi) => (
                        <motion.span
                          key={wi}
                          className="text-5xl font-black"
                          style={{
                            color: "#fbbf24",
                            textShadow: "0 0 30px #fbbf24, 0 0 60px #fbbf24, 0 0 10px #78350f",
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 2.5, 1.8], opacity: [0, 1, 1] }}
                          transition={{ duration: 0.8, delay: wi * 0.2, ease: "easeOut" }}
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                  )}
                  {highestRarity === "UR" && (
                    <div className="absolute z-20 flex">
                      {"ULTRA RARE!!".split("").map((ch, ci) => (
                        <motion.span
                          key={ci}
                          className="text-5xl font-black"
                          style={{
                            backgroundImage: "linear-gradient(to right, #f472b6, #fbbf24, #22c55e, #60a5fa, #a78bfa)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            textShadow: "none",
                            filter: "drop-shadow(0 0 15px rgba(244,114,182,0.5)) drop-shadow(0 0 30px rgba(251,191,36,0.3))",
                          }}
                          initial={{ scale: 0, opacity: 0, y: 20 }}
                          animate={{ scale: [0, 2.5, 1.8], opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: ci * 0.03, ease: "easeOut" }}
                        >
                          {ch === " " ? "\u00A0" : ch}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </>
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
            @keyframes shake-light {
              0%, 100% { transform: translate(0); }
              25% { transform: translate(-3px, 2px); }
              50% { transform: translate(3px, -2px); }
              75% { transform: translate(-2px, 1px); }
            }
            @keyframes shake-double {
              0%, 100% { transform: translate(0); }
              5% { transform: translate(-15px, 8px); }
              10% { transform: translate(15px, -8px); }
              15% { transform: translate(-12px, 12px); }
              20% { transform: translate(12px, -12px); }
              25% { transform: translate(-10px, 5px); }
              30% { transform: translate(10px, -5px); }
              40% { transform: translate(-8px, 8px); }
              50% { transform: translate(8px, -8px); }
              60% { transform: translate(-5px, 3px); }
              70% { transform: translate(5px, -3px); }
              80% { transform: translate(-3px, 5px); }
              90% { transform: translate(1px, -1px); }
            }
            .screen-shake {
              animation: shake 0.5s ease-in-out;
            }
            .screen-shake-light {
              animation: shake-light 0.4s ease-in-out;
            }
            .screen-shake-double {
              animation: shake-double 0.8s ease-in-out;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
