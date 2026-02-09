"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsChartProps {
  data: Array<{ date: string; value: number; [key: string]: any }>;
  dataKey?: string;
  title?: string;
  color?: string;
  showGrid?: boolean;
  height?: number;
  loading?: boolean;
  showLegend?: boolean;
}

// Custom tooltip component with dark mode support
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm text-zinc-600 dark:text-zinc-400"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Loading skeleton component
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg"
      style={{ height }}
    >
      <div className="flex items-end justify-around h-full p-4 gap-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-zinc-200 dark:bg-zinc-700 rounded-t w-full"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AnalyticsChart({
  data,
  dataKey = "value",
  title,
  color = "#1E4DB7",
  showGrid = true,
  height = 300,
  loading = false,
  showLegend = false,
}: AnalyticsChartProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  if (loading) {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <ChartSkeleton height={height} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-700"
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            stroke="currentColor"
            className="text-zinc-500 dark:text-zinc-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            stroke="currentColor"
            className="text-zinc-500 dark:text-zinc-400"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {value}
                </span>
              )}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${dataKey})`}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
