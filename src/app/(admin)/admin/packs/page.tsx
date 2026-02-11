"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { getCategoryLabel } from "@/types";

interface Pack {
  id: string;
  title: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  status: string;
  featured: boolean;
  createdAt: string;
  _count: { packPrizes: number; draws: number };
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-700 text-gray-300",
  ACTIVE: "bg-green-900/50 text-green-400",
  ENDED: "bg-red-900/50 text-red-400",
  SOLD_OUT: "bg-yellow-900/50 text-yellow-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  ACTIVE: "公開中",
  ENDED: "終了",
  SOLD_OUT: "完売",
};

export default function PacksPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    if (typeof window === "undefined") return "table";
    const stored = window.localStorage.getItem("admin-packs-view-mode");
    return stored === "table" || stored === "grid" ? stored : "table";
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    window.localStorage.setItem("admin-packs-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    const url = `/api/admin/packs${params.toString() ? `?${params}` : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setPacks(data))
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter]);

  const columns: Column<Pack>[] = [
    { key: "title", label: "タイトル", sortable: true },
    {
      key: "category",
      label: "カテゴリ",
      render: (row) => getCategoryLabel(row.category),
    },
    {
      key: "pricePerDraw",
      label: "価格/回",
      render: (row) => formatPrice(row.pricePerDraw),
      sortable: true,
    },
    {
      key: "remainingStock",
      label: "在庫",
      render: (row) => `${row.remainingStock} / ${row.totalStock}`,
    },
    {
      key: "status",
      label: "ステータス",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[row.status] || ""}`}
        >
          {STATUS_LABELS[row.status] || row.status}
        </span>
      ),
    },
    {
      key: "_count",
      label: "景品数",
      render: (row) => row._count.packPrizes,
    },
    {
      key: "createdAt",
      label: "作成日",
      render: (row) => formatDate(row.createdAt),
      sortable: true,
    },
  ];

  if (loading) {
    return <p className="text-center text-gray-500 py-20">読み込み中...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">パック管理</h1>
        <Link href="/admin/packs/new">
          <Button size="sm">新規作成</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="タイトル検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-mid"
        >
          <option value="">すべてのステータス</option>
          <option value="DRAFT">下書き</option>
          <option value="ACTIVE">公開中</option>
          <option value="ENDED">終了</option>
          <option value="SOLD_OUT">完売</option>
        </select>
        <div className="ml-auto inline-flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "table" ? "gold" : "outline"}
            onClick={() => setViewMode("table")}
          >
            リスト
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "grid" ? "gold" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            画像一覧
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={packs}
            onRowClick={(row) => router.push(`/admin/packs/${row.id}`)}
            emptyMessage={
              search || statusFilter
                ? "条件に一致するパックがありません"
                : "パックがまだありません。「新規作成」からパックを作成しましょう。"
            }
          />
        ) : packs.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {search || statusFilter
              ? "条件に一致するパックがありません"
              : "パックがまだありません。「新規作成」からパックを作成しましょう。"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => router.push(`/admin/packs/${pack.id}`)}
                className="group text-left rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden hover:border-gold-mid/50 transition"
              >
                <div className="aspect-[16/9] bg-gray-800 overflow-hidden">
                  {pack.image ? (
                    <img
                      src={pack.image}
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                      画像なし
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {pack.title}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${STATUS_STYLES[pack.status] || ""}`}
                    >
                      {STATUS_LABELS[pack.status] || pack.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {getCategoryLabel(pack.category)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div>価格: {formatPrice(pack.pricePerDraw)}</div>
                    <div>景品数: {pack._count.packPrizes}</div>
                    <div>在庫: {pack.remainingStock}</div>
                    <div>総数: {pack.totalStock}</div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    作成日: {formatDate(pack.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
