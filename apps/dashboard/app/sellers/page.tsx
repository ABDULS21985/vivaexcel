"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { Modal } from "@/components/modal";
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
    ArrowUpDown,
    Filter,
    X,
    Loader2,
    CheckCircle,
    DollarSign,
    Clock,
    Eye,
    Star,
    Users,
    ShieldCheck,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Download,
    UserX,
    UserCheck,
    Package,
    Percent,
    CreditCard,
    Store,
    Calendar,
} from "lucide-react";
import {
    useAdminSellers,
    useSuspendSeller,
    useReinstateSeller,
    useUpdateSeller,
} from "@/hooks/use-sellers";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SellerUser {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface Seller {
    id: string;
    displayName: string;
    slug: string;
    email?: string;
    status: string;
    verificationStatus: string;
    commissionRate: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    totalProducts: number;
    payoutBalance: number;
    createdAt: string;
    user?: SellerUser;
}

type SortOption =
    | "newest"
    | "oldest"
    | "revenue-high"
    | "most-sales"
    | "rating-high"
    | "rating-low";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    approved:
        "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    pending_review:
        "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    suspended:
        "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    rejected:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const STATUS_LABELS: Record<string, string> = {
    approved: "Approved",
    pending_review: "Pending Review",
    suspended: "Suspended",
    rejected: "Rejected",
};

const VERIFICATION_LABELS: Record<string, string> = {
    unverified: "Unverified",
    identity_verified: "Identity Verified",
    business_verified: "Business Verified",
};

const VERIFICATION_COLORS: Record<string, string> = {
    unverified:
        "bg-zinc-100/90 text-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-400",
    identity_verified:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    business_verified:
        "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function relativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    return "just now";
}

// ─── Stats Card Component ───────────────────────────────────────────────────

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgClass: string;
    description?: string;
}

