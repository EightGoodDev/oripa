import type { Rarity } from "@prisma/client";

export type { Rarity, Category, UserRank, OwnedItemStatus, PackStatus } from "@prisma/client";

export const RARITY_CONFIG: Record<
  Rarity,
  { label: string; color: string; bg: string; glow: string }
> = {
  N: { label: "N", color: "#9ca3af", bg: "#374151", glow: "" },
  R: { label: "R", color: "#60a5fa", bg: "#1e3a5f", glow: "" },
  SR: {
    label: "SR",
    color: "#a78bfa",
    bg: "#3b1f7a",
    glow: "0 0 20px rgba(167,139,250,0.5)",
  },
  SSR: {
    label: "SSR",
    color: "#fbbf24",
    bg: "#78350f",
    glow: "0 0 30px rgba(251,191,36,0.6)",
  },
  UR: {
    label: "UR",
    color: "#f472b6",
    bg: "#831843",
    glow: "0 0 40px rgba(244,114,182,0.7)",
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  all: "すべて",
  sneaker: "スニーカー",
  card: "トレカ",
  figure: "フィギュア",
  game: "ゲーム",
  other: "その他",
};

// API response types
export interface DrawResultResponse {
  id: string;
  prize: {
    id: string;
    name: string;
    image: string;
    rarity: Rarity;
    marketPrice: number;
    coinValue: number;
  };
  isTrial: boolean;
}

export interface GachaDrawResponse {
  results: DrawResultResponse[];
  remainingStock: number;
  coinsSpent: number;
  newBalance: number;
}

// View types for SSR pages
export interface PackListItem {
  id: string;
  title: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  featured: boolean;
  hasLastOnePrize: boolean;
  endsAt: string | null;
}

export interface PackDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  featured: boolean;
  limitPerUser: number | null;
  endsAt: string | null;
  lastOnePrize: {
    id: string;
    name: string;
    image: string;
    rarity: Rarity;
    marketPrice: number;
  } | null;
  prizes: {
    id: string;
    prizeId: string;
    name: string;
    image: string;
    rarity: Rarity;
    marketPrice: number;
    coinValue: number;
    weight: number;
    totalQuantity: number;
    remainingQuantity: number;
  }[];
  totalWeight: number;
}

export interface RankingEntry {
  id: string;
  userName: string;
  userImage: string | null;
  prizeName: string;
  prizeImage: string;
  prizeRarity: Rarity;
  oripaTitle: string;
  drawnAt: string;
}
