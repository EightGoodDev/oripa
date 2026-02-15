"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatCoins, formatDateTime, formatPrice } from "@/lib/utils/format";

type ChargeStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface PaymentRow {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  amount: number;
  coins: number;
  bonus: number;
  status: ChargeStatus;
  paymentMethod: string;
  stripePaymentId: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAmount: number;
  refundedCoins: number;
  refundedMiles: number;
  refundableAmount: number;
  canRefund: boolean;
  stripePaymentIntentStatus?: string | null;
}

interface PaymentListResponse {
  items: PaymentRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FunnelResponse {
  since: string;
  buckets: Record<string, number>;
  rates: {
    completedRate: number;
    failedRate: number;
    refundedRate: number;
  };
}

type RefundMode = "FULL" | "PARTIAL";

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid";

function statusBadge(status: ChargeStatus) {
  if (status === "REFUNDED") {
    return "bg-purple-900/40 text-purple-300 border-purple-800";
  }
  if (status === "COMPLETED") {
    return "bg-green-900/40 text-green-300 border-green-800";
  }
  if (status === "FAILED") {
    return "bg-red-900/40 text-red-300 border-red-800";
  }
  return "bg-yellow-900/40 text-yellow-300 border-yellow-800";
}

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refundTarget, setRefundTarget] = useState<PaymentRow | null>(null);
  const [refundMode, setRefundMode] = useState<RefundMode>("FULL");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) {
        toast.error("決済履歴の取得に失敗しました");
        return;
      }

      const data = (await res.json()) as PaymentListResponse;
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/payments/funnel?since=7d", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as FunnelResponse;
        if (cancelled) return;
        setFunnel(data);
      } catch {
        // ignore
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const columns: Column<PaymentRow>[] = [
    {
      key: "createdAt",
      label: "決済日時",
      sortable: true,
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "user",
      label: "ユーザー",
      render: (row) => (
        <div>
          <div className="text-white">{row.user.name ?? "—"}</div>
          <div className="text-xs text-gray-400">{row.user.email ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "決済額",
      sortable: true,
      render: (row) => formatPrice(row.amount),
    },
    {
      key: "coins",
      label: "付与コイン",
      render: (row) => (
        <span>
          {formatCoins(row.coins + row.bonus)}
          {row.bonus > 0 ? (
            <span className="text-xs text-gold-mid ml-1">
              (+{formatCoins(row.bonus)})
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "status",
      label: "状態",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusBadge(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "stripePaymentIntentStatus",
      label: "Stripe",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.stripePaymentIntentStatus ?? "—"}
        </span>
      ),
    },
    {
      key: "refundedAmount",
      label: "返金済み",
      render: (row) => formatPrice(row.refundedAmount),
    },
    {
      key: "refundableAmount",
      label: "返金可能",
      render: (row) => formatPrice(row.refundableAmount),
    },
    {
      key: "actions",
      label: "操作",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          disabled={!row.canRefund}
          onClick={(e) => {
            e.stopPropagation();
            setRefundTarget(row);
            setRefundMode("FULL");
            setPartialAmount("");
            setReason("");
            setNote("");
          }}
        >
          返金
        </Button>
      ),
    },
  ];

  const partialAmountInt = useMemo(() => {
    const parsed = Number(partialAmount);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  }, [partialAmount]);

  async function submitRefund() {
    if (!refundTarget) return;
    const payload: {
      amount?: number;
      reason?: string;
      note?: string;
    } = {};

    if (refundMode === "PARTIAL") {
      if (partialAmountInt < 1) {
        toast.error("一部返金額は1円以上を入力してください");
        return;
      }
      if (partialAmountInt > refundTarget.refundableAmount) {
        toast.error("返金額が返金可能額を超えています");
        return;
      }
      payload.amount = partialAmountInt;
    }

    if (reason.trim()) payload.reason = reason.trim();
    if (note.trim()) payload.note = note.trim();

    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/payments/${refundTarget.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "返金に失敗しました");
        return;
      }

      toast.success("返金を実行しました");
      setRefundTarget(null);
      await fetchPayments();
    } finally {
      setRefunding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">決済履歴管理</h1>
        <div className="text-sm text-gray-400">{formatCoins(total)} 件</div>
      </div>

      {funnel ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">作成</p>
            <p className="text-xl font-bold">{formatCoins(funnel.buckets.created ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">完了</p>
            <p className="text-xl font-bold text-green-400">
              {formatCoins(funnel.buckets.completed ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              CVR {(funnel.rates.completedRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">失敗</p>
            <p className="text-xl font-bold text-red-400">
              {formatCoins(funnel.buckets.failed ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(funnel.rates.failedRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">返金</p>
            <p className="text-xl font-bold text-purple-300">
              {formatCoins(funnel.buckets.refunded ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(funnel.rates.refundedRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <input
          className={`${inputClass} max-w-sm`}
          placeholder="ユーザー名 / メール / 決済ID / Stripe ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`${inputClass} w-[180px]`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">全ステータス</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">読み込み中...</div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            emptyMessage="決済履歴がありません。"
          />
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {formatCoins(total)}件中 {formatCoins((page - 1) * pageSize + 1)}-
            {formatCoins(Math.min(page * pageSize, total))}件
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              前へ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              次へ
            </Button>
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={!!refundTarget}
        onClose={() => (!refunding ? setRefundTarget(null) : undefined)}
        className="max-w-lg"
      >
        {refundTarget ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold">返金実行</h2>

            <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-3 space-y-1 text-sm">
              <p className="text-gray-300">
                対象: {refundTarget.user.name ?? "—"} ({refundTarget.user.email ?? "—"})
              </p>
              <p className="text-gray-300">決済額: {formatPrice(refundTarget.amount)}</p>
              <p className="text-gray-300">
                返金可能額: {formatPrice(refundTarget.refundableAmount)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-300">返金タイプ</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    refundMode === "FULL"
                      ? "border-gold-mid text-gold-mid bg-gold-mid/10"
                      : "border-gray-700 text-gray-300"
                  }`}
                  onClick={() => setRefundMode("FULL")}
                >
                  全額返金
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    refundMode === "PARTIAL"
                      ? "border-gold-mid text-gold-mid bg-gold-mid/10"
                      : "border-gray-700 text-gray-300"
                  }`}
                  onClick={() => setRefundMode("PARTIAL")}
                >
                  一部返金
                </button>
              </div>
            </div>

            {refundMode === "PARTIAL" ? (
              <div>
                <label className="text-sm text-gray-300">返金額（円）</label>
                <input
                  type="number"
                  min={1}
                  max={refundTarget.refundableAmount}
                  className={`${inputClass} mt-1`}
                  placeholder="例: 500"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                />
              </div>
            ) : null}

            <div>
              <label className="text-sm text-gray-300">返金理由（任意）</label>
              <input
                className={`${inputClass} mt-1`}
                placeholder="例: ユーザー依頼"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">メモ（任意）</label>
              <textarea
                rows={3}
                className={`${inputClass} mt-1`}
                placeholder="管理メモ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <p className="text-xs text-gray-500">
              返金時は、該当チャージにより付与されたコイン/マイルを返金額に応じて自動減算します。
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={refunding}
                onClick={() => setRefundTarget(null)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={refunding}
                onClick={() => void submitRefund()}
              >
                {refunding ? "処理中..." : "返金を実行"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
