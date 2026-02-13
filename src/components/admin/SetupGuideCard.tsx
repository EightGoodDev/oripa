import Link from "next/link";
import type { AdminSetupStatus } from "@/lib/admin/setup";

interface SetupGuideCardProps {
  status: AdminSetupStatus;
  compact?: boolean;
}

export default function SetupGuideCard({
  status,
  compact = false,
}: SetupGuideCardProps) {
  const barWidth = `${Math.max(0, Math.min(100, status.percent))}%`;

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">初期セットアップ</h2>
          <p className="text-sm text-gray-400">
            空の管理画面から公開開始までの必須手順をガイドします。
          </p>
        </div>
        {status.isReadyForLaunch ? (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
            運営開始可能
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
            準備中
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            必須 {status.completedRequiredCount}/{status.totalRequiredCount}
          </span>
          <span className="text-gray-400">{status.percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold-start to-gold-end" style={{ width: barWidth }} />
        </div>
      </div>

      <div className="space-y-2">
        {status.steps.map((step) => (
          <div
            key={step.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    step.completed
                      ? "text-emerald-300"
                      : step.required
                        ? "text-amber-300"
                        : "text-gray-500"
                  }
                >
                  {step.completed ? "●" : "○"}
                </span>
                <span className="text-white">{step.title}</span>
                {!step.required ? (
                  <span className="text-[11px] rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">
                    任意
                  </span>
                ) : null}
              </div>
              {!compact ? (
                <p className="text-xs text-gray-400 mt-1">{step.description}</p>
              ) : null}
            </div>

            <Link
              href={step.href}
              prefetch={false}
              className="shrink-0 text-xs rounded border border-gray-700 px-2 py-1 text-gray-200 hover:bg-gray-800 transition-colors"
            >
              開く
            </Link>
          </div>
        ))}
      </div>

      {status.nextStep ? (
        <div className="rounded-lg border border-gold-mid/30 bg-gold-mid/10 p-3">
          <p className="text-xs text-gold-end">次にやること</p>
          <Link
            href={status.nextStep.href}
            prefetch={false}
            className="text-sm text-gold-mid hover:text-gold-end"
          >
            {status.nextStep.title}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
