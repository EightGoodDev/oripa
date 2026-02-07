"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  drawsToday: number;
  activePacks: number;
  soldOutPacks: number;
  dailyDraws: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="ユーザー数"
          value={stats.totalUsers.toLocaleString("ja-JP")}
          sub={`今日 +${stats.newUsersToday}`}
        />
        <StatCard
          title="総売上"
          value={formatPrice(stats.totalRevenue)}
        />
        <StatCard
          title="今日のガチャ"
          value={stats.drawsToday.toLocaleString("ja-JP")}
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
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyDraws}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#374151" }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#374151" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#FFDA3B"
                fill="#FFDA3B"
                fillOpacity={0.1}
                strokeWidth={2}
                name="ガチャ回数"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
