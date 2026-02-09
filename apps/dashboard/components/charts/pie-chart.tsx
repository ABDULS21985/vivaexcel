"use client";

import { useState, useCallback } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  loading?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  interactive?: boolean;
}

// Default color palette
const DEFAULT_COLORS = [
  "#1E4DB7",
  "#F59A23",
  "#E86A1D",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#84CC16",
];

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            {data.name}
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Value: {data.value.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Percentage: {((data.percent || 0) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

// Active shape for interactive hover
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
          transition: "all 0.3s ease",
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        style={{ transition: "all 0.3s ease" }}
      />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        className="fill-zinc-900 dark:fill-white text-sm font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        className="fill-zinc-500 dark:fill-zinc-400 text-xs"
      >
        {value.toLocaleString()} ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

// Loading skeleton
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse flex items-center justify-center"
      style={{ height }}
    >
      <div className="w-48 h-48 rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

// Custom legend
function CustomLegend({
  data,
  colors,
}: {
  data: PieChartData[];
  colors: string[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {data.map((item, index) => {
        const color = item.color || colors[index % colors.length];
        const percentage = ((item.value / total) * 100).toFixed(1);
        return (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.name}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PieChartComponent({
  data,
  title,
  height = 300,
  loading = false,
  showLegend = true,
  showLabels = false,
  innerRadius = 60,
  outerRadius = 100,
  colors = DEFAULT_COLORS,
  interactive = true,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      if (interactive) {
        setActiveIndex(index);
      }
    },
    [interactive]
  );

  const onPieLeave = useCallback(() => {
    if (interactive) {
      setActiveIndex(undefined);
    }
  }, [interactive]);

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
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
    <div className="w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            {...(interactive ? {
              activeIndex,
              activeShape: renderActiveShape,
              onMouseEnter: onPieEnter,
              onMouseLeave: onPieLeave,
            } as Record<string, unknown> : {})}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            label={
              showLabels
                ? ({ name, percent }: { name?: string; percent?: number }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                : false
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                style={{ transition: "all 0.3s ease" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      {showLegend && <CustomLegend data={data} colors={colors} />}
    </div>
  );
}

// Also export as PieChart for convenience
export { PieChartComponent as PieChart };
