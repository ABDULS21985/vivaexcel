"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import {
    Loader2,
    X,
    BarChart3,
    DollarSign,
    Percent,
    TrendingUp,
    Ticket,
    Zap,
} from "lucide-react";
import {
    usePromotionAnalytics,
} from "@/hooks/use-promotions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatNumber(num: number): string {
    return new Intl.NumberFormat("en-US").format(num);
}

function formatPercent(num: number): string {
    return `${num.toFixed(1)}%`;
}

// ─── Stats Card Component ───────────────────────────────────────────────────

interface StatsCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    iconBgClass: string;
    description?: string;
}

function StatsCard({ label, value, icon, iconBgClass, description }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center gap-4">
                <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
                        {value}
                    </p>
                    {description && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Bar Chart Placeholder ──────────────────────────────────────────────────

function RedemptionChart({
    data,
}: {
    data: { date: string; count: number }[];
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-zinc-400 dark:text-zinc-500 text-sm">
                No redemption data available
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="flex items-end gap-1.5 h-48 px-2">
            {data.map((item, index) => {
                const height = (item.count / maxCount) * 100;
                const date = new Date(item.date);
                const label = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });

                return (
                    <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1 group"
                    >
                        <div className="relative w-full flex items-end justify-center" style={{ height: "160px" }}>
                            <div
                                className="w-full max-w-[40px] bg-primary/20 hover:bg-primary/30 rounded-t-md transition-all relative group"
                                style={{ height: `${Math.max(height, 2)}%` }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                />
                                {/* Tooltip on hover */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    {item.count} redemptions
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Pie Chart Placeholder ──────────────────────────────────────────────────

function CouponTypeChart({
    data,
}: {
    data: { type: string; count: number }[];
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-zinc-400 dark:text-zinc-500 text-sm">
                No coupon type data available
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const colors = [
        "bg-primary",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-indigo-500",
        "bg-pink-500",
    ];

    const typeLabels: Record<string, string> = {
        percentage: "Percentage",
        fixed_amount: "Fixed Amount",
        free_shipping: "Free Shipping",
    };

    return (
        <div className="flex items-center gap-8">
            {/* Donut chart visual */}
            <div className="relative h-40 w-40 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    {data.reduce<{ elements: React.ReactNode[]; offset: number }>(
                        (acc, item, index) => {
                            const pct = (item.count / total) * 100;
                            const color = colors[index % colors.length];
                            const colorMap: Record<string, string> = {
                                "bg-primary": "stroke-primary",
                                "bg-emerald-500": "stroke-emerald-500",
                                "bg-amber-500": "stroke-amber-500",
                                "bg-indigo-500": "stroke-indigo-500",
                                "bg-pink-500": "stroke-pink-500",
                            };

                            acc.elements.push(
                                <circle
                                    key={index}
                                    cx="18"
                                    cy="18"
                                    r="15.91549430918954"
                                    fill="transparent"
                                    className={colorMap[color] || "stroke-zinc-400"}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${pct} ${100 - pct}`}
                                    strokeDashoffset={`${-acc.offset}`}
                                    strokeLinecap="round"
                                />,
                            );
                            acc.offset += pct;
                            return acc;
                        },
                        { elements: [], offset: 0 },
                    ).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                            {total}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Total
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
                {data.map((item, index) => {
                    const pct = ((item.count / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}
                            />
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {typeLabels[item.type] || item.type}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {item.count} ({pct}%)
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function PromotionAnalyticsPage() {
    // Fetch data
    const { data: analytics, isLoading, error } = usePromotionAnalytics();

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Promotion Analytics"
                description="Track the performance of your promotions and discounts"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Promotions", href: "/promotions/coupons" },
                    { label: "Analytics" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading analytics...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load analytics
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error.message || "An error occurred while fetching analytics data."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard
                                label="Total Redemptions"
                                value={analytics ? formatNumber(analytics.totalRedemptions) : "0"}
                                icon={<Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                                iconBgClass="bg-indigo-100 dark:bg-indigo-900/40"
                                description="All-time coupon uses"
                            />
                            <StatsCard
                                label="Revenue Impact"
                                value={analytics ? formatCurrency(analytics.revenueImpact) : "$0"}
                                icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                                iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
                                description="Revenue from promotions"
                            />
                            <StatsCard
                                label="Conversion Rate"
                                value={analytics ? formatPercent(analytics.conversionRate) : "0%"}
                                icon={<TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                iconBgClass="bg-blue-100 dark:bg-blue-900/40"
                                description="Promotion-driven conversions"
                            />
                            <StatsCard
                                label="Average Discount"
                                value={analytics ? formatCurrency(analytics.averageDiscount) : "$0"}
                                icon={<Percent className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                                iconBgClass="bg-amber-100 dark:bg-amber-900/40"
                                description="Average discount per order"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Redemptions Over Time */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-zinc-400" />
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                        Redemptions Over Time
                                    </h3>
                                </div>
                                <RedemptionChart
                                    data={analytics?.redemptionsByDay ?? []}
                                />
                            </div>

                            {/* Coupon Type Distribution */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Percent className="h-5 w-5 text-zinc-400" />
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                        Coupon Type Distribution
                                    </h3>
                                </div>
                                <CouponTypeChart
                                    data={analytics?.couponTypeDistribution ?? []}
                                />
                            </div>
                        </div>

                        {/* Tables Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Most Used Coupon Codes */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-zinc-400" />
                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                            Most Used Coupon Codes
                                        </h3>
                                    </div>
                                </div>
                                {analytics?.topCoupons && analytics.topCoupons.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Code
                                                    </th>
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Redemptions
                                                    </th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Revenue
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {analytics.topCoupons.map((coupon, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <span className="text-sm font-mono font-semibold text-primary">
                                                                {coupon.code}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {coupon.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {formatNumber(coupon.redemptions)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                                {formatCurrency(coupon.revenue)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
                                        No coupon usage data yet
                                    </div>
                                )}
                            </div>

                            {/* Flash Sale Performance */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-zinc-400" />
                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                            Flash Sale Performance
                                        </h3>
                                    </div>
                                </div>
                                {analytics?.flashSalePerformance &&
                                analytics.flashSalePerformance.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Sale
                                                    </th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Sales
                                                    </th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Revenue
                                                    </th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Conv. Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {analytics.flashSalePerformance.map(
                                                    (sale, index) => (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                    {sale.name}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                    {formatNumber(sale.totalSales)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                                    {formatCurrency(sale.revenue)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                    {formatPercent(sale.conversionRate)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
                                        No flash sale performance data yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
