"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance, StripeElementsOptions } from "@stripe/stripe-js";
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

interface PaymentFormProps {
  onClose: () => void;
  onCompleted: () => void;
}

function PaymentElementForm({ onClose, onCompleted }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/charge?status=success`,
        },
        redirect: "if_required",
      });

      if (error) {
        const message = error.message ?? "決済に失敗しました";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        toast.success("決済完了を確認しました。残高を更新します。");
        onCompleted();
        return;
      }

      toast.info("決済状態を確認中です。少し待ってからご確認ください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      {errorMessage ? (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" type="button" onClick={onClose}>
          キャンセル
        </Button>
        <Button size="sm" type="submit" disabled={!stripe || !elements || isSubmitting}>
          {isSubmitting ? "決済処理中..." : "この内容で支払う"}
        </Button>
      </div>
    </form>
  );
}

export default function ChargeClient({ plans }: { plans: ChargePlan[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ChargePlan | null>(null);
  const [stripePromise, setStripePromise] = useState<
    ReturnType<typeof loadStripe> | null
  >(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const handledStatusRef = useRef<string | null>(null);

  const closeCheckout = () => {
    setClientSecret(null);
    setSelectedPlan(null);
  };

  const handlePaymentCompleted = () => {
    closeCheckout();
    router.refresh();
  };

  const appearance = useMemo<Appearance>(
    () => ({
      theme: "night",
      variables: {
        colorPrimary: "#FFD71F",
        colorBackground: "#0B1220",
        colorText: "#E2E8F0",
        colorDanger: "#F87171",
        fontFamily: "Noto Sans JP, sans-serif",
        spacingUnit: "4px",
        borderRadius: "10px",
      },
      rules: {
        ".Input": {
          backgroundColor: "#111827",
          border: "1px solid #334155",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #FFD71F",
          boxShadow: "0 0 0 1px #FFD71F",
        },
        ".Label": {
          color: "#CBD5E1",
          fontWeight: "500",
        },
        ".Tab": {
          backgroundColor: "#0F172A",
          border: "1px solid #334155",
        },
        ".Tab--selected": {
          border: "1px solid #FFD71F",
        },
      },
    }),
    [],
  );

  const elementsOptions = useMemo<StripeElementsOptions | null>(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance,
            locale: "ja",
          }
        : null,
    [appearance, clientSecret],
  );

  useEffect(() => {
    if (!clientSecret) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [clientSecret]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (!status || handledStatusRef.current === status) return;

    handledStatusRef.current = status;
    if (status === "success") {
      toast.success("決済完了を確認しました。残高反映まで数秒かかる場合があります。");
      closeCheckout();
      router.refresh();
      return;
    }
    if (status === "cancel") {
      toast.info("決済をキャンセルしました");
    }
  }, [router, searchParams]);

  const handleCharge = async (plan: ChargePlan) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoadingPlanId(plan.id);
    setSelectedPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "エラーが発生しました");
        setSelectedPlan(null);
        return;
      }

      if (data.clientSecret && data.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey as string));
        setClientSecret(data.clientSecret as string);
        return;
      }

      toast.error("決済フォームの生成に失敗しました");
      setSelectedPlan(null);
    } catch {
      toast.error("通信エラーが発生しました");
      setSelectedPlan(null);
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
                onClick={() => handleCharge(plan)}
                disabled={loadingPlanId !== null}
              >
                {loadingPlanId === plan.id ? "読込中..." : formatPrice(plan.price)}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {stripePromise && elementsOptions ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="mx-auto mt-2 sm:mt-8 w-full max-w-5xl">
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-gold-start/20 via-gold-end/10 to-gold-start/20" />

              <div className="relative flex items-start justify-between gap-3 border-b border-slate-700 px-4 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-gold-end/80 uppercase">
                    Secure Payment
                  </p>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                    コインチャージ決済
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    入力フォームはサイトカラーに合わせて最適化しています
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={closeCheckout}>
                  閉じる
                </Button>
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 p-4 sm:p-6">
                <aside className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 space-y-4">
                  <div>
                    <p className="text-[11px] text-slate-400">選択中プラン</p>
                    <p className="text-lg font-bold text-white mt-1">
                      🪙 {formatCoins(selectedPlan?.coins ?? 0)}
                    </p>
                    {selectedPlan?.bonus ? (
                      <p className="text-xs text-emerald-400 mt-1">
                        +{formatCoins(selectedPlan.bonus)} ボーナス
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                    <p className="text-[11px] text-slate-400">お支払い金額</p>
                    <p className="text-xl font-bold text-gold-end mt-1">
                      {selectedPlan ? formatPrice(selectedPlan.price) : "-"}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <p>・決済完了後、コイン残高に反映されます。</p>
                    <p>・反映に数秒かかる場合があります。</p>
                  </div>
                </aside>

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 sm:p-4">
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <PaymentElementForm
                      onClose={closeCheckout}
                      onCompleted={handlePaymentCompleted}
                    />
                  </Elements>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
