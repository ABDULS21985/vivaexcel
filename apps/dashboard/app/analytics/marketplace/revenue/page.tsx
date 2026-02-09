"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@ktblog/ui/components";
import {
    DollarSign,
    Download,
    Loader2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    usePlatformRevenue,
    useExportRevenue,
    type GroupBy,
    type RevenueDataPoint,
} from "@/hooks/use-marketplace-analytics";

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
}

function formatCompactCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
}

function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
}

// ─── Helper Components ──────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className ?? ""}`} />
    );
}

function RevenueTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-3 min-w-[200px]">
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
                            {formatCurrency(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RevenueReportsPage() {
    const { success, error: toastError } = useToast();

    // Date range and grouping state
    const defaults = React.useMemo(() => getDefaultDates(), []);
    const [startDate, setStartDate] = React.useState(defaults.startDate);
    const [endDate, setEndDate] = React.useState(defaults.endDate);
    const [groupBy, setGroupBy] = React.useState<GroupBy>("day");

    // Pagination
    const [page, setPage] = React.useState(0);

    // Sort state
    const [sortColumn, setSortColumn] = React.useState<keyof RevenueDataPoint>("date");
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

    // Compute period from date range for API
    const period = React.useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) return "7d" as const;
        if (diffDays <= 30) return "30d" as const;
        if (diffDays <= 90) return "90d" as const;
        return "1y" as const;
    }, [startDate, endDate]);

    // Queries
    const {
        data: revenueData,
        isLoading,
        error,
    } = usePlatformRevenue(period, groupBy);

    const exportMutation = useExportRevenue();

    // Sorted data
    const sortedData = React.useMemo(() => {
        if (!revenueData) return [];
        return [...revenueData].sort((a, b) => {
            const multiplier = sortDirection === "desc" ? -1 : 1;
            if (sortColumn === "date") {
                return a.date.localeCompare(b.date) * multiplier;
            }
            return ((a[sortColumn] as number) - (b[sortColumn] as number)) * multiplier;
        });
    }, [revenueData, sortColumn, sortDirection]);

    // Paginated data
    const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
    const paginatedData = sortedData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Totals row
    const totals = React.useMemo(() => {
        if (!revenueData) return null;
        return revenueData.reduce(
            (acc, row) => ({
                orders: acc.orders + row.orders,
                grossRevenue: acc.grossRevenue + row.grossRevenue,
                platformFee: acc.platformFee + row.platformFee,
                netRevenue: acc.netRevenue + row.netRevenue,
            }),
            { orders: 0, grossRevenue: 0, platformFee: 0, netRevenue: 0 },
        );
    }, [revenueData]);

    const totalAOV = totals && totals.orders > 0
        ? totals.grossRevenue / totals.orders
        : 0;

    // Handle sort
    const handleSort = (column: keyof RevenueDataPoint) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
        } else {
            setSortColumn(column);
            setSortDirection("desc");
        }
        setPage(0);
    };

    // Handle export
    const handleExport = () => {
        exportMutation.mutate(
            { startDate, endDate, groupBy },
            {
                onSuccess: () => {
                    success("Export Complete", "Revenue report has been downloaded.");
                },
                onError: () => {
                    toastError("Export Failed", "Could not export the revenue report. Please try again.");
                },
            },
        );
    };

    const SortHeader = ({
        column,
        label,
        align = "right",
    }: {
        column: keyof RevenueDataPoint;
        label: string;
        align?: "left" | "right";
    }) => (
        <th
            className={`${align === "left" ? "text-left" : "text-right"} px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 select-none`}
            onClick={() => handleSort(column)}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {sortColumn === column ? (
                    sortDirection === "desc" ? (
                        <TrendingDown className="h-3 w-3" />
                    ) : (
                        <TrendingUp className="h-3 w-3" />
                    )
                ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                )}
            </span>
        </th>
    );

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Revenue Reports"
                description="Detailed revenue breakdown with export capabilities"
                backHref="/analytics/marketplace"
                backLabel="Back to Marketplace Analytics"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Analytics", href: "/analytics" },
                    { label: "Marketplace", href: "/analytics/marketplace" },
                    { label: "Revenue Reports" },
                ]}
                actions={
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={exportMutation.isPending || isLoading}
                    >
                        {exportMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                                Start Date
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(0);
                                }}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                                End Date
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(0);
                                }}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                        </div>
                        <div className="w-full sm:w-[160px]">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                                Group By
                            </label>
                            <Select
                                value={groupBy}
                                onValueChange={(v) => {
                                    setGroupBy(v as GroupBy);
                                    setPage(0);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            Failed to load revenue data. Please try again later.
                        </p>
                    </div>
                )}

                {/* Revenue Chart */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                        Revenue Over Time
                    </h3>
                    {isLoading ? (
                        <SkeletonBlock className="h-[300px] w-full" />
                    ) : revenueData && revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorGrossRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E4DB7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1E4DB7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNetRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                                    tickFormatter={(value) => formatCompactCurrency(value)}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="grossRevenue"
                                    name="Gross Revenue"
                                    stroke="#1E4DB7"
                                    fill="url(#colorGrossRevenue)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="netRevenue"
                                    name="Net Revenue"
                                    stroke="#10B981"
                                    fill="url(#colorNetRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No revenue data available for this date range.
                            </p>
                        </div>
                    )}
                </div>

                {/* Revenue Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Revenue Breakdown
                        </h3>
                    </div>
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 8 }, (_, i) => (
                                <SkeletonBlock key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : paginatedData.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                            <SortHeader column="date" label="Date" align="left" />
                                            <SortHeader column="orders" label="Orders" />
                                            <SortHeader column="grossRevenue" label="Gross Revenue" />
                                            <SortHeader column="platformFee" label="Platform Fee" />
                                            <SortHeader column="netRevenue" label="Net Revenue" />
                                            <SortHeader column="averageOrderValue" label="Avg Order Value" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {paginatedData.map((row, index) => (
                                            <tr
                                                key={row.date}
                                                className={`hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors ${
                                                    index % 2 === 0
                                                        ? ""
                                                        : "bg-zinc-25 dark:bg-zinc-800/50"
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
                                                    {row.date}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                                                    {row.orders.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white text-right">
                                                    {formatCurrency(row.grossRevenue)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 text-right">
                                                    {formatCurrency(row.platformFee)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right">
                                                    {formatCurrency(row.netRevenue)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                                                    {formatCurrency(row.averageOrderValue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* Totals Row */}
                                    {totals && (
                                        <tfoot>
                                            <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700/50 font-semibold">
                                                <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white">
                                                    Total
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white text-right">
                                                    {totals.orders.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white text-right">
                                                    {formatCurrency(totals.grossRevenue)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 text-right">
                                                    {formatCurrency(totals.platformFee)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 text-right">
                                                    {formatCurrency(totals.netRevenue)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                                                    {formatCurrency(totalAOV)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Showing {page * PAGE_SIZE + 1} to{" "}
                                        {Math.min((page + 1) * PAGE_SIZE, sortedData.length)} of{" "}
                                        {sortedData.length} entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 0}
                                            onClick={() => setPage((p) => p - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Page {page + 1} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages - 1}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <DollarSign className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No revenue data available for this date range.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
