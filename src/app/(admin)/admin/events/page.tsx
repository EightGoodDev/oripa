"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface PackOption {
  id: string;
  title: string;
}

interface EventRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  imageUrl: string;
  linkUrl: string | null;
  newUserOnly: boolean;
  isActive: boolean;
  isPublished: boolean;
  packs: {
    pack: {
      id: string;
      title: string;
      image: string;
    };
  }[];
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [packs, setPacks] = useState<PackOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    newUserOnly: false,
    isActive: true,
    isPublished: true,
  });

  useEffect(() => {
    void fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [eventsRes, packsRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/packs"),
      ]);
      if (!eventsRes.ok || !packsRes.ok) throw new Error();

      const [eventsData, packsData]: [EventRow[], Array<{ id: string; title: string }>] =
        await Promise.all([eventsRes.json(), packsRes.json()]);

      setRows(eventsData);
      setPacks(packsData.map((pack) => ({ id: pack.id, title: pack.title })));
    } catch {
      toast.error("イベント情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function createEvent() {
    if (!form.title || !form.imageUrl) {
      toast.error("タイトルと画像は必須です");
      return;
    }
    const normalizedLinkUrl = form.linkUrl.trim();
    if (selectedPackIds.length === 0 && !normalizedLinkUrl) {
      toast.error("対象パックかリンクURLのいずれかを設定してください");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          linkUrl: normalizedLinkUrl,
          packIds: selectedPackIds,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "作成に失敗しました");
        return;
      }

      toast.success("イベントを作成しました");
      setForm({
        title: "",
        subtitle: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        newUserOnly: false,
        isActive: true,
        isPublished: true,
      });
      setSelectedPackIds([]);
      await fetchAll();
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(row: EventRow, key: "isActive" | "isPublished") {
    const res = await fetch(`/api/admin/events/${row.id}`, {
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
    await fetchAll();
  }

  async function deleteRow(id: string) {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body?.error ?? "削除に失敗しました");
      return;
    }

    toast.success("削除しました");
    await fetchAll();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "イベント管理" }]} />
      <h1 className="text-2xl font-bold">イベント管理</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-bold">新規イベント作成</h2>
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="タイトル"
          className={inputClass}
        />
        <input
          value={form.subtitle}
          onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
          placeholder="サブタイトル（任意）"
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
          folder="packs"
          recommendedSize="1600 x 600px（8:3）"
          inputClassName={inputClass}
        />
        <input
          value={form.linkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="リンクURL（任意: https://... または /path）"
          className={inputClass}
        />

        <div>
          <p className="text-xs text-gray-400 mb-2">対象パック</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {packs.map((pack) => {
              const checked = selectedPackIds.includes(pack.id);
              return (
                <label key={pack.id} className="text-xs bg-gray-800 rounded p-2 flex gap-2 items-start">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedPackIds((prev) =>
                        e.target.checked
                          ? [...prev, pack.id]
                          : prev.filter((id) => id !== pack.id),
                      );
                    }}
                  />
                  <span>{pack.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <label className="text-xs text-gray-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.newUserOnly}
              onChange={(e) => setForm((prev) => ({ ...prev, newUserOnly: e.target.checked }))}
            />
            新規ユーザー限定
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

        <Button size="sm" onClick={createEvent} disabled={saving}>
          {saving ? "作成中..." : "作成"}
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">イベントがありません</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {rows.map((row) => (
              <div key={row.id} className="p-3 space-y-2">
                <div className="text-sm font-medium">{row.title}</div>
                <p className="text-xs text-gray-400">対象: {row.packs.map((x) => x.pack.title).join(" / ") || "なし"}</p>
                <p className="text-xs text-gray-500">リンク: {row.linkUrl || "未設定"}</p>
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
