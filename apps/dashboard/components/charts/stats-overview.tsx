"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartType = "area" | "line";
type DateRange = "7d" | "30d" | "90d" | "1y";

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  visible?: boolean;
}

interface StatsOverviewProps {
  data: Array<{ date: string; [key: string]: any }>;
  metrics: MetricConfig[];
  title?: string;
  height?: number;
  loading?: boolean;
  showDateRangeSelector?: boolean;
  showChartTypeToggle?: boolean;
  defaultChartType?: ChartType;
  defaultDateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

// Custom tooltip component with dark mode support
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 min-w-[150px]">
        <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-700">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
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

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
];

export function StatsOverview({
  data,
  metrics,
  title,
  height = 350,
  loading = false,
  showDateRangeSelector = true,
  showChartTypeToggle = true,
  defaultChartType = "area",
  defaultDateRange = "30d",
  onDateRangeChange,
}: StatsOverviewProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(metrics.filter((m) => m.visible !== false).map((m) => m.key))
  );

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  const toggleMetric = (key: string) => {
    setVisibleMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        // Don't allow hiding all metrics
        if (newSet.size > 1) {
          newSet.delete(key);
        }
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const activeMetrics = useMemo(
    () => metrics.filter((m) => visibleMetrics.has(m.key)),
    [metrics, visibleMetrics]
  );

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        <ChartSkeleton height={height} />
      </div>
    );
  }

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  return (
    <div className="w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {title && (
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Type Toggle */}
          {showChartTypeToggle && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setChartType("area")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartType === "area"
                    ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Line
              </button>
            </div>
          )}

          {/* Date Range Selector */}
          {showDateRangeSelector && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDateRangeChange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    dateRange === option.value
                      ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              visibleMetrics.has(metric.key)
                ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                : "bg-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-opacity ${
                visibleMetrics.has(metric.key) ? "opacity-100" : "opacity-30"
              }`}
              style={{ backgroundColor: metric.color }}
            />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {activeMetrics.map((metric) => (
              <linearGradient
                key={metric.key}
                id={`gradient-${metric.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-700"
            opacity={0.5}
          />
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
          {chartType === "area"
            ? activeMetrics.map((metric) => (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${metric.key})`}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))
            : activeMetrics.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
