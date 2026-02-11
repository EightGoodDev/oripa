"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";

const domains = [
  { value: "RANKS", label: "ランク" },
  { value: "HOME_BANNERS", label: "バナー" },
  { value: "HOME_EVENTS", label: "イベント" },
  { value: "MILE_REWARDS", label: "マイル交換景品" },
  { value: "FEATURE_FLAGS", label: "機能フラグ" },
  { value: "CONTENT_OVERRIDES", label: "文言上書き" },
] as const;

interface ConfigVersionRow {
  id: string;
  domain: string;
  version: number;
  description: string | null;
  rolledBackFromVersion: number | null;
  publishedBy: string | null;
  publishedAt: string;
}

export default function ConfigVersionsPage() {
  const [domain, setDomain] = useState<(typeof domains)[number]["value"]>("RANKS");
  const [rows, setRows] = useState<ConfigVersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState<number | null>(null);

  useEffect(() => {
    void fetchRows();
  }, [domain]);

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/config/history?domain=${domain}`);
      if (!res.ok) throw new Error();
      const data: ConfigVersionRow[] = await res.json();
      setRows(data);
    } catch {
      toast.error("履歴の取得に失敗しました");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function publishNow() {
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/config/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "公開に失敗しました");
        return;
      }

      toast.success(`公開しました: v${body.version}`);
      await fetchRows();
    } catch {
      toast.error("公開に失敗しました");
    } finally {
      setPublishing(false);
    }
  }

  async function rollback(version: number) {
    if (!window.confirm(`v${version} へロールバックしますか？`)) return;

    setRollbackLoading(version);
    try {
      const res = await fetch("/api/admin/config/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, version }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "ロールバックに失敗しました");
        return;
      }

      toast.success(`ロールバック完了: v${body.version}`);
      await fetchRows();
    } catch {
      toast.error("ロールバックに失敗しました");
    } finally {
      setRollbackLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "設定公開履歴" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">設定公開履歴</h1>
        <Button size="sm" onClick={publishNow} disabled={publishing}>
          {publishing ? "公開中..." : "現在内容をPublish"}
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="text-xs text-gray-400">対象ドメイン</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value as (typeof domains)[number]["value"])}
          className="mt-1 w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          {domains.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">履歴がありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">公開日時</th>
                <th className="px-3 py-2">説明</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-800/50">
                  <td className="px-3 py-2 font-medium">v{row.version}</td>
                  <td className="px-3 py-2">{new Date(row.publishedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{row.description ?? (row.rolledBackFromVersion ? `v${row.rolledBackFromVersion}からロールバック` : "-")}</td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rollback(row.version)}
                      disabled={rollbackLoading === row.version}
                    >
                      {rollbackLoading === row.version ? "実行中..." : "この版に戻す"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
