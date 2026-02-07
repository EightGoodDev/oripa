import { randomInt } from "crypto";

interface WeightedItem {
  id: string;
  weight: number;
  remainingQuantity: number;
}

/**
 * Server-side gacha draw using CSPRNG (crypto.randomInt).
 * Never trust the client for randomness.
 */
export function weightedDraw(items: WeightedItem[]): string | null {
  const available = items.filter((item) => item.weight > 0 && item.remainingQuantity > 0);
  if (available.length === 0) return null;

  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return null;

  // CSPRNG: crypto.randomInt returns [0, max)
  const roll = randomInt(totalWeight);

  let cumulative = 0;
  for (const item of available) {
    cumulative += item.weight;
    if (roll < cumulative) {
      return item.id;
    }
  }

  // Fallback (should never reach)
  return available[available.length - 1].id;
}

/**
 * Calculate display probability for a prize within a pack.
 * Used for 景表法-compliant probability display.
 */
export function calculateProbability(weight: number, totalWeight: number): number {
  if (totalWeight <= 0) return 0;
  return weight / totalWeight;
}

/**
 * Format probability as percentage string.
 */
export function formatProbability(weight: number, totalWeight: number): string {
  const pct = calculateProbability(weight, totalWeight) * 100;
  if (pct < 0.01) return "< 0.01%";
  return `${pct.toFixed(2)}%`;
}
