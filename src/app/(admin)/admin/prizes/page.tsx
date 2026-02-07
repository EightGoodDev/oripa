"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatCoins, formatDate } from "@/lib/utils/format";
import type { Rarity } from "@/types";

interface Prize {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  marketPrice: number;
  coinValue: number;
  createdAt: string;
  _count: {
    packPrizes: number;
  };
}

const RARITY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "N", label: "N" },
  { value: "R", label: "R" },
  { value: "SR", label: "SR" },
  { value: "SSR", label: "SSR" },
  { value: "UR", label: "UR" },
];

export default function PrizesPage() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchPrizes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (rarity) params.set("rarity", rarity);

      const res = await fetch(`/api/admin/prizes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPrizes(data);
      }
    } catch (error) {
      console.error("Failed to fetch prizes:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, rarity]);

  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  const columns: Column<Prize>[] = [
    {
      key: "name",
      label: "名前",
      sortable: true,
    },
    {
      key: "rarity",
      label: "レアリティ",
      render: (row) => <Badge rarity={row.rarity} />,
    },
    {
      key: "marketPrice",
      label: "市場価格",
      sortable: true,
      render: (row) => formatPrice(row.marketPrice),
    },
    {
      key: "coinValue",
      label: "コイン価値",
      sortable: true,
      render: (row) => formatCoins(row.coinValue),
    },
    {
      key: "_count",
      label: "使用パック数",
      render: (row) => String(row._count.packPrizes),
    },
    {
      key: "createdAt",
      label: "作成日",
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">景品管理</h1>
        <Link href="/admin/prizes/new">
          <Button size="sm">新規作成</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="景品名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
        >
          {RARITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            読み込み中...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={prizes}
            onRowClick={(row) =>
              router.push(`/admin/prizes/${(row as unknown as Prize).id}`)
            }
            emptyMessage={
              search || rarity
                ? "条件に一致する景品がありません"
                : "景品がまだありません。「新規作成」から景品を登録しましょう。"
            }
          />
        )}
      </div>
    </div>
  );
}
