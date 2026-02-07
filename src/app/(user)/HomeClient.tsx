"use client";

import { useState, useMemo } from "react";
import type { PackListItem } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import Tabs from "@/components/ui/Tabs";
import OripaGrid from "@/components/oripa/OripaGrid";

type CategoryFilter = "all" | "sneaker" | "card" | "figure" | "game" | "other";
type SortKey = "recommended" | "newest" | "price-asc" | "price-desc";

const categoryTabs: { value: CategoryFilter; label: string }[] = Object.entries(
  CATEGORY_LABELS,
).map(([value, label]) => ({ value: value as CategoryFilter, label }));

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "おすすめ" },
  { value: "newest", label: "新着" },
  { value: "price-asc", label: "安い順" },
  { value: "price-desc", label: "高い順" },
];

export default function HomeClient({ packs }: { packs: PackListItem[] }) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  const filtered = useMemo(() => {
    let result =
      category === "all"
        ? packs
        : packs.filter((p) => p.category === category);

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.pricePerDraw - b.pricePerDraw);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.pricePerDraw - a.pricePerDraw);
        break;
      case "newest":
        result = [...result].reverse();
        break;
    }

    return result;
  }, [packs, category, sort]);

  return (
    <div className="pt-2 pb-4">
      <Tabs tabs={categoryTabs} active={category} onChange={setCategory} />

      <div className="flex gap-1 px-4 py-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === opt.value
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <OripaGrid packs={filtered} />
    </div>
  );
}
