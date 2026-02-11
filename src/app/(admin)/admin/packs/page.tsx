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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

      <div className="flex gap-3 mb-4">
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
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
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
      </div>
    </div>
  );
}
