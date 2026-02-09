"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { FormModal } from "@/components/modal";
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
    Package,
    Tag,
    ArrowUpDown,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import {
    useBundleDiscounts,
    useCreateBundleDiscount,
    type BundleDiscount,
    type BundleFilters,
    type BundleStatus,
} from "@/hooks/use-promotions";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    inactive: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    expired: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    expired: "Expired",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

// ─── Bundle Form Component ──────────────────────────────────────────────────

interface BundleFormProps {
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading: boolean;
    onCancel: () => void;
}

function BundleForm({ onSubmit, isLoading, onCancel }: BundleFormProps) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [bundlePrice, setBundlePrice] = React.useState("");
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
            bundlePrice: parseFloat(bundlePrice) || 0,
            productIds: ids,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Bundle Name *
                </label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Starter Pack Bundle"
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
                    Bundle Price *
                </label>
                <Input
                    type="number"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(e.target.value)}
                    placeholder="e.g. 49.99"
                    required
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Product IDs (comma-separated) *
                </label>
                <Input
                    value={productIds}
                    onChange={(e) => setProductIds(e.target.value)}
                    placeholder="e.g. product-id-1, product-id-2, product-id-3"
                    required
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter the IDs of products to include in this bundle.
                </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                    Create Bundle
                </Button>
            </div>
        </form>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function BundlesPage() {
    const { success, error: toastError } = useToast();

    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState("newest");

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: BundleFilters = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (sortOption === "newest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "ASC";
        } else if (sortOption === "savings-high") {
            filters.sortBy = "savingsPercentage";
            filters.sortOrder = "DESC";
        }
        return filters;
    }, [searchQuery, statusFilter, sortOption]);

    // Fetch data
    const { data: bundlesData, isLoading, error } = useBundleDiscounts(apiFilters);
    const bundles = bundlesData?.items ?? [];

    // Mutations
    const createBundleMutation = useCreateBundleDiscount();

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleCreate = (data: Record<string, unknown>) => {
        createBundleMutation.mutate(data, {
            onSuccess: () => {
                success("Bundle created", "The bundle deal has been created successfully.");
                setIsCreateOpen(false);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to create bundle deal.");
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

    const getStatusBadge = (status: BundleStatus) => (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_COLORS[status] || ""}`}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Bundle Deals"
                description="Create product bundles with special pricing"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Promotions", href: "/promotions/coupons" },
                    { label: "Bundles" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create Bundle
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
                                placeholder="Search bundles..."
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
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-[160px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="savings-high">Best Savings</SelectItem>
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
                        <p className="text-zinc-500 dark:text-zinc-400">Loading bundles...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load bundles
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error.message || "An error occurred while fetching bundles."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                        {bundles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {bundles.map((bundle) => (
                                    <div
                                        key={bundle.id}
                                        className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Header */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
                                                        {bundle.name}
                                                    </h3>
                                                    {bundle.description && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                            {bundle.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {getStatusBadge(bundle.status)}
                                            </div>

                                            {/* Products list */}
                                            <div className="space-y-2 mb-4">
                                                <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                                                    Products in bundle
                                                </p>
                                                <div className="space-y-1.5">
                                                    {bundle.products.slice(0, 4).map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="flex items-center justify-between gap-3 text-sm"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                                                    {product.productImage ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img
                                                                            src={product.productImage}
                                                                            alt=""
                                                                            className="h-8 w-8 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Package className="h-4 w-4 text-zinc-400" />
                                                                    )}
                                                                </div>
                                                                <span className="text-zinc-700 dark:text-zinc-300 truncate">
                                                                    {product.productTitle}
                                                                </span>
                                                            </div>
                                                            <span className="text-zinc-400 dark:text-zinc-500 line-through text-xs flex-shrink-0">
                                                                {formatPrice(product.originalPrice)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {bundle.products.length > 4 && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-10">
                                                            +{bundle.products.length - 4} more products
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Pricing */}
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        Original Total
                                                    </span>
                                                    <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                                                        {formatPrice(bundle.originalTotalPrice)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Bundle Price
                                                    </span>
                                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                        {formatPrice(bundle.bundlePrice)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                        Savings
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {formatPrice(bundle.savingsAmount)}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded">
                                                            {bundle.savingsPercentage.toFixed(0)}% OFF
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer actions */}
                                        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <Package className="h-3.5 w-3.5" />
                                                <span>{bundle.products.length} products</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {bundle.status === "active" ? (
                                                    <button
                                                        className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                                        title="Deactivate"
                                                    >
                                                        <ToggleRight className="h-5 w-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        title="Activate"
                                                    >
                                                        <ToggleLeft className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No bundle deals found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || searchQuery
                                        ? "Try adjusting your search or filters."
                                        : "Create bundle deals to offer product combinations at a discount."}
                                </p>
                                {!hasActiveFilters && !searchQuery && (
                                    <Button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="mt-4"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Bundle
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

            {/* Create Bundle Modal */}
            <FormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Create Bundle Deal"
                description="Combine products into a discounted bundle."
                size="xl"
            >
                <BundleForm
                    onSubmit={handleCreate}
                    isLoading={createBundleMutation.isPending}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </FormModal>
        </div>
    );
}
