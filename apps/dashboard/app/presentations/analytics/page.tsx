"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Presentation,
    Layers,
    Download,
    DollarSign,
    TrendingUp,
    BarChart3,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Brain,
    Calendar,
} from "lucide-react";
import {
    usePresentationStats,
    usePresentations,
    type PresentationIndustry,
    type PresentationType as PresType,
} from "@/hooks/use-presentations";

// ─── Constants ──────────────────────────────────────────────────────────────

const INDUSTRY_LABELS: Record<string, string> = {
    technology: "Technology", healthcare: "Healthcare", finance: "Finance",
    education: "Education", marketing: "Marketing", real_estate: "Real Estate",
    consulting: "Consulting", manufacturing: "Manufacturing", retail: "Retail",
    nonprofit: "Nonprofit", government: "Government", creative: "Creative",
    legal: "Legal", startup: "Startup", general: "General", other: "Other",
};

const TYPE_LABELS: Record<string, string> = {
    pitch_deck: "Pitch Deck", business_plan: "Business Plan", sales_deck: "Sales Deck",
    company_profile: "Company Profile", project_proposal: "Project Proposal",
    training: "Training", webinar: "Webinar", case_study: "Case Study",
    report: "Report", infographic: "Infographic", portfolio: "Portfolio",
    keynote_speech: "Keynote Speech", product_launch: "Product Launch",
    investor_update: "Investor Update", other: "Other",
};

const FORMAT_LABELS: Record<string, string> = {
    pptx: "PPTX", ppt: "PPT", key: "Keynote", odp: "ODP", pdf: "PDF",
};

type DateRange = "7d" | "30d" | "90d" | "12m" | "all";

export default function PresentationAnalyticsPage() {
    const [dateRange, setDateRange] = React.useState<DateRange>("30d");

    const { data: statsData, isLoading: isLoadingStats } = usePresentationStats();
    const { data: presentationsData, isLoading: isLoadingPresentations } =
        usePresentations({ sortBy: "downloadCount", sortOrder: "DESC", limit: 10 });
    const topPresentations = presentationsData?.items ?? [];

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Presentation Analytics"
                description="Insights into your presentation marketplace performance"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Presentations", href: "/presentations" },
                    { label: "Analytics" },
                ]}
                backHref="/presentations"
                backLabel="Back to Presentations"
                actions={
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                        <SelectTrigger className="w-[160px]">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Loading State */}
                {isLoadingStats && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading analytics data...</p>
                    </div>
                )}

                {!isLoadingStats && (
                    <>
                        {/* Overview Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Presentation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />12%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.totalPresentations ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total Presentations</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />8%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.totalDownloads ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total Downloads</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />15%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {formatCurrency(statsData?.totalRevenue ?? 0)}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total Revenue</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />5%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.aiAnalyzedCount ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">AI Analyzed</p>
                            </div>
                        </div>

                        {/* Chart Placeholders */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Downloads by Industry */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Downloads by Industry
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byIndustry ?? []).length > 0 ? (
                                        statsData!.byIndustry.map((item) => {
                                            const maxCount = Math.max(
                                                ...statsData!.byIndustry.map((i) => i.count)
                                            );
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.industry} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {INDUSTRY_LABELS[item.industry] || item.industry}
                                                    </span>
                                                    <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-12 text-right">
                                                        {item.count.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                            <div className="text-center">
                                                <BarChart3 className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Bar chart: Downloads by Industry</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Data will populate as presentations are downloaded</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Revenue by Type */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Revenue by Presentation Type
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byType ?? []).length > 0 ? (
                                        statsData!.byType.map((item) => {
                                            const maxCount = Math.max(
                                                ...statsData!.byType.map((i) => i.count)
                                            );
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.type} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {TYPE_LABELS[item.type] || item.type}
                                                    </span>
                                                    <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-12 text-right">
                                                        {item.count.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                            <div className="text-center">
                                                <BarChart3 className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Bar chart: Revenue by Presentation Type</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Data will populate as revenue is generated</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Trend */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Upload Trend
                                </h3>
                                <div className="h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Line chart: Presentations uploaded over time</p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Shows monthly upload trend for the selected period</p>
                                    </div>
                                </div>
                            </div>

                            {/* Format Distribution */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Format Distribution
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byFormat ?? []).length > 0 ? (
                                        statsData!.byFormat.map((item) => {
                                            const total = statsData!.byFormat.reduce(
                                                (acc, i) => acc + i.count, 0
                                            );
                                            const pct = total > 0 ? (item.count / total) * 100 : 0;
                                            return (
                                                <div key={item.format} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-20 uppercase font-medium">
                                                        {FORMAT_LABELS[item.format] || item.format}
                                                    </span>
                                                    <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-16 text-right">
                                                        {pct.toFixed(1)}% ({item.count})
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                            <div className="text-center">
                                                <Layers className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Pie chart: File format distribution</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Shows breakdown of presentation formats</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Presentations */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Top Performing Presentations
                                </h3>
                            </div>
                            {isLoadingPresentations ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                </div>
                            ) : topPresentations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">#</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Presentation</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Industry</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Type</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Downloads</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Views</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {topPresentations.map((pres, index) => (
                                                <tr key={pres.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {pres.thumbnailUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={pres.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover flex-shrink-0 hidden sm:block" />
                                                            ) : (
                                                                <div className="h-8 w-12 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                    <Presentation className="h-3.5 w-3.5 text-zinc-400" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <Link href={`/presentations/${pres.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                                    {pres.title}
                                                                </Link>
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{pres.slideCount} slides</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            {INDUSTRY_LABELS[pres.industry] || pres.industry}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            {TYPE_LABELS[pres.type] || pres.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white flex items-center justify-end gap-1">
                                                            <Download className="h-3.5 w-3.5 text-zinc-400" />
                                                            {pres.downloadCount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden md:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-end gap-1">
                                                            <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                                            {pres.viewCount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden lg:table-cell">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {formatCurrency(pres.price * pres.downloadCount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Presentation className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No presentation data available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Industry Breakdown */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Industry Breakdown
                                </h3>
                            </div>
                            {(statsData?.byIndustry ?? []).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Industry</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Presentations</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Share</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Distribution</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {statsData!.byIndustry.map((item) => {
                                                const total = statsData!.byIndustry.reduce((acc, i) => acc + i.count, 0);
                                                const pct = total > 0 ? (item.count / total) * 100 : 0;
                                                return (
                                                    <tr key={item.industry} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {INDUSTRY_LABELS[item.industry] || item.industry}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {item.count.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right hidden md:table-cell">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {pct.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 hidden lg:table-cell">
                                                            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary/70 rounded-full transition-all"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart3 className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No industry data available yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
