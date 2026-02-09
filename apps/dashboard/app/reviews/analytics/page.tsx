"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
    Button,
} from "@ktblog/ui/components";
import {
    Star,
    MessageSquare,
    Clock,
    Flag,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    BarChart3,
    Loader2,
    ArrowLeft,
    X,
    Shield,
    ThumbsUp,
    Percent,
} from "lucide-react";
import {
    useReviewStats,
    useReviewAnalytics,
} from "@/hooks/use-reviews";

// ─── Helper Components ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                        i < Math.round(rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-300 dark:text-zinc-600"
                    }`}
                />
            ))}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    iconBg,
    iconColor,
    isLoading,
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    isLoading: boolean;
    subtitle?: string;
}) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <div className={iconColor}>{icon}</div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {isLoading ? (
                            <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                        ) : (
                            value
                        )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{title}</p>
                    {subtitle && !isLoading && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 ${className || ""}`}>
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ReviewAnalyticsPage() {
    const { data: stats, isLoading: isLoadingStats } = useReviewStats();
    const { data: analytics, isLoading: isLoadingAnalytics } = useReviewAnalytics();

    const maxRatingCount = React.useMemo(() => {
        if (!stats?.ratingDistribution) return 1;
        return Math.max(...stats.ratingDistribution.map((r) => r.count), 1);
    }, [stats]);

    const maxTrendCount = React.useMemo(() => {
        if (!analytics?.trends) return 1;
        return Math.max(...analytics.trends.map((t) => t.count), 1);
    }, [analytics]);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Review Analytics"
                description="Insights and trends from customer reviews"
                backHref="/reviews"
                backLabel="Back to Reviews"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Reviews", href: "/reviews" },
                    { label: "Analytics" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Reviews"
                        value={(stats?.totalReviews ?? 0).toLocaleString()}
                        icon={<MessageSquare className="h-5 w-5" />}
                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={isLoadingStats}
                    />
                    <StatCard
                        title="Average Rating"
                        value={(stats?.averageRating ?? 0).toFixed(1)}
                        icon={<Star className="h-5 w-5" />}
                        iconBg="bg-amber-100 dark:bg-amber-900/30"
                        iconColor="text-amber-600 dark:text-amber-400"
                        isLoading={isLoadingStats}
                    />
                    <StatCard
                        title="Pending Moderation"
                        value={(stats?.pendingModeration ?? 0).toLocaleString()}
                        icon={<Clock className="h-5 w-5" />}
                        iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                        iconColor="text-yellow-600 dark:text-yellow-400"
                        isLoading={isLoadingStats}
                    />
                    <StatCard
                        title="Flagged Reviews"
                        value={(stats?.flaggedCount ?? 0).toLocaleString()}
                        icon={<Flag className="h-5 w-5" />}
                        iconBg="bg-orange-100 dark:bg-orange-900/30"
                        iconColor="text-orange-600 dark:text-orange-400"
                        isLoading={isLoadingStats}
                    />
                </div>

                {/* Second row stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Approved Reviews"
                        value={(stats?.approvedCount ?? 0).toLocaleString()}
                        icon={<CheckCircle className="h-5 w-5" />}
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600 dark:text-green-400"
                        isLoading={isLoadingStats}
                    />
                    <StatCard
                        title="Rejected Reviews"
                        value={(stats?.rejectedCount ?? 0).toLocaleString()}
                        icon={<X className="h-5 w-5" />}
                        iconBg="bg-red-100 dark:bg-red-900/30"
                        iconColor="text-red-600 dark:text-red-400"
                        isLoading={isLoadingStats}
                    />
                    <StatCard
                        title="Verified Purchases"
                        value={(stats?.verifiedPurchaseCount ?? 0).toLocaleString()}
                        icon={<Shield className="h-5 w-5" />}
                        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={isLoadingStats}
                        subtitle={stats ? `${stats.unverifiedCount} unverified` : undefined}
                    />
                    <StatCard
                        title="Response Rate"
                        value={stats ? `${(stats.responseRate * 100).toFixed(1)}%` : "0%"}
                        icon={<Percent className="h-5 w-5" />}
                        iconBg="bg-purple-100 dark:bg-purple-900/30"
                        iconColor="text-purple-600 dark:text-purple-400"
                        isLoading={isLoadingStats}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rating Distribution */}
                    <SectionCard title="Rating Distribution">
                        {isLoadingStats ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="flex-1 h-6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const distribution = stats?.ratingDistribution?.find((r) => r.rating === rating);
                                    const count = distribution?.count ?? 0;
                                    const percentage = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
                                    const totalPercentage = stats?.totalReviews ? ((count / stats.totalReviews) * 100).toFixed(0) : "0";

                                    return (
                                        <div key={rating} className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 w-14 flex-shrink-0">
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{rating}</span>
                                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                            </div>
                                            <div className="flex-1 h-7 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="w-16 text-right flex-shrink-0">
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{count}</span>
                                                <span className="text-xs text-zinc-400 ml-1">({totalPercentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    {/* Verified vs Unverified Breakdown */}
                    <SectionCard title="Purchase Verification Breakdown">
                        {isLoadingStats ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Visual breakdown */}
                                <div className="flex items-center gap-1 h-10 rounded-lg overflow-hidden">
                                    {stats && stats.totalReviews > 0 ? (
                                        <>
                                            <div
                                                className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-l-lg transition-all duration-500"
                                                style={{ width: `${(stats.verifiedPurchaseCount / stats.totalReviews) * 100}%` }}
                                            />
                                            <div
                                                className="h-full bg-zinc-300 dark:bg-zinc-600 rounded-r-lg transition-all duration-500"
                                                style={{ width: `${(stats.unverifiedCount / stats.totalReviews) * 100}%` }}
                                            />
                                        </>
                                    ) : (
                                        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-700 rounded-lg" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Verified Purchase</span>
                                        </div>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            {(stats?.verifiedPurchaseCount ?? 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {stats?.totalReviews
                                                ? `${((stats.verifiedPurchaseCount / stats.totalReviews) * 100).toFixed(1)}%`
                                                : "0%"
                                            }
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-3 w-3 rounded-full bg-zinc-400" />
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Unverified</span>
                                        </div>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            {(stats?.unverifiedCount ?? 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {stats?.totalReviews
                                                ? `${((stats.unverifiedCount / stats.totalReviews) * 100).toFixed(1)}%`
                                                : "0%"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Reviews Over Time */}
                <SectionCard title="Reviews Over Time">
                    {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    ) : analytics?.trends && analytics.trends.length > 0 ? (
                        <div className="space-y-4">
                            {/* Simple bar chart */}
                            <div className="flex items-end gap-1 h-48">
                                {analytics.trends.map((trend, i) => {
                                    const heightPercent = maxTrendCount > 0 ? (trend.count / maxTrendCount) * 100 : 0;
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 flex flex-col items-center gap-1 group"
                                        >
                                            <div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {trend.count} reviews ({trend.averageRating.toFixed(1)} avg)
                                            </div>
                                            <div
                                                className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all duration-300 min-h-[2px]"
                                                style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            {/* X-axis labels */}
                            <div className="flex gap-1">
                                {analytics.trends.map((trend, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                                            {new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No trend data available yet.</p>
                        </div>
                    )}
                </SectionCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top-Rated Products */}
                    <SectionCard title="Top-Rated Products">
                        {isLoadingAnalytics ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : analytics?.topRatedProducts && analytics.topRatedProducts.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topRatedProducts.map((product, i) => (
                                    <div key={product.productId} className="flex items-center gap-3 py-2">
                                        <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 w-6 text-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                {product.productTitle}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <StarRating rating={Math.round(product.averageRating)} />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {product.averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <TrendingUp className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">No product data available yet.</p>
                            </div>
                        )}
                    </SectionCard>

                    {/* Lowest-Rated Products (Needs Attention) */}
                    <SectionCard title="Lowest-Rated Products (Needs Attention)">
                        {isLoadingAnalytics ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : analytics?.lowestRatedProducts && analytics.lowestRatedProducts.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.lowestRatedProducts.map((product, i) => (
                                    <div key={product.productId} className="flex items-center gap-3 py-2">
                                        <div className="flex-shrink-0">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                product.averageRating < 2
                                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                    : product.averageRating < 3
                                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                                    : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            }`}>
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                {product.productTitle}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <StarRating rating={Math.round(product.averageRating)} />
                                            <span className={`text-sm font-medium ${
                                                product.averageRating < 2
                                                    ? "text-red-600 dark:text-red-400"
                                                    : product.averageRating < 3
                                                    ? "text-orange-600 dark:text-orange-400"
                                                    : "text-yellow-600 dark:text-yellow-400"
                                            }`}>
                                                {product.averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <TrendingDown className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">No product data available yet.</p>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Average Rating by Category */}
                <SectionCard title="Average Rating by Category">
                    {isLoadingAnalytics ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i} className="p-3 rounded-lg animate-pulse">
                                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
                                    <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : analytics?.averageByCategory && analytics.averageByCategory.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analytics.averageByCategory.map((cat) => (
                                <div key={cat.category} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        {cat.category}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={Math.round(cat.averageRating)} />
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {cat.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        {cat.reviewCount} review{cat.reviewCount !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No category data available yet.</p>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
