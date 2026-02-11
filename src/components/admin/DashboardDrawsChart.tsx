"use client";

import dynamic from "next/dynamic";

interface DashboardDrawsChartProps {
  data: { date: string; count: number }[];
}

const DashboardDrawsChartInner = dynamic(
  () => import("@/components/admin/DashboardDrawsChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 min-w-0 flex items-center justify-center text-gray-500">
        グラフを読み込み中...
      </div>
    ),
  },
);

export default function DashboardDrawsChart(props: DashboardDrawsChartProps) {
  return <DashboardDrawsChartInner {...props} />;
}
