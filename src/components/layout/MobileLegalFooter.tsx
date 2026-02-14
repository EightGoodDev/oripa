"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MobileLegalFooter() {
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
    <footer className="mt-8 border-t border-slate-700 bg-slate-900/70 px-4 py-4 text-[11px] text-gray-400 lg:hidden">
      <p className="truncate text-gray-500">運営: {operatorName}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link href="/operator" className="hover:text-white">
          運営者情報
        </Link>
        <Link href="/terms" className="hover:text-white">
          利用規約
        </Link>
        <Link href="/privacy" className="hover:text-white">
          プライバシー
        </Link>
        <a href={`mailto:${supportEmail}`} className="hover:text-white">
          問い合わせ
        </a>
      </div>
    </footer>
  );
}
