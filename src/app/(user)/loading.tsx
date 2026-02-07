export default function HomeLoading() {
  return (
    <div className="pt-2 pb-4">
      {/* Tab skeleton */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-16 bg-gray-800 rounded-full animate-pulse shrink-0"
          />
        ))}
      </div>

      {/* Sort skeleton */}
      <div className="flex gap-1 px-4 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-7 w-14 bg-gray-900 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 px-4 mt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
