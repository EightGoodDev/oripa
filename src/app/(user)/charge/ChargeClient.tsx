"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { formatCoins, formatPrice } from "@/lib/utils/format";

interface ChargePlan {
  id: string;
  coins: number;
  price: number;
  bonus: number;
  isPopular: boolean;
  firstTimeOnly: boolean;
}

export default function ChargeClient({ plans }: { plans: ChargePlan[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const handledStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (!status || handledStatusRef.current === status) return;

    handledStatusRef.current = status;
    if (status === "success") {
      toast.success("決済完了を確認しました。残高反映まで数秒かかる場合があります。");
      router.refresh();
      return;
    }
    if (status === "cancel") {
      toast.info("決済をキャンセルしました");
    }
  }, [router, searchParams]);

  const handleCharge = async (planId: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoadingPlanId(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "エラーが発生しました");
        return;
      }

      if (!data.checkoutUrl) {
        toast.error("決済ページの生成に失敗しました");
        return;
      }

      window.location.assign(data.checkoutUrl as string);
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="pt-4 pb-4 px-4">
      <h1 className="text-lg font-bold text-white mb-2">コインチャージ</h1>

      {session?.user && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
          <p className="text-xs text-gray-400">現在の残高</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            🪙 {formatCoins(session.user.coins ?? 0)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-gray-900 rounded-xl p-4 border border-gray-800 relative"
          >
            {plan.isPopular && (
              <span className="absolute -top-2 left-4 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded">
                人気
              </span>
            )}
            {plan.firstTimeOnly && (
              <span className="absolute -top-2 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                初回限定
              </span>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">
                  🪙 {formatCoins(plan.coins)}
                </p>
                {plan.bonus > 0 && (
                  <p className="text-xs text-green-400 mt-0.5">
                    +{formatCoins(plan.bonus)} ボーナス
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleCharge(plan.id)}
                disabled={loadingPlanId !== null}
              >
                {loadingPlanId === plan.id ? "遷移中..." : formatPrice(plan.price)}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
