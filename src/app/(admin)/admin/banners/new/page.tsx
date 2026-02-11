"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ImageUploadField from "@/components/admin/ImageUploadField";

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

const emptyForm = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
  isActive: true,
  isPublished: true,
};

export default function BannerCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function createBanner() {
    if (!form.imageUrl) {
      toast.error("画像を設定してください");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "作成に失敗しました");
        return;
      }

      toast.success("バナーを作成しました");
      router.push("/admin/banners");
      router.refresh();
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
          { label: "バナー管理", href: "/admin/banners" },
          { label: "新規作成" },
        ]}
      />
      <h1 className="text-2xl font-bold">バナー新規作成</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="タイトル（任意）"
          className={inputClass}
        />
        <ImageUploadField
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          folder="packs"
          recommendedSize="2400 x 600px（4:1）"
          inputClassName={inputClass}
          previewClassName="w-full max-w-[720px] aspect-[4/1]"
          previewObjectFit="contain"
        />
        <input
          value={form.linkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="リンクURL（任意）"
          className={inputClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
            className={inputClass}
          />
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
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
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={createBanner} disabled={saving}>
            {saving ? "作成中..." : "作成"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/admin/banners")}
            disabled={saving}
          >
            一覧へ戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
