"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

/* ────────────────────────────────────────────
 * seededRandom – SSR-safe deterministic RNG
 * Uses Linear Congruential Generator (LCG)
 * ──────────────────────────────────────────── */
export function seededRandom(seed: number, count: number): number[] {
  const result: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    result.push(s / 0x7fffffff);
  }
  return result;
}

/* ────────────────────────────────────────────
 * StarField – Twinkling background stars
 * ──────────────────────────────────────────── */
interface StarFieldProps {
  count?: number;
  seed?: number;
  color?: string;
  speed?: number;
}

export function StarField({
  count = 40,
  seed = 777,
  color = "#ffffff",
  speed = 1,
}: StarFieldProps) {
  const stars = useMemo(() => {
    const rng = seededRandom(seed, count * 4);
    return Array.from({ length: count }, (_, i) => ({
      x: rng[i * 4] * 100,
      y: rng[i * 4 + 1] * 100,
      size: 1 + rng[i * 4 + 2] * 2.5,
      delay: rng[i * 4 + 3] * 3,
    }));
  }, [count, seed]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: color,
            boxShadow: `0 0 ${star.size * 2}px ${color}`,
          }}
          animate={{
            opacity: [0, 0.8, 0.2, 1, 0],
            scale: [0.8, 1.3, 0.9, 1.2, 0.8],
          }}
          transition={{
            duration: (2 + star.delay) / speed,
            repeat: Infinity,
            delay: star.delay / speed,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
 * Confetti – Falling rotating rectangular particles
 * ──────────────────────────────────────────── */
interface ConfettiProps {
  count?: number;
  seed?: number;
  colors?: string[];
  active?: boolean;
  duration?: number;
}

export function Confetti({
  count = 30,
  seed = 123,
  colors = ["#fbbf24", "#f472b6", "#60a5fa", "#22c55e", "#a78bfa"],
  active = true,
  duration = 3,
}: ConfettiProps) {
  const particles = useMemo(() => {
    const rng = seededRandom(seed, count * 6);
    return Array.from({ length: count }, (_, i) => ({
      x: rng[i * 6] * 100,
      delay: rng[i * 6 + 1] * duration * 0.5,
      width: 4 + rng[i * 6 + 2] * 6,
      height: 6 + rng[i * 6 + 3] * 10,
      color: colors[Math.floor(rng[i * 6 + 4] * colors.length)],
      rotateEnd: 360 + rng[i * 6 + 5] * 720,
      drift: (rng[i * 6 + 1] - 0.5) * 80,
    }));
  }, [count, seed, colors, duration]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-5%",
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: 1,
          }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            x: p.drift,
            rotate: p.rotateEnd,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: duration + p.delay * 0.5,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
 * ShockwaveRing – Expanding shockwave ring
 * ──────────────────────────────────────────── */
interface ShockwaveRingProps {
  color?: string;
  size?: number;
  delay?: number;
  thickness?: number;
  duration?: number;
}

export function ShockwaveRing({
  color = "#ffffff",
  size = 500,
  delay = 0,
  thickness = 3,
  duration = 1.2,
}: ShockwaveRingProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
        borderWidth: thickness,
        borderStyle: "solid",
        borderColor: color,
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: size, height: size, opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    />
  );
}

/* ────────────────────────────────────────────
 * RadialBurst – Conic gradient radial light rays
 * ──────────────────────────────────────────── */
interface RadialBurstProps {
  color?: string;
  rayCount?: number;
  spin?: boolean;
  pulse?: boolean;
  size?: number;
}

export function RadialBurst({
  color = "#fbbf24",
  rayCount = 12,
  spin = true,
  pulse = true,
  size = 600,
}: RadialBurstProps) {
  const gradient = useMemo(() => {
    const stops: string[] = [];
    const step = 360 / rayCount;
    for (let i = 0; i < rayCount; i++) {
      const a = i * step;
      stops.push(`transparent ${a}deg`);
      stops.push(`${color}30 ${a + step * 0.2}deg`);
      stops.push(`${color}15 ${a + step * 0.5}deg`);
      stops.push(`transparent ${a + step}deg`);
    }
    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [color, rayCount]);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
        width: size,
        height: size,
        background: gradient,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: pulse ? [0, 0.8, 0.4, 0.7, 0.4] : [0, 0.7],
        scale: [0, 1.2, 1],
        rotate: spin ? [0, 360] : 0,
      }}
      transition={{
        opacity: { duration: pulse ? 2 : 0.8, repeat: pulse ? Infinity : 0 },
        scale: { duration: 0.8, ease: "easeOut" },
        rotate: spin
          ? { duration: 8, repeat: Infinity, ease: "linear" }
          : undefined,
      }}
    />
  );
}

/* ────────────────────────────────────────────
 * ScreenVignette – Dark overlay at screen edges
 * ──────────────────────────────────────────── */
interface ScreenVignetteProps {
  intensity?: number;
}

export function ScreenVignette({ intensity = 0.5 }: ScreenVignetteProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${intensity}) 100%)`,
      }}
    />
  );
}
