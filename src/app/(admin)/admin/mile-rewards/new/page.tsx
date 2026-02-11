"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Button from "@/components/ui/Button";

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const initialForm = {
  name: "",
  description: "",
  imageUrl: "",
  requiredMiles: 100,
  stock: "",
  isActive: true,
  isPublished: true,
};

export default function NewMileRewardPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  async function createRow() {
    if (!form.name || !form.imageUrl) {
      toast.error("名前と画像は必須です");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/mile-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
          requiredMiles: Number(form.requiredMiles),
          stock: form.stock === "" ? null : Number(form.stock),
          isActive: form.isActive,
          isPublished: form.isPublished,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "作成に失敗しました");
        return;
      }

      toast.success("交換景品を作成しました");
      setForm(initialForm);
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "マイル交換景品", href: "/admin/mile-rewards" },
          { label: "新規作成" },
        ]}
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">マイル交換景品を作成</h1>
        <Link href="/admin/mile-rewards">
          <Button size="sm" variant="outline">
            一覧へ戻る
          </Button>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="景品名"
          className={inputClass}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="説明"
          rows={3}
          className={inputClass}
        />
        <ImageUploadField
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          folder="prizes"
          recommendedSize="1000 x 1000px（1:1）"
          inputClassName={inputClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={form.requiredMiles}
            onChange={(e) => setForm((prev) => ({ ...prev, requiredMiles: Number(e.target.value) }))}
            placeholder="必要マイル"
            className={inputClass}
          />
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="在庫（空欄で無制限）"
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <label className="text-xs text-gray-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            有効
          </label>
          <label className="text-xs text-gray-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            公開
          </label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={createRow} disabled={saving}>
            {saving ? "作成中..." : "作成"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setForm(initialForm)}
            disabled={saving}
          >
            リセット
          </Button>
        </div>
      </div>
    </div>
  );
}
