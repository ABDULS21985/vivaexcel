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
    Loader2,
    X,
    Zap,
    Clock,
    Calendar,
    ShoppingBag,
    ArrowUpDown,
    Filter,
} from "lucide-react";
import {
    useFlashSales,
    useCreateFlashSale,
    type FlashSale,
    type FlashSaleFilters,
    type FlashSaleStatus,
} from "@/hooks/use-promotions";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    upcoming: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    active: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    ended: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    cancelled: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
    upcoming: "Upcoming",
    active: "Active",
    ended: "Ended",
    cancelled: "Cancelled",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Countdown Component ────────────────────────────────────────────────────

function Countdown({ targetDate, label }: { targetDate: string; label: string }) {
    const [timeLeft, setTimeLeft] = React.useState("");

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft("Ended");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                {label}
            </p>
            <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                {timeLeft}
            </p>
        </div>
    );
}

// ─── Flash Sale Form Component ──────────────────────────────────────────────

interface FlashSaleFormProps {
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading: boolean;
    onCancel: () => void;
}

function FlashSaleForm({ onSubmit, isLoading, onCancel }: FlashSaleFormProps) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [discountPercentage, setDiscountPercentage] = React.useState("");
    const [startsAt, setStartsAt] = React.useState("");
    const [endsAt, setEndsAt] = React.useState("");
    const [productIds, setProductIds] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const ids = productIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
        onSubmit({
            name,
            description: description || undefined,
            discountPercentage: parseFloat(discountPercentage) || 0,
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            productIds: ids.length > 0 ? ids : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Sale Name *
                </label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Black Friday Flash Sale"
                    required
                />
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

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Discount Percentage *
                </label>
                <Input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="e.g. 30"
                    required
                    min="1"
                    max="100"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Start Date & Time *
                    </label>
                    <Input
                        type="datetime-local"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        End Date & Time *
                    </label>
                    <Input
                        type="datetime-local"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Product IDs (comma-separated)
                </label>
                <Input
                    value={productIds}
                    onChange={(e) => setProductIds(e.target.value)}
                    placeholder="e.g. product-id-1, product-id-2"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter product IDs to include in this flash sale. Leave empty to apply to all products.
                </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                    Schedule Flash Sale
                </Button>
            </div>
        </form>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function FlashSalesPage() {
    const { success, error: toastError } = useToast();

    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState("newest");

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: FlashSaleFilters = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (sortOption === "newest") {
            filters.sortBy = "startsAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "startsAt";
            filters.sortOrder = "ASC";
        }
        return filters;
    }, [searchQuery, statusFilter, sortOption]);

    // Fetch data
    const { data: salesData, isLoading, error } = useFlashSales(apiFilters);
    const flashSales = salesData?.items ?? [];

    // Mutations
    const createFlashSaleMutation = useCreateFlashSale();

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleCreate = (data: Record<string, unknown>) => {
        createFlashSaleMutation.mutate(data, {
            onSuccess: () => {
                success("Flash sale scheduled", "The flash sale has been scheduled successfully.");
                setIsCreateOpen(false);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to create flash sale.");
            },
        });
    };

    // ─── Filters ─────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSortOption("newest");
    };

    const hasActiveFilters = statusFilter !== "all";

    // ─── Render helpers ──────────────────────────────────────────────────────

    const getStatusBadge = (status: FlashSaleStatus) => (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_COLORS[status] || ""}`}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );

    const getSaleProgress = (sale: FlashSale) => {
        const now = Date.now();
        const start = new Date(sale.startsAt).getTime();
        const end = new Date(sale.endsAt).getTime();

        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Flash Sales"
                description="Schedule and manage time-limited flash sales"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Promotions", href: "/promotions/coupons" },
                    { label: "Flash Sales" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Schedule Flash Sale
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
                                placeholder="Search flash sales..."
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
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="ended">Ended</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading flash sales...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load flash sales
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error.message || "An error occurred while fetching flash sales."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                        {flashSales.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {flashSales.map((sale) => {
                                    const progress = getSaleProgress(sale);
                                    const isActive = sale.status === "active";
                                    const isUpcoming = sale.status === "upcoming";

                                    return (
                                        <div
                                            key={sale.id}
                                            className={`relative bg-white dark:bg-zinc-800 rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                                                isActive
                                                    ? "border-green-300 dark:border-green-700 ring-1 ring-green-200 dark:ring-green-800"
                                                    : "border-zinc-200 dark:border-zinc-700"
                                            }`}
                                        >
                                            {/* Status indicator */}
                                            {isActive && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                                    </span>
                                                </div>
                                            )}

                                            {/* Header */}
                                            <div className="p-5 pb-4">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
                                                            {sale.name}
                                                        </h3>
                                                        {sale.description && (
                                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                                {sale.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(sale.status)}
                                                </div>

                                                {/* Discount badge */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                                                        <Zap className="h-4 w-4" />
                                                        <span className="text-lg font-bold">
                                                            {sale.discountPercentage}% OFF
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                                        <ShoppingBag className="h-4 w-4" />
                                                        <span>{sale.products.length} products</span>
                                                    </div>
                                                </div>

                                                {/* Countdown */}
                                                {(isActive || isUpcoming) && (
                                                    <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3">
                                                        {isUpcoming ? (
                                                            <Countdown
                                                                targetDate={sale.startsAt}
                                                                label="Starts in"
                                                            />
                                                        ) : (
                                                            <Countdown
                                                                targetDate={sale.endsAt}
                                                                label="Ends in"
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Progress bar (for active sales) */}
                                                {isActive && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                                            <span>Progress</span>
                                                            <span>{progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-green-500 transition-all"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-700">
                                                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{formatShortDate(sale.startsAt)}</span>
                                                    </div>
                                                    <span className="text-zinc-300 dark:text-zinc-600">-</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{formatShortDate(sale.endsAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No flash sales found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || searchQuery
                                        ? "Try adjusting your search or filters."
                                        : "Schedule your first flash sale to create urgency and boost sales."}
                                </p>
                                {!hasActiveFilters && !searchQuery && (
                                    <Button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="mt-4"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Schedule Flash Sale
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

            {/* Create Flash Sale Modal */}
            <FormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Schedule Flash Sale"
                description="Set up a time-limited flash sale with deep discounts."
                size="xl"
            >
                <FlashSaleForm
                    onSubmit={handleCreate}
                    isLoading={createFlashSaleMutation.isPending}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </FormModal>
        </div>
    );
}
