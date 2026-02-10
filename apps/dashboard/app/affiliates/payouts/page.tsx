"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Badge,
} from "@ktblog/ui/components";
import {
    Loader2,
    CheckCircle,
    DollarSign,
    Clock,
    XCircle,
    Wallet,
    ChevronLeft,
    ChevronRight,
    Play,
} from "lucide-react";
import { useAdminAffiliatePayouts, useProcessAffiliatePayout } from "@/hooks/use-admin-affiliates";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatCurrency(val: number) {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AffiliatePayoutsAdminPage() {
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [page, setPage] = React.useState(0);

    const { data, isLoading } = useAdminAffiliatePayouts({
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    const processPayout = useProcessAffiliatePayout();

    const payouts = data?.data ?? [];
    const ITEMS_PER_PAGE = 20;
    const paginated = payouts.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(payouts.length / ITEMS_PER_PAGE);

    const [processModal, setProcessModal] = React.useState<{ open: boolean; id: string }>({ open: false, id: "" });

    const handleProcess = async () => {
        try {
            await processPayout.mutateAsync(processModal.id);
            showToast("Payout processed successfully", "success");
            setProcessModal({ open: false, id: "" });
        } catch (e: any) {
            showToast(e.message || "Failed to process payout", "error");
        }
    };

    const pendingTotal = payouts.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + p.amount, 0);
    const completedTotal = payouts.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + p.amount, 0);

    return (
        <div className="space-y-6">
            <PageHeader title="Affiliate Payouts" description="Process and manage affiliate payout requests" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Pending Payouts", value: formatCurrency(pendingTotal), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
                    { label: "Completed", value: formatCurrency(completedTotal), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
                    { label: "Total Payouts", value: payouts.length, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500">{stat.label}</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : paginated.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-lg font-medium">No payouts found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Net</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Commissions</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Processed</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {paginated.map((payout: any) => (
                                    <tr key={payout.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-neutral-900 dark:text-white">
                                                {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatCurrency(payout.amount)}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(payout.netAmount)}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm">{payout.commissionCount}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={`text-[11px] ${STATUS_COLORS[payout.status] ?? ""}`}>
                                                {payout.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-neutral-500">
                                                {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {payout.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setProcessModal({ open: true, id: payout.id })}
                                                    disabled={processPayout.isPending}
                                                >
                                                    <Play className="h-3.5 w-3.5 mr-1" />
                                                    Process
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
                            <p className="text-sm text-neutral-500">Page {page + 1} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                open={processModal.open}
                title="Process Payout"
                description="This will initiate a Stripe transfer to the affiliate. Are you sure?"
                confirmLabel="Process Payout"
                loading={processPayout.isPending}
                onConfirm={handleProcess}
                onCancel={() => setProcessModal({ open: false, id: "" })}
            />
        </div>
    );
}
