"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import FormField from "@/components/admin/FormField";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { CATEGORY_LABELS } from "@/types";

const packSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  category: z.enum(["sneaker", "card", "figure", "game", "other"]),
  pricePerDraw: z.coerce.number().int().min(1, "1以上を入力"),
  totalStock: z.coerce.number().int().min(1, "1以上を入力"),
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
});

type PackForm = z.infer<typeof packSchema>;

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const categoryEntries = Object.entries(CATEGORY_LABELS).filter(
  ([k]) => k !== "all",
);

export default function NewPackPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packSchema) as any,
    defaultValues: {
      category: "sneaker",
      featured: false,
    },
  });

  async function onSubmit(data: PackForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const pack = await res.json();
      toast.success("パックを作成しました。次に景品を追加してください。");
      router.push(`/admin/packs/${pack.id}`);
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "パック管理", href: "/admin/packs" },
          { label: "新規作成" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">パック新規作成</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        <span className="flex items-center gap-1.5 text-gold-mid font-medium">
          <span className="w-6 h-6 rounded-full bg-gold-mid text-gray-900 flex items-center justify-center text-xs font-bold">1</span>
          パック情報入力
        </span>
        <span className="text-gray-600">→</span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-xs font-bold">2</span>
          景品追加
        </span>
        <span className="text-gray-600">→</span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-xs font-bold">3</span>
          公開
        </span>
      </div>

      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={handleSubmit(onSubmit as any)}
        className="max-w-2xl space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <FormField label="タイトル" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </FormField>

        <FormField label="説明" error={errors.description?.message}>
          <textarea {...register("description")} rows={3} className={inputClass} />
        </FormField>

        <FormField label="画像URL" error={errors.image?.message}>
          <input
            {...register("image")}
            placeholder="https://..."
            className={inputClass}
          />
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
          <FormField label="1回あたりの価格(コイン)" error={errors.pricePerDraw?.message}>
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

        <FormField label="ユーザーあたりの制限(任意)" error={errors.limitPerUser?.message}>
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

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "作成中..." : "作成"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
