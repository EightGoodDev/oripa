"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "オリパ", icon: "🎰" },
  { href: "/ranking", label: "ランキング", icon: "🏆" },
  { href: "/exchange", label: "交換所", icon: "🔄" },
  { href: "/mypage", label: "マイページ", icon: "👤" },
  { href: "/charge", label: "コイン", icon: "🪙" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 lg:hidden">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname.startsWith("/oripa")
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              <span className="text-lg mb-0.5">{tab.icon}</span>
              <span className={isActive ? "font-bold" : ""}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
