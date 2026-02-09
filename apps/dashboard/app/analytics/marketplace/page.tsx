"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@ktblog/ui/components";
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Percent,
    BarChart3,
    Loader2,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
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
    usePlatformOverview,
    usePlatformRevenue,
    useTopProducts,
    useCategoryRevenue,
    useMarketplaceTrafficSources,
    useDeviceBreakdown,
    type Period,
} from "@/hooks/use-marketplace-analytics";

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: Period }[] = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "1y", value: "1y" },
];

const CATEGORY_COLORS = [
    "#1E4DB7",
    "#F59A23",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#84CC16",
    "#06B6D4",
    "#EF4444",
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
        <div
            className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className ?? ""}`}
        />
    );
}

function KPICardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="space-y-3 animate-pulse">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
            </div>
        </div>
    );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const chartData = data.map((value, index) => ({ index, value }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={chartData}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

function KPICard({
    title,
    value,
    change,
    sparklineData,
    sparklineColor,
    icon,
    iconBg,
}: {
    title: string;
    value: string;
    change: number;
    sparklineData: number[];
    sparklineColor: string;
    icon: React.ReactNode;
    iconBg: string;
}) {
    const isPositive = change >= 0;
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {title}
                </p>
                <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {value}
            </p>
            {sparklineData.length > 0 && (
                <div className="mb-2">
                    <MiniSparkline data={sparklineData} color={sparklineColor} />
                </div>
            )}
            <div className="flex items-center gap-1">
                {isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                    className={`text-xs font-semibold ${
                        isPositive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {isPositive ? "+" : ""}
                    {change.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    vs prior period
                </span>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    children,
    className,
    actions,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 ${className || ""}`}>
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
                {actions}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="text-center py-12">
            <div className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600">{icon}</div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        </div>
    );
}

// ─── Custom Tooltips ────────────────────────────────────────────────────────

function RevenueChartTooltip({ active, payload, label }: any) {
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
                                : entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

function CategoryTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-3">
                <p className="text-xs font-medium text-white mb-1">{data.category}</p>
                <p className="text-xs text-zinc-400">
                    {formatCurrency(data.revenue)} ({data.percentage.toFixed(1)}%)
                </p>
            </div>
        );
    }
    return null;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MarketplaceAnalyticsPage() {
    const [period, setPeriod] = React.useState<Period>("30d");

    // ─── Queries ────────────────────────────────────────────────────────
    const {
        data: overview,
        isLoading: isLoadingOverview,
        error: overviewError,
    } = usePlatformOverview(period);

    const {
        data: revenueData,
        isLoading: isLoadingRevenue,
    } = usePlatformRevenue(period, "day");

    const {
        data: topProducts,
        isLoading: isLoadingProducts,
    } = useTopProducts(period, 10);

    const {
        data: categoryData,
        isLoading: isLoadingCategories,
    } = useCategoryRevenue(period);

    const {
        data: trafficData,
        isLoading: isLoadingTraffic,
    } = useMarketplaceTrafficSources(period);

    const {
        data: deviceData,
        isLoading: isLoadingDevices,
    } = useDeviceBreakdown(period);

    // ─── Sort state for top products ────────────────────────────────────
    const [sortColumn, setSortColumn] = React.useState<"revenue" | "views" | "conversionRate">("revenue");
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

    const sortedProducts = React.useMemo(() => {
        if (!topProducts) return [];
        return [...topProducts].sort((a, b) => {
            const multiplier = sortDirection === "desc" ? -1 : 1;
            return (a[sortColumn] - b[sortColumn]) * multiplier;
        });
    }, [topProducts, sortColumn, sortDirection]);

    const handleSort = (column: "revenue" | "views" | "conversionRate") => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
        } else {
            setSortColumn(column);
            setSortDirection("desc");
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) return null;
        return sortDirection === "desc" ? (
            <TrendingDown className="h-3 w-3 inline ml-1" />
        ) : (
            <TrendingUp className="h-3 w-3 inline ml-1" />
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Marketplace Analytics"
                description="Monitor marketplace performance, revenue, and product insights"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Analytics", href: "/analytics" },
                    { label: "Marketplace" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/analytics/marketplace/funnel">
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Funnel
                            </Button>
                        </Link>
                        <Link href="/analytics/marketplace/revenue">
                            <Button variant="outline" size="sm">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Revenue Reports
                            </Button>
                        </Link>
                    </div>
                }
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

                {/* KPI Cards */}
                {overviewError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            Failed to load overview metrics. Please try again later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoadingOverview ? (
                            <>
                                <KPICardSkeleton />
                                <KPICardSkeleton />
                                <KPICardSkeleton />
                                <KPICardSkeleton />
                            </>
                        ) : overview ? (
                            <>
                                <KPICard
                                    title="Total Revenue"
                                    value={formatCurrency(overview.totalRevenue)}
                                    change={overview.revenueChange}
                                    sparklineData={overview.revenueSparkline}
                                    sparklineColor="#1E4DB7"
                                    icon={<DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                                />
                                <KPICard
                                    title="Total Orders"
                                    value={formatNumber(overview.totalOrders)}
                                    change={overview.ordersChange}
                                    sparklineData={overview.ordersSparkline}
                                    sparklineColor="#F59A23"
                                    icon={<ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                                    iconBg="bg-orange-100 dark:bg-orange-900/30"
                                />
                                <KPICard
                                    title="Average Order Value"
                                    value={formatCurrency(overview.averageOrderValue)}
                                    change={overview.aovChange}
                                    sparklineData={overview.aovSparkline}
                                    sparklineColor="#10B981"
                                    icon={<TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                                />
                                <KPICard
                                    title="Conversion Rate"
                                    value={`${overview.conversionRate.toFixed(2)}%`}
                                    change={overview.conversionChange}
                                    sparklineData={overview.conversionSparkline}
                                    sparklineColor="#8B5CF6"
                                    icon={<Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                                />
                            </>
                        ) : null}
                    </div>
                )}

                {/* Revenue Chart */}
                <SectionCard title="Revenue & Orders Over Time">
                    {isLoadingRevenue ? (
                        <SkeletonBlock className="h-[350px] w-full" />
                    ) : revenueData && revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                    yAxisId="revenue"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <YAxis
                                    yAxisId="orders"
                                    orientation="right"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<RevenueChartTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }}
                                />
                                <Area
                                    yAxisId="revenue"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#1E4DB7"
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="orders"
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    stroke="#F59A23"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState
                            icon={<BarChart3 className="h-8 w-8" />}
                            message="No revenue data available for this period."
                        />
                    )}
                </SectionCard>

                {/* Two-Column: Top Products & Category Revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 10 Products Table */}
                    <SectionCard title="Top 10 Products">
                        {isLoadingProducts ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="h-4 w-6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <div className="overflow-x-auto -mx-5 px-5">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                            <th className="text-left pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-10">
                                                #
                                            </th>
                                            <th className="text-left pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th
                                                className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                                                onClick={() => handleSort("views")}
                                            >
                                                Views <SortIcon column="views" />
                                            </th>
                                            <th
                                                className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                                                onClick={() => handleSort("revenue")}
                                            >
                                                Revenue <SortIcon column="revenue" />
                                            </th>
                                            <th
                                                className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                                                onClick={() => handleSort("conversionRate")}
                                            >
                                                Conv. <SortIcon column="conversionRate" />
                                            </th>
                                            <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-20">
                                                Trend
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                        {sortedProducts.map((product, index) => (
                                            <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                <td className="py-2.5">
                                                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="py-2.5">
                                                    <Link
                                                        href={`/analytics/marketplace/product/${product.id}`}
                                                        className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors truncate max-w-[180px] block"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {formatNumber(product.views)}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {formatCurrency(product.revenue)}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {product.conversionRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-2.5">
                                                    {product.sparkline.length > 0 && (
                                                        <div className="w-16 h-6 ml-auto">
                                                            <MiniSparkline data={product.sparkline} color="#1E4DB7" />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                icon={<ShoppingCart className="h-8 w-8" />}
                                message="No product data available for this period."
                            />
                        )}
                    </SectionCard>

                    {/* Revenue by Category */}
                    <SectionCard title="Revenue by Category">
                        {isLoadingCategories ? (
                            <SkeletonBlock className="h-[300px] w-full" />
                        ) : categoryData && categoryData.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="revenue"
                                            nameKey="category"
                                        >
                                            {categoryData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CategoryTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full">
                                    {categoryData.map((cat, index) => (
                                        <div key={cat.category} className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                                            />
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                                {cat.category}
                                            </span>
                                            <span className="text-xs font-medium text-zinc-900 dark:text-white ml-auto">
                                                {formatCurrency(cat.revenue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={<BarChart3 className="h-8 w-8" />}
                                message="No category data available for this period."
                            />
                        )}
                    </SectionCard>
                </div>

                {/* Bottom Row: Traffic Sources & Device Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Traffic Sources */}
                    <SectionCard title="Traffic Sources">
                        {isLoadingTraffic ? (
                            <SkeletonBlock className="h-[280px] w-full" />
                        ) : trafficData && trafficData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={trafficData}
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
                                        formatter={(value: number) => [formatNumber(value), "Visits"]}
                                    />
                                    <Bar
                                        dataKey="visits"
                                        fill="#1E4DB7"
                                        radius={[0, 4, 4, 0]}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                icon={<BarChart3 className="h-8 w-8" />}
                                message="No traffic source data available for this period."
                            />
                        )}
                    </SectionCard>

                    {/* Device Breakdown */}
                    <SectionCard title="Device Breakdown">
                        {isLoadingDevices ? (
                            <SkeletonBlock className="h-[280px] w-full" />
                        ) : deviceData && deviceData.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="count"
                                            nameKey="device"
                                        >
                                            {deviceData.map((_, index) => (
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
                                            formatter={(value: number, _name: string, entry: any) => [
                                                `${value.toLocaleString()} (${entry.payload.percentage.toFixed(1)}%)`,
                                                entry.payload.device,
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex items-center gap-6 mt-4">
                                    {deviceData.map((device, index) => (
                                        <div key={device.device} className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                                            />
                                            <div className="text-center">
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
                            <EmptyState
                                icon={<BarChart3 className="h-8 w-8" />}
                                message="No device data available for this period."
                            />
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
