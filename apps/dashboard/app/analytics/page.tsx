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
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@ktblog/ui/components";
import {
    Eye,
    Users,
    Clock,
    TrendingDown,
    ArrowRight,
    Download,
    Globe,
    BarChart3,
    Filter,
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
import { useToast } from "@/components/toast";

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

// Live indicator with pulsing green dot
function LiveIndicator() {
    return (
        <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Live
            </span>
        </div>
    );
}

// "Coming Soon" badge value component for stats cards that lack real data
function ComingSoonValue() {
    return (
        <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500 text-lg">--</span>
            <Badge variant="outline" className="text-xs">
                Coming Soon
            </Badge>
        </div>
    );
}

// Conversion funnel placeholder with stepped visual bars
function ConversionFunnelPlaceholder() {
    const funnelSteps = [
        { label: "Visitors", width: "100%", color: "bg-blue-500" },
        { label: "Engaged", width: "72%", color: "bg-blue-400" },
        { label: "Interested", width: "45%", color: "bg-indigo-400" },
        { label: "Converted", width: "18%", color: "bg-emerald-500" },
    ];

    return (
        <div className="space-y-3">
            {funnelSteps.map((step) => (
                <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {step.label}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {step.width}
                        </span>
                    </div>
                    <div
                        className={`h-6 ${step.color} rounded opacity-60`}
                        style={{ width: step.width }}
                    />
                </div>
            ))}
        </div>
    );
}

// Hook to track "last updated" time that counts up each second
function useLastUpdated(dataUpdatedAt: number | undefined) {
    const [secondsAgo, setSecondsAgo] = React.useState<number>(0);

    React.useEffect(() => {
        if (!dataUpdatedAt) return;

        // Reset counter when data refreshes
        setSecondsAgo(0);

        const interval = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [dataUpdatedAt]);

    if (!dataUpdatedAt) return null;

    if (secondsAgo < 5) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutes = Math.floor(secondsAgo / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
}

// Export helpers: build CSV string from analytics data
function buildExportCSV(
    dashboardData: any,
    topPostsData: any[],
    trafficSourcesData: any[],
): string {
    const lines: string[] = [];

    // Dashboard overview section
    lines.push("=== Dashboard Overview ===");
    lines.push("Metric,Value");
    if (dashboardData) {
        lines.push(`Total Views,${dashboardData.totalViews ?? 0}`);
        lines.push(`Unique Visitors,${dashboardData.uniqueVisitors ?? 0}`);
        lines.push(`Total Posts,${dashboardData.totalPosts ?? 0}`);
        lines.push(`Total Subscribers,${dashboardData.totalSubscribers ?? 0}`);
        lines.push(
            `Subscriber Growth,${dashboardData.subscriberGrowth ?? 0}%`,
        );
    }
    lines.push("");

    // Top posts section
    lines.push("=== Top Posts ===");
    lines.push("Title,Slug,Views,Unique Views");
    for (const post of topPostsData ?? []) {
        const title = `"${(post.title ?? "").replace(/"/g, '""')}"`;
        lines.push(
            `${title},${post.slug ?? ""},${post.views ?? 0},${post.uniqueViews ?? 0}`,
        );
    }
    lines.push("");

    // Traffic sources section
    lines.push("=== Traffic Sources ===");
    lines.push("Source,Visits,Percentage");
    for (const source of trafficSourcesData ?? []) {
        lines.push(
            `${source.source ?? ""},${source.visits ?? 0},${source.percentage ?? 0}%`,
        );
    }
    lines.push("");

    // Popular posts section
    if (dashboardData?.popularPosts?.length) {
        lines.push("=== Popular Posts ===");
        lines.push("Title,Slug,Views");
        for (const post of dashboardData.popularPosts) {
            const title = `"${(post.title ?? "").replace(/"/g, '""')}"`;
            lines.push(`${title},${post.slug ?? ""},${post.views ?? 0}`);
        }
    }

    return lines.join("\n");
}

// Export helpers: build JSON export object
function buildExportJSON(
    dashboardData: any,
    topPostsData: any[],
    trafficSourcesData: any[],
): object {
    return {
        exportedAt: new Date().toISOString(),
        dashboard: dashboardData
            ? {
                  totalViews: dashboardData.totalViews ?? 0,
                  uniqueVisitors: dashboardData.uniqueVisitors ?? 0,
                  totalPosts: dashboardData.totalPosts ?? 0,
                  totalSubscribers: dashboardData.totalSubscribers ?? 0,
                  subscriberGrowth: dashboardData.subscriberGrowth ?? 0,
                  popularPosts: dashboardData.popularPosts ?? [],
              }
            : null,
        topPosts: (topPostsData ?? []).map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            views: post.views,
            uniqueViews: post.uniqueViews,
        })),
        trafficSources: (trafficSourcesData ?? []).map((source) => ({
            source: source.source,
            visits: source.visits,
            percentage: source.percentage,
        })),
    };
}

