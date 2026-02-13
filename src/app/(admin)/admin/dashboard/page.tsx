import DashboardDrawsChart from "@/components/admin/DashboardDrawsChart";
import SetupGuideCard from "@/components/admin/SetupGuideCard";
import StatCard from "@/components/admin/StatCard";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { getAdminSetupStatus } from "@/lib/admin/setup";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCoins, formatPrice } from "@/lib/utils/format";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    redirect("/admin/login");
  }
  const [stats, setup] = await Promise.all([
    getAdminDashboardStats(tenantId),
    getAdminSetupStatus(tenantId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <SetupGuideCard status={setup} compact />
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/get-started"
          prefetch={false}
          className="text-sm rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 transition-colors"
        >
          初期セットアップ画面を開く
        </Link>
        {setup.nextStep ? (
          <Link
            href={setup.nextStep.href}
            prefetch={false}
            className="text-sm rounded-lg border border-gold-mid/40 bg-gold-mid/10 px-3 py-2 text-gold-mid hover:text-gold-end transition-colors"
          >
            次の手順: {setup.nextStep.title}
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="ユーザー数"
          value={formatCoins(stats.totalUsers)}
          sub={`今日 +${stats.newUsersToday}`}
        />
        <StatCard
          title="総売上"
          value={formatPrice(stats.totalRevenue)}
        />
        <StatCard
          title="今日のガチャ"
          value={formatCoins(stats.drawsToday)}
        />
        <StatCard
          title="アクティブパック"
          value={stats.activePacks}
        />
        <StatCard
          title="完売パック"
          value={stats.soldOutPacks}
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">ガチャ回数（過去7日間）</h2>
        <DashboardDrawsChart data={stats.dailyDraws} />
      </div>
    </div>
  );
}
