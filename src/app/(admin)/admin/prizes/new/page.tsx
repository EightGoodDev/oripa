"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/admin/FormField";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/admin/ImageUploadField";

const prizeSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  genre: z.string().trim().min(1, "ジャンルを入力してください").max(40),
  rarity: z.enum(["N", "R", "SR", "SSR", "UR"]),
  marketPrice: z.coerce.number().int().min(0),
  costPrice: z.coerce.number().int().min(0),
  coinValue: z.coerce.number().int().min(0),
});

type PrizeFormData = z.infer<typeof prizeSchema>;

export default function NewPrizePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrizeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(prizeSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      image: "",
      genre: "other",
      rarity: "N",
      marketPrice: 0,
      costPrice: 0,
      coinValue: 0,
    },
  });

  const imageUrl = watch("image") ?? "";

  const onSubmit = async (data: PrizeFormData) => {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/admin/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "作成に失敗しました");
        return;
      }

      const result = await res.json();
      router.push(`/admin/prizes/${result.id}`);
    } catch {
      setServerError("作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: "景品管理", href: "/admin/prizes" },
          { label: "新規作成" },
        ]}
      />
      <h1 className="text-2xl font-bold">景品を作成</h1>

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

        <FormField label="画像" error={errors.image?.message}>
          <input type="hidden" {...register("image")} />
          <ImageUploadField
            value={imageUrl}
            onChange={(url) =>
              setValue("image", url, { shouldDirty: true, shouldValidate: true })
            }
            folder="prizes"
            recommendedSize="1200 x 1200px（1:1）"
            disabled={submitting}
          />
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

        <FormField label="ジャンル" error={errors.genre?.message}>
          <input
            type="text"
            {...register("genre")}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid"
            placeholder="例: sneaker"
          />
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

        <FormField label="原価（円）" error={errors.costPrice?.message}>
          <input
            type="number"
            {...register("costPrice")}
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
            {submitting ? "作成中..." : "作成"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
