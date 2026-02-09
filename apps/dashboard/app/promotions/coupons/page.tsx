"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal, FormModal } from "@/components/modal";
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
    Plus,
    Search,
    Pencil,
    Trash,
    Loader2,
    X,
    Filter,
    ArrowUpDown,
    Ticket,
    Copy,
    ChevronDown,
} from "lucide-react";
import {
    useCoupons,
    useCreateCoupon,
    useUpdateCoupon,
    useDeleteCoupon,
    type Coupon,
    type CouponFilters,
    type DiscountType,
    type CouponStatus,
} from "@/hooks/use-promotions";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    expired: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    depleted: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    disabled: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    expired: "Expired",
    depleted: "Depleted",
    disabled: "Disabled",
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
    percentage: "Percentage",
    fixed_amount: "Fixed Amount",
    free_shipping: "Free Shipping",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDiscount(type: DiscountType, value: number): string {
    switch (type) {
        case "percentage":
            return `${value}%`;
        case "fixed_amount":
            return `$${value.toFixed(2)}`;
        case "free_shipping":
            return "Free Shipping";
        default:
            return String(value);
    }
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getUsagePercentage(coupon: Coupon): number {
    if (!coupon.usageLimit) return 0;
    return Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100);
}

// ─── Coupon Form Component ──────────────────────────────────────────────────

interface CouponFormProps {
    coupon?: Coupon | null;
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading: boolean;
    onCancel: () => void;
}

