"use client";

import * as React from "react";
import Link from "next/link";
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";
import {
    Search,
    ArrowUpDown,
    Filter,
    X,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    Download,
    ChevronDown,
    MoreHorizontal,
    Play,
    RotateCcw,
    Eye,
    DollarSign,
    Copy,
    Calendar,
    ArrowRight,
    Users,
} from "lucide-react";
import {
    useAdminPayouts,
    useProcessPayout,
    sellerAdminKeys,
} from "../../../hooks/use-sellers";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayoutStatus = "pending" | "processing" | "completed" | "failed";

interface PayoutSeller {
    id: string;
    displayName: string;
    user?: {
        email: string;
        avatar?: string;
    };
}

interface Payout {
    id: string;
    amount: number;
    platformFee: number;
    netAmount: number;
    itemCount: number;
    status: PayoutStatus;
    failureReason?: string;
    stripeTransferId?: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
    processedAt?: string;
    completedAt?: string;
    seller: PayoutSeller;
}

interface PayoutsMeta {
    total?: number;
    hasNextPage?: boolean;
    nextCursor?: string;
}

type SortOption = "newest" | "oldest" | "amount-high" | "amount-low";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
    pending:
        "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    processing:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    completed:
        "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    failed: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
};

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDatetime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateRange(start: string, end: string): string {
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function getSellerInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function getFeePercentage(amount: number, fee: number): string {
    if (amount === 0) return "0";
    return ((fee / amount) * 100).toFixed(1);
}

// ─── Stats Card Component ────────────────────────────────────────────────────

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgClass: string;
    description?: string;
    highlight?: boolean;
}

