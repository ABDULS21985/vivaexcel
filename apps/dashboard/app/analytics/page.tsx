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

// Generate mock data for views over time
function generateViewsData(days: number) {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: Math.floor(Math.random() * 800 + 200),
        });
    }
    return data;
}

const viewsData = generateViewsData(30);

const topPostsData = [
    { name: "React Best Practices", views: 4520 },
    { name: "TypeScript Tips", views: 3800 },
    { name: "Next.js Guide", views: 3200 },
    { name: "CSS Grid Layout", views: 2900 },
    { name: "Node.js Security", views: 2650 },
    { name: "Docker Tutorial", views: 2400 },
    { name: "GraphQL Intro", views: 2100 },
    { name: "AWS Deployment", views: 1800 },
    { name: "Testing Strategies", views: 1500 },
    { name: "CI/CD Pipeline", views: 1200 },
];

const trafficSourcesData = [
    { name: "Organic Search", value: 4200, color: "#1E4DB7" },
    { name: "Social Media", value: 2800, color: "#F59A23" },
    { name: "Direct", value: 2100, color: "#10B981" },
    { name: "Referral", value: 1400, color: "#8B5CF6" },
    { name: "Email", value: 900, color: "#EC4899" },
];

const recentPopularPosts = [
    { title: "React Best Practices for 2024", views: 4520, completion: 78, shares: 245 },
    { title: "TypeScript Tips You Need to Know", views: 3800, completion: 82, shares: 189 },
    { title: "Complete Next.js 15 Guide", views: 3200, completion: 65, shares: 312 },
    { title: "Mastering CSS Grid Layout", views: 2900, completion: 71, shares: 156 },
    { title: "Node.js Security Essentials", views: 2650, completion: 88, shares: 201 },
];

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

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = React.useState("30d");

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Views"
                        value="45.2K"
                        icon={<Eye className="h-5 w-5" />}
                        trend={{ value: 18, label: "vs last period" }}
                        variant="primary"
                    />
                    <StatsCard
                        title="Unique Visitors"
                        value="12.8K"
                        icon={<Users className="h-5 w-5" />}
                        trend={{ value: 12, label: "vs last period" }}
                        variant="success"
                    />
                    <StatsCard
                        title="Avg Read Time"
                        value="4m 32s"
                        icon={<Clock className="h-5 w-5" />}
                        trend={{ value: 5, label: "vs last period" }}
                        variant="warning"
                    />
                    <StatsCard
                        title="Bounce Rate"
                        value="34.2%"
                        icon={<TrendingDown className="h-5 w-5" />}
                        trend={{ value: -3, label: "vs last period", isPositive: true }}
                        variant="default"
                    />
                </div>

                {/* Views Over Time */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <AnalyticsChart
                        data={viewsData}
                        title="Views Over Time"
                        color="#1E4DB7"
                        height={350}
                    />
                </div>

                {/* Bar Chart + Pie Chart Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Posts Bar Chart */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                            Top 10 Posts by Views
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsBarChart
                                data={topPostsData}
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
                    </div>

                    {/* Traffic Sources Pie Chart */}
                    <PieChart
                        data={trafficSourcesData}
                        title="Traffic Sources"
                        height={350}
                        interactive
                    />
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
                </div>
            </div>
        </div>
    );
}
