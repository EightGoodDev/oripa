"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormField from "@/components/admin/FormField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatPrice, formatCoins } from "@/lib/utils/format";

const planSchema = z.object({
  coins: z.coerce.number().int().min(1, "1以上を入力"),
  price: z.coerce.number().int().min(1, "1以上を入力"),
  bonus: z.coerce.number().int().min(0).default(0),
  isPopular: z.boolean().default(false),
  firstTimeOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

type PlanForm = z.infer<typeof planSchema>;

interface ChargePlan {
  id: string;
  coins: number;
  price: number;
  bonus: number;
  isPopular: boolean;
  firstTimeOnly: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<ChargePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ChargePlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChargePlan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      coins: 0,
      price: 0,
      bonus: 0,
      isPopular: false,
      firstTimeOnly: false,
      isActive: true,
      sortOrder: 0,
    },
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function openCreateModal() {
    setEditingPlan(null);
    reset({
      coins: 0,
      price: 0,
      bonus: 0,
      isPopular: false,
      firstTimeOnly: false,
      isActive: true,
      sortOrder: 0,
    });
    setModalOpen(true);
  }

  function openEditModal(plan: ChargePlan) {
    setEditingPlan(plan);
    reset({
      coins: plan.coins,
      price: plan.price,
      bonus: plan.bonus,
      isPopular: plan.isPopular,
      firstTimeOnly: plan.firstTimeOnly,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPlan(null);
  }

  async function onSubmit(data: PlanForm) {
    setSaving(true);
    try {
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        closeModal();
        await fetchPlans();
        toast.success(editingPlan ? "プランを更新しました" : "プランを作成しました");
      } else {
        toast.error("保存に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const result = await res.json();
        setDeleteTarget(null);
        await fetchPlans();
        toast.success(result.softDeleted ? "プランを無効化しました" : "プランを削除しました");
      } else {
        toast.error("削除に失敗しました");
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<ChargePlan>[] = [
    {
      key: "coins",
      label: "コイン数",
      sortable: true,
      render: (row) => formatCoins(row.coins),
    },
    {
      key: "price",
      label: "価格",
      sortable: true,
      render: (row) => formatPrice(row.price),
    },
    {
      key: "bonus",
      label: "ボーナス",
      render: (row) =>
        row.bonus > 0 ? (
          <span className="text-gold-mid">+{formatCoins(row.bonus)}</span>
        ) : (
          <span className="text-gray-500">&mdash;</span>
        ),
    },
    {
      key: "isPopular",
      label: "人気",
      render: (row) =>
        row.isPopular ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
            人気
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
            —
          </span>
        ),
    },
    {
      key: "firstTimeOnly",
      label: "初回限定",
      render: (row) =>
        row.firstTimeOnly ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-800">
            初回限定
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
            —
          </span>
        ),
    },
    {
      key: "isActive",
      label: "有効",
      render: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            有効
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            無効
          </span>
        ),
    },
    {
      key: "sortOrder",
      label: "表示順",
      sortable: true,
    },
    {
      key: "actions",
      label: "操作",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
          >
            編集
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
          >
            削除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">チャージプラン管理</h1>
        <Button variant="gold" size="sm" onClick={openCreateModal}>
          新規追加
        </Button>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            読み込み中...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={plans as never[]}
            emptyMessage="チャージプランがまだありません。「新規追加」からプランを作成しましょう。"
          />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        className="max-w-md"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">
            {editingPlan ? "プラン編集" : "新規プラン作成"}
          </h2>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField label="コイン数" error={errors.coins?.message}>
              <input
                type="number"
                {...register("coins")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
              />
            </FormField>

            <FormField label="価格 (円)" error={errors.price?.message}>
              <input
                type="number"
                {...register("price")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
              />
            </FormField>

            <FormField label="ボーナスコイン" error={errors.bonus?.message}>
              <input
                type="number"
                {...register("bonus")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
              />
            </FormField>

            <FormField label="表示順" error={errors.sortOrder?.message}>
              <input
                type="number"
                {...register("sortOrder")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
              />
            </FormField>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  {...register("isPopular")}
                  className="rounded border-gray-600 bg-gray-800 text-gold-mid focus:ring-gold-mid"
                />
                人気プランとして表示
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  {...register("firstTimeOnly")}
                  className="rounded border-gray-600 bg-gray-800 text-gold-mid focus:ring-gold-mid"
                />
                初回限定プラン
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="rounded border-gray-600 bg-gray-800 text-gold-mid focus:ring-gold-mid"
                />
                有効
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeModal}
              >
                キャンセル
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={saving}>
                {saving
                  ? "保存中..."
                  : editingPlan
                    ? "更新"
                    : "作成"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="プランを削除"
        message="このチャージプランを削除しますか？注文履歴がある場合は無効化されます。"
        confirmLabel="削除"
        loading={deleteLoading}
      />
    </div>
  );
}
