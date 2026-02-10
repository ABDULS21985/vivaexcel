"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal, Modal } from "@/components/modal";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";
import {
    Search,
    Filter,
    X,
    Loader2,
    CheckCircle,
    DollarSign,
    Clock,
    Eye,
    Users,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    UserX,
    UserCheck,
    Percent,
    TrendingUp,
    Link2,
    AlertTriangle,
} from "lucide-react";
import {
    useAdminAffiliates,
    useAdminAffiliateStats,
    useReviewAffiliateApplication,
    useSuspendAffiliate,
    useUpdateAffiliate,
} from "@/hooks/use-admin-affiliates";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Affiliate {
    id: string;
    affiliateCode: string;
    customSlug?: string;
    status: string;
    tier: string;
    commissionRate: number;
    lifetimeSales: number;
    lifetimeRevenue: number;
    lifetimeCommission: number;
    pendingBalance: number;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

// ─── Status Helpers ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending_approval: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    rejected: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const TIER_COLORS: Record<string, string> = {
    standard: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    silver: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    platinum: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function formatCurrency(val: number) {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AffiliatesAdminPage() {
    const { showToast } = useToast();

    // ── Filters ────────────────────────────────────────
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [tierFilter, setTierFilter] = React.useState("all");
    const [page, setPage] = React.useState(0);

    // Debounce search
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // ── Data ────────────────────────────────────────────
    const { data: affiliatesData, isLoading } = useAdminAffiliates({
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        tier: tierFilter !== "all" ? tierFilter : undefined,
    });
    const { data: stats } = useAdminAffiliateStats();

    const reviewApplication = useReviewAffiliateApplication();
    const suspendAffiliate = useSuspendAffiliate();
    const updateAffiliate = useUpdateAffiliate();

    const allAffiliates: Affiliate[] = affiliatesData?.data ?? [];
    const ITEMS_PER_PAGE = 20;
    const paginated = allAffiliates.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(allAffiliates.length / ITEMS_PER_PAGE);

    // ── Modal states ────────────────────────────────────
    const [suspendModal, setSuspendModal] = React.useState<{ open: boolean; id: string }>({ open: false, id: "" });
    const [reviewModal, setReviewModal] = React.useState<{ open: boolean; id: string; decision: "approve" | "reject" }>({ open: false, id: "", decision: "approve" });
    const [commissionModal, setCommissionModal] = React.useState<{ open: boolean; id: string; rate: number }>({ open: false, id: "", rate: 10 });
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    // ── Actions ─────────────────────────────────────────
    const handleReview = async () => {
        try {
            await reviewApplication.mutateAsync({ id: reviewModal.id, decision: reviewModal.decision });
            showToast(`Application ${reviewModal.decision === "approve" ? "approved" : "rejected"}`, "success");
            setReviewModal({ open: false, id: "", decision: "approve" });
        } catch (e: any) {
            showToast(e.message || "Failed", "error");
        }
    };

    const handleSuspend = async () => {
        try {
            await suspendAffiliate.mutateAsync({ id: suspendModal.id });
            showToast("Affiliate suspended", "success");
            setSuspendModal({ open: false, id: "" });
        } catch (e: any) {
            showToast(e.message || "Failed", "error");
        }
    };

    const handleUpdateCommission = async () => {
        try {
            await updateAffiliate.mutateAsync({ id: commissionModal.id, data: { commissionRate: commissionModal.rate } });
            showToast("Commission rate updated", "success");
            setCommissionModal({ open: false, id: "", rate: 10 });
        } catch (e: any) {
            showToast(e.message || "Failed", "error");
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === paginated.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paginated.map((a) => a.id)));
        }
    };

    const activeFilters = [statusFilter !== "all", tierFilter !== "all", !!debouncedSearch].filter(Boolean).length;

    return (
        <div className="space-y-6">
            <PageHeader title="Affiliates" description="Manage affiliate partners, applications, and commissions" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Affiliates", value: stats?.totalAffiliates ?? allAffiliates.length, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
                    { label: "Active", value: stats?.activeCount ?? allAffiliates.filter((a) => a.status === "active").length, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
                    { label: "Pending Review", value: stats?.pendingCount ?? allAffiliates.filter((a) => a.status === "pending_approval").length, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
                    { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue ?? allAffiliates.reduce((s, a) => s + a.lifetimeRevenue, 0)), icon: DollarSign, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
                    { label: "Total Commissions", value: formatCurrency(stats?.totalCommissions ?? allAffiliates.reduce((s, a) => s + a.lifetimeCommission, 0)), icon: TrendingUp, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/30" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search affiliates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                        </button>
                    )}
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending_approval">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                </Select>

                {activeFilters > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setStatusFilter("all"); setTierFilter("all"); }}
                        className="text-xs"
                    >
                        <X className="h-3 w-3 mr-1" /> Clear ({activeFilters})
                    </Button>
                )}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : paginated.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
                    <Users className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-lg font-medium">No affiliates found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="px-4 py-3 text-left">
                                        <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Affiliate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Tier</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden xl:table-cell">Sales</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden xl:table-cell">Revenue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden xl:table-cell">Commission</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Joined</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {paginated.map((affiliate) => (
                                    <tr key={affiliate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.has(affiliate.id)} onChange={() => toggleSelect(affiliate.id)} className="rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {affiliate.user?.name?.charAt(0)?.toUpperCase() ?? "A"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{affiliate.user?.name ?? affiliate.affiliateCode}</p>
                                                    <p className="text-xs text-neutral-500">{affiliate.user?.email ?? affiliate.affiliateCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <Badge className={`text-[11px] ${STATUS_COLORS[affiliate.status] ?? STATUS_COLORS.rejected}`}>
                                                {affiliate.status.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <Badge className={`text-[11px] ${TIER_COLORS[affiliate.tier] ?? TIER_COLORS.standard}`}>
                                                {affiliate.tier}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{affiliate.commissionRate}%</span>
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell">
                                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{affiliate.lifetimeSales}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{formatCurrency(affiliate.lifetimeRevenue)}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell">
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(affiliate.lifetimeCommission)}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-neutral-500">{new Date(affiliate.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {}}>
                                                        <Eye className="h-4 w-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setCommissionModal({ open: true, id: affiliate.id, rate: affiliate.commissionRate })}>
                                                        <Percent className="h-4 w-4 mr-2" /> Edit Commission
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {affiliate.status === "pending_approval" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => setReviewModal({ open: true, id: affiliate.id, decision: "approve" })}>
                                                                <UserCheck className="h-4 w-4 mr-2" /> Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setReviewModal({ open: true, id: affiliate.id, decision: "reject" })} className="text-red-600">
                                                                <UserX className="h-4 w-4 mr-2" /> Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {affiliate.status === "active" && (
                                                        <DropdownMenuItem onClick={() => setSuspendModal({ open: true, id: affiliate.id })} className="text-red-600">
                                                            <UserX className="h-4 w-4 mr-2" /> Suspend
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
                            <p className="text-sm text-neutral-500">
                                Showing {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, allAffiliates.length)} of {allAffiliates.length}
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

            {/* Bulk Actions Bar */}
            {selected.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl px-6 py-3 shadow-2xl flex items-center gap-4">
                    <span className="text-sm font-medium">{selected.size} selected</span>
                    <Button size="sm" variant="ghost" className="text-white dark:text-neutral-900" onClick={() => setSelected(new Set())}>
                        Clear
                    </Button>
                </div>
            )}

            {/* Review Modal */}
            <ConfirmModal
                open={reviewModal.open}
                title={`${reviewModal.decision === "approve" ? "Approve" : "Reject"} Application`}
                description={`Are you sure you want to ${reviewModal.decision} this affiliate application?`}
                confirmLabel={reviewModal.decision === "approve" ? "Approve" : "Reject"}
                variant={reviewModal.decision === "approve" ? "default" : "destructive"}
                loading={reviewApplication.isPending}
                onConfirm={handleReview}
                onCancel={() => setReviewModal({ open: false, id: "", decision: "approve" })}
            />

            {/* Suspend Modal */}
            <ConfirmModal
                open={suspendModal.open}
                title="Suspend Affiliate"
                description="This will prevent the affiliate from earning commissions. Are you sure?"
                confirmLabel="Suspend"
                variant="destructive"
                loading={suspendAffiliate.isPending}
                onConfirm={handleSuspend}
                onCancel={() => setSuspendModal({ open: false, id: "" })}
            />

            {/* Commission Edit Modal */}
            <Modal
                open={commissionModal.open}
                title="Edit Commission Rate"
                onClose={() => setCommissionModal({ open: false, id: "", rate: 10 })}
            >
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Commission Rate (%)</label>
                        <Input
                            type="number"
                            min={1}
                            max={50}
                            value={commissionModal.rate}
                            onChange={(e) => setCommissionModal((p) => ({ ...p, rate: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setCommissionModal({ open: false, id: "", rate: 10 })}>Cancel</Button>
                        <Button onClick={handleUpdateCommission} disabled={updateAffiliate.isPending}>
                            {updateAffiliate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Update Rate
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
