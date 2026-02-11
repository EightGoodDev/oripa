"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCoins, formatRelativeTime } from "@/lib/utils/format";
import { RANK_LABELS } from "@/lib/utils/rank";
import type { UserRank, Rarity } from "@prisma/client";
import { toast } from "sonner";

type TabKey = "overview" | "exchange" | "invite" | "rank";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "概要" },
  { key: "exchange", label: "交換" },
  { key: "invite", label: "招待" },
  { key: "rank", label: "ランク" },
];

interface OwnedItemView {
  id: string;
  status: string;
  createdAt: string;
  prize: {
    name: string;
    image: string;
    rarity: Rarity;
    coinValue: number;
  };
}

interface DrawHistoryView {
  id: string;
  isTrial: boolean;
  createdAt: string;
  prize: { name: string; rarity: Rarity };
  pack: { title: string };
}

interface InviteData {
  referralCode: string;
  miles: number;
  invitedCount: number;
  limit: number;
  phoneVerifiedRewardedCount: number;
  firstChargeRewardedCount: number;
  links: {
    id: string;
    name: string;
    createdAt: string;
    phoneVerifiedRewarded: boolean;
    firstChargeRewarded: boolean;
  }[];
}

interface MileageHistory {
  id: string;
  amount: number;
  balance: number;
  type: string;
  description: string;
  createdAt: string;
}

interface MileRewardItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredMiles: number;
  stock: number | null;
  canExchange: boolean;
}

interface RankSettingRow {
  rank: UserRank;
  chargeThreshold: number;
  coinReturnRate: number;
  mileReturnRate: number;
  rankUpBonus: number;
  sortOrder: number;
}

interface RankSettingResponse {
  user: {
    rank: UserRank;
    totalCharged: number;
  } | null;
  settings: RankSettingRow[];
}

