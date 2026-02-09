'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Eye,
  ShoppingCart,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  ArrowRight,
  DollarSign,
  Users,
  Target,
  Filter,
} from 'lucide-react';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import { useSellerEarnings } from '../../../../hooks/use-sellers';

// ─── Types ──────────────────────────────────────────────────────────────────

type DateRange = '7d' | '30d' | '90d' | '1y';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const productPerformanceData = [
  { name: 'Excel Dashboard Pro', revenue: 4250, sales: 85 },
  { name: 'Budget Planner', revenue: 3100, sales: 124 },
  { name: 'Project Tracker', revenue: 2800, sales: 56 },
  { name: 'Invoice Template', revenue: 1950, sales: 78 },
  { name: 'Data Analyzer', revenue: 3600, sales: 72 },
];

const trafficSourcesData = [
  { name: 'Direct', value: 40, visits: 4000, color: '#1E4DB7' },
  { name: 'Search', value: 25, visits: 2500, color: '#F59A23' },
  { name: 'Social', value: 20, visits: 2000, color: '#10B981' },
  { name: 'Referral', value: 10, visits: 1000, color: '#8B5CF6' },
  { name: 'Email', value: 5, visits: 500, color: '#EC4899' },
];

const funnelSteps = [
  { label: 'Views', value: 10000, width: 100 },
  { label: 'Add to Cart', value: 2500, width: 70 },
  { label: 'Checkout', value: 1000, width: 45 },
  { label: 'Purchase', value: 750, width: 30 },
];

const funnelConversions = ['25%', '40%', '75%'];

const deviceData = [
  { name: 'Desktop', value: 65, icon: Monitor, color: '#1E4DB7' },
  { name: 'Mobile', value: 28, icon: Smartphone, color: '#F59A23' },
  { name: 'Tablet', value: 7, icon: Tablet, color: '#10B981' },
];

const geographicData = [
  { country: 'United States', flag: '🇺🇸', percentage: 45 },
  { country: 'United Kingdom', flag: '🇬🇧', percentage: 15 },
  { country: 'Canada', flag: '🇨🇦', percentage: 10 },
  { country: 'Germany', flag: '🇩🇪', percentage: 8 },
  { country: 'France', flag: '🇫🇷', percentage: 6 },
  { country: 'Australia', flag: '🇦🇺', percentage: 5 },
  { country: 'India', flag: '🇮🇳', percentage: 4 },
  { country: 'Japan', flag: '🇯🇵', percentage: 3 },
];

function generateHeatmapData(): number[][] {
  const days = 7;
  const hours = 24;
  const data: number[][] = [];
  for (let d = 0; d < days; d++) {
    const row: number[] = [];
    for (let h = 0; h < hours; h++) {
      // Simulate higher activity during business hours and weekdays
      const isWeekday = d < 5;
      const isBusinessHour = h >= 9 && h <= 17;
      const isPeakHour = h >= 10 && h <= 14;
      let base = Math.random() * 3;
      if (isWeekday) base += 2;
      if (isBusinessHour) base += 3;
      if (isPeakHour) base += 2;
      row.push(Math.round(base));
    }
    data.push(row);
  }
  return data;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hourLabels = Array.from({ length: 24 }, (_, i) => i);

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Card Wrapper ───────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── Custom Tooltip Components ──────────────────────────────────────────────

function ProductTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-white mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs text-neutral-300">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
        </p>
      ))}
    </div>
  );
}

function TrafficTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-white">{data.name}</p>
      <p className="text-xs text-neutral-300 mt-1">
        {data.value}% &middot; {data.visits.toLocaleString()} visits
      </p>
    </div>
  );
}

function DeviceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-white">{data.name}</p>
      <p className="text-xs text-neutral-300 mt-1">{data.value}% of traffic</p>
    </div>
  );
}

// ─── Custom Pie Label ───────────────────────────────────────────────────────

function renderTrafficLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800" />
          <Skeleton className="h-4 w-64 mt-2 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <Skeleton className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-80 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <Skeleton className="h-80 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <Skeleton className="h-72 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
    </div>
  );
}

// ─── Heatmap Cell Color ─────────────────────────────────────────────────────

function getHeatmapColor(value: number, max: number): string {
  const intensity = value / max;
  if (intensity < 0.15) return 'bg-[#1E4DB7]/5';
  if (intensity < 0.3) return 'bg-[#1E4DB7]/10';
  if (intensity < 0.45) return 'bg-[#1E4DB7]/20';
  if (intensity < 0.6) return 'bg-[#1E4DB7]/35';
  if (intensity < 0.75) return 'bg-[#1E4DB7]/50';
  if (intensity < 0.9) return 'bg-[#1E4DB7]/75';
  return 'bg-[#1E4DB7]';
}

// ─── Summary Stats ──────────────────────────────────────────────────────────

