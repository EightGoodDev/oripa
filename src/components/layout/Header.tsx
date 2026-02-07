"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
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
                      ? "text-yellow-400 font-bold bg-gray-800"
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
            className="flex items-center gap-1.5 bg-gray-800 rounded-full px-3 py-1.5 text-sm"
          >
            <span className="text-yellow-400 text-base">🪙</span>
            <span className="text-white font-bold">
              {formatCoins(session.user.coins ?? 0)}
            </span>
            <span className="text-xs text-green-400 font-bold ml-1">+</span>
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
    </header>
  );
}
