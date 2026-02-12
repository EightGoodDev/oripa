"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatCoins } from "@/lib/utils/format";

const leftLinks = [
  { href: "/charge", label: "コイン購入", sub: "すぐにチャージ" },
  { href: "/ranking", label: "当選者ランキング", sub: "最新の当選情報" },
  { href: "/exchange", label: "交換所", sub: "マイルで交換" },
  { href: "/mypage", label: "マイページ", sub: "所持景品と履歴" },
];

const rightActionLinks = [
  { href: "/", label: "オリパ一覧へ", sub: "新着やおすすめを確認" },
  { href: "/ranking", label: "当選者ランキング", sub: "高レア当選をチェック" },
  { href: "/exchange", label: "交換所へ", sub: "欲しい景品を探す" },
];

export default function DesktopSideRail({
  side,
}: {
  side: "left" | "right";
}) {
  const { data: session } = useSession();

  if (side === "left") {
    return (
      <div className="sticky top-24 space-y-3">
        <section className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
          <h2 className="text-xs font-bold text-gray-300">クイックアクセス</h2>
          <div className="mt-2 space-y-2">
            {leftLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 transition-colors hover:border-gray-700 hover:bg-gray-900"
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{item.sub}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-3">
      <section className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
        <h2 className="text-xs font-bold text-gray-300">プレイ状況</h2>
        {session?.user ? (
          <div className="mt-2 rounded-lg border border-gray-800 bg-gray-950/70 p-3">
            <p className="text-xs text-gray-400">現在のコイン</p>
            <p className="mt-1 text-lg font-bold text-yellow-400">
              🪙 {formatCoins(session.user.coins ?? 0)}
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/charge"
                className="inline-flex rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-gray-900 hover:bg-yellow-300"
              >
                チャージ
              </Link>
              <Link
                href="/mypage"
                className="inline-flex rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200 hover:bg-gray-700"
              >
                マイページ
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-lg border border-gray-800 bg-gray-950/70 p-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              ログインすると所持コインや当選履歴をすぐ確認できます。
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200 hover:bg-gray-700"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-gray-900 hover:bg-yellow-300"
              >
                新規登録
              </Link>
            </div>
          </div>
        )}
      </section>
      <section className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
        <h2 className="text-xs font-bold text-gray-300">おすすめ導線</h2>
        <div className="mt-2 space-y-2">
          {rightActionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 transition-colors hover:border-gray-700 hover:bg-gray-900"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{item.sub}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
        <h2 className="text-xs font-bold text-gray-300">プレイのコツ</h2>
        <ul className="mt-2 space-y-1.5 text-xs text-gray-400">
          <li>・ランキングで高レアが出ているパックを確認</li>
          <li>・マイページで獲得履歴とマイルを定期チェック</li>
          <li>・交換所で在庫があるうちに交換</li>
        </ul>
      </section>
    </div>
  );
}
