"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/get-started", label: "初期セットアップ", icon: "🚀" },
  { href: "/admin/packs", label: "パック管理", icon: "🎴" },
  { href: "/admin/categories", label: "カテゴリ管理", icon: "🗂️" },
  { href: "/admin/prizes", label: "景品管理", icon: "🎁" },
  { href: "/admin/banners", label: "バナー管理", icon: "🖼️" },
  { href: "/admin/events", label: "イベント管理", icon: "🎉" },
  { href: "/admin/mile-rewards", label: "マイル交換景品", icon: "🎯" },
  { href: "/admin/site-settings", label: "サイト設定", icon: "🏢" },
  { href: "/admin/rank-settings", label: "ランク設定", icon: "🏅" },
  { href: "/admin/config-versions", label: "設定履歴", icon: "🕘" },
  { href: "/admin/users", label: "ユーザー管理", icon: "👤" },
  { href: "/admin/plans", label: "プラン管理", icon: "💰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 p-2 rounded-lg"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-gray-900 border-r border-gray-800 z-40 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-gray-800">
          <Link
            href="/admin/dashboard"
            prefetch={false}
            className="text-xl font-bold"
          >
            <span className="text-gold-mid">ORIPA</span>
            <span className="text-gray-400 text-sm ml-2">管理画面</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-gold-mid/10 text-gold-mid font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
