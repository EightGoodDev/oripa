"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FormField from "@/components/admin/FormField";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { formatCoins, formatDate, formatDateTime } from "@/lib/utils/format";
import { RANK_LABELS, RANK_COLORS } from "@/lib/utils/rank";
import type { UserRank } from "@/types";

type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

interface DrawRecord {
  id: string;
  coinsCost: number;
  isTrial: boolean;
  createdAt: string;
  prize: { id: string; name: string; rarity: string };
  pack: { id: string; title: string };
}

interface CoinTx {
  id: string;
  amount: number;
  balance: number;
  type: string;
  description: string;
  createdAt: string;
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  rank: UserRank;
  coins: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  draws: DrawRecord[];
  coinTransactions: CoinTx[];
  _count: { draws: number };
}

const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];

const inputClass =
  "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-mid w-full";

const sectionClass =
  "bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: sessionData } = useSession();
  const isSuperAdmin = sessionData?.user?.role === "SUPER_ADMIN";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Coin adjustment
  const [coinAmount, setCoinAmount] = useState("");
  const [coinReason, setCoinReason] = useState("");
  const [coinLoading, setCoinLoading] = useState(false);

  // Role change
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [roleLoading, setRoleLoading] = useState(false);

  // Status toggle
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel: string;
  }>({ open: false, title: "", message: "", onConfirm: () => {}, confirmLabel: "" });

  async function fetchUser() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      setSelectedRole(data.role);
    } else {
      setError("ユーザーの取得に失敗しました");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCoinAdjust() {
    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount === 0) return;

    setCoinLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coinAdjust: { amount, reason: coinReason },
      }),
    });

    if (res.ok) {
      setCoinAmount("");
      setCoinReason("");
      await fetchUser();
    }
    setCoinLoading(false);
  }

  async function handleRoleChange() {
    if (selectedRole === user?.role) return;

    setRoleLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole }),
    });

    if (res.ok) {
      await fetchUser();
    }
    setRoleLoading(false);
  }

  async function handleToggleActive() {
    if (!user) return;

    const newStatus = !user.isActive;
    setConfirmDialog({
      open: true,
      title: newStatus ? "アカウント有効化" : "アカウント無効化",
      message: newStatus
        ? "このアカウントを有効化しますか？"
        : "このアカウントを無効化しますか？ユーザーはログインできなくなります。",
      confirmLabel: newStatus ? "有効化" : "無効化",
      onConfirm: async () => {
        setStatusLoading(true);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        });
        if (res.ok) {
          await fetchUser();
        }
        setStatusLoading(false);
      },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error || "ユーザーが見つかりません"}</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
          戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "ユーザー管理", href: "/admin/users" },
          { label: user.name || user.email || "ユーザー詳細" },
        ]}
      />

      {/* ── User Info ── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">ユーザー情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">名前</span>
            <span>{user.name || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500 block">メール</span>
            <span>{user.email || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500 block">ロール</span>
            <span
              className={
                user.role === "SUPER_ADMIN"
                  ? "text-red-400 font-bold"
                  : user.role === "ADMIN"
                    ? "text-yellow-400 font-bold"
                    : ""
              }
            >
              {user.role}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">ランク</span>
            <span
              className="font-bold"
              style={{ color: RANK_COLORS[user.rank] }}
            >
              {RANK_LABELS[user.rank]}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">コイン残高</span>
            <span>{formatCoins(user.coins)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">累計消費</span>
            <span>{formatCoins(user.totalSpent)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">登録日</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">ガチャ回数</span>
            <span>{formatCoins(user._count.draws)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">状態</span>
            <span
              className={user.isActive ? "text-green-400" : "text-red-400"}
            >
              {user.isActive ? "有効" : "無効"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Coin Adjustment ── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">コイン調整</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <FormField label="調整額" className="flex-1">
            <input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="例: 1000 / -500"
              className={inputClass}
            />
          </FormField>
          <FormField label="理由" className="flex-[2]">
            <input
              type="text"
              value={coinReason}
              onChange={(e) => setCoinReason(e.target.value)}
              placeholder="管理者による調整"
              className={inputClass}
            />
          </FormField>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={handleCoinAdjust}
          disabled={coinLoading || !coinAmount || parseInt(coinAmount, 10) === 0}
        >
          {coinLoading ? "処理中..." : "コイン調整を実行"}
        </Button>
      </div>

      {/* ── Role Change (SUPER_ADMIN only) ── */}
      {isSuperAdmin && (
        <div className={sectionClass}>
          <h2 className="text-lg font-bold">ロール変更</h2>
          <div className="flex items-end gap-3">
            <FormField label="ロール" className="w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className={inputClass}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRoleChange}
              disabled={roleLoading || selectedRole === user.role}
            >
              {roleLoading ? "処理中..." : "変更"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Account Status ── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">アカウント状態</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            現在の状態:{" "}
            <span
              className={
                user.isActive
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {user.isActive ? "有効" : "無効"}
            </span>
          </span>
          <Button
            variant={user.isActive ? "danger" : "gold"}
            size="sm"
            onClick={handleToggleActive}
            disabled={statusLoading}
          >
            {statusLoading
              ? "処理中..."
              : user.isActive
                ? "アカウントを無効化"
                : "アカウントを有効化"}
          </Button>
        </div>
      </div>

      {/* ── Recent Draws ── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">最近のガチャ</h2>
        {user.draws.length === 0 ? (
          <p className="text-sm text-gray-500">ガチャ履歴がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="px-3 py-2">景品</th>
                  <th className="px-3 py-2">パック</th>
                  <th className="px-3 py-2">コイン</th>
                  <th className="px-3 py-2">日時</th>
                </tr>
              </thead>
              <tbody>
                {user.draws.map((draw) => (
                  <tr
                    key={draw.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="px-3 py-2">
                      <span className="text-gray-300">{draw.prize.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {draw.prize.rarity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400">
                      {draw.pack.title}
                    </td>
                    <td className="px-3 py-2">
                      {draw.isTrial ? (
                        <span className="text-gray-500">お試し</span>
                      ) : (
                        formatCoins(draw.coinsCost)
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {formatDateTime(draw.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent Coin Transactions ── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">最近の取引</h2>
        {user.coinTransactions.length === 0 ? (
          <p className="text-sm text-gray-500">取引履歴がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="px-3 py-2">種別</th>
                  <th className="px-3 py-2">金額</th>
                  <th className="px-3 py-2">残高</th>
                  <th className="px-3 py-2">説明</th>
                  <th className="px-3 py-2">日時</th>
                </tr>
              </thead>
              <tbody>
                {user.coinTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="px-3 py-2">
                      <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatCoins(tx.amount)}
                    </td>
                    <td className="px-3 py-2">{formatCoins(tx.balance)}</td>
                    <td className="px-3 py-2 text-gray-400">
                      {tx.description}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {formatDateTime(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        loading={statusLoading}
      />
    </div>
  );
}
