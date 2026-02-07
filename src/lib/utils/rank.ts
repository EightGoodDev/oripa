import { UserRank } from "@prisma/client";

const RANK_THRESHOLDS: { rank: UserRank; threshold: number }[] = [
  { rank: "VIP", threshold: 500000 },
  { rank: "DIAMOND", threshold: 200000 },
  { rank: "PLATINUM", threshold: 100000 },
  { rank: "GOLD", threshold: 50000 },
  { rank: "SILVER", threshold: 20000 },
  { rank: "BRONZE", threshold: 5000 },
  { rank: "BEGINNER", threshold: 0 },
];

export function calcRank(totalSpent: number): UserRank {
  for (const { rank, threshold } of RANK_THRESHOLDS) {
    if (totalSpent >= threshold) return rank;
  }
  return "BEGINNER";
}

export const RANK_LABELS: Record<UserRank, string> = {
  BEGINNER: "ビギナー",
  BRONZE: "ブロンズ",
  SILVER: "シルバー",
  GOLD: "ゴールド",
  PLATINUM: "プラチナ",
  DIAMOND: "ダイヤモンド",
  VIP: "VIP",
};

export const RANK_COLORS: Record<UserRank, string> = {
  BEGINNER: "#9ca3af",
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
  DIAMOND: "#b9f2ff",
  VIP: "#ff6b6b",
};
