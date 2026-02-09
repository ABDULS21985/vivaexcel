"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    FileText,
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
    Package,
    ShoppingCart,
    Percent,
} from "lucide-react";
import {
    useSolutionDocumentStats,
    useSolutionDocuments,
    useDocumentBundles,
    type SolutionDocumentStats,
    type SolutionDocument,
    type DocumentBundle,
} from "@/hooks/use-solution-documents";

// ─── Constants ──────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
    fintech: "Fintech",
    healthtech: "Healthtech",
    edtech: "Edtech",
    ecommerce: "E-Commerce",
    saas: "SaaS",
    iot: "IoT",
    ai_ml: "AI / ML",
    cybersecurity: "Cybersecurity",
    cloud_infrastructure: "Cloud Infra",
    devops: "DevOps",
    mobile: "Mobile",
    blockchain: "Blockchain",
    other: "Other",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    architecture_design: "Architecture Design",
    system_design: "System Design",
    api_specification: "API Specification",
    database_design: "Database Design",
    infrastructure: "Infrastructure",
    security_design: "Security Design",
    integration_design: "Integration Design",
    migration_plan: "Migration Plan",
    disaster_recovery: "Disaster Recovery",
    network_design: "Network Design",
    data_flow: "Data Flow",
    other: "Other",
};

const MATURITY_LABELS: Record<string, string> = {
    starter: "Starter",
    intermediate: "Intermediate",
    enterprise: "Enterprise",
};

type DateRange = "7d" | "30d" | "90d" | "12m" | "all";

