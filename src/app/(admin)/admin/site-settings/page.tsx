"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Button from "@/components/ui/Button";

interface SiteSettingsForm {
  operatorName: string;
  operatorCompany: string;
  operatorAddress: string;
  operatorPhone: string;
  supportEmail: string;
  supportHours: string;
  representativeName: string;
  businessDescription: string;
  paymentMethods: string;
  servicePriceNote: string;
  additionalFees: string;
  deliveryTime: string;
  returnPolicy: string;
  termsText: string;
  termsUpdatedAt: string;
  privacyText: string;
  privacyUpdatedAt: string;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";
const textareaClass = `${inputClass} min-h-28 leading-relaxed`;

const emptyForm: SiteSettingsForm = {
  operatorName: "",
  operatorCompany: "",
  operatorAddress: "",
  operatorPhone: "",
  supportEmail: "",
  supportHours: "",
  representativeName: "",
  businessDescription: "",
  paymentMethods: "",
  servicePriceNote: "",
  additionalFees: "",
  deliveryTime: "",
  returnPolicy: "",
  termsText: "",
  termsUpdatedAt: "",
  privacyText: "",
  privacyUpdatedAt: "",
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SiteSettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-settings");
      if (!res.ok) throw new Error("failed");
      const data: SiteSettingsForm = await res.json();
      setForm(data);
    } catch {
      toast.error("サイト設定の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof SiteSettingsForm>(
    key: K,
    value: SiteSettingsForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        const firstError =
          body?.error?.operatorName?.[0] ||
          body?.error?.supportEmail?.[0] ||
          body?.error?.termsText?.[0] ||
          body?.error?.privacyText?.[0] ||
          body?.error?.termsUpdatedAt?.[0] ||
          body?.error?.privacyUpdatedAt?.[0] ||
          body?.error ||
          "保存に失敗しました";
        toast.error(firstError);
        return;
      }

      setForm(body);
      toast.success("サイト設定を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "サイト設定" }]} />
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-400">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "サイト設定" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">サイト設定</h1>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
        <h2 className="text-lg font-bold text-white">運営情報・特商法</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-gray-400">
            運営者名（必須）
            <input
              className={inputClass}
              value={form.operatorName}
              onChange={(e) => updateField("operatorName", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400">
            事業者名
            <input
              className={inputClass}
              value={form.operatorCompany}
              onChange={(e) => updateField("operatorCompany", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            所在地
            <input
              className={inputClass}
              value={form.operatorAddress}
              onChange={(e) => updateField("operatorAddress", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400">
            電話番号
            <input
              className={inputClass}
              value={form.operatorPhone}
              onChange={(e) => updateField("operatorPhone", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400">
            問い合わせメール（必須）
            <input
              className={inputClass}
              value={form.supportEmail}
              onChange={(e) => updateField("supportEmail", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400">
            問い合わせ対応時間
            <input
              className={inputClass}
              value={form.supportHours}
              onChange={(e) => updateField("supportHours", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400">
            運営統括責任者
            <input
              className={inputClass}
              value={form.representativeName}
              onChange={(e) => updateField("representativeName", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            販売業務内容
            <input
              className={inputClass}
              value={form.businessDescription}
              onChange={(e) => updateField("businessDescription", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            支払い方法
            <input
              className={inputClass}
              value={form.paymentMethods}
              onChange={(e) => updateField("paymentMethods", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            販売価格
            <input
              className={inputClass}
              value={form.servicePriceNote}
              onChange={(e) => updateField("servicePriceNote", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            商品代金以外の必要料金
            <input
              className={inputClass}
              value={form.additionalFees}
              onChange={(e) => updateField("additionalFees", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            引き渡し時期
            <input
              className={inputClass}
              value={form.deliveryTime}
              onChange={(e) => updateField("deliveryTime", e.target.value)}
            />
          </label>
          <label className="text-xs text-gray-400 md:col-span-2">
            返品・キャンセル
            <input
              className={inputClass}
              value={form.returnPolicy}
              onChange={(e) => updateField("returnPolicy", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
        <h2 className="text-lg font-bold text-white">利用規約</h2>
        <label className="text-xs text-gray-400">
          最終更新日（YYYY-MM-DD）
          <input
            className={inputClass}
            value={form.termsUpdatedAt}
            onChange={(e) => updateField("termsUpdatedAt", e.target.value)}
          />
        </label>
        <label className="text-xs text-gray-400 block">
          本文（必須）
          <textarea
            className={textareaClass}
            value={form.termsText}
            onChange={(e) => updateField("termsText", e.target.value)}
          />
        </label>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
        <h2 className="text-lg font-bold text-white">プライバシーポリシー</h2>
        <label className="text-xs text-gray-400">
          最終更新日（YYYY-MM-DD）
          <input
            className={inputClass}
            value={form.privacyUpdatedAt}
            onChange={(e) => updateField("privacyUpdatedAt", e.target.value)}
          />
        </label>
        <label className="text-xs text-gray-400 block">
          本文（必須）
          <textarea
            className={textareaClass}
            value={form.privacyText}
            onChange={(e) => updateField("privacyText", e.target.value)}
          />
        </label>
      </section>
    </div>
  );
}