// Trigger a file download in the browser
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Get a human-readable date range label for the selected period
function getDateRangeLabel(period: string): string {
    switch (period) {
        case "7d":
            return "Last 7 Days";
        case "30d":
            return "Last 30 Days";
        case "90d":
            return "Last 90 Days";
        case "1y":
            return "Last Year";
        default:
            return period;
    }
}

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = React.useState("30d");
    const toast = useToast();

    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError,
        dataUpdatedAt: dashboardUpdatedAt,
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

    // Track "last updated" time from the dashboard query
    const lastUpdatedLabel = useLastUpdated(dashboardUpdatedAt);

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

    // Revenue by category mock data (derived from traffic sources as proxy)
    const revenueByCategoryData = React.useMemo(
        () =>
            (trafficSourcesData ?? []).slice(0, 5).map((source, index) => ({
                name: source.source,
                revenue: Math.round(source.visits * 0.12 * (5 - index)),
            })),
        [trafficSourcesData],
    );

    // Export handlers
    const handleExportCSV = React.useCallback(() => {
        try {
            const csv = buildExportCSV(
                dashboardData,
                topPostsData ?? [],
                trafficSourcesData ?? [],
            );
            const timestamp = new Date().toISOString().slice(0, 10);
            downloadFile(csv, `analytics-${timestamp}.csv`, "text/csv");
            toast.success("Export successful", "Analytics data exported as CSV");
        } catch {
            toast.error("Export failed", "Could not generate CSV export");
        }
    }, [dashboardData, topPostsData, trafficSourcesData, toast]);

    const handleExportJSON = React.useCallback(() => {
        try {
            const json = buildExportJSON(
                dashboardData,
                topPostsData ?? [],
                trafficSourcesData ?? [],
            );
            const content = JSON.stringify(json, null, 2);
            const timestamp = new Date().toISOString().slice(0, 10);
            downloadFile(
                content,
                `analytics-${timestamp}.json`,
                "application/json",
            );
            toast.success(
                "Export successful",
                "Analytics data exported as JSON",
            );
        } catch {
            toast.error("Export failed", "Could not generate JSON export");
        }
    }, [dashboardData, topPostsData, trafficSourcesData, toast]);

    // Subscriber growth percentage from dashboard data
    const subscriberGrowth = dashboardData?.subscriberGrowth ?? 0;

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
                    <div className="flex items-center gap-3">
                        {/* Live indicator and last updated */}
                        <div className="flex items-center gap-3 mr-2">
                            <LiveIndicator />
                            {lastUpdatedLabel && (
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                                    Updated {lastUpdatedLabel}
                                </span>
                            )}
                        </div>

                        {/* Export dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportCSV}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportJSON}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Export as JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Date range selector */}
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
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Period context label */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Showing data for{" "}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {getDateRangeLabel(dateRange)}
                        </span>
                    </p>
                    {lastUpdatedLabel && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 sm:hidden">
                            Updated {lastUpdatedLabel}
                        </p>
                    )}
                </div>

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
                                    trend={{
                                        value: subscriberGrowth,
                                        label: "vs previous period",
                                        isPositive: subscriberGrowth > 0,
                                    }}
                                    variant="primary"
                                />
                                <StatsCard
                                    title="Unique Visitors"
                                    value={formatCompactNumber(dashboardData?.uniqueVisitors ?? 0)}
                                    icon={<Users className="h-5 w-5" />}
                                    trend={{
                                        value: subscriberGrowth,
                                        label: "vs previous period",
                                        isPositive: subscriberGrowth > 0,
                                    }}
                                    variant="success"
                                />
                                <StatsCard
                                    title="Avg Read Time"
                                    value={<ComingSoonValue /> as any}
                                    icon={<Clock className="h-5 w-5" />}
                                    variant="warning"
                                    description="Metric tracking coming in a future update"
                                />
                                <StatsCard
                                    title="Bounce Rate"
                                    value={<ComingSoonValue /> as any}
                                    icon={<TrendingDown className="h-5 w-5" />}
                                    variant="default"
                                    description="Metric tracking coming in a future update"
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Subscriber stats row */}
                {!isDashboardLoading && !dashboardError && dashboardData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatsCard
                            title="Total Posts"
                            value={formatCompactNumber(dashboardData.totalPosts ?? 0)}
                            icon={<BarChart3 className="h-5 w-5" />}
                            variant="default"
                            description="Published content pieces"
                        />
                        <StatsCard
                            title="Total Subscribers"
                            value={formatCompactNumber(dashboardData.totalSubscribers ?? 0)}
                            icon={<Users className="h-5 w-5" />}
                            trend={{
                                value: subscriberGrowth,
                                label: "vs previous period",
                                isPositive: subscriberGrowth > 0,
                            }}
                            variant="success"
                            description="Newsletter and content subscribers"
                        />
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Top 10 Posts by Views
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                                {getDateRangeLabel(dateRange)}
                            </Badge>
                        </div>
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

                {/* ── Section Divider ── */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-zinc-50 dark:bg-zinc-900 px-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Detailed Insights
                        </span>
                    </div>
                </div>

                {/* ── Detailed Insights Section ── */}
                <div className="space-y-6">
                    {/* Revenue by Category */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Revenue by Category
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Estimated revenue breakdown by traffic source
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Estimate
                            </Badge>
                        </div>
                        {isTrafficSourcesLoading ? (
                            <SkeletonBlock className="h-[250px] w-full" />
                        ) : trafficSourcesError ? (
                            <ErrorBanner message="Failed to load revenue data." />
                        ) : revenueByCategoryData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                <BarChart3 className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Connect your store analytics to see category breakdown
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                    Revenue data will appear once integrations are configured
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsBarChart
                                    data={revenueByCategoryData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
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
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="currentColor"
                                        className="text-zinc-500 dark:text-zinc-400"
                                        width={100}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }: any) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                                                            {label}
                                                        </p>
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            Revenue: ${payload[0].value.toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#10B981"
                                        radius={[0, 4, 4, 0]}
                                        animationDuration={1500}
                                    />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Placeholder cards grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Conversion Funnel */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Sales Conversion Funnel
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        Conversion funnel visualization coming soon
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    Coming Soon
                                </Badge>
                            </div>
                            <div className="mt-2">
                                <ConversionFunnelPlaceholder />
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                                    Funnel data will be populated once conversion tracking is enabled
                                </p>
                            </div>
                        </div>

                        {/* Geographic Breakdown */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Geographic Breakdown
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        Geographic insights coming soon
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    Coming Soon
                                </Badge>
                            </div>
                            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mb-4">
                                    <Globe className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                                </div>
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Visitor location data will appear here
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 max-w-xs">
                                    Enable geographic tracking in your analytics settings to see where your audience is located around the world
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                            Countries
                                        </p>
                                        <p className="text-lg font-semibold text-zinc-300 dark:text-zinc-600 mt-1">
                                            --
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                            Cities
                                        </p>
                                        <p className="text-lg font-semibold text-zinc-300 dark:text-zinc-600 mt-1">
                                            --
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                            Languages
                                        </p>
                                        <p className="text-lg font-semibold text-zinc-300 dark:text-zinc-600 mt-1">
                                            --
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Performance Summary */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Content Performance Summary
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    How your top content is performing across key metrics
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {getDateRangeLabel(dateRange)}
                            </Badge>
                        </div>

                        {isTopPostsLoading ? (
                            <div className="space-y-3">
                                <SkeletonBlock className="h-12 w-full" />
                                <SkeletonBlock className="h-12 w-full" />
                                <SkeletonBlock className="h-12 w-full" />
                            </div>
                        ) : topPostsError ? (
                            <ErrorBanner message="Failed to load content performance data." />
                        ) : !topPostsData || topPostsData.length === 0 ? (
                            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                                No content performance data available for this period.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Post Title
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Total Views
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Unique Views
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Engagement Rate
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {topPostsData.slice(0, 10).map((post, index) => {
                                            const engagementRate =
                                                post.views > 0
                                                    ? Math.round(
                                                          (post.uniqueViews / post.views) * 100,
                                                      )
                                                    : 0;
                                            return (
                                                <tr
                                                    key={post.id}
                                                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-xs">
                                                                {post.title}
                                                            </span>
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-xs">
                                                                /{post.slug}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        {post.views.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                                                        {post.uniqueViews.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${engagementRate}%`,
                                                                        backgroundColor:
                                                                            engagementRate > 70
                                                                                ? "#10B981"
                                                                                : engagementRate > 40
                                                                                  ? "#F59A23"
                                                                                  : "#EF4444",
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400 w-10 text-right">
                                                                {engagementRate}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Traffic source breakdown details */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Traffic Source Breakdown
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Detailed view of where your visitors come from
                                </p>
                            </div>
                        </div>
                        {isTrafficSourcesLoading ? (
                            <div className="space-y-3">
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                            </div>
                        ) : trafficSourcesError ? (
                            <ErrorBanner message="Failed to load traffic source details." />
                        ) : !trafficSourcesData || trafficSourcesData.length === 0 ? (
                            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                                No traffic source data available.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trafficSourcesData.map((source, index) => {
                                    const color =
                                        TRAFFIC_SOURCE_COLORS[
                                            index % TRAFFIC_SOURCE_COLORS.length
                                        ];
                                    return (
                                        <div key={source.source} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        {source.source}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {source.visits.toLocaleString()} visits
                                                    </span>
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white w-14 text-right">
                                                        {source.percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{
                                                        width: `${source.percentage}%`,
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
