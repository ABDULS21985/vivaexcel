"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import { PieChart } from "@/components/charts/pie-chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Eye,
    Users,
    Clock,
    TrendingDown,
    ArrowRight,
} from "lucide-react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import {
    useAnalyticsDashboard,
    useTopPosts,
    useTrafficSources,
} from "@/hooks/use-analytics";

// Default colors for traffic source pie chart slices
const TRAFFIC_SOURCE_COLORS = [
    "#1E4DB7",
    "#F59A23",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#84CC16",
];

// Format large numbers into compact strings (e.g. 45200 -> "45.2K")
function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

// Custom tooltip for bar chart
function BarChartTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                    {label}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Views: {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
}

// Skeleton placeholder for loading states
function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className ?? ""}`}
        />
    );
}

// Error banner component
function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">
                {message}
            </p>
        </div>
    );
}

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = React.useState("30d");

    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError,
    } = useAnalyticsDashboard();

    const {
        data: topPostsData,
        isLoading: isTopPostsLoading,
        error: topPostsError,
    } = useTopPosts(dateRange);

    const {
        data: trafficSourcesData,
        isLoading: isTrafficSourcesLoading,
        error: trafficSourcesError,
    } = useTrafficSources(dateRange);

    // Map top posts for the bar chart (needs { name, views })
    const topPostsChartData = React.useMemo(
        () =>
            (topPostsData ?? []).map((post) => ({
                name: post.title,
                views: post.views,
            })),
        [topPostsData],
    );

    // Map traffic sources for the pie chart (needs { name, value, color? })
    const trafficSourcesPieData = React.useMemo(
        () =>
            (trafficSourcesData ?? []).map((source, index) => ({
                name: source.source,
                value: source.visits,
                color: TRAFFIC_SOURCE_COLORS[index % TRAFFIC_SOURCE_COLORS.length],
            })),
        [trafficSourcesData],
    );

    // Map popular posts for the table from the dashboard overview
    const recentPopularPosts = React.useMemo(
        () =>
            (dashboardData?.popularPosts ?? []).map((post) => ({
                title: post.title,
                views: post.views,
                completion: 0,
                shares: 0,
            })),
        [dashboardData],
    );

    // Build a synthetic views-over-time dataset from popular posts
    // The API doesn't return time-series views data at the dashboard level,
    // so we show the popular posts as chart data points instead.
    const viewsChartData = React.useMemo(
        () =>
            (dashboardData?.popularPosts ?? []).map((post) => ({
                date: post.title.length > 20 ? post.title.slice(0, 20) + "..." : post.title,
                value: post.views,
            })),
        [dashboardData],
    );

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Analytics"
                description="Track your blog performance and audience insights"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Analytics" },
                ]}
                actions={
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                {dashboardError ? (
                    <ErrorBanner message="Failed to load analytics overview. Please try again later." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isDashboardLoading ? (
                            <>
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                            </>
                        ) : (
                            <>
                                <StatsCard
                                    title="Total Views"
                                    value={formatCompactNumber(dashboardData?.totalViews ?? 0)}
                                    icon={<Eye className="h-5 w-5" />}
                                    trend={{ value: 0, label: "vs last period" }}
                                    variant="primary"
                                />
                                <StatsCard
                                    title="Unique Visitors"
                                    value={formatCompactNumber(dashboardData?.uniqueVisitors ?? 0)}
                                    icon={<Users className="h-5 w-5" />}
                                    trend={{ value: 0, label: "vs last period" }}
                                    variant="success"
                                />
                                <StatsCard
                                    title="Avg Read Time"
                                    value="--"
                                    icon={<Clock className="h-5 w-5" />}
                                    variant="warning"
                                />
                                <StatsCard
                                    title="Bounce Rate"
                                    value="--"
                                    icon={<TrendingDown className="h-5 w-5" />}
                                    variant="default"
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Views Over Time */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    {isDashboardLoading ? (
                        <SkeletonBlock className="h-[350px] w-full" />
                    ) : dashboardError ? (
                        <ErrorBanner message="Failed to load views chart." />
                    ) : (
                        <AnalyticsChart
                            data={viewsChartData}
                            title="Views Over Time"
                            color="#1E4DB7"
                            height={350}
                        />
                    )}
                </div>

                {/* Bar Chart + Pie Chart Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Posts Bar Chart */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                            Top 10 Posts by Views
                        </h3>
                        {isTopPostsLoading ? (
                            <SkeletonBlock className="h-[350px] w-full" />
                        ) : topPostsError ? (
                            <ErrorBanner message="Failed to load top posts." />
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <RechartsBarChart
                                    data={topPostsChartData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="currentColor"
                                        className="text-zinc-200 dark:text-zinc-700"
                                        opacity={0.5}
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="currentColor"
                                        className="text-zinc-500 dark:text-zinc-400"
                                        tickFormatter={(value) => value.toLocaleString()}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="currentColor"
                                        className="text-zinc-500 dark:text-zinc-400"
                                        width={120}
                                    />
                                    <Tooltip content={<BarChartTooltip />} />
                                    <Bar
                                        dataKey="views"
                                        fill="#1E4DB7"
                                        radius={[0, 4, 4, 0]}
                                        animationDuration={1500}
                                    />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Traffic Sources Pie Chart */}
                    {isTrafficSourcesLoading ? (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                                Traffic Sources
                            </h3>
                            <SkeletonBlock className="h-[350px] w-full" />
                        </div>
                    ) : trafficSourcesError ? (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                                Traffic Sources
                            </h3>
                            <ErrorBanner message="Failed to load traffic sources." />
                        </div>
                    ) : (
                        <PieChart
                            data={trafficSourcesPieData}
                            title="Traffic Sources"
                            height={350}
                            interactive
                        />
                    )}
                </div>

                {/* Recent Popular Posts Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Recent Popular Posts
                        </h3>
                        <Link
                            href="/blog"
                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {isDashboardLoading ? (
                        <div className="p-6 space-y-3">
                            <SkeletonBlock className="h-10 w-full" />
                            <SkeletonBlock className="h-10 w-full" />
                            <SkeletonBlock className="h-10 w-full" />
                            <SkeletonBlock className="h-10 w-full" />
                            <SkeletonBlock className="h-10 w-full" />
                        </div>
                    ) : dashboardError ? (
                        <div className="p-6">
                            <ErrorBanner message="Failed to load popular posts." />
                        </div>
                    ) : recentPopularPosts.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
                            No popular posts data available.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Post Title
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Read Completion
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Shares
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {recentPopularPosts.map((post, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {post.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                {post.views.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${post.completion}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {post.completion}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                {post.shares}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
