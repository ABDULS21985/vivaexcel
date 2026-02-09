"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import {
    BarChart3,
    Loader2,
    ArrowDown,
    ChevronRight,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    useConversionFunnel,
    type Period,
} from "@/hooks/use-marketplace-analytics";

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: Period }[] = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "1y", value: "1y" },
];

const FUNNEL_COLORS = ["#1E4DB7", "#3B82F6", "#60A5FA", "#10B981"];

const DROPOFF_COLORS = ["#EF4444", "#F97316", "#F59E0B"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
}

// ─── Helper Components ──────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className ?? ""}`} />
    );
}

function SectionCard({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 ${className || ""}`}>
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Drop-Off Tooltip ───────────────────────────────────────────────────────

function DropOffTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-3">
                <p className="text-xs font-medium text-white mb-1">{label}</p>
                <p className="text-xs text-zinc-400">
                    {formatNumber(payload[0].value)} visitors dropped off ({payload[0].payload.dropOffPercentage.toFixed(1)}%)
                </p>
            </div>
        );
    }
    return null;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function FunnelPage() {
    const [period, setPeriod] = React.useState<Period>("30d");

    const {
        data: funnelData,
        isLoading,
        error,
    } = useConversionFunnel(period);

    // Build drop-off data for the chart
    const dropOffData = React.useMemo(() => {
        if (!funnelData || funnelData.length < 2) return [];
        return funnelData.slice(0, -1).map((stage, index) => ({
            transition: `${stage.stage} → ${funnelData[index + 1].stage}`,
            dropOff: stage.dropOff,
            dropOffPercentage: stage.dropOffPercentage,
        }));
    }, [funnelData]);

    // Max count for funnel width calculation
    const maxCount = React.useMemo(() => {
        if (!funnelData || funnelData.length === 0) return 1;
        return Math.max(...funnelData.map((s) => s.count), 1);
    }, [funnelData]);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Conversion Funnel"
                description="Analyze the customer journey from product views to purchase completion"
                backHref="/analytics/marketplace"
                backLabel="Back to Marketplace Analytics"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Analytics", href: "/analytics" },
                    { label: "Marketplace", href: "/analytics/marketplace" },
                    { label: "Funnel" },
                ]}
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

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            Failed to load funnel data. Please try again later.
                        </p>
                    </div>
                )}

                {/* Visual Funnel */}
                <SectionCard title="Conversion Funnel">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }, (_, i) => (
                                <SkeletonBlock key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : funnelData && funnelData.length > 0 ? (
                        <div className="space-y-3">
                            {funnelData.map((stage, index) => {
                                const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
                                const isLast = index === funnelData.length - 1;

                                return (
                                    <React.Fragment key={stage.stage}>
                                        <div className="flex items-center gap-4">
                                            {/* Stage bar */}
                                            <div className="flex-1">
                                                <div
                                                    className="relative rounded-lg px-4 py-3 transition-all duration-500"
                                                    style={{
                                                        width: `${widthPercent}%`,
                                                        backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
                                                        minWidth: "200px",
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-white">
                                                            {stage.stage}
                                                        </span>
                                                        <span className="text-sm font-bold text-white">
                                                            {formatNumber(stage.count)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Percentage column */}
                                            <div className="w-28 text-right flex-shrink-0">
                                                <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                    {stage.percentage.toFixed(1)}%
                                                </span>
                                                {index > 0 && (
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                                        of previous stage
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Drop-off indicator between stages */}
                                        {!isLast && (
                                            <div className="flex items-center gap-4 pl-8">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <ArrowDown className="h-3.5 w-3.5 text-red-400" />
                                                    <span className="text-red-500 dark:text-red-400 font-medium">
                                                        -{formatNumber(stage.dropOff)} dropped off
                                                    </span>
                                                    <span className="text-zinc-400 dark:text-zinc-500">
                                                        ({stage.dropOffPercentage.toFixed(1)}% drop-off)
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No funnel data available for this period.
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* Summary Cards */}
                {!isLoading && funnelData && funnelData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {funnelData.map((stage, index) => (
                            <div
                                key={stage.stage}
                                className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] }}
                                    />
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        {stage.stage}
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {formatNumber(stage.count)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {stage.percentage.toFixed(1)}% of total
                                    </span>
                                    {index > 0 && (
                                        <>
                                            <span className="text-zinc-300 dark:text-zinc-600">|</span>
                                            <span className="text-xs text-red-500 dark:text-red-400">
                                                {funnelData[index - 1].dropOffPercentage.toFixed(1)}% drop-off
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Drop-off Analysis Chart */}
                <SectionCard title="Drop-off Analysis">
                    {isLoading ? (
                        <SkeletonBlock className="h-[280px] w-full" />
                    ) : dropOffData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={dropOffData}
                                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    opacity={0.3}
                                />
                                <XAxis
                                    dataKey="transition"
                                    stroke="#9CA3AF"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatNumber(value)}
                                />
                                <Tooltip content={<DropOffTooltip />} />
                                <Bar dataKey="dropOff" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                    {dropOffData.map((_, index) => (
                                        <Cell
                                            key={`dropoff-${index}`}
                                            fill={DROPOFF_COLORS[index % DROPOFF_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No drop-off data available for this period.
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* Funnel Flow Visualization */}
                {!isLoading && funnelData && funnelData.length >= 2 && (
                    <SectionCard title="Stage-by-Stage Breakdown">
                        <div className="overflow-x-auto -mx-5 px-5">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                        <th className="text-left pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Stage
                                        </th>
                                        <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Count
                                        </th>
                                        <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            % of Total
                                        </th>
                                        <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            % of Previous
                                        </th>
                                        <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Drop-off
                                        </th>
                                        <th className="text-right pb-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Drop-off %
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                    {funnelData.map((stage, index) => {
                                        const prevStage = index > 0 ? funnelData[index - 1] : null;
                                        const percentOfPrevious = prevStage
                                            ? ((stage.count / prevStage.count) * 100).toFixed(1)
                                            : "100.0";

                                        return (
                                            <tr key={stage.stage} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] }}
                                                        />
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {stage.stage}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {formatNumber(stage.count)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {stage.percentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {percentOfPrevious}%
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="text-sm text-red-500 dark:text-red-400">
                                                        {stage.dropOff > 0 ? `-${formatNumber(stage.dropOff)}` : "-"}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="text-sm text-red-500 dark:text-red-400">
                                                        {stage.dropOffPercentage > 0
                                                            ? `${stage.dropOffPercentage.toFixed(1)}%`
                                                            : "-"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}
            </div>
        </div>
    );
}
