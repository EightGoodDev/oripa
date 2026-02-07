export default function OripaDetailLoading() {
  return (
    <div className="pb-6">
      {/* Hero skeleton */}
      <div className="aspect-[4/3] bg-gray-800 animate-pulse" />

      <div className="px-4 pt-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-800 rounded animate-pulse w-2/3" />
        {/* Description */}
        <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />

        {/* Price */}
        <div className="h-6 bg-gray-800 rounded animate-pulse w-1/3" />

        {/* Remaining bar */}
        <div className="h-3 bg-gray-800 rounded-full animate-pulse" />

        {/* Draw buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="h-12 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-12 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-900 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Prize list skeleton */}
      <div className="mt-8 px-4">
        <div className="h-5 bg-gray-800 rounded animate-pulse w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-900 rounded-lg border border-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
