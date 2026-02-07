import Image from "next/image";
import { getRecentWinners } from "@/lib/db/queries";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const revalidate = 30;

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

              <div className="relative w-12 h-12 shrink-0 rounded bg-gray-800 overflow-hidden">
                <Image
                  src={entry.prizeImage}
                  alt={entry.prizeName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge rarity={entry.prizeRarity} />
                  <span className="text-xs text-gray-500 truncate">
                    {entry.oripaTitle}
                  </span>
                </div>
                <p className="text-sm text-white font-medium truncate mt-0.5">
                  {entry.prizeName}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.userName} ・ {formatRelativeTime(entry.drawnAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
