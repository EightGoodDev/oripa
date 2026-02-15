"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { getCategoryLabel } from "@/types";

interface PackCategory {
  id: string;
  name: string;
  sortOrder: number;
  packCount: number;
  tabBackgroundColor: string | null;
  tabTextColor: string | null;
  createdAt: string;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_TAB_BG = "#facc15";
const DEFAULT_TAB_TEXT = "#111827";

const TAB_PRESETS: Array<{
  label: string;
  bg: string;
  text: string;
}> = [
  { label: "Gold", bg: "#facc15", text: "#111827" },
  { label: "Black", bg: "#111827", text: "#f9fafb" },
  { label: "White", bg: "#f9fafb", text: "#111827" },
  { label: "Blue", bg: "#2563eb", text: "#ffffff" },
  { label: "Sky", bg: "#0ea5e9", text: "#ffffff" },
  { label: "Teal", bg: "#14b8a6", text: "#052e2b" },
  { label: "Green", bg: "#22c55e", text: "#052e2b" },
  { label: "Orange", bg: "#f97316", text: "#111827" },
  { label: "Red", bg: "#ef4444", text: "#ffffff" },
  { label: "Pink", bg: "#ec4899", text: "#ffffff" },
  { label: "Purple", bg: "#7c3aed", text: "#ffffff" },
  { label: "Slate", bg: "#334155", text: "#f9fafb" },
] as const;

function normalizeColorForPicker(value: string | null, fallback: string) {
  const raw = value?.trim() ?? "";
  if (!HEX_COLOR_PATTERN.test(raw)) return fallback;
  if (raw.length === 4) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return raw.toLowerCase();
}

function parseHexColorToRgb(value: string): { r: number; g: number; b: number } | null {
  const normalized = value.trim();
  if (!HEX_COLOR_PATTERN.test(normalized)) return null;
  const full =
    normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized;
  const r = Number.parseInt(full.slice(1, 3), 16);
  const g = Number.parseInt(full.slice(3, 5), 16);
  const b = Number.parseInt(full.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function suggestTextColor(bgHex: string) {
  const rgb = parseHexColorToRgb(bgHex);
  if (!rgb) return DEFAULT_TAB_TEXT;
  // Perceived luminance (sRGB) for quick contrast pick.
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.62 ? "#111827" : "#ffffff";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingStyleId, setUpdatingStyleId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PackCategory | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packs/categories");
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data: PackCategory[] = await res.json();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const hasOrderChanges = useMemo(
    () => categories.some((category, index) => category.sortOrder !== index),
    [categories],
  );

  const moveCategory = (fromIndex: number, direction: -1 | 1) => {
    setCategories((prev) => {
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= prev.length) return prev;

      const next = [...prev];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  };

  const moveCategoryById = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;

    setCategories((prev) => {
      const fromIndex = prev.findIndex((category) => category.id === dragId);
      const toIndex = prev.findIndex((category) => category.id === targetId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/packs/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: categories.map((category) => category.id) }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "並び順の保存に失敗しました");
        return;
      }
      await fetchCategories();
      toast.success("カテゴリの並び順を保存しました");
    } catch {
      toast.error("並び順の保存に失敗しました");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const normalized = name.toLocaleLowerCase("ja-JP");
    if (
      categories.some(
        (category) => category.name.toLocaleLowerCase("ja-JP") === normalized,
      )
    ) {
      toast.error("同じカテゴリ名がすでに存在します");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/packs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(
          body?.error?.name?.[0] ?? body?.error ?? "カテゴリ作成に失敗しました",
        );
        return;
      }

      setNewCategoryName("");
      await fetchCategories();
      toast.success("カテゴリを作成しました");
    } catch {
      toast.error("カテゴリ作成に失敗しました");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/admin/packs/categories/${deleteTarget.id}`,
        { method: "DELETE" },
      );
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "カテゴリ削除に失敗しました");
        return;
      }

      setDeleteTarget(null);
      await fetchCategories();
      toast.success("カテゴリを削除しました");
    } catch {
      toast.error("カテゴリ削除に失敗しました");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveCategoryStyle = async (category: PackCategory) => {
    setUpdatingStyleId(category.id);
    try {
      const res = await fetch(`/api/admin/packs/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tabBackgroundColor: category.tabBackgroundColor ?? "",
          tabTextColor: category.tabTextColor ?? "",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(
          body?.error?.tabBackgroundColor?.[0] ??
            body?.error?.tabTextColor?.[0] ??
            body?.error ??
            "タブ配色の保存に失敗しました",
        );
        return;
      }
      await fetchCategories();
      toast.success("タブ配色を保存しました");
    } catch {
      toast.error("タブ配色の保存に失敗しました");
    } finally {
      setUpdatingStyleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "カテゴリ管理" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">カテゴリ管理</h1>
        <Button
          size="sm"
          onClick={handleSaveOrder}
          disabled={!hasOrderChanges || savingOrder || loading}
        >
          {savingOrder ? "保存中..." : "並び順を保存"}
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2">新規カテゴリ作成</p>
        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="例: electronics"
            className={inputClass}
          />
          <Button
            size="sm"
            type="button"
            className="shrink-0"
            onClick={handleCreateCategory}
            disabled={createLoading}
          >
            {createLoading ? "作成中..." : "作成"}
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        {loading ? (
          <div className="py-10 text-center text-gray-500">読み込み中...</div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            カテゴリがありません
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              バーをドラッグして並び替えできます（保存ボタンで反映）
            </p>
            {categories.map((category, index) => {
              const isDragging = draggingId === category.id;
              const isDragOver = dragOverId === category.id && draggingId !== category.id;

              return (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => {
                    setDraggingId(category.id);
                    setDragOverId(category.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverId !== category.id) {
                      setDragOverId(category.id);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingId) {
                      moveCategoryById(draggingId, category.id);
                    }
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  className={[
                    "w-full rounded-xl border bg-gray-950/40 px-4 py-3 transition",
                    "flex items-center gap-3",
                    isDragging
                      ? "border-gold-mid/70 opacity-70"
                      : "border-gray-800",
                    isDragOver ? "ring-2 ring-gold-mid/50" : "",
                  ].join(" ")}
                >
                  <div className="text-lg text-gray-400 select-none cursor-grab active:cursor-grabbing">
                    ⋮⋮
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {getCategoryLabel(category.name)}
                    </p>
                    <p className="text-xs text-gray-400">
                      使用中パック数: {category.packCount}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="inline-flex px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: normalizeColorForPicker(
                            category.tabBackgroundColor,
                            DEFAULT_TAB_BG,
                          ),
                          color: normalizeColorForPicker(
                            category.tabTextColor,
                            DEFAULT_TAB_TEXT,
                          ),
                        }}
                      >
                        {getCategoryLabel(category.name)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="text-xs text-gray-400 flex items-center gap-2">
                        背景
                        <input
                          type="color"
                          value={normalizeColorForPicker(
                            category.tabBackgroundColor,
                            DEFAULT_TAB_BG,
                          )}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((row) =>
                                row.id === category.id
                                  ? {
                                      ...row,
                                      tabBackgroundColor: e.target.value,
                                    }
                                  : row,
                              ),
                            )
                          }
                          className="w-8 h-8 rounded border border-gray-700 bg-gray-900"
                        />
                        <input
                          value={category.tabBackgroundColor ?? ""}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((row) =>
                                row.id === category.id
                                  ? {
                                      ...row,
                                      tabBackgroundColor: e.target.value,
                                    }
                                  : row,
                              ),
                            )
                          }
                          placeholder="#RRGGBB"
                          className={[
                            inputClass,
                            category.tabBackgroundColor &&
                            category.tabBackgroundColor.trim().length > 0 &&
                            !HEX_COLOR_PATTERN.test(category.tabBackgroundColor.trim())
                              ? "border-red-500"
                              : "",
                          ].join(" ")}
                        />
                      </label>
                      <label className="text-xs text-gray-400 flex items-center gap-2">
                        文字
                        <input
                          type="color"
                          value={normalizeColorForPicker(
                            category.tabTextColor,
                            DEFAULT_TAB_TEXT,
                          )}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((row) =>
                                row.id === category.id
                                  ? {
                                      ...row,
                                      tabTextColor: e.target.value,
                                    }
                                  : row,
                              ),
                            )
                          }
                          className="w-8 h-8 rounded border border-gray-700 bg-gray-900"
                        />
                        <input
                          value={category.tabTextColor ?? ""}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((row) =>
                                row.id === category.id
                                  ? {
                                      ...row,
                                      tabTextColor: e.target.value,
                                    }
                                  : row,
                              ),
                            )
                          }
                          placeholder="#RRGGBB"
                          className={[
                            inputClass,
                            category.tabTextColor &&
                            category.tabTextColor.trim().length > 0 &&
                            !HEX_COLOR_PATTERN.test(category.tabTextColor.trim())
                              ? "border-red-500"
                              : "",
                          ].join(" ")}
                        />
                      </label>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-gray-500">
                          プリセット（ワンクリックで背景+文字）
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-[11px] text-gray-300 hover:text-white underline underline-offset-2"
                            onClick={() =>
                              setCategories((prev) =>
                                prev.map((row) =>
                                  row.id === category.id
                                    ? {
                                        ...row,
                                        tabTextColor: suggestTextColor(
                                          normalizeColorForPicker(
                                            row.tabBackgroundColor,
                                            DEFAULT_TAB_BG,
                                          ),
                                        ),
                                      }
                                    : row,
                                ),
                              )
                            }
                          >
                            文字色を自動
                          </button>
                          <button
                            type="button"
                            className="text-[11px] text-gray-400 hover:text-white underline underline-offset-2"
                            onClick={() =>
                              setCategories((prev) =>
                                prev.map((row) =>
                                  row.id === category.id
                                    ? {
                                        ...row,
                                        tabBackgroundColor: null,
                                        tabTextColor: null,
                                      }
                                    : row,
                                ),
                              )
                            }
                          >
                            リセット
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {TAB_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            className="h-8 px-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-xs font-bold"
                            style={{
                              backgroundColor: preset.bg,
                              color: preset.text,
                            }}
                            onClick={() =>
                              setCategories((prev) =>
                                prev.map((row) =>
                                  row.id === category.id
                                    ? {
                                        ...row,
                                        tabBackgroundColor: preset.bg,
                                        tabTextColor: preset.text,
                                      }
                                    : row,
                                ),
                              )
                            }
                            title={`${preset.label} (${preset.bg} / ${preset.text})`}
                          >
                            Aa
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingStyleId === category.id}
                      onClick={() => handleSaveCategoryStyle(category)}
                    >
                      {updatingStyleId === category.id ? "保存中..." : "配色保存"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => moveCategory(index, -1)}
                    >
                      上へ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === categories.length - 1}
                      onClick={() => moveCategory(index, 1)}
                    >
                      下へ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={category.packCount > 0}
                      onClick={() => setDeleteTarget(category)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="カテゴリ削除"
        message="このカテゴリを削除しますか？この操作は元に戻せません。"
        loading={deleteLoading}
      />
    </div>
  );
}