const summaryByRange: Record<DateRange, { views: number; sales: number; conversion: number }> = {
  '7d': { views: 2400, sales: 180, conversion: 7.5 },
  '30d': { views: 10000, sales: 750, conversion: 7.5 },
  '90d': { views: 28500, sales: 2100, conversion: 7.4 },
  '1y': { views: 120000, sales: 8900, conversion: 7.4 },
};

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SellerAnalyticsPage() {
  const { data: earnings, isLoading } = useSellerEarnings();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const heatmapMax = useMemo(
    () => Math.max(...heatmapData.flat()),
    [heatmapData],
  );

  const summary = summaryByRange[dateRange];

  const totalDeviceViews = useMemo(
    () => deviceData.reduce((sum, d) => sum + d.value, 0),
    [],
  );

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── 1. Page Header ─────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#1E4DB7]" />
            Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {summary.views.toLocaleString()} total views &bull;{' '}
            {summary.sales.toLocaleString()} sales &bull; {summary.conversion}%
            conversion
          </p>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                dateRange === range
                  ? 'bg-[#1E4DB7] text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── 2. Product Performance Comparison (Full Width) ─────────────── */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Product Performance
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Revenue and sales by product
            </p>
          </div>
          <Badge className="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 border-0">
            <TrendingUp className="h-3 w-3 mr-1" />
            {dateRange}
          </Badge>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productPerformanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-neutral-400 dark:text-neutral-500"
                tickFormatter={(value: string) =>
                  value.length > 12 ? `${value.slice(0, 12)}...` : value
                }
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-neutral-400 dark:text-neutral-500"
                tickFormatter={(v: number) => `$${v}`}
              />
              <YAxis
                yAxisId="sales"
                orientation="right"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-neutral-400 dark:text-neutral-500"
              />
              <Tooltip content={<ProductTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Revenue"
                fill="#1E4DB7"
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
              <Bar
                yAxisId="sales"
                dataKey="sales"
                name="Sales"
                fill="#F59A23"
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* ─── 3 + 4. Traffic Sources + Conversion Funnel (Side by Side) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Traffic Sources */}
        <GlassCard>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Traffic Sources
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Where your visitors come from
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-64 w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    dataKey="value"
                    label={renderTrafficLabel}
                    labelLine={false}
                    strokeWidth={2}
                    stroke="transparent"
                  >
                    {trafficSourcesData.map((entry, index) => (
                      <Cell key={`traffic-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<TrafficTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {trafficSourcesData.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {source.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {source.visits.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 w-10 text-right">
                      {source.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* 4. Conversion Funnel */}
        <GlassCard>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Conversion Funnel
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              From views to purchase
            </p>
          </div>
          <div className="flex flex-col items-center gap-0 py-2">
            {funnelSteps.map((step, index) => (
              <div key={step.label} className="w-full flex flex-col items-center">
                {/* Funnel bar */}
                <div
                  className="relative flex items-center justify-center py-3 rounded-lg transition-all"
                  style={{
                    width: `${step.width}%`,
                    background: `linear-gradient(135deg, ${
                      index === 0
                        ? '#1E4DB7'
                        : index === 1
                          ? '#2A5BC4'
                          : index === 2
                            ? '#3569D1'
                            : '#143A8F'
                    }, ${
                      index === 0
                        ? '#2A5BC4'
                        : index === 1
                          ? '#3569D1'
                          : index === 2
                            ? '#143A8F'
                            : '#0F2D6E'
                    })`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {step.label}
                    </span>
                    <span className="text-white/80 text-xs">
                      ({step.value.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Conversion rate between steps */}
                {index < funnelSteps.length - 1 && (
                  <div className="flex items-center gap-1.5 py-2">
                    <ArrowRight className="h-3 w-3 text-[#F59A23] rotate-90" />
                    <span className="text-xs font-bold text-[#F59A23]">
                      {funnelConversions[index]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ─── 5 + 6. Device Breakdown + Geographic Breakdown (Side by Side) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Device Breakdown (Donut) */}
        <GlassCard>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Device Breakdown
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              How visitors access your store
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-56 w-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="transparent"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`device-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DeviceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {totalDeviceViews}%
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total Views
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {deviceData.map((device) => {
                const Icon = device.icon;
                return (
                  <div key={device.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          className="h-4 w-4"
                          style={{ color: device.color }}
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {device.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {device.value}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${device.value}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: device.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* 6. Geographic Breakdown */}
        <GlassCard>
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#1E4DB7]" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Geographic Breakdown
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Top countries by traffic
            </p>
          </div>
          <div className="space-y-3">
            {geographicData.map((geo, index) => (
              <div key={geo.country} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0 w-7 text-center">
                  {geo.flag}
                </span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300 w-28 flex-shrink-0 truncate">
                  {geo.country}
                </span>
                <div className="flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${geo.percentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1 * index,
                      ease: 'easeOut',
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #1E4DB7, #3569D1)`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white w-10 text-right flex-shrink-0">
                  {geo.percentage}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ─── 7. Time-of-Day Heatmap (Full Width) ─────────────────────────── */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1E4DB7]" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Peak Sales Times
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Sales volume by day and hour
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Low
            </span>
            <div className="flex gap-0.5">
              {[5, 10, 20, 35, 50, 75, 100].map((opacity) => (
                <div
                  key={opacity}
                  className="w-4 h-3 rounded-sm"
                  style={{
                    backgroundColor: `rgba(30, 77, 183, ${opacity / 100})`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              High
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Hour labels */}
            <div className="flex items-center mb-1">
              <div className="w-12 flex-shrink-0" />
              <div
                className="flex-1 grid gap-px"
                style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
              >
                {hourLabels.map((h) => (
                  <div
                    key={h}
                    className="text-center text-[10px] text-neutral-400 dark:text-neutral-500"
                  >
                    {h % 6 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap rows */}
            {heatmapData.map((row, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-px">
                <div className="w-12 flex-shrink-0 text-xs text-neutral-500 dark:text-neutral-400 font-medium pr-2 text-right">
                  {dayLabels[dayIndex]}
                </div>
                <div
                  className="flex-1 grid gap-px"
                  style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                >
                  {row.map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={cn(
                        'aspect-[2/1] rounded-sm transition-colors',
                        getHeatmapColor(value, heatmapMax),
                      )}
                      title={`${dayLabels[dayIndex]} ${hourIndex}:00 - ${value} sales`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
