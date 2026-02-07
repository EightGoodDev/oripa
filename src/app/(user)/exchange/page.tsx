"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCoins } from "@/lib/utils/format";
import type { Rarity } from "@prisma/client";

interface ExchangeItem {
  id: string;
  prize: {
    name: string;
    image: string;
    rarity: Rarity;
    coinValue: number;
  };
}

export default function ExchangePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: items } = useQuery<ExchangeItem[]>({
    queryKey: ["exchangeable-items"],
    queryFn: () =>
      fetch("/api/user/inventory?status=OWNED").then((r) => r.json()),
    enabled: !!session?.user,
  });

  const exchangeMutation = useMutation({
    mutationFn: (itemId: string) =>
      fetch("/api/user/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeable-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="pt-4 pb-4">
      <h1 className="text-lg font-bold text-white px-4 mb-4">コイン交換所</h1>
      <p className="text-sm text-gray-400 px-4 mb-4">
        獲得したアイテムをコインに交換できます
      </p>

      {!items || items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          交換可能なアイテムがありません
        </div>
      ) : (
        <div className="space-y-2 px-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800"
            >
              <div className="relative w-14 h-14 shrink-0 rounded bg-gray-800 overflow-hidden">
                <Image
                  src={item.prize.image}
                  alt={item.prize.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Badge rarity={item.prize.rarity} />
                <p className="text-sm text-white font-medium truncate mt-0.5">
                  {item.prize.name}
                </p>
                <p className="text-xs text-yellow-400 mt-0.5">
                  🪙 {formatCoins(item.prize.coinValue)}コイン
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={exchangeMutation.isPending}
                onClick={() => {
                  if (
                    confirm(
                      `${item.prize.name}を${formatCoins(item.prize.coinValue)}コインに交換しますか？`,
                    )
                  ) {
                    exchangeMutation.mutate(item.id);
                  }
                }}
              >
                交換
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