function CouponForm({ coupon, onSubmit, isLoading, onCancel }: CouponFormProps) {
    const [code, setCode] = React.useState(coupon?.code ?? "");
    const [name, setName] = React.useState(coupon?.name ?? "");
    const [description, setDescription] = React.useState(coupon?.description ?? "");
    const [discountType, setDiscountType] = React.useState<string>(coupon?.discountType ?? "percentage");
    const [discountValue, setDiscountValue] = React.useState(coupon?.discountValue?.toString() ?? "");
    const [minimumOrderAmount, setMinimumOrderAmount] = React.useState(coupon?.minimumOrderAmount?.toString() ?? "");
    const [maximumDiscountAmount, setMaximumDiscountAmount] = React.useState(coupon?.maximumDiscountAmount?.toString() ?? "");
    const [usageLimit, setUsageLimit] = React.useState(coupon?.usageLimit?.toString() ?? "");
    const [perUserLimit, setPerUserLimit] = React.useState(coupon?.perUserLimit?.toString() ?? "");
    const [startsAt, setStartsAt] = React.useState(coupon?.startsAt ? coupon.startsAt.split("T")[0] : new Date().toISOString().split("T")[0]);
    const [expiresAt, setExpiresAt] = React.useState(coupon?.expiresAt ? coupon.expiresAt.split("T")[0] : "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            code: code.toUpperCase(),
            name,
            description: description || undefined,
            discountType,
            discountValue: parseFloat(discountValue) || 0,
            minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : undefined,
            maximumDiscountAmount: maximumDiscountAmount ? parseFloat(maximumDiscountAmount) : undefined,
            usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
            perUserLimit: perUserLimit ? parseInt(perUserLimit) : undefined,
            startsAt: new Date(startsAt).toISOString(),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });
    };

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Coupon Code *
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SUMMER20"
                            required
                            className="font-mono uppercase"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={generateCode} className="shrink-0">
                            Generate
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Name *
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Summer Sale 20% Off"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                </label>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Discount Type *
                    </label>
                    <Select value={discountType} onValueChange={setDiscountType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            <SelectItem value="free_shipping">Free Shipping</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Discount Value *
                    </label>
                    <Input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 10.00"}
                        required={discountType !== "free_shipping"}
                        disabled={discountType === "free_shipping"}
                        min="0"
                        step={discountType === "percentage" ? "1" : "0.01"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Minimum Order Amount
                    </label>
                    <Input
                        type="number"
                        value={minimumOrderAmount}
                        onChange={(e) => setMinimumOrderAmount(e.target.value)}
                        placeholder="No minimum"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Maximum Discount Amount
                    </label>
                    <Input
                        type="number"
                        value={maximumDiscountAmount}
                        onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                        placeholder="No maximum"
                        min="0"
                        step="0.01"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Total Usage Limit
                    </label>
                    <Input
                        type="number"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        placeholder="Unlimited"
                        min="1"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Per User Limit
                    </label>
                    <Input
                        type="number"
                        value={perUserLimit}
                        onChange={(e) => setPerUserLimit(e.target.value)}
                        placeholder="Unlimited"
                        min="1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Start Date *
                    </label>
                    <Input
                        type="date"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Expiry Date
                    </label>
                    <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        placeholder="No expiry"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                    {coupon ? "Update Coupon" : "Create Coupon"}
                </Button>
            </div>
        </form>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function CouponsPage() {
    const { success, error: toastError } = useToast();

    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [discountTypeFilter, setDiscountTypeFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedCoupon, setSelectedCoupon] = React.useState<Coupon | null>(null);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: CouponFilters = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (discountTypeFilter !== "all") filters.discountType = discountTypeFilter;
        if (sortOption === "newest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "ASC";
        } else if (sortOption === "most-used") {
            filters.sortBy = "usageCount";
            filters.sortOrder = "DESC";
        }
        return filters;
    }, [searchQuery, statusFilter, discountTypeFilter, sortOption]);

    // Fetch data
    const { data: couponsData, isLoading, error } = useCoupons(apiFilters);
    const coupons = couponsData?.items ?? [];

    // Mutations
    const createCouponMutation = useCreateCoupon();
    const updateCouponMutation = useUpdateCoupon();
    const deleteCouponMutation = useDeleteCoupon();

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleCreate = (data: Record<string, unknown>) => {
        createCouponMutation.mutate(data, {
            onSuccess: () => {
                success("Coupon created", "The coupon has been created successfully.");
                setIsCreateOpen(false);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to create coupon.");
            },
        });
    };

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsEditOpen(true);
    };

    const handleUpdate = (data: Record<string, unknown>) => {
        if (!selectedCoupon) return;
        updateCouponMutation.mutate(
            { id: selectedCoupon.id, data },
            {
                onSuccess: () => {
                    success("Coupon updated", "The coupon has been updated successfully.");
                    setIsEditOpen(false);
                    setSelectedCoupon(null);
                },
                onError: (err) => {
                    toastError("Error", err.message || "Failed to update coupon.");
                },
            },
        );
    };

    const handleDeleteClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedCoupon) return;
        deleteCouponMutation.mutate(selectedCoupon.id, {
            onSuccess: () => {
                success("Coupon deleted", `Coupon "${selectedCoupon.code}" has been deleted.`);
                setIsDeleteOpen(false);
                setSelectedCoupon(null);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to delete coupon.");
            },
        });
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        success("Copied", `Code "${code}" copied to clipboard.`);
    };

    // ─── Filters ─────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setDiscountTypeFilter("all");
        setSortOption("newest");
    };

    const hasActiveFilters =
        statusFilter !== "all" || discountTypeFilter !== "all";

    // ─── Render helpers ──────────────────────────────────────────────────────

    const getStatusBadge = (status: CouponStatus) => (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_COLORS[status] || ""}`}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );

    const getUsageBar = (coupon: Coupon) => {
        const pct = getUsagePercentage(coupon);
        const barColor =
            pct >= 90
                ? "bg-red-500"
                : pct >= 70
                  ? "bg-amber-500"
                  : "bg-emerald-500";

        return (
            <div className="min-w-[100px]">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>{coupon.usageCount}</span>
                    <span>{coupon.usageLimit ? `/ ${coupon.usageLimit}` : "unlimited"}</span>
                </div>
                {coupon.usageLimit ? (
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                ) : (
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full" />
                )}
            </div>
        );
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Coupon Management"
                description="Create and manage discount coupons for your store"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Promotions", href: "/promotions/coupons" },
                    { label: "Coupons" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create Coupon
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search, Filters */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search by code or name..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="depleted">Depleted</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="most-used">Most Used</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={showAdvancedFilters ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10"
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        !
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Discount Type
                                </label>
                                <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                    </SelectContent>
                                </Select>
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
                        <p className="text-zinc-500 dark:text-zinc-400">Loading coupons...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load coupons
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error.message || "An error occurred while fetching coupons."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                        {coupons.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Code
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Discount
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                    Usage
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                    Dates
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
                                            {coupons.map((coupon) => (
                                                <tr
                                                    key={coupon.id}
                                                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-mono font-semibold text-primary">
                                                                {coupon.code}
                                                            </span>
                                                            <button
                                                                onClick={() => handleCopyCode(coupon.code)}
                                                                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded transition-colors"
                                                                title="Copy code"
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">
                                                                {coupon.name}
                                                            </p>
                                                            {coupon.description && (
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                                                                    {coupon.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                                {formatDiscount(coupon.discountType, coupon.discountValue)}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                {DISCOUNT_TYPE_LABELS[coupon.discountType]}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        {getUsageBar(coupon)}
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <div className="flex flex-col text-xs text-zinc-600 dark:text-zinc-400">
                                                            <span>From: {formatDate(coupon.startsAt)}</span>
                                                            <span>
                                                                To:{" "}
                                                                {coupon.expiresAt
                                                                    ? formatDate(coupon.expiresAt)
                                                                    : "No expiry"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(coupon.status)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleEdit(coupon)}
                                                                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                title="Edit coupon"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(coupon)}
                                                                className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                title="Delete coupon"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {couponsData?.meta?.hasNextPage && (
                                    <div className="flex items-center justify-center py-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <ChevronDown className="h-4 w-4" />
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Ticket className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No coupons found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || searchQuery
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Create your first coupon to start offering discounts."}
                                </p>
                                {!hasActiveFilters && !searchQuery && (
                                    <Button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="mt-4"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Coupon
                                    </Button>
                                )}
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

            {/* Create Coupon Modal */}
            <FormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Create Coupon"
                description="Set up a new discount coupon for your store."
                size="xl"
            >
                <CouponForm
                    onSubmit={handleCreate}
                    isLoading={createCouponMutation.isPending}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </FormModal>

            {/* Edit Coupon Modal */}
            <FormModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                title="Edit Coupon"
                description="Update the coupon settings."
                size="xl"
            >
                <CouponForm
                    coupon={selectedCoupon}
                    onSubmit={handleUpdate}
                    isLoading={updateCouponMutation.isPending}
                    onCancel={() => {
                        setIsEditOpen(false);
                        setSelectedCoupon(null);
                    }}
                />
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Coupon"
                description={
                    selectedCoupon
                        ? `Are you sure you want to delete coupon "${selectedCoupon.code}"? This action cannot be undone.`
                        : "Are you sure you want to delete this coupon?"
                }
                confirmLabel="Delete Coupon"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                isLoading={deleteCouponMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
