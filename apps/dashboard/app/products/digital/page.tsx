"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
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
} from "@ktblog/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash,
    Search,
    LayoutGrid,
    List,
    Check,
    ArrowUpDown,
    Filter,
    X,
    Loader2,
    Download,
    Star,
    Eye,
    Archive,
    Package,
    DollarSign,
    CheckCircle,
    Trash2,
    EyeOff,
} from "lucide-react";
import {
    useDigitalProducts,
    useDigitalProductCategories,
    useDeleteDigitalProduct,
    usePublishDigitalProduct,
    useArchiveDigitalProduct,
    type DigitalProduct,
} from "@/hooks/use-digital-products";

type ViewMode = "grid" | "table";
type SortOption =
    | "newest"
    | "oldest"
    | "price-high"
    | "price-low"
    | "downloads"
    | "rating";

const PRODUCT_TYPE_LABELS: Record<DigitalProduct["type"], string> = {
    powerpoint: "PowerPoint",
    document: "Document",
    web_template: "Web Template",
    startup_kit: "Startup Kit",
    solution_template: "Solution Template",
    design_system: "Design System",
    code_template: "Code Template",
    other: "Other",
};

const PRODUCT_TYPE_COLORS: Record<DigitalProduct["type"], string> = {
    powerpoint:
        "bg-orange-100/90 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300",
    document:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    web_template:
        "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
    startup_kit:
        "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300",
    solution_template:
        "bg-cyan-100/90 text-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-300",
    design_system:
        "bg-pink-100/90 text-pink-700 dark:bg-pink-900/80 dark:text-pink-300",
    code_template:
        "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300",
    other: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

export default function DigitalProductsPage() {
    const { success, error: toastError } = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] =
        React.useState<DigitalProduct | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [categoryFilter, setCategoryFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set()
    );
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: Record<string, unknown> = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (typeFilter !== "all") filters.type = typeFilter;
        if (categoryFilter !== "all") filters.categorySlug = categoryFilter;
        if (sortOption === "newest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "ASC";
        } else if (sortOption === "price-high") {
            filters.sortBy = "price";
            filters.sortOrder = "DESC";
        } else if (sortOption === "price-low") {
            filters.sortBy = "price";
            filters.sortOrder = "ASC";
        } else if (sortOption === "downloads") {
            filters.sortBy = "downloadCount";
            filters.sortOrder = "DESC";
        } else if (sortOption === "rating") {
            filters.sortBy = "averageRating";
            filters.sortOrder = "DESC";
        }
        return filters;
    }, [searchQuery, statusFilter, typeFilter, categoryFilter, sortOption]);

    // Fetch data
    const {
        data: productsData,
        isLoading: isLoadingProducts,
        error: productsError,
    } = useDigitalProducts(apiFilters);
    const products = productsData?.items ?? [];

    const { data: categoriesData } = useDigitalProductCategories();
    const allCategories = categoriesData?.categories ?? [];

    // Mutations
    const deleteProductMutation = useDeleteDigitalProduct();
    const publishProductMutation = usePublishDigitalProduct();
    const archiveProductMutation = useArchiveDigitalProduct();

    // Bulk selection helpers
    const isAllSelected =
        products.length > 0 && products.every((p) => selectedIds.has(p.id));
    const isSomeSelected = products.some((p) => selectedIds.has(p.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map((p) => p.id)));
        }
    };

    const toggleSelectProduct = (id: string) => {
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

    // Quick actions
    const handlePublish = (product: DigitalProduct) => {
        publishProductMutation.mutate(product.id, {
            onSuccess: () => {
                success(
                    "Product published",
                    `"${product.title}" has been published.`
                );
            },
            onError: () => {
                toastError("Error", "Failed to publish product.");
            },
        });
    };

    const handleArchive = (product: DigitalProduct) => {
        archiveProductMutation.mutate(product.id, {
            onSuccess: () => {
                success(
                    "Product archived",
                    `"${product.title}" has been archived.`
                );
            },
            onError: () => {
                toastError("Error", "Failed to archive product.");
            },
        });
    };

    const handleDelete = (product: DigitalProduct) => {
        setSelectedProduct(product);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;

        deleteProductMutation.mutate(selectedProduct.id, {
            onSuccess: () => {
                success(
                    "Product deleted",
                    "The digital product has been deleted successfully."
                );
                setIsDeleteOpen(false);
                setSelectedProduct(null);
            },
            onError: () => {
                toastError("Error", "Failed to delete digital product.");
            },
        });
    };

    // Bulk actions
    const handleBulkPublish = async () => {
        setIsBulkLoading(true);
        try {
            const ids = Array.from(selectedIds);
            await Promise.all(
                ids.map((id) => publishProductMutation.mutateAsync(id))
            );
            success(
                "Products published",
                `${ids.length} products have been published.`
            );
            clearSelection();
        } catch {
            toastError("Error", "Failed to publish selected products.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleBulkArchive = async () => {
        setIsBulkLoading(true);
        try {
            const ids = Array.from(selectedIds);
            await Promise.all(
                ids.map((id) => archiveProductMutation.mutateAsync(id))
            );
            success(
                "Products archived",
                `${ids.length} products have been archived.`
            );
            clearSelection();
        } catch {
            toastError("Error", "Failed to archive selected products.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkLoading(true);
        try {
            const ids = Array.from(selectedIds);
            await Promise.all(
                ids.map((id) => deleteProductMutation.mutateAsync(id))
            );
            success(
                "Products deleted",
                `${ids.length} products have been deleted.`
            );
            clearSelection();
        } catch {
            toastError("Error", "Failed to delete selected products.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setTypeFilter("all");
        setCategoryFilter("all");
        setSortOption("newest");
    };

    const hasActiveFilters =
        statusFilter !== "all" ||
        typeFilter !== "all" ||
        categoryFilter !== "all";

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published:
                "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
            draft: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
            archived:
                "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
            coming_soon:
                "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
        };
        const labels: Record<string, string> = {
            published: "Published",
            draft: "Draft",
            archived: "Archived",
            coming_soon: "Coming Soon",
        };
        return (
            <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}
            >
                {labels[status] || status}
            </span>
        );
    };

    const getTypeBadge = (type: DigitalProduct["type"]) => {
        return (
            <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${PRODUCT_TYPE_COLORS[type] || ""}`}
            >
                {PRODUCT_TYPE_LABELS[type] || type}
            </span>
        );
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(price);
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${
                            i < fullStars
                                ? "text-amber-400 fill-amber-400"
                                : i === fullStars && hasHalf
                                  ? "text-amber-400 fill-amber-400/50"
                                  : "text-zinc-300 dark:text-zinc-600"
                        }`}
                    />
                ))}
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Digital Products"
                description="Manage your digital products and templates"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: "Digital Products" },
                ]}
                actions={
                    <Link href="/products/digital/new">
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            New Product
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search, Filters, and View Toggle */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search products..."
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
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                    <SelectItem value="coming_soon">
                                        Coming Soon
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortOption}
                                onValueChange={(v) =>
                                    setSortOption(v as SortOption)
                                }
                            >
                                <SelectTrigger className="w-[140px]">
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
                                    <SelectItem value="price-high">
                                        Price: High
                                    </SelectItem>
                                    <SelectItem value="price-low">
                                        Price: Low
                                    </SelectItem>
                                    <SelectItem value="downloads">
                                        Most Downloads
                                    </SelectItem>
                                    <SelectItem value="rating">
                                        Top Rated
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
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        !
                                    </span>
                                )}
                            </Button>

                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "table"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                                    title="Table view"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced filters row */}
                    {showAdvancedFilters && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Type
                                </label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        <SelectItem value="powerpoint">
                                            PowerPoint
                                        </SelectItem>
                                        <SelectItem value="document">
                                            Document
                                        </SelectItem>
                                        <SelectItem value="web_template">
                                            Web Template
                                        </SelectItem>
                                        <SelectItem value="startup_kit">
                                            Startup Kit
                                        </SelectItem>
                                        <SelectItem value="solution_template">
                                            Solution Template
                                        </SelectItem>
                                        <SelectItem value="design_system">
                                            Design System
                                        </SelectItem>
                                        <SelectItem value="code_template">
                                            Code Template
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Category
                                </label>
                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Categories
                                        </SelectItem>
                                        {allCategories.map((cat) => (
                                            <SelectItem
                                                key={cat.id}
                                                value={cat.slug}
                                            >
                                                {cat.name}
                                            </SelectItem>
                                        ))}
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
                {isLoadingProducts && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading products...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoadingProducts && productsError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load products
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {productsError.message ||
                                "An error occurred while fetching products."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoadingProducts && !productsError && (
                    <>
                        {/* Bulk select all header */}
                        {products.length > 0 && (
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
                                    {products.length} product
                                    {products.length !== 1 ? "s" : ""}
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                                        {selectedIds.size} selected
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Content: Grid or Table */}
                        {products.length > 0 ? (
                            viewMode === "grid" ? (
                                /* Grid View */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="group relative flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                                        >
                                            {/* Checkbox */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(
                                                        product.id
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectProduct(
                                                            product.id
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white/80 backdrop-blur-sm cursor-pointer"
                                                />
                                            </div>

                                            {/* Featured / Bestseller badges */}
                                            {(product.isFeatured ||
                                                product.isBestseller) && (
                                                <div className="absolute top-3 right-12 z-10 flex gap-1">
                                                    {product.isFeatured && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500 text-white uppercase">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {product.isBestseller && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500 text-white uppercase">
                                                            Bestseller
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Cover Image */}
                                            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                {product.featuredImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={
                                                            product.featuredImage
                                                        }
                                                        alt={product.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        <Package className="h-8 w-8 opacity-50" />
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3">
                                                    {getStatusBadge(
                                                        product.status
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-5 flex flex-col space-y-3">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {getTypeBadge(
                                                            product.type
                                                        )}
                                                        {product.category && (
                                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                                {
                                                                    product
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                        {product.title}
                                                    </h3>
                                                    {product.shortDescription && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                            {
                                                                product.shortDescription
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                        {formatPrice(
                                                            product.price,
                                                            product.currency
                                                        )}
                                                    </span>
                                                    {product.compareAtPrice &&
                                                        product.compareAtPrice >
                                                            product.price && (
                                                            <span className="text-sm text-zinc-400 line-through">
                                                                {formatPrice(
                                                                    product.compareAtPrice,
                                                                    product.currency
                                                                )}
                                                            </span>
                                                        )}
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" />
                                                        {product.downloadCount.toLocaleString()}
                                                    </span>
                                                    {product.averageRating >
                                                        0 &&
                                                        renderStars(
                                                            product.averageRating
                                                        )}
                                                </div>

                                                {/* Footer */}
                                                <div className="pt-4 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        {product.createdAt && (
                                                            <span>
                                                                {new Date(
                                                                    product.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/products/digital/${product.id}`}
                                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {product.status !==
                                                                    "published" && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handlePublish(
                                                                                product
                                                                            )
                                                                        }
                                                                    >
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        Publish
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {product.status ===
                                                                    "published" && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleArchive(
                                                                                product
                                                                            )
                                                                        }
                                                                    >
                                                                        <Archive className="mr-2 h-4 w-4" />
                                                                        Archive
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={`https://drkatangablog.com/products/${product.slug}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View on
                                                                        Site
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Table View */
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="w-10 px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isAllSelected
                                                            }
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
                                                        Product
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                        Type
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                        Price
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                        Downloads
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                        Rating
                                                    </th>
                                                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {products.map((product) => (
                                                    <tr
                                                        key={product.id}
                                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                    >
                                                        <td className="w-10 px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(
                                                                    product.id
                                                                )}
                                                                onChange={() =>
                                                                    toggleSelectProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {product.featuredImage ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={
                                                                            product.featuredImage
                                                                        }
                                                                        alt=""
                                                                        className="h-10 w-14 rounded object-cover flex-shrink-0 hidden sm:block"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-14 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                        <Package className="h-4 w-4 text-zinc-400" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        href={`/products/digital/${product.id}`}
                                                                        className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                                                                    >
                                                                        {
                                                                            product.title
                                                                        }
                                                                    </Link>
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                                        /
                                                                        {
                                                                            product.slug
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {getStatusBadge(
                                                                product.status
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 hidden md:table-cell">
                                                            {getTypeBadge(
                                                                product.type
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                    {formatPrice(
                                                                        product.price,
                                                                        product.currency
                                                                    )}
                                                                </span>
                                                                {product.compareAtPrice &&
                                                                    product.compareAtPrice >
                                                                        product.price && (
                                                                        <span className="text-xs text-zinc-400 line-through">
                                                                            {formatPrice(
                                                                                product.compareAtPrice,
                                                                                product.currency
                                                                            )}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                                                <Download className="h-3.5 w-3.5" />
                                                                {product.downloadCount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 hidden xl:table-cell">
                                                            {product.averageRating >
                                                            0 ? (
                                                                renderStars(
                                                                    product.averageRating
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-zinc-400">
                                                                    No reviews
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                {product.status !==
                                                                    "published" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handlePublish(
                                                                                product
                                                                            )
                                                                        }
                                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                        title="Publish"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                                {product.status ===
                                                                    "published" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleArchive(
                                                                                product
                                                                            )
                                                                        }
                                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                        title="Archive"
                                                                    >
                                                                        <Archive className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={`/products/digital/${product.id}`}
                                                                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <a
                                                                                href={`https://drkatangablog.com/products/${product.slug}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                View
                                                                                on
                                                                                Site
                                                                            </a>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    product
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            Delete
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
                                </div>
                            )
                        ) : (
                            /* Empty state */
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No products found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || searchQuery
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Get started by creating your first digital product."}
                                </p>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="mt-4 text-primary"
                                    >
                                        Clear all filters
                                    </Button>
                                ) : (
                                    <Link href="/products/digital/new">
                                        <Button className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Product
                                        </Button>
                                    </Link>
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
                                {selectedIds.size} product
                                {selectedIds.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkPublish}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                {isBulkLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                )}
                                Publish
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkArchive}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <Archive className="h-3.5 w-3.5 mr-1" />
                                Archive
                            </Button>

                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkLoading}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
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

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Product"
                description="Are you sure you want to delete this digital product? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                isLoading={deleteProductMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
