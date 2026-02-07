"use client";

import type { PackListItem } from "@/types";
import OripaCard from "./OripaCard";

export default function OripaGrid({ packs }: { packs: PackListItem[] }) {
  if (packs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        該当するオリパがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {packs.map((pack) => (
        <OripaCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
}
