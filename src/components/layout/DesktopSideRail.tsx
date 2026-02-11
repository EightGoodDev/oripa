import Link from "next/link";

const leftLinks = [
  { href: "/charge", label: "コイン購入", sub: "すぐにチャージ" },
  { href: "/ranking", label: "当選者ランキング", sub: "最新の当選情報" },
  { href: "/exchange", label: "交換所", sub: "マイルで交換" },
  { href: "/mypage", label: "マイページ", sub: "所持景品と履歴" },
];

const rightLinks = [
  { href: "/operator", label: "運営者情報" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
];

export default function DesktopSideRail({
  side,
}: {
  side: "left" | "right";
}) {
  const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "ORIPA運営事務局";
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@oripa.example";

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
        <h2 className="text-xs font-bold text-gray-300">サポート</h2>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          運営: {operatorName}
        </p>
        <a
          href={`mailto:${supportEmail}`}
          className="mt-2 inline-flex rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200 hover:bg-gray-700"
        >
          問い合わせ
        </a>
      </section>
      <section className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
        <h2 className="text-xs font-bold text-gray-300">ガイド</h2>
        <div className="mt-2 space-y-1.5">
          {rightLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-xs text-gray-400 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
