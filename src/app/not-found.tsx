import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-black text-gray-700 mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">
          ページが見つかりません
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-gold-start to-gold-end text-gray-900 font-bold text-base transition-all hover:brightness-110 active:scale-95"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
