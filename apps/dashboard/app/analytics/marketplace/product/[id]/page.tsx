"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
    Eye,
    Users,
    ShoppingCart,
    DollarSign,
    Percent,
    Package,
    BarChart3,
    Loader2,
} from "lucide-react";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
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
} from "recharts";
import {
    useProductAnalytics,
    useProductTraffic,
    type Period,
} from "@/hooks/use-marketplace-analytics";

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: Period }[] = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "1y", value: "1y" },
];

const TRAFFIC_COLORS = [
    "#1E4DB7",
    "#F59A23",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
];

const DEVICE_COLORS = ["#1E4DB7", "#F59A23", "#10B981"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
}

// ─── Helper Components ──────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className ?? ""}`} />
    );
}

function KPICard({
    title,
    value,
    icon,
    iconBg,
    isLoading,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
    isLoading: boolean;
}) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {isLoading ? (
                            <span className="inline-block w-16 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                        ) : (
                            value
                        )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{title}</p>
                </div>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 ${className || ""}`}>
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function DualAxisTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-3 min-w-[180px]">
                <p className="text-xs font-medium text-zinc-300 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-zinc-400">{entry.name}</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                            {entry.name === "Revenue"
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductAnalyticsPage() {
    const params = useParams();
    const productId = params.id as string;

    const [period, setPeriod] = React.useState<Period>("30d");

    const {
        data: analytics,
        isLoading: isLoadingAnalytics,
        error: analyticsError,
    } = useProductAnalytics(productId, period);

    const {
        data: trafficData,
        isLoading: isLoadingTraffic,
    } = useProductTraffic(productId, period);

    const productName = analytics?.productName || "Product";

    return (
        <div className="min-h-screen">
            <PageHeader
                title={isLoadingAnalytics ? "Product Analytics" : `${productName} - Analytics`}
                description="Detailed performance metrics for this product"
                backHref="/analytics/marketplace"
                backLabel="Back to Marketplace Analytics"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Analytics", href: "/analytics" },
                    { label: "Marketplace", href: "/analytics/marketplace" },
                    { label: isLoadingAnalytics ? "Product" : productName },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Period Selector */}
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 p-1 w-fit">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                period === p.value
                                    ? "bg-primary text-white"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Error State */}
                {analyticsError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            Failed to load product analytics. Please try again later.
                        </p>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <KPICard
                        title="Views"
                        value={formatNumber(analytics?.views ?? 0)}
                        icon={<Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                    <KPICard
                        title="Unique Visitors"
                        value={formatNumber(analytics?.uniqueVisitors ?? 0)}
                        icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        iconBg="bg-purple-100 dark:bg-purple-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                    <KPICard
                        title="Add to Carts"
                        value={formatNumber(analytics?.addToCarts ?? 0)}
                        icon={<ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                        iconBg="bg-orange-100 dark:bg-orange-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                    <KPICard
                        title="Purchases"
                        value={formatNumber(analytics?.purchases ?? 0)}
                        icon={<Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                    <KPICard
                        title="Revenue"
                        value={formatCurrency(analytics?.revenue ?? 0)}
                        icon={<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                    <KPICard
                        title="Conversion Rate"
                        value={`${(analytics?.conversionRate ?? 0).toFixed(2)}%`}
                        icon={<Percent className="h-5 w-5 text-pink-600 dark:text-pink-400" />}
                        iconBg="bg-pink-100 dark:bg-pink-900/30"
                        isLoading={isLoadingAnalytics}
                    />
                </div>

                {/* Views & Revenue Over Time */}
                <SectionCard title="Views & Revenue Over Time">
                    {isLoadingAnalytics ? (
                        <SkeletonBlock className="h-[350px] w-full" />
                    ) : analytics?.viewsOverTime && analytics.viewsOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={analytics.viewsOverTime}>
                                <defs>
                                    <linearGradient id="colorProductViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E4DB7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1E4DB7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="views"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="revenue"
                                    orientation="right"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip content={<DualAxisTooltip />} />
                                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                                <Area
                                    yAxisId="views"
                                    type="monotone"
                                    dataKey="views"
                                    name="Views"
                                    stroke="#1E4DB7"
                                    fill="url(#colorProductViews)"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="revenue"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No time-series data available for this period.
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* Two-Column: Traffic Sources & Device Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Traffic Sources */}
                    <SectionCard title="Traffic Sources">
                        {isLoadingAnalytics ? (
                            <SkeletonBlock className="h-[280px] w-full" />
                        ) : analytics?.trafficSources && analytics.trafficSources.length > 0 ? (
                            <div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart
                                        data={analytics.trafficSources}
                                        layout="vertical"
                                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#374151"
                                            opacity={0.3}
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            stroke="#9CA3AF"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => formatNumber(value)}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="source"
                                            stroke="#9CA3AF"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            width={100}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1F2937",
                                                border: "none",
                                                borderRadius: "8px",
                                                color: "#F9FAFB",
                                            }}
                                            formatter={((value: number | undefined, _: string, entry: any) => [
                                                `${formatNumber(value ?? 0)} (${entry.payload.percentage.toFixed(1)}%)`,
                                                "Visits",
                                            ]) as any}
                                        />
                                        <Bar dataKey="visits" radius={[0, 4, 4, 0]} animationDuration={1500}>
                                            {analytics.trafficSources.map((_, index) => (
                                                <Cell
                                                    key={`traffic-${index}`}
                                                    fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {analytics.trafficSources.map((source, index) => (
                                        <div key={source.source} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }}
                                                />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {source.source}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {formatNumber(source.visits)}
                                                </span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500 w-12 text-right">
                                                    {source.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    No traffic source data available.
                                </p>
                            </div>
                        )}
                    </SectionCard>

                    {/* Device Breakdown */}
                    <SectionCard title="Device Breakdown">
                        {isLoadingAnalytics ? (
                            <SkeletonBlock className="h-[280px] w-full" />
                        ) : analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.deviceBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="count"
                                            nameKey="device"
                                        >
                                            {analytics.deviceBreakdown.map((_, index) => (
                                                <Cell
                                                    key={`device-${index}`}
                                                    fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1F2937",
                                                border: "none",
                                                borderRadius: "8px",
                                                color: "#F9FAFB",
                                            }}
                                            formatter={((value: number | undefined, _name: string, entry: any) => [
                                                `${(value ?? 0).toLocaleString()} (${entry.payload.percentage.toFixed(1)}%)`,
                                                entry.payload.device,
                                            ]) as any}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex items-center gap-6 mt-4">
                                    {analytics.deviceBreakdown.map((device, index) => (
                                        <div key={device.device} className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {device.device}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {device.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    No device data available.
                                </p>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Traffic Over Time */}
                <SectionCard title="Traffic Over Time">
                    {isLoadingTraffic ? (
                        <SkeletonBlock className="h-[280px] w-full" />
                    ) : trafficData && trafficData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorTrafficViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E4DB7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1E4DB7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1F2937",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#F9FAFB",
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    name="Views"
                                    stroke="#1E4DB7"
                                    fill="url(#colorTrafficViews)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="uniqueVisitors"
                                    name="Unique Visitors"
                                    stroke="#8B5CF6"
                                    fill="url(#colorUniqueVisitors)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No traffic data available for this period.
                            </p>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
