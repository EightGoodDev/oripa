"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatCoins } from "@/lib/utils/format";

const navItems = [
  { href: "/", label: "オリパ" },
  { href: "/ranking", label: "ランキング" },
  { href: "/exchange", label: "交換所" },
  { href: "/mypage", label: "マイページ" },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [operatorName, setOperatorName] = useState(
    process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "ORIPA運営事務局",
  );
  const [supportEmail, setSupportEmail] = useState(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@oripa.example",
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/public/site-settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          operatorName?: string;
          supportEmail?: string;
        };
        if (!isMounted) return;
        if (data.operatorName) setOperatorName(data.operatorName);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
      } catch {
        // Keep fallback values.
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/95 backdrop-blur supports-[backdrop-filter]:bg-slate-800/85">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent">
              ORIPA
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname.startsWith("/oripa")
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "text-yellow-400 font-bold bg-slate-700"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {session?.user ? (
          <Link
            href="/charge"
            className="flex items-center gap-2 bg-slate-700 rounded-full px-3 py-1.5 text-sm hover:bg-slate-600 transition-colors"
          >
            <span className="text-yellow-400 text-base">🪙</span>
            <span className="text-white font-bold">
              {formatCoins(session.user.coins ?? 0)}
            </span>
            <span className="text-xs text-gray-300 hidden sm:inline">コイン</span>
            <span className="text-xs text-green-400 font-bold ml-1">チャージ+</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white"
          >
            ログイン
          </Link>
        )}
      </div>

      <div className="hidden border-t border-slate-700 bg-slate-900/75 lg:block">
        <div className="w-full max-w-[1600px] mx-auto min-h-8 px-4 py-1 flex items-center justify-between gap-2 text-[11px]">
          <p className="text-gray-500 truncate hidden sm:block">運営: {operatorName}</p>
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/operator" className="text-gray-400 hover:text-white">
              運営者情報
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              利用規約
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              プライバシー
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="text-gray-400 hover:text-white"
            >
              問い合わせ
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
