"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FormField from "@/components/admin/FormField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import { CATEGORY_LABELS, type Rarity } from "@/types";
import { formatPrice, formatCoins } from "@/lib/utils/format";
import Breadcrumb from "@/components/admin/Breadcrumb";

const packSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  category: z.enum(["sneaker", "card", "figure", "game", "other"]),
  pricePerDraw: z.coerce.number().int().min(1),
  totalStock: z.coerce.number().int().min(1),
  limitPerUser: z.coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => v || null),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  lastOnePrizeId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type PackForm = z.infer<typeof packSchema>;

interface PackPrizeItem {
  id: string;
  prizeId: string;
  weight: number;
  totalQuantity: number;
  remainingQuantity: number;
  prize: {
    id: string;
    name: string;
    image: string;
    rarity: Rarity;
    marketPrice: number;
    coinValue: number;
  };
}

interface PackData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  status: string;
  featured: boolean;
  limitPerUser: number | null;
  startsAt: string | null;
  endsAt: string | null;
  lastOnePrizeId: string | null;
  sortOrder: number;
  packPrizes: PackPrizeItem[];
  _count: { draws: number };
}

interface PrizeOption {
  id: string;
  name: string;
  rarity: Rarity;
  marketPrice: number;
}

const addPrizeSchema = z.object({
  prizeId: z.string().min(1, "景品を選択してください"),
  weight: z.coerce.number().int().min(1, "1以上を入力"),
  totalQuantity: z.coerce.number().int().min(1, "1以上を入力"),
});

