"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Badge,
} from "@ktblog/ui/components";
import {
    Search,
    X,
    Loader2,
    CheckCircle,
    DollarSign,
    Clock,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
} from "lucide-react";
import {
    useAdminCommissions,
    useReviewCommission,
    useBulkApproveCommissions,
} from "@/hooks/use-admin-affiliates";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    reversed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatCurrency(val: number) {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AffiliateCommissionsAdminPage() {
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [flaggedOnly, setFlaggedOnly] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    const { data, isLoading } = useAdminCommissions({
        status: statusFilter !== "all" ? statusFilter : undefined,
        flagged: flaggedOnly || undefined,
    });

    const reviewCommission = useReviewCommission();
    const bulkApprove = useBulkApproveCommissions();

    const commissions = data?.data ?? [];
    const ITEMS_PER_PAGE = 20;
    const paginated = commissions.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(commissions.length / ITEMS_PER_PAGE);

    const [reviewModal, setReviewModal] = React.useState<{ open: boolean; id: string; decision: "approve" | "reject" }>({ open: false, id: "", decision: "approve" });

    const handleReview = async () => {
        try {
            await reviewCommission.mutateAsync({ id: reviewModal.id, decision: reviewModal.decision });
            showToast(`Commission ${reviewModal.decision}d`, "success");
            setReviewModal({ open: false, id: "", decision: "approve" });
        } catch (e: any) {
            showToast(e.message || "Failed", "error");
        }
    };

    const handleBulkApprove = async () => {
        try {
            await bulkApprove.mutateAsync(Array.from(selected));
            showToast(`${selected.size} commissions approved`, "success");
            setSelected(new Set());
        } catch (e: any) {
            showToast(e.message || "Failed", "error");
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const pendingCount = commissions.filter((c: any) => c.status === "pending").length;
    const flaggedCount = commissions.filter((c: any) => c.flagged).length;

    return (
        <div className="space-y-6">
            <PageHeader title="Commission Approval" description="Review and approve affiliate commissions" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
                    { label: "Flagged", value: flaggedCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
                    { label: "Total Value", value: formatCurrency(commissions.reduce((s: number, c: any) => s + c.commissionAmount, 0)), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
                    { label: "Total Items", value: commissions.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="reversed">Reversed</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant={flaggedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setFlaggedOnly(!flaggedOnly); setPage(0); }}
                >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Flagged Only
                </Button>

                {selected.size > 0 && (
                    <Button
                        size="sm"
                        onClick={handleBulkApprove}
                        disabled={bulkApprove.isPending}
                    >
                        {bulkApprove.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                        Approve Selected ({selected.size})
                    </Button>
                )}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : paginated.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-lg font-medium">No commissions found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === paginated.length && paginated.length > 0}
                                            onChange={() => {
                                                if (selected.size === paginated.length) setSelected(new Set());
                                                else setSelected(new Set(paginated.map((c: any) => c.id)));
                                            }}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Order</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Sale</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Commission</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Flagged</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {paginated.map((commission: any) => (
                                    <tr key={commission.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.has(commission.id)} onChange={() => toggleSelect(commission.id)} className="rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {commission.order?.orderNumber ?? commission.orderId?.slice(0, 8)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm">{formatCurrency(commission.saleAmount)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(commission.commissionAmount)}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm">{commission.commissionRate}%</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={`text-[11px] ${STATUS_COLORS[commission.status] ?? ""}`}>
                                                {commission.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {commission.flagged && (
                                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    <span className="text-xs">Yes</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-neutral-500">{new Date(commission.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {commission.status === "pending" && (
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setReviewModal({ open: true, id: commission.id, decision: "approve" })}
                                                        className="text-emerald-600 h-7"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setReviewModal({ open: true, id: commission.id, decision: "reject" })}
                                                        className="text-red-600 h-7"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
                            <p className="text-sm text-neutral-500">
                                Page {page + 1} of {totalPages}
                            </p>
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
                open={reviewModal.open}
                title={`${reviewModal.decision === "approve" ? "Approve" : "Reject"} Commission`}
                description={`Are you sure you want to ${reviewModal.decision} this commission?`}
                confirmLabel={reviewModal.decision === "approve" ? "Approve" : "Reject"}
                variant={reviewModal.decision === "approve" ? "default" : "destructive"}
                loading={reviewCommission.isPending}
                onConfirm={handleReview}
                onCancel={() => setReviewModal({ open: false, id: "", decision: "approve" })}
            />
        </div>
    );
}