function StatsCard({
    label,
    value,
    icon,
    iconBgClass,
    description,
    highlight,
}: StatsCardProps) {
    return (
        <div
            className={`bg-white dark:bg-zinc-800 rounded-xl border p-5 ${
                highlight
                    ? "border-red-300 dark:border-red-700"
                    : "border-zinc-200 dark:border-zinc-700"
            }`}
        >
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

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function PayoutsPage() {
    const { success, error: toastError } = useToast();

    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [amountMin, setAmountMin] = React.useState("");
    const [amountMax, setAmountMax] = React.useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set()
    );
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // Process confirmation state
    const [isProcessOpen, setIsProcessOpen] = React.useState(false);
    const [payoutToProcess, setPayoutToProcess] = React.useState<Payout | null>(
        null
    );
    const [isBulkProcessOpen, setIsBulkProcessOpen] = React.useState(false);

    // Detail sheet state
    const [detailPayout, setDetailPayout] = React.useState<Payout | null>(null);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);

    // Pagination cursor
    const [cursor, setCursor] = React.useState<string | undefined>(undefined);

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Build API params
    const apiParams = React.useMemo(() => {
        const params: { status?: string; sellerId?: string } = {};
        if (statusFilter !== "all") params.status = statusFilter;
        return params;
    }, [statusFilter]);

    // Fetch data
    const {
        data: payoutsData,
        isLoading,
        error: payoutsError,
    } = useAdminPayouts(apiParams);

    const allPayouts: Payout[] = (payoutsData?.data as Payout[]) ?? [];
    const payoutsMeta: PayoutsMeta = payoutsData?.meta ?? {};

    // Mutations
    const processPayoutMutation = useProcessPayout();

    // Client-side filtering, sorting & search
    const filteredPayouts = React.useMemo(() => {
        let result = [...allPayouts];

        // Search by seller name/email
        if (debouncedSearch) {
            const lower = debouncedSearch.toLowerCase();
            result = result.filter(
                (p) =>
                    p.seller?.displayName?.toLowerCase().includes(lower) ||
                    p.seller?.user?.email?.toLowerCase().includes(lower)
            );
        }

        // Date range filter
        if (dateFrom) {
            const from = new Date(dateFrom);
            result = result.filter(
                (p) => new Date(p.createdAt) >= from
            );
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(
                (p) => new Date(p.createdAt) <= to
            );
        }

        // Amount range filter
        if (amountMin) {
            const min = parseFloat(amountMin);
            if (!isNaN(min)) {
                result = result.filter((p) => p.netAmount >= min);
            }
        }
        if (amountMax) {
            const max = parseFloat(amountMax);
            if (!isNaN(max)) {
                result = result.filter((p) => p.netAmount <= max);
            }
        }

        // Sort
        result.sort((a, b) => {
            switch (sortOption) {
                case "newest":
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                case "oldest":
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    );
                case "amount-high":
                    return b.netAmount - a.netAmount;
                case "amount-low":
                    return a.netAmount - b.netAmount;
                default:
                    return 0;
            }
        });

        return result;
    }, [allPayouts, debouncedSearch, dateFrom, dateTo, amountMin, amountMax, sortOption]);

    // Computed stats from data
    const computedStats = React.useMemo(() => {
        const pending = allPayouts.filter((p) => p.status === "pending");
        const processing = allPayouts.filter((p) => p.status === "processing");
        const failed = allPayouts.filter((p) => p.status === "failed");

        // Completed this month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedThisMonth = allPayouts.filter(
            (p) =>
                p.status === "completed" &&
                p.completedAt &&
                new Date(p.completedAt) >= monthStart
        );

        return {
            pendingAmount: pending.reduce((sum, p) => sum + p.netAmount, 0),
            pendingCount: pending.length,
            processingAmount: processing.reduce(
                (sum, p) => sum + p.netAmount,
                0
            ),
            processingCount: processing.length,
            completedAmount: completedThisMonth.reduce(
                (sum, p) => sum + p.netAmount,
                0
            ),
            completedCount: completedThisMonth.length,
            failedAmount: failed.reduce((sum, p) => sum + p.netAmount, 0),
            failedCount: failed.length,
        };
    }, [allPayouts]);

    // ─── Bulk Selection ──────────────────────────────────────────────────────

    const isAllSelected =
        filteredPayouts.length > 0 &&
        filteredPayouts.every((p) => selectedIds.has(p.id));
    const isSomeSelected = filteredPayouts.some((p) => selectedIds.has(p.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPayouts.map((p) => p.id)));
        }
    };

    const toggleSelectPayout = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleProcessClick = (payout: Payout) => {
        setPayoutToProcess(payout);
        setIsProcessOpen(true);
    };

    const handleConfirmProcess = () => {
        if (!payoutToProcess) return;

        processPayoutMutation.mutate(payoutToProcess.id, {
            onSuccess: () => {
                success(
                    "Payout processing",
                    `Payout for ${payoutToProcess.seller.displayName} of ${formatPrice(payoutToProcess.netAmount)} has been initiated.`
                );
                setIsProcessOpen(false);
                setPayoutToProcess(null);
            },
            onError: (err) => {
                toastError(
                    "Processing failed",
                    err.message || "Failed to process payout. Please try again."
                );
            },
        });
    };

    const handleRetryClick = (payout: Payout) => {
        setPayoutToProcess(payout);
        setIsProcessOpen(true);
    };

    const handleViewDetails = (payout: Payout) => {
        setDetailPayout(payout);
        setIsDetailOpen(true);
    };

    const handleCopyTransferId = (transferId: string) => {
        navigator.clipboard.writeText(transferId);
        success("Copied", "Stripe transfer ID copied to clipboard.");
    };

    const handleBulkProcess = async () => {
        const eligiblePayouts = filteredPayouts.filter(
            (p) => selectedIds.has(p.id) && p.status === "pending"
        );

        if (eligiblePayouts.length === 0) {
            toastError(
                "No eligible payouts",
                "Only pending payouts can be processed."
            );
            return;
        }

        setIsBulkLoading(true);
        try {
            await Promise.all(
                eligiblePayouts.map((p) =>
                    processPayoutMutation.mutateAsync(p.id)
                )
            );
            success(
                "Payouts processing",
                `${eligiblePayouts.length} payout${eligiblePayouts.length !== 1 ? "s" : ""} have been initiated for processing.`
            );
            clearSelection();
            setIsBulkProcessOpen(false);
        } catch {
            toastError("Error", "Failed to process some payouts.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleExportSingle = (payout: Payout) => {
        exportPayoutsCSV([payout]);
    };

    const handleBulkExport = () => {
        const selectedPayouts = filteredPayouts.filter((p) =>
            selectedIds.has(p.id)
        );
        if (selectedPayouts.length === 0) return;
        exportPayoutsCSV(selectedPayouts);
    };

    const exportPayoutsCSV = (payouts: Payout[]) => {
        const headers = [
            "Payout ID",
            "Seller Name",
            "Seller Email",
            "Status",
            "Period Start",
            "Period End",
            "Gross Amount",
            "Platform Fee",
            "Net Amount",
            "Item Count",
            "Stripe Transfer ID",
            "Failure Reason",
            "Created At",
            "Processed At",
            "Completed At",
        ];
        const rows = payouts.map((p) => [
            p.id,
            p.seller.displayName,
            p.seller.user?.email || "",
            p.status,
            new Date(p.periodStart).toISOString(),
            new Date(p.periodEnd).toISOString(),
            p.amount.toFixed(2),
            p.platformFee.toFixed(2),
            p.netAmount.toFixed(2),
            p.itemCount.toString(),
            p.stripeTransferId || "",
            p.failureReason || "",
            new Date(p.createdAt).toISOString(),
            p.processedAt ? new Date(p.processedAt).toISOString() : "",
            p.completedAt ? new Date(p.completedAt).toISOString() : "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payouts-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        success(
            "Export complete",
            `${payouts.length} payout${payouts.length !== 1 ? "s" : ""} exported to CSV.`
        );
    };

    // ─── Filters ─────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setSortOption("newest");
        setDateFrom("");
        setDateTo("");
        setAmountMin("");
        setAmountMax("");
        setCursor(undefined);
    };

    const activeFilterCount = [
        statusFilter !== "all",
        dateFrom !== "",
        dateTo !== "",
        amountMin !== "",
        amountMax !== "",
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    // Reset cursor when filters change
    React.useEffect(() => {
        setCursor(undefined);
    }, [debouncedSearch, statusFilter, dateFrom, dateTo, amountMin, amountMax, sortOption]);

    // Bulk process info
    const selectedPendingPayouts = React.useMemo(() => {
        return filteredPayouts.filter(
            (p) => selectedIds.has(p.id) && p.status === "pending"
        );
    }, [filteredPayouts, selectedIds]);

    const selectedPendingTotal = React.useMemo(() => {
        return selectedPendingPayouts.reduce((sum, p) => sum + p.netAmount, 0);
    }, [selectedPendingPayouts]);

    // ─── Render helpers ──────────────────────────────────────────────────────

    const getStatusBadge = (payout: Payout) => {
        const status = payout.status;
        const iconClass = "h-3 w-3 mr-1 flex-shrink-0";

        const icons: Record<PayoutStatus, React.ReactNode> = {
            pending: <Clock className={iconClass} />,
            processing: (
                <Loader2 className={`${iconClass} animate-spin`} />
            ),
            completed: <CheckCircle className={iconClass} />,
            failed: <XCircle className={iconClass} />,
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${PAYOUT_STATUS_COLORS[status]}`}
                title={
                    status === "failed" && payout.failureReason
                        ? payout.failureReason
                        : undefined
                }
            >
                {icons[status]}
                {PAYOUT_STATUS_LABELS[status]}
            </span>
        );
    };

    const getSellerDisplay = (payout: Payout) => {
        const seller = payout.seller;
        const avatarUrl = seller.user?.avatar;
        const initials = getSellerInitials(seller.displayName || "??");

        return (
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full flex-shrink-0 overflow-hidden bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={seller.displayName}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                            {initials}
                        </span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {seller.displayName}
                    </p>
                    {seller.user?.email && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {seller.user.email}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Payouts"
                description={
                    payoutsMeta?.total !== undefined
                        ? `${payoutsMeta.total} total payout${payoutsMeta.total !== 1 ? "s" : ""}`
                        : "Manage seller payouts and disbursements"
                }
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Sellers", href: "/sellers" },
                    { label: "Payouts" },
                ]}
                actions={
                    <Link href="/sellers">
                        <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-1.5" />
                            All Sellers
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Pending"
                        value={
                            isLoading
                                ? "..."
                                : formatPrice(computedStats.pendingAmount)
                        }
                        icon={
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        }
                        iconBgClass="bg-amber-100 dark:bg-amber-900/40"
                        description={
                            isLoading
                                ? undefined
                                : `${computedStats.pendingCount} payout${computedStats.pendingCount !== 1 ? "s" : ""} awaiting`
                        }
                    />
                    <StatsCard
                        label="Processing"
                        value={
                            isLoading
                                ? "..."
                                : formatPrice(computedStats.processingAmount)
                        }
                        icon={
                            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        }
                        iconBgClass="bg-blue-100 dark:bg-blue-900/40"
                        description={
                            isLoading
                                ? undefined
                                : `${computedStats.processingCount} in transit`
                        }
                    />
                    <StatsCard
                        label="Completed This Month"
                        value={
                            isLoading
                                ? "..."
                                : formatPrice(computedStats.completedAmount)
                        }
                        icon={
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
                        description={
                            isLoading
                                ? undefined
                                : `${computedStats.completedCount} disbursed`
                        }
                    />
                    <StatsCard
                        label="Failed"
                        value={
                            isLoading
                                ? "..."
                                : formatPrice(computedStats.failedAmount)
                        }
                        icon={
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        }
                        iconBgClass="bg-red-100 dark:bg-red-900/40"
                        description={
                            isLoading
                                ? undefined
                                : `${computedStats.failedCount} need attention`
                        }
                        highlight={computedStats.failedCount > 0}
                    />
                </div>

                {/* Search, Filters */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search by seller name or email..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Processing
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortOption}
                                onValueChange={(v) =>
                                    setSortOption(v as SortOption)
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        Newest First
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        Oldest First
                                    </SelectItem>
                                    <SelectItem value="amount-high">
                                        Highest Amount
                                    </SelectItem>
                                    <SelectItem value="amount-low">
                                        Lowest Amount
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={
                                    showAdvancedFilters ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                    setShowAdvancedFilters(!showAdvancedFilters)
                                }
                                className="h-10"
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Advanced filters row */}
                    {showAdvancedFilters && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Date From
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-[170px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Date To
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-[170px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Amount Min ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amountMin}
                                    onChange={(e) =>
                                        setAmountMin(e.target.value)
                                    }
                                    className="w-[130px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Amount Max ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amountMax}
                                    onChange={(e) =>
                                        setAmountMax(e.target.value)
                                    }
                                    className="w-[130px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading payouts...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && payoutsError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load payouts
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {(payoutsError as Error).message ||
                                "An error occurred while fetching payouts."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !payoutsError && (
                    <>
                        {/* Bulk select all header */}
                        {filteredPayouts.length > 0 && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el)
                                                el.indeterminate =
                                                    isSomeSelected &&
                                                    !isAllSelected;
                                        }}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium">
                                        {isAllSelected
                                            ? "Deselect all"
                                            : "Select all"}
                                    </span>
                                </label>
                                <span className="text-zinc-400">
                                    Showing {filteredPayouts.length} payout
                                    {filteredPayouts.length !== 1 ? "s" : ""}
                                    {payoutsMeta?.total !== undefined &&
                                        payoutsMeta.total >
                                            filteredPayouts.length && (
                                            <span>
                                                {" "}
                                                of {payoutsMeta.total} total
                                            </span>
                                        )}
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                                        {selectedIds.size} selected
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Payouts Table */}
                        {filteredPayouts.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="w-10 px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        ref={(el) => {
                                                            if (el)
                                                                el.indeterminate =
                                                                    isSomeSelected &&
                                                                    !isAllSelected;
                                                        }}
                                                        onChange={
                                                            toggleSelectAll
                                                        }
                                                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                    />
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Seller
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                    Period
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Gross
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Fee
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Net
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                    Items
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {filteredPayouts.map((payout) => (
                                                <tr
                                                    key={payout.id}
                                                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors ${
                                                        selectedIds.has(
                                                            payout.id
                                                        )
                                                            ? "bg-primary/5 dark:bg-primary/10"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="w-10 px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(
                                                                payout.id
                                                            )}
                                                            onChange={() =>
                                                                toggleSelectPayout(
                                                                    payout.id
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getSellerDisplay(
                                                            payout
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {formatDate(
                                                                    payout.periodStart
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                to{" "}
                                                                {formatDate(
                                                                    payout.periodEnd
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            {formatPrice(
                                                                payout.amount
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                {formatPrice(
                                                                    payout.platformFee
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                (
                                                                {getFeePercentage(
                                                                    payout.amount,
                                                                    payout.platformFee
                                                                )}
                                                                %)
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {formatPrice(
                                                                payout.netAmount
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                                            <Package className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {payout.itemCount}{" "}
                                                            order
                                                            {payout.itemCount !==
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(payout)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-48"
                                                            >
                                                                {payout.status ===
                                                                    "pending" && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleProcessClick(
                                                                                payout
                                                                            )
                                                                        }
                                                                    >
                                                                        <Play className="h-4 w-4 mr-2" />
                                                                        Process
                                                                        Payout
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {payout.status ===
                                                                    "failed" && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleRetryClick(
                                                                                payout
                                                                            )
                                                                        }
                                                                    >
                                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                                        Retry
                                                                        Payout
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleViewDetails(
                                                                            payout
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleExportSingle(
                                                                            payout
                                                                        )
                                                                    }
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Export CSV
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination / Load More */}
                                {payoutsMeta?.hasNextPage && (
                                    <div className="flex items-center justify-center py-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (payoutsMeta?.nextCursor) {
                                                    setCursor(
                                                        payoutsMeta.nextCursor
                                                    );
                                                }
                                            }}
                                            className="gap-1.5"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                            Load More Payouts
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No payouts found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || debouncedSearch
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Payouts will appear here once sellers have completed orders to disburse."}
                                </p>
                                {(hasActiveFilters || debouncedSearch) && (
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="mt-4 text-primary"
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-2xl px-5 py-3 border border-zinc-700 dark:border-zinc-300">
                        <div className="flex items-center gap-2 pr-3 border-r border-zinc-700 dark:border-zinc-300">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium whitespace-nowrap">
                                {selectedIds.size} payout
                                {selectedIds.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {selectedPendingPayouts.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkProcessOpen(true)}
                                    disabled={isBulkLoading}
                                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 dark:text-emerald-600 dark:hover:text-emerald-700 dark:hover:bg-emerald-100 h-8 text-xs"
                                >
                                    {isBulkLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                    ) : (
                                        <Play className="h-3.5 w-3.5 mr-1" />
                                    )}
                                    Process ({selectedPendingPayouts.length})
                                </Button>
                            )}

                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkExport}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Export CSV
                            </Button>
                        </div>

                        <div className="pl-2 border-l border-zinc-700 dark:border-zinc-300">
                            <button
                                onClick={clearSelection}
                                className="p-1 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Confirmation Modal */}
            <ConfirmModal
                open={isProcessOpen}
                onOpenChange={setIsProcessOpen}
                title={
                    payoutToProcess?.status === "failed"
                        ? "Retry Payout"
                        : "Process Payout"
                }
                description={
                    payoutToProcess
                        ? `Are you sure you want to ${payoutToProcess.status === "failed" ? "retry" : "process"} the payout for ${payoutToProcess.seller.displayName}? This will initiate a Stripe transfer of ${formatPrice(payoutToProcess.netAmount)}.`
                        : "Are you sure you want to process this payout?"
                }
                confirmLabel={
                    payoutToProcess?.status === "failed"
                        ? "Retry Payout"
                        : "Process Payout"
                }
                cancelLabel="Cancel"
                onConfirm={handleConfirmProcess}
                isLoading={processPayoutMutation.isPending}
                variant="warning"
            />

            {/* Bulk Process Confirmation Modal */}
            <ConfirmModal
                open={isBulkProcessOpen}
                onOpenChange={setIsBulkProcessOpen}
                title="Process Multiple Payouts"
                description={`You are about to process ${selectedPendingPayouts.length} pending payout${selectedPendingPayouts.length !== 1 ? "s" : ""} totaling ${formatPrice(selectedPendingTotal)}. This will initiate Stripe transfers for each seller. This action cannot be undone.`}
                confirmLabel={`Process ${selectedPendingPayouts.length} Payout${selectedPendingPayouts.length !== 1 ? "s" : ""}`}
                cancelLabel="Cancel"
                onConfirm={handleBulkProcess}
                isLoading={isBulkLoading}
                variant="warning"
            />

            {/* Payout Detail Sheet */}
            <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Payout Details</SheetTitle>
                        <SheetDescription>
                            {detailPayout
                                ? `Payout for ${detailPayout.seller.displayName}`
                                : "Loading payout details..."}
                        </SheetDescription>
                    </SheetHeader>

                    {detailPayout && (
                        <div className="mt-6 space-y-6">
                            {/* Seller Info */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                                    Seller
                                </h4>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                                        {detailPayout.seller.user?.avatar ? (
                                            <img
                                                src={
                                                    detailPayout.seller.user
                                                        .avatar
                                                }
                                                alt={
                                                    detailPayout.seller
                                                        .displayName
                                                }
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                                {getSellerInitials(
                                                    detailPayout.seller
                                                        .displayName
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {
                                                detailPayout.seller
                                                    .displayName
                                            }
                                        </p>
                                        {detailPayout.seller.user?.email && (
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {
                                                    detailPayout.seller.user
                                                        .email
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Period Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                                    Period
                                </h4>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                                    <Calendar className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                        {formatDate(
                                            detailPayout.periodStart
                                        )}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-zinc-400" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                        {formatDate(
                                            detailPayout.periodEnd
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                                    Amount Breakdown
                                </h4>
                                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-700/50">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Gross Amount
                                        </span>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {formatPrice(
                                                detailPayout.amount
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Platform Fee (
                                            {getFeePercentage(
                                                detailPayout.amount,
                                                detailPayout.platformFee
                                            )}
                                            %)
                                        </span>
                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                            -
                                            {formatPrice(
                                                detailPayout.platformFee
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-900/20">
                                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                            Net Amount
                                        </span>
                                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                            {formatPrice(
                                                detailPayout.netAmount
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Item Count */}
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                                <Package className="h-4 w-4 text-zinc-500" />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {detailPayout.itemCount} order
                                    {detailPayout.itemCount !== 1
                                        ? "s"
                                        : ""}{" "}
                                    included
                                </span>
                            </div>

                            {/* Stripe Transfer ID */}
                            {detailPayout.stripeTransferId && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                                        Stripe Transfer ID
                                    </h4>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                                        <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                                            {
                                                detailPayout.stripeTransferId
                                            }
                                        </code>
                                        <button
                                            onClick={() =>
                                                handleCopyTransferId(
                                                    detailPayout.stripeTransferId!
                                                )
                                            }
                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex-shrink-0"
                                            title="Copy transfer ID"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Processing Timeline */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                                    Timeline
                                </h4>
                                <div className="space-y-0">
                                    {/* Created */}
                                    <div className="flex items-start gap-3 relative pb-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-3 w-3 text-zinc-600 dark:text-zinc-300" />
                                            </div>
                                            <div className="w-px h-full bg-zinc-200 dark:bg-zinc-600 mt-1" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                Created
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {formatDatetime(
                                                    detailPayout.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Processing */}
                                    {detailPayout.processedAt && (
                                        <div className="flex items-start gap-3 relative pb-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                                    <Loader2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-600 mt-1" />
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    Processing
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {formatDatetime(
                                                        detailPayout.processedAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Completed */}
                                    {detailPayout.completedAt && (
                                        <div className="flex items-start gap-3 relative">
                                            <div className="flex flex-col items-center">
                                                <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    Completed
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {formatDatetime(
                                                        detailPayout.completedAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Failed */}
                                    {detailPayout.status === "failed" &&
                                        !detailPayout.completedAt && (
                                            <div className="flex items-start gap-3 relative">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                                                        <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 pt-0.5">
                                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                        Failed
                                                    </p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {detailPayout.processedAt
                                                            ? formatDatetime(
                                                                  detailPayout.processedAt
                                                              )
                                                            : formatDatetime(
                                                                  detailPayout.createdAt
                                                              )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {/* Pending indicator */}
                                    {detailPayout.status === "pending" && (
                                        <div className="flex items-start gap-3 relative">
                                            <div className="flex flex-col items-center">
                                                <div className="h-6 w-6 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center flex-shrink-0">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                                                    Awaiting processing
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Processing indicator */}
                                    {detailPayout.status === "processing" &&
                                        !detailPayout.completedAt && (
                                            <div className="flex items-start gap-3 relative">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-6 w-6 rounded-full border-2 border-dashed border-blue-300 dark:border-blue-600 flex items-center justify-center flex-shrink-0">
                                                        <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 pt-0.5">
                                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                        Transfer in progress
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Failure Reason */}
                            {detailPayout.status === "failed" &&
                                detailPayout.failureReason && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                                            Failure Reason
                                        </h4>
                                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                {detailPayout.failureReason}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsDetailOpen(false);
                                                handleRetryClick(
                                                    detailPayout
                                                );
                                            }}
                                            className="w-full"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-1.5" />
                                            Retry This Payout
                                        </Button>
                                    </div>
                                )}

                            {/* Process button for pending */}
                            {detailPayout.status === "pending" && (
                                <Button
                                    onClick={() => {
                                        setIsDetailOpen(false);
                                        handleProcessClick(detailPayout);
                                    }}
                                    className="w-full"
                                >
                                    <Play className="h-4 w-4 mr-1.5" />
                                    Process This Payout
                                </Button>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