type AddPrizeForm = z.infer<typeof addPrizeSchema>;

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const categoryEntries = Object.entries(CATEGORY_LABELS).filter(
  ([k]) => k !== "all",
);

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pack, setPack] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [removePrizeId, setRemovePrizeId] = useState<string | null>(null);
  const [allPrizes, setAllPrizes] = useState<PrizeOption[]>([]);
  const [addingPrize, setAddingPrize] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PackForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packSchema) as any,
  });

  const addPrizeForm = useForm<AddPrizeForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addPrizeSchema) as any,
  });

  async function fetchPack() {
    const res = await fetch(`/api/admin/packs/${id}`);
    if (!res.ok) {
      router.push("/admin/packs");
      return;
    }
    const data: PackData = await res.json();
    setPack(data);
    reset({
      title: data.title,
      description: data.description,
      image: data.image,
      category: data.category as PackForm["category"],
      pricePerDraw: data.pricePerDraw,
      totalStock: data.totalStock,
      limitPerUser: data.limitPerUser,
      startsAt: toLocalDatetime(data.startsAt),
      endsAt: toLocalDatetime(data.endsAt),
      featured: data.featured,
      lastOnePrizeId: data.lastOnePrizeId,
      sortOrder: data.sortOrder,
    });
    setLoading(false);
  }

  useEffect(() => {
    fetchPack();
    fetch("/api/admin/prizes")
      .then((r) => r.json())
      .then((data) => setAllPrizes(data));
  }, [id]);

  async function onSubmit(data: PackForm) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchPack();
      toast.success("保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/admin/packs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await fetchPack();
      toast.success("ステータスを変更しました");
    } else {
      toast.error("ステータス変更に失敗しました");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "削除に失敗しました");
        return;
      }
      toast.success("パックを削除しました");
      router.push("/admin/packs");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleAddPrize(data: AddPrizeForm) {
    setAddingPrize(true);
    try {
      const res = await fetch(`/api/admin/packs/${id}/prizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "追加に失敗しました");
        return;
      }
      setPrizeModalOpen(false);
      addPrizeForm.reset();
      await fetchPack();
      toast.success("景品を追加しました");
    } finally {
      setAddingPrize(false);
    }
  }

  async function handleRemovePrize() {
    if (!removePrizeId) return;
    const res = await fetch(
      `/api/admin/packs/${id}/prizes?packPrizeId=${removePrizeId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "削除に失敗しました");
    } else {
      await fetchPack();
      toast.success("景品を削除しました");
    }
    setRemovePrizeId(null);
  }

  if (loading || !pack) {
    return <p className="text-center text-gray-500 py-20">読み込み中...</p>;
  }

  const totalWeight = pack.packPrizes.reduce((sum, pp) => sum + pp.weight, 0);
  const totalPrizeQuantity = pack.packPrizes.reduce(
    (sum, pp) => sum + pp.totalQuantity,
    0,
  );
  const stockDiff = pack.totalStock - totalPrizeQuantity;
  const isDraft = pack.status === "DRAFT";

  const publishChecks = useMemo(() => {
    if (!pack) return [];
    return [
      {
        label: "景品が1つ以上登録されている",
        ok: pack.packPrizes.length > 0,
      },
      {
        label: `景品合計数(${totalPrizeQuantity}) = 総在庫数(${pack.totalStock})`,
        ok: stockDiff === 0,
      },
      {
        label: "画像が設定されている",
        ok: !!pack.image && pack.image.startsWith("http"),
      },
      {
        label: "タイトルが設定されている",
        ok: !!pack.title && pack.title.length > 0,
      },
      {
        label: "1回あたりの価格が設定されている",
        ok: pack.pricePerDraw > 0,
      },
    ];
  }, [pack, totalPrizeQuantity, stockDiff]);

  const canPublish = publishChecks.every((c) => c.ok);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "パック管理", href: "/admin/packs" },
          { label: pack.title },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">パック編集</h1>
        <div className="flex gap-2">
          {pack.status === "DRAFT" && (
            <Button size="sm" onClick={() => setPublishOpen(true)}>
              公開する
            </Button>
          )}
          {pack.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("ENDED")}
            >
              終了する
            </Button>
          )}
          {isDraft && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              削除
            </Button>
          )}
        </div>
      </div>

      {/* Stock validation banner */}
      {pack.packPrizes.length > 0 && stockDiff !== 0 && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            stockDiff > 0
              ? "border-yellow-600/50 bg-yellow-900/20 text-yellow-300"
              : "border-red-600/50 bg-red-900/20 text-red-300"
          }`}
        >
          <span className="text-lg mt-0.5">{stockDiff > 0 ? "⚠️" : "🚨"}</span>
          <div className="text-sm">
            <p className="font-bold">
              {stockDiff > 0
                ? "景品数が総在庫数より少ないです"
                : "景品数が総在庫数を超えています"}
            </p>
            <p className="mt-1 text-xs opacity-80">
              総在庫: {pack.totalStock}口 / 景品合計: {totalPrizeQuantity}口
              {stockDiff > 0
                ? ` (あと${stockDiff}口分の景品が必要)`
                : ` (${Math.abs(stockDiff)}口分超過)`}
            </p>
          </div>
        </div>
      )}

      {pack.packPrizes.length > 0 && stockDiff === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-green-600/50 bg-green-900/20 text-green-300 p-4">
          <span className="text-lg">✅</span>
          <p className="text-sm font-medium">
            在庫数一致: {pack.totalStock}口 = 景品合計 {totalPrizeQuantity}口
          </p>
        </div>
      )}

      {/* Pack form */}
      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={handleSubmit(onSubmit as any)}
        className="max-w-2xl space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <FormField label="タイトル" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </FormField>

        <FormField label="説明" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={3}
            className={inputClass}
          />
        </FormField>

        <FormField label="画像URL" error={errors.image?.message}>
          <input {...register("image")} className={inputClass} />
        </FormField>

        <FormField label="カテゴリ" error={errors.category?.message}>
          <select {...register("category")} className={inputClass}>
            {categoryEntries.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="1回あたりの価格(コイン)"
            error={errors.pricePerDraw?.message}
          >
            <input
              type="number"
              {...register("pricePerDraw")}
              className={inputClass}
            />
          </FormField>
          <FormField label="総在庫数" error={errors.totalStock?.message}>
            <input
              type="number"
              {...register("totalStock")}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="ユーザーあたりの制限(任意)">
          <input
            type="number"
            {...register("limitPerUser")}
            placeholder="制限なし"
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="開始日時(任意)">
            <input
              type="datetime-local"
              {...register("startsAt")}
              className={inputClass}
            />
          </FormField>
          <FormField label="終了日時(任意)">
            <input
              type="datetime-local"
              {...register("endsAt")}
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="表示順">
            <input
              type="number"
              {...register("sortOrder")}
              className={inputClass}
            />
          </FormField>
          <FormField label="ラストワン景品">
            <select {...register("lastOnePrizeId")} className={inputClass}>
              <option value="">なし</option>
              {pack.packPrizes.map((pp) => (
                <option key={pp.prize.id} value={pp.prize.id}>
                  {pp.prize.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="rounded border-gray-600 bg-gray-800 text-gold-mid focus:ring-gold-mid"
            />
            注目パックとして表示
          </label>
        </FormField>

        <div className="pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>

      {/* PackPrize management */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">景品一覧</h2>
            <p className="text-xs text-gray-400 mt-1">
              {totalPrizeQuantity} / {pack.totalStock}口 割当済
              {stockDiff > 0 && (
                <span className="text-yellow-400 ml-2">
                  (残り{stockDiff}口)
                </span>
              )}
            </p>
          </div>
          <Button size="sm" onClick={() => setPrizeModalOpen(true)}>
            景品追加
          </Button>
        </div>

        {pack.packPrizes.length === 0 ? (
          <p className="text-gray-500 text-sm">景品が追加されていません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-3 py-2 text-gray-400 font-medium">景品名</th>
                <th className="px-3 py-2 text-gray-400 font-medium">
                  レアリティ
                </th>
                <th className="px-3 py-2 text-gray-400 font-medium">重み</th>
                <th className="px-3 py-2 text-gray-400 font-medium">数量</th>
                <th className="px-3 py-2 text-gray-400 font-medium">確率</th>
                <th className="px-3 py-2 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pack.packPrizes.map((pp) => (
                <tr key={pp.id} className="border-b border-gray-800/50">
                  <td className="px-3 py-2">{pp.prize.name}</td>
                  <td className="px-3 py-2">
                    <Badge rarity={pp.prize.rarity} />
                  </td>
                  <td className="px-3 py-2">{pp.weight}</td>
                  <td className="px-3 py-2">
                    {pp.remainingQuantity} / {pp.totalQuantity}
                  </td>
                  <td className="px-3 py-2">
                    {totalWeight > 0
                      ? `${((pp.weight / totalWeight) * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {isDraft && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRemovePrizeId(pp.id)}
                      >
                        削除
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add prize modal */}
      <Modal
        isOpen={prizeModalOpen}
        onClose={() => setPrizeModalOpen(false)}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2">景品を追加</h3>
          <p className="text-xs text-gray-400 mb-4">
            残り割当可能: {Math.max(0, stockDiff)}口 / 総在庫: {pack.totalStock}口
          </p>
          <form
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSubmit={addPrizeForm.handleSubmit(handleAddPrize as any)}
            className="space-y-4"
          >
            <FormField
              label="景品"
              error={addPrizeForm.formState.errors.prizeId?.message}
            >
              <select
                {...addPrizeForm.register("prizeId")}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {allPrizes
                  .filter(
                    (p) =>
                      !pack.packPrizes.some((pp) => pp.prizeId === p.id),
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.rarity}] {p.name} ({formatPrice(p.marketPrice)})
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField
              label="重み(確率ウェイト)"
              error={addPrizeForm.formState.errors.weight?.message}
            >
              <input
                type="number"
                {...addPrizeForm.register("weight")}
                placeholder="例: 10"
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">
                現在の合計ウェイト: {totalWeight} — 値が大きいほど当選確率が高くなります
              </p>
            </FormField>

            <FormField
              label="数量"
              error={addPrizeForm.formState.errors.totalQuantity?.message}
            >
              <input
                type="number"
                {...addPrizeForm.register("totalQuantity")}
                placeholder={stockDiff > 0 ? `最大 ${stockDiff}` : "0"}
                className={inputClass}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" size="sm" disabled={addingPrize}>
                {addingPrize ? "追加中..." : "追加"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPrizeModalOpen(false)}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete pack confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="パック削除"
        message="このパックを削除しますか？この操作は元に戻せません。"
        loading={deleting}
      />

      {/* Remove prize confirmation */}
      <ConfirmDialog
        isOpen={!!removePrizeId}
        onClose={() => setRemovePrizeId(null)}
        onConfirm={handleRemovePrize}
        title="景品削除"
        message="この景品をパックから削除しますか？"
      />

      {/* Publish checklist modal */}
      <Modal isOpen={publishOpen} onClose={() => setPublishOpen(false)}>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md">
          <h3 className="text-lg font-bold mb-4">公開前チェックリスト</h3>
          <ul className="space-y-3 mb-6">
            {publishChecks.map((check, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 ${check.ok ? "text-green-400" : "text-red-400"}`}>
                  {check.ok ? "✓" : "✗"}
                </span>
                <span className={check.ok ? "text-gray-300" : "text-red-300"}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
          {!canPublish && (
            <p className="text-xs text-red-400 mb-4">
              すべての項目をクリアしてから公開してください
            </p>
          )}
          <div className="flex gap-3">
            <Button
              size="sm"
              disabled={!canPublish}
              onClick={async () => {
                setPublishOpen(false);
                await handleStatusChange("ACTIVE");
              }}
            >
              公開する
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPublishOpen(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
