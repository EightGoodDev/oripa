"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/admin/FormField";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Rarity } from "@/types";

const prizeSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  rarity: z.enum(["N", "R", "SR", "SSR", "UR"]),
  marketPrice: z.coerce.number().int().min(0),
  coinValue: z.coerce.number().int().min(0),
});

type PrizeFormData = z.infer<typeof prizeSchema>;

interface PrizeDetail {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: Rarity;
  marketPrice: number;
  coinValue: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    packPrizes: number;
  };
  packPrizes: {
    id: string;
    pack: {
      id: string;
      title: string;
    };
  }[];
}

export default function PrizeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [prize, setPrize] = useState<PrizeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PrizeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(prizeSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      image: "",
      rarity: "N",
      marketPrice: 0,
      coinValue: 0,
    },
  });

  const imageUrl = watch("image");

  useEffect(() => {
    async function fetchPrize() {
      try {
        const res = await fetch(`/api/admin/prizes/${id}`);
        if (!res.ok) {
          router.push("/admin/prizes");
          return;
        }
        const data: PrizeDetail = await res.json();
        setPrize(data);
        reset({
          name: data.name,
          description: data.description,
          image: data.image,
          rarity: data.rarity,
          marketPrice: data.marketPrice,
          coinValue: data.coinValue,
        });
      } catch {
        router.push("/admin/prizes");
      } finally {
        setLoading(false);
      }
    }

    fetchPrize();
  }, [id, reset, router]);

  const onSubmit = async (data: PrizeFormData) => {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch(`/api/admin/prizes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "更新に失敗しました");
        return;
      }

      const updated = await res.json();
      setPrize((prev) => (prev ? { ...prev, ...updated } : prev));
      setServerError("");
    } catch {
      setServerError("更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/prizes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "削除に失敗しました");
        setShowDeleteDialog(false);
        return;
      }

      router.push("/admin/prizes");
    } catch {
      setServerError("削除に失敗しました");
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-12">読み込み中...</div>
    );
  }

  if (!prize) {
    return null;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: "景品管理", href: "/admin/prizes" },
          { label: prize.name },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">景品を編集</h1>
        <Badge rarity={prize.rarity} />
      </div>

      {serverError && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
        <FormField label="名前" error={errors.name?.message}>
          <input
            type="text"
            {...register("name")}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
            placeholder="景品名を入力"
          />
        </FormField>

        <FormField label="説明" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid resize-none"
            placeholder="景品の説明（任意）"
          />
        </FormField>

        <FormField label="画像URL" error={errors.image?.message}>
          <input
            type="text"
            {...register("image")}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
            placeholder="https://..."
          />
          {imageUrl && /^https?:\/\/.+/.test(imageUrl) && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="プレビュー"
                className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </FormField>

        <FormField label="レアリティ" error={errors.rarity?.message}>
          <select
            {...register("rarity")}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
          >
            <option value="N">N</option>
            <option value="R">R</option>
            <option value="SR">SR</option>
            <option value="SSR">SSR</option>
            <option value="UR">UR</option>
          </select>
        </FormField>

        <FormField label="市場価格（円）" error={errors.marketPrice?.message}>
          <input
            type="number"
            {...register("marketPrice")}
            min={0}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
            placeholder="0"
          />
        </FormField>

        <FormField label="コイン価値" error={errors.coinValue?.message}>
          <input
            type="number"
            {...register("coinValue")}
            min={0}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
            placeholder="0"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "更新中..." : "更新"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/prizes")}
          >
            一覧に戻る
          </Button>
        </div>
      </form>

      {/* 使用中のパック一覧 */}
      {prize.packPrizes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">使用中のパック</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-800">
              {prize.packPrizes.map((pp) => (
                <li key={pp.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                    onClick={() => router.push(`/admin/packs/${pp.pack.id}`)}
                  >
                    {pp.pack.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 削除ボタン */}
      {prize._count.packPrizes === 0 && (
        <div className="border-t border-gray-800 pt-6">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            この景品を削除
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="景品を削除"
        message={`「${prize.name}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除"
        loading={deleting}
      />
    </div>
  );
}