function StatsCard({
    label,
    value,
    icon,
    iconBgClass,
    description,
}: StatsCardProps) {
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

// ─── Star Rating Component ──────────────────────────────────────────────────

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
            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                {Number(rating).toFixed(1)}
            </span>
        </div>
    );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SellersPage() {
    const { success, error: toastError } = useToast();

    // ─── Filter state ───────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [verificationFilter, setVerificationFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [commissionMin, setCommissionMin] = React.useState("");
    const [commissionMax, setCommissionMax] = React.useState("");

    // ─── Selection state ────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set()
    );
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // ─── Modal state ────────────────────────────────────────────────────
    const [isSuspendOpen, setIsSuspendOpen] = React.useState(false);
    const [sellerToSuspend, setSellerToSuspend] = React.useState<Seller | null>(
        null
    );
    const [isCommissionOpen, setIsCommissionOpen] = React.useState(false);
    const [sellerToEdit, setSellerToEdit] = React.useState<Seller | null>(null);
    const [newCommission, setNewCommission] = React.useState("");

    // ─── Pagination ─────────────────────────────────────────────────────
    const [page, setPage] = React.useState(1);

    // ─── Debounced search ───────────────────────────────────────────────
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [statusFilter, verificationFilter, sortOption, dateFrom, dateTo, commissionMin, commissionMax]);

    // ─── Build API filters ──────────────────────────────────────────────
    const apiFilters = React.useMemo(() => {
        const filters: Record<string, string> = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== "all") filters.status = statusFilter;
        return filters;
    }, [debouncedSearch, statusFilter]);

    // ─── Queries ────────────────────────────────────────────────────────
    const {
        data: sellersData,
        isLoading,
        error: sellersError,
    } = useAdminSellers(apiFilters);

    const allSellers: Seller[] = sellersData?.data ?? [];
    const sellersMeta = sellersData?.meta;

    // ─── Mutations ──────────────────────────────────────────────────────
    const suspendMutation = useSuspendSeller();
    const reinstateMutation = useReinstateSeller();
    const updateMutation = useUpdateSeller();

    // ─── Client-side filtering and sorting ──────────────────────────────
    const filteredSellers = React.useMemo(() => {
        let result = [...allSellers];

        // Verification filter
        if (verificationFilter !== "all") {
            result = result.filter(
                (s) => s.verificationStatus === verificationFilter
            );
        }

        // Date range filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            result = result.filter(
                (s) => new Date(s.createdAt) >= fromDate
            );
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(
                (s) => new Date(s.createdAt) <= toDate
            );
        }

        // Commission range filter
        if (commissionMin) {
            const min = parseFloat(commissionMin);
            if (!isNaN(min)) {
                result = result.filter((s) => Number(s.commissionRate) >= min);
            }
        }
        if (commissionMax) {
            const max = parseFloat(commissionMax);
            if (!isNaN(max)) {
                result = result.filter((s) => Number(s.commissionRate) <= max);
            }
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortOption) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "revenue-high":
                    return Number(b.totalRevenue) - Number(a.totalRevenue);
                case "most-sales":
                    return Number(b.totalSales) - Number(a.totalSales);
                case "rating-high":
                    return Number(b.averageRating) - Number(a.averageRating);
                case "rating-low":
                    return Number(a.averageRating) - Number(b.averageRating);
                default:
                    return 0;
            }
        });

        return result;
    }, [allSellers, verificationFilter, dateFrom, dateTo, commissionMin, commissionMax, sortOption]);

    // ─── Pagination ─────────────────────────────────────────────────────
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(filteredSellers.length / pageSize));
    const paginatedSellers = filteredSellers.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // ─── Computed Stats ─────────────────────────────────────────────────
    const computedStats = React.useMemo(() => {
        const totalCount = allSellers.length;
        const activeCount = allSellers.filter(
            (s) => s.status === "approved"
        ).length;
        const pendingCount = allSellers.filter(
            (s) => s.status === "pending_review"
        ).length;
        const totalRevenue = allSellers.reduce(
            (sum, s) => sum + Number(s.totalRevenue || 0),
            0
        );
        const avgCommission =
            totalCount > 0
                ? allSellers.reduce(
                      (sum, s) => sum + Number(s.commissionRate || 0),
                      0
                  ) / totalCount
                : 0;

        return {
            totalCount,
            activeCount,
            pendingCount,
            totalRevenue,
            avgCommission,
        };
    }, [allSellers]);

    // ─── Bulk Selection ─────────────────────────────────────────────────

    const isAllSelected =
        paginatedSellers.length > 0 &&
        paginatedSellers.every((s) => selectedIds.has(s.id));
    const isSomeSelected = paginatedSellers.some((s) =>
        selectedIds.has(s.id)
    );

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedSellers.map((s) => s.id)));
        }
    };

    const toggleSelectSeller = (id: string) => {
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

    // ─── Actions ────────────────────────────────────────────────────────

    const handleSuspendClick = (seller: Seller) => {
        setSellerToSuspend(seller);
        setIsSuspendOpen(true);
    };

    const handleConfirmSuspend = () => {
        if (!sellerToSuspend) return;

        suspendMutation.mutate(sellerToSuspend.id, {
            onSuccess: () => {
                success(
                    "Seller suspended",
                    `${sellerToSuspend.displayName} has been suspended.`
                );
                setIsSuspendOpen(false);
                setSellerToSuspend(null);
            },
            onError: (err) => {
                toastError(
                    "Suspension failed",
                    err.message || "Failed to suspend seller. Please try again."
                );
            },
        });
    };

    const handleReinstate = (seller: Seller) => {
        reinstateMutation.mutate(seller.id, {
            onSuccess: () => {
                success(
                    "Seller reinstated",
                    `${seller.displayName} has been reinstated.`
                );
            },
            onError: (err) => {
                toastError(
                    "Reinstatement failed",
                    err.message || "Failed to reinstate seller."
                );
            },
        });
    };

    const handleEditCommission = (seller: Seller) => {
        setSellerToEdit(seller);
        setNewCommission(String(Number(seller.commissionRate)));
        setIsCommissionOpen(true);
    };

    const handleSaveCommission = () => {
        if (!sellerToEdit) return;
        const rate = parseFloat(newCommission);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toastError(
                "Invalid rate",
                "Commission rate must be between 0 and 100."
            );
            return;
        }

        updateMutation.mutate(
            { id: sellerToEdit.id, data: { commissionRate: rate } },
            {
                onSuccess: () => {
                    success(
                        "Commission updated",
                        `${sellerToEdit.displayName}'s commission rate has been updated to ${rate}%.`
                    );
                    setIsCommissionOpen(false);
                    setSellerToEdit(null);
                    setNewCommission("");
                },
                onError: (err) => {
                    toastError(
                        "Update failed",
                        err.message || "Failed to update commission rate."
                    );
                },
            }
        );
    };

    // ─── Bulk Actions ───────────────────────────────────────────────────

    const handleBulkSuspend = async () => {
        const eligible = paginatedSellers.filter(
            (s) => selectedIds.has(s.id) && s.status === "approved"
        );

        if (eligible.length === 0) {
            toastError(
                "No eligible sellers",
                "Only approved sellers can be suspended."
            );
            return;
        }

        setIsBulkLoading(true);
        try {
            await Promise.all(
                eligible.map((s) => suspendMutation.mutateAsync(s.id))
            );
            success(
                "Sellers suspended",
                `${eligible.length} seller${eligible.length !== 1 ? "s" : ""} have been suspended.`
            );
            clearSelection();
        } catch {
            toastError("Error", "Failed to suspend some sellers.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleBulkUpdateCommission = () => {
        if (selectedIds.size === 0) return;
        // Open commission modal for bulk — use the first selected for context
        const firstSelected = paginatedSellers.find((s) =>
            selectedIds.has(s.id)
        );
        if (firstSelected) {
            setSellerToEdit(firstSelected);
            setNewCommission("");
            setIsCommissionOpen(true);
        }
    };

    const handleBulkExport = () => {
        const selectedSellers = paginatedSellers.filter((s) =>
            selectedIds.has(s.id)
        );
        if (selectedSellers.length === 0) return;

        const headers = [
            "ID",
            "Display Name",
            "Email",
            "Status",
            "Verification",
            "Commission Rate (%)",
            "Total Sales",
            "Total Revenue",
            "Average Rating",
            "Total Products",
            "Payout Balance",
            "Joined",
        ];
        const rows = selectedSellers.map((s) => [
            s.id,
            s.displayName,
            s.user?.email || s.email || "",
            s.status,
            s.verificationStatus || "unverified",
            String(Number(s.commissionRate)),
            String(s.totalSales),
            Number(s.totalRevenue).toFixed(2),
            Number(s.averageRating).toFixed(1),
            String(s.totalProducts),
            Number(s.payoutBalance).toFixed(2),
            new Date(s.createdAt).toISOString(),
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
        link.download = `sellers-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        success(
            "Export complete",
            `${selectedSellers.length} seller${selectedSellers.length !== 1 ? "s" : ""} exported to CSV.`
        );
    };

    // ─── Filters ────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setVerificationFilter("all");
        setSortOption("newest");
        setDateFrom("");
        setDateTo("");
        setCommissionMin("");
        setCommissionMax("");
        setPage(1);
    };

    const hasActiveFilters =
        statusFilter !== "all" ||
        verificationFilter !== "all" ||
        dateFrom !== "" ||
        dateTo !== "" ||
        commissionMin !== "" ||
        commissionMax !== "";

    const activeFilterCount = [
        statusFilter !== "all",
        verificationFilter !== "all",
        dateFrom !== "",
        dateTo !== "",
        commissionMin !== "",
        commissionMax !== "",
    ].filter(Boolean).length;

    // ─── Render helpers ─────────────────────────────────────────────────

    const getSellerDisplay = (seller: Seller) => {
        const name = seller.displayName;
        const email = seller.user?.email || seller.email || "";
        const initials = name
            ? name.charAt(0).toUpperCase()
            : email
            ? email.charAt(0).toUpperCase()
            : "S";

        return (
            <div className="flex items-center gap-3 min-w-0">
                {seller.user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={seller.user.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            {initials}
                        </span>
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <Link
                            href={`/sellers/${seller.id}`}
                            className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors truncate"
                        >
                            {name}
                        </Link>
                        {seller.verificationStatus === "business_verified" && (
                            <ShieldCheck className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                        )}
                        {seller.verificationStatus === "identity_verified" && (
                            <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {email}
                    </p>
                </div>
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        return (
            <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_COLORS[status] || ""}`}
            >
                {STATUS_LABELS[status] || status.replace(/_/g, " ")}
            </span>
        );
    };

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Sellers"
                description={
                    sellersMeta?.total !== undefined
                        ? `${sellersMeta.total} registered seller${sellersMeta.total !== 1 ? "s" : ""}`
                        : "Manage marketplace sellers and commissions"
                }
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Sellers" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/sellers/applications">
                            <PageHeaderButton variant="outline" icon={<Users className="h-4 w-4" />}>
                                Applications
                            </PageHeaderButton>
                        </Link>
                        <Link href="/sellers/payouts">
                            <PageHeaderButton variant="outline" icon={<CreditCard className="h-4 w-4" />}>
                                Payouts
                            </PageHeaderButton>
                        </Link>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatsCard
                        label="Total Sellers"
                        value={
                            isLoading
                                ? "..."
                                : computedStats.totalCount.toLocaleString()
                        }
                        icon={
                            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        }
                        iconBgClass="bg-indigo-100 dark:bg-indigo-900/40"
                        description="All registered sellers"
                    />
                    <StatsCard
                        label="Active Sellers"
                        value={
                            isLoading
                                ? "..."
                                : computedStats.activeCount.toLocaleString()
                        }
                        icon={
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
                        description="Currently approved"
                    />
                    <StatsCard
                        label="Pending Applications"
                        value={
                            isLoading
                                ? "..."
                                : computedStats.pendingCount.toLocaleString()
                        }
                        icon={
                            <Clock
                                className={`h-5 w-5 ${
                                    computedStats.pendingCount > 0
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-zinc-600 dark:text-zinc-400"
                                }`}
                            />
                        }
                        iconBgClass={
                            computedStats.pendingCount > 0
                                ? "bg-amber-100 dark:bg-amber-900/40"
                                : "bg-zinc-100 dark:bg-zinc-700/40"
                        }
                        description={
                            computedStats.pendingCount > 0
                                ? "Requires review"
                                : "No pending applications"
                        }
                    />
                    <StatsCard
                        label="Platform Revenue"
                        value={
                            isLoading
                                ? "..."
                                : formatPrice(computedStats.totalRevenue)
                        }
                        icon={
                            <DollarSign className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        }
                        iconBgClass="bg-sky-100 dark:bg-sky-900/40"
                        description="Total seller revenue"
                    />
                    <StatsCard
                        label="Avg Commission"
                        value={
                            isLoading
                                ? "..."
                                : `${computedStats.avgCommission.toFixed(1)}%`
                        }
                        icon={
                            <Percent className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        }
                        iconBgClass="bg-violet-100 dark:bg-violet-900/40"
                        description="Across all sellers"
                    />
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search sellers by name or email..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending_review">
                                        Pending Review
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={verificationFilter}
                                onValueChange={(v) => {
                                    setVerificationFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Verification" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Verification
                                    </SelectItem>
                                    <SelectItem value="unverified">
                                        Unverified
                                    </SelectItem>
                                    <SelectItem value="identity_verified">
                                        Identity Verified
                                    </SelectItem>
                                    <SelectItem value="business_verified">
                                        Business Verified
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
                                    <SelectItem value="revenue-high">
                                        Highest Revenue
                                    </SelectItem>
                                    <SelectItem value="most-sales">
                                        Most Sales
                                    </SelectItem>
                                    <SelectItem value="rating-high">
                                        Highest Rating
                                    </SelectItem>
                                    <SelectItem value="rating-low">
                                        Lowest Rating
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
                                    Commission Min (%)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="0"
                                    value={commissionMin}
                                    onChange={(e) =>
                                        setCommissionMin(e.target.value)
                                    }
                                    className="w-[130px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Commission Max (%)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="100"
                                    value={commissionMax}
                                    onChange={(e) =>
                                        setCommissionMax(e.target.value)
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

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {statusFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                Status: {STATUS_LABELS[statusFilter] || statusFilter}
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {verificationFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                Verification: {VERIFICATION_LABELS[verificationFilter] || verificationFilter}
                                <button
                                    onClick={() => setVerificationFilter("all")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {dateFrom && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                From: {dateFrom}
                                <button
                                    onClick={() => setDateFrom("")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {dateTo && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                To: {dateTo}
                                <button
                                    onClick={() => setDateTo("")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {commissionMin && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                Min: {commissionMin}%
                                <button
                                    onClick={() => setCommissionMin("")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {commissionMax && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                Max: {commissionMax}%
                                <button
                                    onClick={() => setCommissionMax("")}
                                    className="ml-0.5 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-7"
                        >
                            Clear All ({activeFilterCount})
                        </Button>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading sellers...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && sellersError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load sellers
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {sellersError.message ||
                                "An error occurred while fetching sellers."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !sellersError && (
                    <>
                        {/* Bulk select all header */}
                        {paginatedSellers.length > 0 && (
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
                                    {paginatedSellers.length} seller
                                    {paginatedSellers.length !== 1 ? "s" : ""}{" "}
                                    shown
                                    {filteredSellers.length >
                                        paginatedSellers.length && (
                                        <span>
                                            {" "}
                                            of {filteredSellers.length} total
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

                        {/* Sellers Table */}
                        {paginatedSellers.length > 0 ? (
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
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Products
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Sales
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                    Revenue
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                    Commission
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                    Rating
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                    Joined
                                                </th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {paginatedSellers.map((seller) => (
                                                <tr
                                                    key={seller.id}
                                                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors ${
                                                        selectedIds.has(
                                                            seller.id
                                                        )
                                                            ? "bg-primary/5 dark:bg-primary/10"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="w-10 px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(
                                                                seller.id
                                                            )}
                                                            onChange={() =>
                                                                toggleSelectSeller(
                                                                    seller.id
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getSellerDisplay(
                                                            seller
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(
                                                            seller.status
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                                            <Package className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {seller.totalProducts}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {Number(
                                                                seller.totalSales
                                                            ).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {formatPrice(
                                                                Number(
                                                                    seller.totalRevenue
                                                                )
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                                            {Number(
                                                                seller.commissionRate
                                                            )}
                                                            %
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <StarRating
                                                            rating={Number(
                                                                seller.averageRating
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {formatDate(
                                                                    seller.createdAt
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                {relativeTime(
                                                                    seller.createdAt
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/sellers/${seller.id}`}
                                                                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                title="View profile"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/sellers/${seller.id}`}
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                            Profile
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleEditCommission(
                                                                                seller
                                                                            )
                                                                        }
                                                                    >
                                                                        <Percent className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                        Commission
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    {seller.status ===
                                                                        "approved" && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleSuspendClick(
                                                                                    seller
                                                                                )
                                                                            }
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            <UserX className="mr-2 h-4 w-4" />
                                                                            Suspend
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {seller.status ===
                                                                        "suspended" && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleReinstate(
                                                                                    seller
                                                                                )
                                                                            }
                                                                            className="text-green-600 focus:text-green-600"
                                                                        >
                                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                                            Reinstate
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/sellers/${seller.id}/products`}
                                                                        >
                                                                            <Package className="mr-2 h-4 w-4" />
                                                                            View
                                                                            Products
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/sellers/${seller.id}/payouts`}
                                                                        >
                                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                                            View
                                                                            Payouts
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Page {page} of {totalPages}
                                            {" "}
                                            ({filteredSellers.length} seller
                                            {filteredSellers.length !== 1
                                                ? "s"
                                                : ""}
                                            )
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page <= 1}
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.max(1, p - 1)
                                                    )
                                                }
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= totalPages}
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1
                                                        )
                                                    )
                                                }
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Store className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No sellers found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || debouncedSearch
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Sellers will appear here once they register on the platform."}
                                </p>
                                {hasActiveFilters && (
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
                                {selectedIds.size} seller
                                {selectedIds.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
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

                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkUpdateCommission}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <Percent className="h-3.5 w-3.5 mr-1" />
                                Update Commission
                            </Button>

                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkSuspend}
                                disabled={isBulkLoading}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs"
                            >
                                {isBulkLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <UserX className="h-3.5 w-3.5 mr-1" />
                                )}
                                Suspend
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

            {/* Suspend Confirmation Modal */}
            <ConfirmModal
                open={isSuspendOpen}
                onOpenChange={setIsSuspendOpen}
                title="Suspend Seller"
                description={
                    sellerToSuspend
                        ? `Are you sure you want to suspend ${sellerToSuspend.displayName}? Their products will be hidden from the marketplace and they will not be able to receive new orders. This action can be reversed.`
                        : "Are you sure you want to suspend this seller?"
                }
                confirmLabel="Suspend Seller"
                cancelLabel="Cancel"
                onConfirm={handleConfirmSuspend}
                isLoading={suspendMutation.isPending}
                variant="danger"
            />

            {/* Commission Update Modal */}
            <Modal
                open={isCommissionOpen}
                onOpenChange={setIsCommissionOpen}
                title="Update Commission Rate"
                description={
                    sellerToEdit
                        ? `Set the commission rate for ${sellerToEdit.displayName}. Current rate: ${Number(sellerToEdit.commissionRate)}%`
                        : "Set the commission rate for this seller."
                }
                size="sm"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCommissionOpen(false);
                                setSellerToEdit(null);
                                setNewCommission("");
                            }}
                            disabled={updateMutation.isPending}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveCommission}
                            disabled={
                                updateMutation.isPending || !newCommission
                            }
                            className="flex-1"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            ) : null}
                            Save Changes
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Commission Rate (%)
                        </label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="e.g. 15"
                            value={newCommission}
                            onChange={(e) => setNewCommission(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Enter a value between 0 and 100. This is the
                            percentage the platform takes from each sale.
                        </p>
                    </div>
                    {selectedIds.size > 1 && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                This will update the commission rate for{" "}
                                {selectedIds.size} selected sellers.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
