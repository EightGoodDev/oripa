"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { RANK_LABELS } from "@/lib/utils/rank";
import type { UserRank } from "@prisma/client";

interface RankSettingRow {
  rank: UserRank;
  chargeThreshold: number;
  coinReturnRate: number;
  mileReturnRate: number;
  rankUpBonus: number;
  sortOrder: number;
  isActive: boolean;
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

export default function RankSettingsPage() {
  const [rows, setRows] = useState<RankSettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    void fetchRows();
  }, []);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rank-settings");
      if (!res.ok) throw new Error();
      const data: RankSettingRow[] = await res.json();
      setRows(data);
    } catch {
      toast.error("ランク設定の取得に失敗しました");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(rank: UserRank, key: keyof RankSettingRow, value: string | boolean) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.rank !== rank) return row;

        if (typeof value === "boolean") {
          return { ...row, [key]: value };
        }

        const numericValue = Number(value);
        return { ...row, [key]: Number.isFinite(numericValue) ? numericValue : 0 };
      }),
    );
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rank-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: sortedRows }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "保存に失敗しました");
        return;
      }

      toast.success("ランク設定を保存し、再計算を実行しました");
      await fetchRows();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function recalculate() {
    setRecalculating(true);
    try {
      const res = await fetch("/api/admin/rank-settings/recalculate", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "再計算に失敗しました");
        return;
      }

      toast.success(
        `再計算完了: ${body.summary.rankUpdatedCount}件ランク更新 / ${body.summary.totalBonusDelta}コイン差額付与`,
      );
    } catch {
      toast.error("再計算に失敗しました");
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "ランク設定" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ランク設定</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={recalculate} disabled={recalculating}>
            {recalculating ? "再計算中..." : "再計算のみ実行"}
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "保存中..." : "保存して反映"}
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">読み込み中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="px-3 py-2">ランク</th>
                  <th className="px-3 py-2">昇格基準(円)</th>
                  <th className="px-3 py-2">コイン還元率(0~1)</th>
                  <th className="px-3 py-2">マイル付与率(0~1)</th>
                  <th className="px-3 py-2">昇格ボーナス(コイン)</th>
                  <th className="px-3 py-2">表示順</th>
                  <th className="px-3 py-2">有効</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.rank} className="border-b border-gray-800/50">
                    <td className="px-3 py-2 font-medium">{RANK_LABELS[row.rank]}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className={inputClass}
                        value={row.chargeThreshold}
                        onChange={(e) => updateRow(row.rank, "chargeThreshold", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.001"
                        className={inputClass}
                        value={row.coinReturnRate}
                        onChange={(e) => updateRow(row.rank, "coinReturnRate", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.001"
                        className={inputClass}
                        value={row.mileReturnRate}
                        onChange={(e) => updateRow(row.rank, "mileReturnRate", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className={inputClass}
                        value={row.rankUpBonus}
                        onChange={(e) => updateRow(row.rank, "rankUpBonus", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className={inputClass}
                        value={row.sortOrder}
                        onChange={(e) => updateRow(row.rank, "sortOrder", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(e) => updateRow(row.rank, "isActive", e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
