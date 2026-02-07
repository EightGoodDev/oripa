interface RemainingBarProps {
  remaining: number;
  total: number;
  size?: "sm" | "md";
}

export default function RemainingBar({
  remaining,
  total,
  size = "sm",
}: RemainingBarProps) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = pct < 20;

  return (
    <div>
      <div
        className={`w-full bg-gray-800 rounded-full overflow-hidden ${size === "md" ? "h-3" : "h-2"}`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            isLow
              ? "bg-red-500"
              : "bg-gradient-to-r from-green-400 to-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={`text-gray-400 mt-1 ${size === "md" ? "text-sm" : "text-xs"}`}
      >
        残り{" "}
        <span className={`font-bold ${isLow ? "text-red-400" : "text-white"}`}>
          {remaining}
        </span>
        <span className="text-gray-600"> / {total}口</span>
      </p>
    </div>
  );
}
