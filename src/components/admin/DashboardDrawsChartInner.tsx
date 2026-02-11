"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardDrawsChartInnerProps {
  data: { date: string; count: number }[];
}

export default function DashboardDrawsChartInner({
  data,
}: DashboardDrawsChartInnerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setChartSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const isChartReady = chartSize.width > 0 && chartSize.height > 0;

  return (
    <div ref={chartContainerRef} className="h-72 min-w-0 w-full">
      {isChartReady ? (
        <AreaChart width={chartSize.width} height={chartSize.height} data={data}>
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
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          グラフを読み込み中...
        </div>
      )}
    </div>
  );
}
