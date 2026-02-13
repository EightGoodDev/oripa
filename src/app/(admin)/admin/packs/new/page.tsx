"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import FormField from "@/components/admin/FormField";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Modal from "@/components/ui/Modal";
import { getCategoryLabel } from "@/types";

const packSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  image: z.string().url("有効なURLを入力してください"),
  category: z.string().trim().min(1, "カテゴリを入力してください"),
  minRank: z.enum(["BEGINNER", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "VIP"]).default("BEGINNER"),
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

export default function NewPackPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PackForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packSchema) as any,
    defaultValues: {
      category: "sneaker",
      minRank: "BEGINNER",
      featured: false,
    },
  });

  const imageUrl = watch("image") ?? "";
  const selectedCategory = watch("category") ?? "";

  const fetchCategories = async (preferredName?: string) => {
    const res = await fetch("/api/admin/packs/categories");
    if (!res.ok) {
      setCategories([]);
      return;
    }

    const data: { id: string; name: string }[] = await res.json();
    setCategories(data);

    if (preferredName && data.some((c) => c.name === preferredName)) {
      setValue("category", preferredName, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const current = getValues("category");
    if (!current || !data.some((c) => c.name === current)) {
      setValue("category", data[0]?.name ?? "", { shouldValidate: true });
    }
  };

  useEffect(() => {
    fetchCategories().catch(() => setCategories([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryModalError("カテゴリ名を入力してください");
      return;
    }

    const normalized = name.toLocaleLowerCase("ja-JP");
    if (categories.some((category) => category.name.toLocaleLowerCase("ja-JP") === normalized)) {
      setCategoryModalError("同じカテゴリ名がすでに存在します");
      return;
    }

    setCategoryModalError("");
    setCreatingCategory(true);
    try {
      const res = await fetch("/api/admin/packs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const body = await res.json();
      if (!res.ok) {
        setCategoryModalError(
          body?.error?.name?.[0] ?? body?.error ?? "カテゴリ作成に失敗しました",
        );
        return;
      }

      await fetchCategories(body.name);
      setNewCategoryName("");
      setCategoryModalError("");
      setCategoryModalOpen(false);
      toast.success("カテゴリを作成しました");
    } catch {
      setCategoryModalError("カテゴリ作成に失敗しました");
    } finally {
      setCreatingCategory(false);
    }
  };

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

        <FormField label="画像" error={errors.image?.message}>
          <input type="hidden" {...register("image")} />
          <ImageUploadField
            value={imageUrl}
            onChange={(url) =>
              setValue("image", url, { shouldDirty: true, shouldValidate: true })
            }
            folder="packs"
            recommendedSize="1200 x 1200px（1:1）"
            disabled={saving}
            inputClassName={inputClass}
          />
        </FormField>

        <FormField label="カテゴリ" error={errors.category?.message}>
          <div className="flex gap-2">
            <input type="hidden" {...register("category")} />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setValue("category", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={inputClass}
            >
              {categories.length === 0 ? (
                <option value="">カテゴリを作成してください</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {getCategoryLabel(category.name)}
                  </option>
                ))
              )}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setCategoryModalError("");
                setCategoryModalOpen(true);
              }}
            >
              新規
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">カテゴリは事前登録が必要です。</p>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="必要ランク">
            <select {...register("minRank")} className={inputClass}>
              <option value="BEGINNER">ビギナー以上</option>
              <option value="BRONZE">ブロンズ以上</option>
              <option value="SILVER">シルバー以上</option>
              <option value="GOLD">ゴールド以上</option>
              <option value="PLATINUM">プラチナ以上</option>
              <option value="DIAMOND">ダイヤモンド以上</option>
              <option value="VIP">???（シークレット）限定</option>
            </select>
          </FormField>
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

      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryModalError("");
        }}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold">カテゴリ管理</h3>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">新規カテゴリ名</label>
            <div className="flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (categoryModalError) setCategoryModalError("");
                }}
                className={`${inputClass} flex-1`}
                placeholder="例: electronics"
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={handleCreateCategory}
                disabled={creatingCategory}
              >
                {creatingCategory ? "作成中..." : "作成"}
              </Button>
            </div>
            {categoryModalError && (
              <p className="text-xs text-red-400">{categoryModalError}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-400">登録済みカテゴリ</p>
            <div className="max-h-60 overflow-y-auto border border-gray-800 rounded-lg">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="px-3 py-2 text-sm border-b border-gray-800 last:border-b-0"
                >
                  <span>{getCategoryLabel(category.name)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCategoryModalOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
