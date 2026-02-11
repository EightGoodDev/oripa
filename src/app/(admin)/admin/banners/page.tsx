"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface BannerRow {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
  isPublished: boolean;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const emptyForm = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
  isActive: true,
  isPublished: true,
};

export default function BannersPage() {
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error();
      const data: BannerRow[] = await res.json();
      setRows(data);
    } catch {
      toast.error("バナー取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function createBanner() {
    if (!form.imageUrl) {
      toast.error("画像を設定してください");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "作成に失敗しました");
        return;
      }

      setForm(emptyForm);
      toast.success("バナーを作成しました");
      await fetchRows();
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function saveRow(id: string, patch: Partial<BannerRow>) {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
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

    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
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
      <Breadcrumb items={[{ label: "バナー管理" }]} />
      <h1 className="text-2xl font-bold">バナー管理</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-bold">新規バナー作成</h2>
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="タイトル（任意）"
          className={inputClass}
        />
        <ImageUploadField
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          folder="packs"
          inputClassName={inputClass}
        />
        <input
          value={form.linkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="リンクURL（任意）"
          className={inputClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
            className={inputClass}
          />
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
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
        <Button size="sm" onClick={createBanner} disabled={saving}>
          {saving ? "作成中..." : "作成"}
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">バナーがありません</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {rows.map((row) => (
              <div key={row.id} className="p-3 space-y-2">
                <div className="text-xs text-gray-500">ID: {row.id}</div>
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr_1.2fr_auto] gap-2 items-end">
                  <input
                    defaultValue={row.title ?? ""}
                    className={inputClass}
                    onBlur={(e) => void saveRow(row.id, { title: e.target.value })}
                  />
                  <input
                    defaultValue={row.imageUrl}
                    className={inputClass}
                    onBlur={(e) => void saveRow(row.id, { imageUrl: e.target.value })}
                  />
                  <input
                    defaultValue={row.linkUrl ?? ""}
                    className={inputClass}
                    onBlur={(e) => void saveRow(row.id, { linkUrl: e.target.value })}
                  />
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
