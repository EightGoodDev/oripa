"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";

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

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

export default function MileRewardsPage() {
  const [rows, setRows] = useState<RewardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    requiredMiles: 100,
    stock: "",
    isActive: true,
    isPublished: true,
  });

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

  async function createRow() {
    if (!form.name || !form.imageUrl) {
      toast.error("名前と画像は必須です");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/mile-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
          requiredMiles: Number(form.requiredMiles),
          stock: form.stock === "" ? null : Number(form.stock),
          isActive: form.isActive,
          isPublished: form.isPublished,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "作成に失敗しました");
        return;
      }

      setForm({
        name: "",
        description: "",
        imageUrl: "",
        requiredMiles: 100,
        stock: "",
        isActive: true,
        isPublished: true,
      });
      toast.success("交換景品を作成しました");
      await fetchRows();
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(row: RewardRow, key: "isActive" | "isPublished") {
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
  }

  async function deleteRow(id: string) {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/admin/mile-rewards/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body?.error ?? "削除に失敗しました");
      return;
    }

    toast.success("削除しました");
    await fetchRows();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "マイル交換景品" }]} />
      <h1 className="text-2xl font-bold">マイル交換景品管理</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-bold">新規作成</h2>
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="景品名"
          className={inputClass}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="説明"
          rows={3}
          className={inputClass}
        />
        <ImageUploadField
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          folder="prizes"
          inputClassName={inputClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={form.requiredMiles}
            onChange={(e) => setForm((prev) => ({ ...prev, requiredMiles: Number(e.target.value) }))}
            placeholder="必要マイル"
            className={inputClass}
          />
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="在庫（空欄で無制限）"
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <label className="text-xs text-gray-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            有効
          </label>
          <label className="text-xs text-gray-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            公開
          </label>
        </div>
        <Button size="sm" onClick={createRow} disabled={saving}>
          {saving ? "作成中..." : "作成"}
        </Button>
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