export default function SolutionAnalyticsPage() {
    const [dateRange, setDateRange] = React.useState<DateRange>("30d");

    const { data: statsData, isLoading: isLoadingStats } = useSolutionDocumentStats();
    const { data: documentsData, isLoading: isLoadingDocuments } = useSolutionDocuments({
        sortBy: "downloadCount",
        sortOrder: "DESC",
        limit: 10,
    });
    const { data: bundlesData, isLoading: isLoadingBundles } = useDocumentBundles({
        sortBy: "createdAt",
        sortOrder: "DESC",
        limit: 10,
    });

    const topDocuments = documentsData?.items ?? [];
    const topBundles = bundlesData?.items ?? [];

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    // Aggregate domain breakdown from top documents
    const domainBreakdown = React.useMemo(() => {
        const counts: Record<string, number> = {};
        topDocuments.forEach((doc) => {
            counts[doc.domain] = (counts[doc.domain] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count);
    }, [topDocuments]);

    // Aggregate document type breakdown from top documents
    const typeBreakdown = React.useMemo(() => {
        const counts: Record<string, number> = {};
        topDocuments.forEach((doc) => {
            counts[doc.documentType] = (counts[doc.documentType] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
    }, [topDocuments]);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Solutions Analytics"
                description="Insights into your solution document marketplace performance"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Solutions", href: "/solutions" },
                    { label: "Analytics" },
                ]}
                backHref="/solutions"
                backLabel="Back to Solutions"
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
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />14%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.totalDocuments ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total Documents</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />9%
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
                                        <ArrowUpRight className="h-3 w-3" />18%
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
                                        <ArrowUpRight className="h-3 w-3" />7%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.aiAnalyzedCount ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">AI Analyzed</p>
                            </div>
                        </div>

                        {/* Secondary Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.totalBundles ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Active Bundles</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <Eye className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {(statsData?.avgPageCount ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Avg Page Count</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                        <Percent className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {((statsData?.publishedCount ?? 0) / Math.max(statsData?.totalDocuments ?? 1, 1) * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Published Rate</p>
                            </div>
                        </div>

                        {/* Chart Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sales by Domain */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Documents by Domain
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byDomain ?? []).length > 0 ? (
                                        statsData!.byDomain.map((item: { domain: string; count: number }) => {
                                            const maxCount = Math.max(
                                                ...statsData!.byDomain.map((i: { count: number }) => i.count)
                                            );
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.domain} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {DOMAIN_LABELS[item.domain] || item.domain}
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
                                    ) : domainBreakdown.length > 0 ? (
                                        domainBreakdown.map((item) => {
                                            const maxCount = Math.max(...domainBreakdown.map((i) => i.count));
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.domain} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {DOMAIN_LABELS[item.domain] || item.domain}
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
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Bar chart: Documents by Domain</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Data will populate as documents are created</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sales by Document Type */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Documents by Type
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byDocumentType ?? []).length > 0 ? (
                                        statsData!.byDocumentType.map((item: { documentType: string; count: number }) => {
                                            const maxCount = Math.max(
                                                ...statsData!.byDocumentType.map((i: { count: number }) => i.count)
                                            );
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.documentType} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {DOCUMENT_TYPE_LABELS[item.documentType] || item.documentType}
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
                                    ) : typeBreakdown.length > 0 ? (
                                        typeBreakdown.map((item) => {
                                            const maxCount = Math.max(...typeBreakdown.map((i) => i.count));
                                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                            return (
                                                <div key={item.type} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 truncate">
                                                        {DOCUMENT_TYPE_LABELS[item.type] || item.type}
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
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Bar chart: Documents by Type</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Data will populate as documents are created</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Revenue Trend */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Revenue Trend
                                </h3>
                                <div className="h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Line chart: Revenue over time</p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Shows monthly revenue trend for the selected period</p>
                                    </div>
                                </div>
                            </div>

                            {/* Maturity Level Distribution */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Maturity Level Distribution
                                </h3>
                                <div className="space-y-3">
                                    {(statsData?.byMaturity ?? []).length > 0 ? (
                                        statsData!.byMaturity.map((item: { maturityLevel: string; count: number }) => {
                                            const total = statsData!.byMaturity.reduce(
                                                (acc: number, i: { count: number }) => acc + i.count, 0
                                            );
                                            const pct = total > 0 ? (item.count / total) * 100 : 0;
                                            return (
                                                <div key={item.maturityLevel} className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-28 font-medium">
                                                        {MATURITY_LABELS[item.maturityLevel] || item.maturityLevel}
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
                                                <BarChart3 className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Maturity level breakdown</p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">Shows starter, intermediate, enterprise split</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Documents */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Top Performing Documents
                                </h3>
                            </div>
                            {isLoadingDocuments ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                </div>
                            ) : topDocuments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">#</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Document</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Domain</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Type</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Downloads</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Views</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {topDocuments.map((doc, index) => (
                                                <tr key={doc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {doc.coverImageUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={doc.coverImageUrl} alt="" className="h-8 w-12 rounded object-cover flex-shrink-0 hidden sm:block" />
                                                            ) : (
                                                                <div className="h-8 w-12 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <Link href={`/solutions/${doc.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                                    {doc.title}
                                                                </Link>
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{doc.pageCount} pages</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            {DOMAIN_LABELS[doc.domain] || doc.domain}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white flex items-center justify-end gap-1">
                                                            <Download className="h-3.5 w-3.5 text-zinc-400" />
                                                            {doc.downloadCount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden md:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-end gap-1">
                                                            <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                                            {doc.viewCount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden lg:table-cell">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {formatCurrency(doc.price * doc.downloadCount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No document data available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Bundle Conversion Rates */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Bundle Performance
                                </h3>
                            </div>
                            {isLoadingBundles ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                </div>
                            ) : topBundles.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Bundle</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Documents</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Price</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Savings</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {topBundles.map((bundle) => (
                                                <tr key={bundle.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                                <Package className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <Link href={`/solutions/bundles/${bundle.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                                {bundle.name}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {bundle.documentCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {formatCurrency(bundle.price)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden md:table-cell">
                                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                            {bundle.savingsPercent}% off
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                            bundle.status === "published"
                                                                ? "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300"
                                                                : bundle.status === "archived"
                                                                    ? "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300"
                                                                    : "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300"
                                                        }`}>
                                                            {bundle.status.charAt(0).toUpperCase() + bundle.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No bundle data available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Domain Breakdown Table */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Domain Breakdown
                                </h3>
                            </div>
                            {(statsData?.byDomain ?? domainBreakdown).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Domain</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Documents</th>
                                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Share</th>
                                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Distribution</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {(statsData?.byDomain ?? domainBreakdown).map((item: { domain: string; count: number }) => {
                                                const data = statsData?.byDomain ?? domainBreakdown;
                                                const total = data.reduce((acc: number, i: { count: number }) => acc + i.count, 0);
                                                const pct = total > 0 ? (item.count / total) * 100 : 0;
                                                return (
                                                    <tr key={item.domain} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {DOMAIN_LABELS[item.domain] || item.domain}
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
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No domain data available yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
