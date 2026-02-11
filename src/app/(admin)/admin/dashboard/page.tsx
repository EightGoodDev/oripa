import DashboardDrawsChart from "@/components/admin/DashboardDrawsChart";
import StatCard from "@/components/admin/StatCard";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { resolveTenantId } from "@/lib/tenant/context";
import { formatCoins, formatPrice } from "@/lib/utils/format";

export default async function DashboardPage() {
  const tenantId = await resolveTenantId();
  const stats = await getAdminDashboardStats(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

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
