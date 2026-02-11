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
  createdAt: string;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
