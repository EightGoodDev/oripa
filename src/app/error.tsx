"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-black text-red-500/60 mb-4">Error</p>
        <h1 className="text-xl font-bold text-white mb-2">
          エラーが発生しました
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          一時的な問題が発生しています。しばらくしてからもう一度お試しください。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-gold-start to-gold-end text-gray-900 font-bold text-base transition-all hover:brightness-110 active:scale-95"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
