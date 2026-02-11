"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface RewardRow {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredMiles: number;
  stock: number | null;
  isActive: boolean;
  isPublished: boolean;
}

export default function MileRewardsPage() {
  const [rows, setRows] = useState<RewardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mile-rewards");
      if (!res.ok) throw new Error();
      const data: RewardRow[] = await res.json();
      setRows(data);
    } catch {
      toast.error("交換景品の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function toggleField(row: RewardRow, key: "isActive" | "isPublished") {
    try {
      const res = await fetch(`/api/admin/mile-rewards/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !row[key] }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "更新に失敗しました");
        return;
      }

      toast.success("更新しました");
      await fetchRows();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  async function deleteRow(id: string) {
    if (!window.confirm("削除しますか？")) return;
    try {
      const res = await fetch(`/api/admin/mile-rewards/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "削除に失敗しました");
        return;
      }

      toast.success("削除しました");
      await fetchRows();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "マイル交換景品" }]} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">マイル交換景品一覧</h1>
        <Link href="/admin/mile-rewards/new">
          <Button size="sm">新規作成</Button>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">景品がありません</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {rows.map((row) => (
              <div key={row.id} className="p-3 space-y-2">
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-gray-400">必要マイル: {row.requiredMiles} / 在庫: {row.stock ?? "∞"}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant={row.isActive ? "gold" : "outline"} onClick={() => toggleField(row, "isActive")}>有効: {row.isActive ? "ON" : "OFF"}</Button>
                  <Button size="sm" variant={row.isPublished ? "gold" : "outline"} onClick={() => toggleField(row, "isPublished")}>公開: {row.isPublished ? "ON" : "OFF"}</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteRow(row.id)}>削除</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
