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

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-10 text-center text-gray-500">読み込み中...</div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-500">
            カテゴリがありません
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">カテゴリ</th>
                <th className="px-4 py-3 text-gray-400 font-medium">使用中パック数</th>
                <th className="px-4 py-3 text-gray-400 font-medium">並び替え</th>
                <th className="px-4 py-3 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="border-b border-gray-800/50">
                  <td className="px-4 py-3">{getCategoryLabel(category.name)}</td>
                  <td className="px-4 py-3">{category.packCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={category.packCount > 0}
                      onClick={() => setDeleteTarget(category)}
                    >
                      削除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