const tabButtonClass =
  "text-xs px-3 py-1.5 rounded-full border transition-colors";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabKey | null) ?? "overview";
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs.some((tab) => tab.key === initialTab) ? initialTab : "overview",
  );
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const { data: inventory, isLoading: loadingInv } = useQuery<OwnedItemView[]>({
    queryKey: ["inventory"],
    queryFn: () => fetch("/api/user/inventory").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: history, isLoading: loadingHist } = useQuery<DrawHistoryView[]>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/user/history").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: invite } = useQuery<InviteData>({
    queryKey: ["invite"],
    queryFn: () => fetch("/api/user/invite").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: mileageHistory } = useQuery<MileageHistory[]>({
    queryKey: ["mileage-history"],
    queryFn: () => fetch("/api/user/miles/history").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: mileItems } = useQuery<MileRewardItem[]>({
    queryKey: ["mile-items"],
    queryFn: () => fetch("/api/user/mile-exchange/items").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: rankSettings } = useQuery<RankSettingResponse>({
    queryKey: ["rank-settings"],
    queryFn: () => fetch("/api/user/rank-settings").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const exchangeCoinMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/user/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "交換に失敗しました");
      return body;
    },
    onSuccess: () => {
      toast.success("コインに交換しました");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "交換に失敗しました");
    },
  });

  const exchangeMileMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/user/mile-exchange/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "交換申請に失敗しました");
      return body;
    },
    onSuccess: () => {
      toast.success("交換申請を送信しました");
      queryClient.invalidateQueries({ queryKey: ["mile-items"] });
      queryClient.invalidateQueries({ queryKey: ["mileage-history"] });
      queryClient.invalidateQueries({ queryKey: ["invite"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "交換申請に失敗しました");
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/phone/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "送信に失敗しました");
      return body;
    },
    onSuccess: (body) => {
      toast.success("認証コードを送信しました");
      if (body.devCode) {
        toast.message(`開発用コード: ${body.devCode}`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "送信に失敗しました");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/phone/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "認証に失敗しました");
      return body;
    },
    onSuccess: () => {
      toast.success("電話番号認証が完了しました");
      queryClient.invalidateQueries({ queryKey: ["invite"] });
      queryClient.invalidateQueries({ queryKey: ["mileage-history"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "認証に失敗しました");
    },
  });

  const exchangeableInventory = useMemo(
    () => (inventory ?? []).filter((item) => item.status === "OWNED"),
    [inventory],
  );

  if (status === "loading") return null;
  if (!session?.user) return null;

  const rankLabel = RANK_LABELS[session.user.rank as UserRank] ?? "ビギナー";

  return (
    <div className="pt-4 pb-4 px-4 space-y-5">
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl overflow-hidden">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={56}
                height={56}
                className="object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold truncate">{session.user.name ?? "ユーザー"}</p>
            <p className="text-xs text-yellow-400">{rankLabel}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ログアウト
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-[11px] text-gray-400">コイン</p>
            <p className="text-lg font-bold text-yellow-400">🪙 {formatCoins(session.user.coins ?? 0)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-[11px] text-gray-400">マイル</p>
            <p className="text-lg font-bold text-green-400">🟢 {formatCoins(invite?.miles ?? session.user.miles ?? 0)}</p>
          </div>
        </div>

        <div className="mt-3">
          <Button size="sm" onClick={() => router.push("/charge")}>チャージ</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`${tabButtonClass} ${
              activeTab === tab.key
                ? "bg-gold-mid/20 border-gold-mid text-gold-mid"
                : "bg-gray-900 border-gray-700 text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <section className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-3">獲得アイテム</h2>
            {loadingInv ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : exchangeableInventory.length === 0 ? (
              <p className="text-sm text-gray-500">保有中アイテムはありません</p>
            ) : (
              <div className="space-y-2">
                {exchangeableInventory.slice(0, 5).map((item) => (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-800">
                      <Image src={item.prize.image} alt={item.prize.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge rarity={item.prize.rarity} />
                        <span className="text-xs text-gray-500">{formatCoins(item.prize.coinValue)}コイン</span>
                      </div>
                      <p className="text-sm text-white truncate mt-0.5">{item.prize.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-3">抽選履歴</h2>
            {loadingHist ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : !history || history.length === 0 ? (
              <p className="text-sm text-gray-500">まだ抽選していません</p>
            ) : (
              <div className="space-y-1.5">
                {history.slice(0, 20).map((h) => (
                  <div key={h.id} className="bg-gray-900/60 rounded-lg px-3 py-2 text-sm flex items-center gap-3">
                    <Badge rarity={h.prize.rarity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{h.prize.name}</p>
                      <p className="text-xs text-gray-500">{h.pack.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 shrink-0">{formatRelativeTime(h.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "exchange" && (
        <section className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-bold mb-3">コイン交換（保有景品）</h2>
            {exchangeableInventory.length === 0 ? (
              <p className="text-sm text-gray-500">交換可能な景品がありません</p>
            ) : (
              <div className="space-y-2">
                {exchangeableInventory.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-800 p-2 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800">
                      <Image src={item.prize.image} alt={item.prize.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.prize.name}</p>
                      <p className="text-xs text-gray-500">{formatCoins(item.prize.coinValue)}コイン</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => exchangeCoinMutation.mutate(item.id)}
                      disabled={exchangeCoinMutation.isPending}
                    >
                      交換
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-bold mb-3">マイル交換</h2>
            {!mileItems || mileItems.length === 0 ? (
              <p className="text-sm text-gray-500">交換可能なアイテムはありません</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mileItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-800 overflow-hidden bg-gray-950/60">
                    <div className="relative aspect-[4/3] bg-gray-900">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className={`object-cover ${item.stock !== null && item.stock <= 0 ? "brightness-[0.35] grayscale" : ""}`}
                        sizes="(max-width: 768px) 100vw, 360px"
                      />
                      {item.stock !== null && item.stock <= 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 bg-black/35" />
                          <div className="absolute -left-12 top-4 w-48 -rotate-12 bg-red-600 text-center text-[11px] font-extrabold tracking-[0.18em] text-white py-1.5 shadow-lg">
                            SOLD OUT
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="min-w-0">
                        <p className="text-sm text-white font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        <p className="text-xs text-green-400 mt-1">{formatCoins(item.requiredMiles)}マイル</p>
                        <p
                          className={`text-[11px] mt-1 ${
                            item.stock !== null && item.stock <= 0 ? "text-red-400" : "text-gray-500"
                          }`}
                        >
                          {item.stock === null ? "在庫: 無制限" : `在庫: ${item.stock}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={
                          item.stock !== null && item.stock <= 0
                            ? "outline"
                            : item.canExchange
                              ? "gold"
                              : "outline"
                        }
                        disabled={
                          item.stock !== null && item.stock <= 0
                            ? true
                            : !item.canExchange || exchangeMileMutation.isPending
                        }
                        onClick={() => exchangeMileMutation.mutate(item.id)}
                        className="w-full"
                      >
                        {item.stock !== null && item.stock <= 0
                          ? "SOLD OUT"
                          : item.canExchange
                            ? "交換"
                            : "マイル不足"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "invite" && (
        <section className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-base font-bold">招待コード</h2>
            <p className="text-xs text-gray-500 mt-1">タップでコピーできます</p>
            <button
              type="button"
              className="mt-3 text-2xl font-bold text-white tracking-wide"
              onClick={async () => {
                if (!invite?.referralCode) return;
                await navigator.clipboard.writeText(invite.referralCode);
                toast.success("招待コードをコピーしました");
              }}
            >
              {invite?.referralCode ?? "-"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              達成人数: {invite?.invitedCount ?? 0} / {invite?.limit ?? 100}
            </p>
            <p className="text-xs text-gray-400">
              電話認証達成: {invite?.phoneVerifiedRewardedCount ?? 0}人 / 初回課金達成: {invite?.firstChargeRewardedCount ?? 0}人
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold">電話番号認証</h3>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090xxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? "送信中..." : "認証コード送信"}
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6桁コード"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
              <Button size="sm" onClick={() => verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? "確認中..." : "認証する"}
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold mb-2">マイル履歴</h3>
            {!mileageHistory || mileageHistory.length === 0 ? (
              <p className="text-xs text-gray-500">まだ履歴がありません</p>
            ) : (
              <div className="space-y-1.5">
                {mileageHistory.slice(0, 15).map((row) => (
                  <div key={row.id} className="flex items-center gap-2 text-xs rounded bg-gray-800/70 px-2 py-1.5">
                    <span className={row.amount >= 0 ? "text-green-400" : "text-red-400"}>
                      {row.amount >= 0 ? `+${row.amount}` : row.amount}
                    </span>
                    <span className="text-gray-300 flex-1 truncate">{row.description}</span>
                    <span className="text-gray-500">{formatRelativeTime(row.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "rank" && (
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-base font-bold">会員ランク</h2>
          <p className="text-xs text-gray-500 mt-1">
            累計チャージ額: {formatCoins(rankSettings?.user?.totalCharged ?? 0)}円
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="py-2 pr-2">ランク</th>
                  <th className="py-2 pr-2">昇格基準</th>
                  <th className="py-2 pr-2">コイン還元率</th>
                  <th className="py-2 pr-2">マイル付与率</th>
                  <th className="py-2">ボーナス</th>
                </tr>
              </thead>
              <tbody>
                {(rankSettings?.settings ?? []).map((row) => {
                  const active = rankSettings?.user?.rank === row.rank;
                  return (
                    <tr key={row.rank} className={`border-b border-gray-800/50 ${active ? "bg-gold-mid/10" : ""}`}>
                      <td className="py-2 pr-2 font-medium">{RANK_LABELS[row.rank]}</td>
                      <td className="py-2 pr-2">{formatCoins(row.chargeThreshold)}円</td>
                      <td className="py-2 pr-2">{(row.coinReturnRate * 100).toFixed(1)}%</td>
                      <td className="py-2 pr-2">{(row.mileReturnRate * 100).toFixed(1)}%</td>
                      <td className="py-2">{formatCoins(row.rankUpBonus)}コイン</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
