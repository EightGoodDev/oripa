export default function RankingLoading() {
  return (
    <div className="pt-4 pb-4">
      <h1 className="text-lg font-bold text-white px-4 mb-4">
        当選者ランキング
      </h1>
      <div className="space-y-2 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800 animate-pulse"
          >
            <div className="w-8 h-6 bg-gray-800 rounded shrink-0" />
            <div className="w-12 h-12 bg-gray-800 rounded shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
