"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatCoins } from "@/lib/utils/format";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          <span className="bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent">
            ORIPA
          </span>
        </Link>

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
