"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { RANK_LABELS } from "@/lib/utils/rank";
import { formatCoins, formatRelativeTime } from "@/lib/utils/format";
import type { UserRank, Rarity } from "@prisma/client";

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

export default function MyPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: inventory } = useQuery<OwnedItemView[]>({
    queryKey: ["inventory"],
    queryFn: () => fetch("/api/user/inventory").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const { data: history } = useQuery<DrawHistoryView[]>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/user/history").then((r) => r.json()),
    enabled: !!session?.user,
  });

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user = session.user;
  const rankLabel = RANK_LABELS[user.rank as UserRank] ?? "ビギナー";

  return (
    <div className="pt-4 pb-4 px-4">
      {/* Profile Card */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={56}
                height={56}
                className="object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">{user.name ?? "ユーザー"}</p>
            <p className="text-xs text-yellow-400">{rankLabel}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ログアウト
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
          <div>
            <p className="text-xs text-gray-400">コイン残高</p>
            <p className="text-lg font-bold text-yellow-400">
              🪙 {formatCoins(user.coins ?? 0)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/charge">
              <Button size="sm">チャージ</Button>
            </Link>
            <Link href="/exchange">
              <Button variant="outline" size="sm">
                交換
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <h2 className="text-base font-bold text-white mt-6 mb-3">
        獲得アイテム
      </h2>
      {!inventory || inventory.length === 0 ? (
        <p className="text-gray-500 text-sm">まだアイテムがありません</p>
      ) : (
        <div className="space-y-2">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800"
            >
              <div className="relative w-12 h-12 shrink-0 rounded bg-gray-800 overflow-hidden">
                <Image
                  src={item.prize.image}
                  alt={item.prize.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge rarity={item.prize.rarity} />
                  <span className="text-xs text-gray-500">
                    {item.status === "OWNED"
                      ? "保有中"
                      : item.status === "EXCHANGED"
                        ? "交換済"
                        : "発送中"}
                  </span>
                </div>
                <p className="text-sm text-white truncate mt-0.5">
                  {item.prize.name}
                </p>
              </div>
              {item.status === "OWNED" && (
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline">
                    発送
                  </Button>
                  <Button size="sm" variant="ghost">
                    還元
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Draw History */}
      <h2 className="text-base font-bold text-white mt-6 mb-3">抽選履歴</h2>
      {!history || history.length === 0 ? (
        <p className="text-gray-500 text-sm">まだ抽選していません</p>
      ) : (
        <div className="space-y-1.5">
          {history.slice(0, 20).map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-3 py-2 text-sm"
            >
              <Badge rarity={h.prize.rarity} />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{h.prize.name}</p>
                <p className="text-xs text-gray-500">{h.pack.title}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(h.createdAt)}
                </p>
                {h.isTrial && (
                  <span className="text-[10px] text-gray-600">お試し</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
