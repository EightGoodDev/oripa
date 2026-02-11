"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";

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

export default function BannersPage() {
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (typeof window === "undefined") return "list";
    const stored = window.localStorage.getItem("admin-banners-view-mode");
    return stored === "grid" || stored === "list" ? stored : "list";
  });

  useEffect(() => {
    void fetchRows();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin-banners-view-mode", viewMode);
  }, [viewMode]);

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

  function formatDate(value: string | null) {
    if (!value) return "未設定";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "未設定";
    return date.toLocaleString("ja-JP");
  }

  function toDateTimeLocal(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "バナー管理" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">バナー一覧</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === "list" ? "gold" : "outline"}
            onClick={() => setViewMode("list")}
          >
            リスト
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "gold" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            画像一覧
          </Button>
          <Link href="/admin/banners/new">
            <Button size="sm">新規作成</Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">バナーがありません</div>
        ) : viewMode === "list" ? (
          <div className="divide-y divide-gray-800">
            {rows.map((row) => (
              <div key={row.id} className="p-3 space-y-2">
                <div className="text-xs text-gray-500">ID: {row.id}</div>
                <div className="rounded-lg border border-gray-800 bg-gray-950/70 overflow-hidden aspect-[16/5]">
                  <img
                    src={row.imageUrl}
                    alt={row.title ?? "banner"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <input
                    defaultValue={row.title ?? ""}
                    className={inputClass}
                    placeholder="タイトル"
                    onBlur={(e) => void saveRow(row.id, { title: e.target.value })}
                  />
                  <input
                    defaultValue={row.linkUrl ?? ""}
                    className={inputClass}
                    placeholder="リンクURL"
                    onBlur={(e) => void saveRow(row.id, { linkUrl: e.target.value })}
                  />
                  <Button size="sm" variant="danger" onClick={() => deleteRow(row.id)}>
                    削除
                  </Button>
                </div>
                <input
                  defaultValue={row.imageUrl}
                  className={inputClass}
                  onBlur={(e) => void saveRow(row.id, { imageUrl: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <input
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(row.startsAt)}
                    className={inputClass}
                    onBlur={(e) =>
                      void saveRow(row.id, { startsAt: e.target.value || null })
                    }
                  />
                  <input
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(row.endsAt)}
                    className={inputClass}
                    onBlur={(e) =>
                      void saveRow(row.id, { endsAt: e.target.value || null })
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    defaultValue={row.sortOrder}
                    className={inputClass}
                    onBlur={(e) =>
                      void saveRow(row.id, { sortOrder: Number(e.target.value || 0) })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={row.isActive ? "outline" : "gold"}
                      onClick={() => void saveRow(row.id, { isActive: !row.isActive })}
                    >
                      有効切替
                    </Button>
                    <Button
                      size="sm"
                      variant={row.isPublished ? "outline" : "gold"}
                      onClick={() =>
                        void saveRow(row.id, { isPublished: !row.isPublished })
                      }
                    >
                      公開切替
                    </Button>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>開始: {formatDate(row.startsAt)}</span>
                  <span>終了: {formatDate(row.endsAt)}</span>
                  <span>表示順: {row.sortOrder}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden">
                <div className="aspect-[16/5] bg-gray-900">
                  <img
                    src={row.imageUrl}
                    alt={row.title ?? "banner"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <input
                    defaultValue={row.title ?? ""}
                    className={inputClass}
                    placeholder="タイトル"
                    onBlur={(e) => void saveRow(row.id, { title: e.target.value })}
                  />
                  <input
                    defaultValue={row.linkUrl ?? ""}
                    className={inputClass}
                    placeholder="リンクURL"
                    onBlur={(e) => void saveRow(row.id, { linkUrl: e.target.value })}
                  />
                  <input
                    defaultValue={row.imageUrl}
                    className={inputClass}
                    onBlur={(e) => void saveRow(row.id, { imageUrl: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded ${row.isActive ? "bg-green-900/50 text-green-300" : "bg-gray-800 text-gray-400"}`}
                    >
                      有効: {row.isActive ? "ON" : "OFF"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${row.isPublished ? "bg-blue-900/50 text-blue-300" : "bg-gray-800 text-gray-400"}`}
                    >
                      公開: {row.isPublished ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 space-y-0.5">
                    <p>開始: {formatDate(row.startsAt)}</p>
                    <p>終了: {formatDate(row.endsAt)}</p>
                    <p>表示順: {row.sortOrder}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(row.startsAt)}
                      className={inputClass}
                      onBlur={(e) =>
                        void saveRow(row.id, { startsAt: e.target.value || null })
                      }
                    />
                    <input
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(row.endsAt)}
                      className={inputClass}
                      onBlur={(e) =>
                        void saveRow(row.id, { endsAt: e.target.value || null })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      defaultValue={row.sortOrder}
                      className={inputClass}
                      onBlur={(e) =>
                        void saveRow(row.id, { sortOrder: Number(e.target.value || 0) })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={row.isActive ? "outline" : "gold"}
                      onClick={() => void saveRow(row.id, { isActive: !row.isActive })}
                    >
                      有効切替
                    </Button>
                    <Button
                      size="sm"
                      variant={row.isPublished ? "outline" : "gold"}
                      onClick={() =>
                        void saveRow(row.id, { isPublished: !row.isPublished })
                      }
                    >
                      公開切替
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteRow(row.id)}>
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
