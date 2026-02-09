"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import {
    FileText,
    Send,
    Eye,
    Users,
    DollarSign,
    ArrowRight,
    Plus,
    Globe,
    Mail,
    MessageCircle,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { useAnalyticsDashboard } from "@/hooks/use-analytics";
import { useBlogPosts } from "@/hooks/use-blog";

// Format large numbers into compact strings (e.g. 45200 -> "45.2K")
function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
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

const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function DashboardHome() {
    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError,
    } = useAnalyticsDashboard();

    const {
        data: postsData,
        isLoading: isPostsLoading,
        error: postsError,
    } = useBlogPosts({ limit: 10, sort: "createdAt", order: "desc" });

    const recentPosts = postsData?.items ?? [];
    const totalPosts = dashboardData?.totalPosts ?? 0;
    const publishedPosts = recentPosts.filter((p) => p.status === "published").length;
    const draftPosts = recentPosts.filter((p) => p.status === "draft").length;

    // Build subscriber growth chart data from popular posts as a proxy
    // (the API doesn't provide time-series subscriber data at this endpoint)
    const subscriberGrowthData = React.useMemo(() => {
        const posts = dashboardData?.popularPosts ?? [];
        return posts.map((post) => ({
            date: post.title.length > 15 ? post.title.slice(0, 15) + "..." : post.title,
            value: post.views,
        }));
    }, [dashboardData]);

    const isLoading = isDashboardLoading || isPostsLoading;

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your KTBlog."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {dashboardError ? (
                    <div className="mb-8">
                        <ErrorBanner message="Failed to load dashboard stats. Please try again later." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                        {isDashboardLoading ? (
                            <>
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                                <SkeletonBlock className="h-32" />
                            </>
                        ) : (
                            <>
                                <StatsCard
                                    title="Total Posts"
                                    value={totalPosts.toString()}
                                    icon={<FileText className="h-5 w-5" />}
                                    variant="primary"
                                />
                                <StatsCard
                                    title="Published"
                                    value={publishedPosts.toString()}
                                    icon={<Send className="h-5 w-5" />}
                                    variant="success"
                                />
                                <StatsCard
                                    title="Drafts"
                                    value={draftPosts.toString()}
                                    icon={<FileText className="h-5 w-5" />}
                                    variant="warning"
                                />
                                <StatsCard
                                    title="Total Views"
                                    value={formatCompactNumber(dashboardData?.totalViews ?? 0)}
                                    icon={<Eye className="h-5 w-5" />}
                                    variant="default"
                                />
                                <StatsCard
                                    title="Subscribers"
                                    value={formatCompactNumber(dashboardData?.totalSubscribers ?? 0)}
                                    icon={<Users className="h-5 w-5" />}
                                    trend={{ value: dashboardData?.subscriberGrowth ?? 0, label: "vs last month" }}
                                    variant="primary"
                                />
                                <StatsCard
                                    title="MRR"
                                    value="--"
                                    icon={<DollarSign className="h-5 w-5" />}
                                    variant="success"
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/blog/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Post
                        </Button>
                    </Link>
                    <a href="https://drkatangablog.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <Globe className="h-4 w-4 mr-2" />
                            View Site
                        </Button>
                    </a>
                    <Link href="/newsletter">
                        <Button variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Newsletter
                        </Button>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Posts Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Recent Posts
                            </h2>
                            <Link
                                href="/blog"
                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        {isPostsLoading ? (
                            <div className="p-6 space-y-3">
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                                <SkeletonBlock className="h-10 w-full" />
                            </div>
                        ) : postsError ? (
                            <div className="p-6">
                                <ErrorBanner message="Failed to load recent posts." />
                            </div>
                        ) : recentPosts.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
                                No posts yet. Create your first post to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Views
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {recentPosts.map((post) => (
                                            <tr
                                                key={post.id}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                            >
                                                <td className="px-6 py-3.5">
                                                    <Link
                                                        href={`/blog/${post.id}`}
                                                        className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span
                                                        className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[post.status] ?? statusColors.draft}`}
                                                    >
                                                        {post.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {post.viewsCount > 0
                                                        ? post.viewsCount.toLocaleString()
                                                        : "--"}
                                                </td>
                                                <td className="px-6 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                    {post.publishedAt
                                                        ? new Date(post.publishedAt).toLocaleDateString()
                                                        : post.createdAt
                                                            ? new Date(post.createdAt).toLocaleDateString()
                                                            : "--"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Comments */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Recent Comments
                            </h2>
                            <Link
                                href="/comments"
                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                <SkeletonBlock className="h-16 w-full" />
                                <SkeletonBlock className="h-16 w-full" />
                                <SkeletonBlock className="h-16 w-full" />
                            </div>
                        ) : (
                            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                Comments will appear here once available from the API.
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscriber Growth Chart */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    {isDashboardLoading ? (
                        <SkeletonBlock className="h-[250px] w-full" />
                    ) : dashboardError ? (
                        <ErrorBanner message="Failed to load subscriber growth data." />
                    ) : (
                        <AnalyticsChart
                            data={subscriberGrowthData}
                            title="Subscriber Growth"
                            color="#10B981"
                            height={250}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
