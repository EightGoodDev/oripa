import { getRecentWinners } from "@/lib/db/queries";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const entries = await getRecentWinners();

  return (
    <div className="pt-4 pb-4">
      <h1 className="text-lg font-bold text-white px-4 mb-4">
        当選者ランキング
      </h1>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          まだ当選者がいません
        </div>
      ) : (
        <div className="space-y-2 px-4">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800"
            >
              <div className="w-8 text-center shrink-0">
                {i < 3 ? (
                  <span className="text-lg">
                    {["🥇", "🥈", "🥉"][i]}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">{i + 1}</span>
                )}
              </div>

              <div className="w-10 h-10 shrink-0 rounded-full bg-gray-800 grid place-items-center text-sm font-bold text-gray-300">
                {(entry.userName ?? "匿").slice(0, 1)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">
                  {entry.userName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  高レア当選 {entry.highRarityWinCount} 回
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  最終当選: {entry.latestPrizeName}（{entry.latestOripaTitle}）
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex justify-end">
                  <Badge rarity={entry.latestPrizeRarity} />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {formatRelativeTime(entry.lastWonAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
