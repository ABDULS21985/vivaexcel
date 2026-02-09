"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    RotateCcw,
    Eye,
    Receipt,
    Package,
    Calendar,
    Download,
    ChevronDown,
} from "lucide-react";
import {
    useOrders,
    useOrderStats,
    useRefundOrder,
    type Order,
    type OrderFilters,
    OrderStatus,
} from "@/hooks/use-orders";

// ─── Constants ───────────────────────────────────────────────────────────────

type SortOption = "newest" | "oldest" | "value-high" | "value-low";

const ORDER_STATUS_COLORS: Record<string, string> = {
    completed:
        "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    pending:
        "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    processing:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    failed: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    refunded:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
    completed: "Completed",
    pending: "Pending",
    processing: "Processing",
    failed: "Failed",
    refunded: "Refunded",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
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

// ─── Stats Card Component ────────────────────────────────────────────────────

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

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();

    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set()
    );
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // Refund confirmation state
    const [isRefundOpen, setIsRefundOpen] = React.useState(false);
    const [orderToRefund, setOrderToRefund] = React.useState<Order | null>(
        null
    );

    // Pagination cursor
    const [cursor, setCursor] = React.useState<string | undefined>(undefined);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: OrderFilters = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (cursor) filters.cursor = cursor;
        if (sortOption === "newest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "ASC";
        } else if (sortOption === "value-high") {
            filters.sortBy = "total";
            filters.sortOrder = "DESC";
        } else if (sortOption === "value-low") {
            filters.sortBy = "total";
            filters.sortOrder = "ASC";
        }
        return filters;
    }, [searchQuery, statusFilter, dateFrom, dateTo, cursor, sortOption]);

    // Fetch data
    const {
        data: ordersData,
        isLoading: isLoadingOrders,
        error: ordersError,
    } = useOrders(apiFilters);
    const orders = ordersData?.items ?? [];
    const ordersMeta = ordersData?.meta;

    const {
        data: statsData,
        isLoading: isLoadingStats,
    } = useOrderStats();

    // Mutations
    const refundOrderMutation = useRefundOrder();

    // Computed stats from data (fallback if stats endpoint unavailable)
    const computedStats = React.useMemo(() => {
        if (statsData) {
            return {
                totalOrders: statsData.totalOrders,
                totalRevenue: formatPrice(
                    statsData.totalRevenue,
                    statsData.currency || "USD"
                ),
                pendingOrders: statsData.pendingOrders,
                refundedOrders: statsData.refundedOrders,
            };
        }
        // Fallback: compute from loaded orders (partial data)
        const completedOrders = orders.filter(
            (o) => o.status === OrderStatus.COMPLETED
        );
        const pendingOrders = orders.filter(
            (o) =>
                o.status === OrderStatus.PENDING ||
                o.status === OrderStatus.PROCESSING
        );
        const refundedOrders = orders.filter(
            (o) => o.status === OrderStatus.REFUNDED
        );
        const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            totalOrders: ordersMeta?.total ?? orders.length,
            totalRevenue: formatPrice(revenue, "USD"),
            pendingOrders: pendingOrders.length,
            refundedOrders: refundedOrders.length,
        };
    }, [statsData, orders, ordersMeta]);

    // ─── Bulk Selection ──────────────────────────────────────────────────────

    const isAllSelected =
        orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
    const isSomeSelected = orders.some((o) => selectedIds.has(o.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map((o) => o.id)));
        }
    };

    const toggleSelectOrder = (id: string) => {
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

    const handleRefundClick = (order: Order) => {
        setOrderToRefund(order);
        setIsRefundOpen(true);
    };

    const handleConfirmRefund = () => {
        if (!orderToRefund) return;

        refundOrderMutation.mutate(orderToRefund.id, {
            onSuccess: () => {
                success(
                    "Order refunded",
                    `Order ${orderToRefund.orderNumber} has been refunded successfully.`
                );
                setIsRefundOpen(false);
                setOrderToRefund(null);
            },
            onError: (err) => {
                toastError(
                    "Refund failed",
                    err.message || "Failed to refund order. Please try again."
                );
            },
        });
    };

    const handleBulkRefund = async () => {
        const eligibleOrders = orders.filter(
            (o) =>
                selectedIds.has(o.id) && o.status === OrderStatus.COMPLETED
        );

        if (eligibleOrders.length === 0) {
            toastError(
                "No eligible orders",
                "Only completed orders can be refunded."
            );
            return;
        }

        setIsBulkLoading(true);
        try {
            await Promise.all(
                eligibleOrders.map((o) =>
                    refundOrderMutation.mutateAsync(o.id)
                )
            );
            success(
                "Orders refunded",
                `${eligibleOrders.length} order${eligibleOrders.length !== 1 ? "s" : ""} have been refunded.`
            );
            clearSelection();
        } catch {
            toastError("Error", "Failed to refund some orders.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleBulkExport = () => {
        // Build CSV from selected orders
        const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
        if (selectedOrders.length === 0) return;

        const headers = [
            "Order Number",
            "Customer Email",
            "Customer Name",
            "Status",
            "Items",
            "Subtotal",
            "Discount",
            "Total",
            "Currency",
            "Date",
        ];
        const rows = selectedOrders.map((o) => [
            o.orderNumber,
            o.billingEmail,
            o.billingName || "",
            o.status,
            o.items.length.toString(),
            o.subtotal.toFixed(2),
            o.discountAmount.toFixed(2),
            o.total.toFixed(2),
            o.currency,
            new Date(o.createdAt).toISOString(),
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
        link.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        success(
            "Export complete",
            `${selectedOrders.length} order${selectedOrders.length !== 1 ? "s" : ""} exported to CSV.`
        );
    };

    // ─── Filters ─────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSortOption("newest");
        setDateFrom("");
        setDateTo("");
        setCursor(undefined);
    };

    const hasActiveFilters =
        statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

    const handleLoadMore = () => {
        if (ordersMeta?.nextCursor) {
            setCursor(ordersMeta.nextCursor);
        }
    };

    // Reset cursor when filters change
    React.useEffect(() => {
        setCursor(undefined);
    }, [searchQuery, statusFilter, dateFrom, dateTo, sortOption]);

    // ─── Render helpers ──────────────────────────────────────────────────────

    const getStatusBadge = (status: string) => {
        return (
            <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${ORDER_STATUS_COLORS[status] || ""}`}
            >
                {ORDER_STATUS_LABELS[status] || status}
            </span>
        );
    };

    const getCustomerDisplay = (order: Order) => {
        const name = order.billingName || order.user
            ? `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim()
            : null;
        return (
            <div className="min-w-0">
                {name && (
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {name}
                    </p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {order.billingEmail}
                </p>
            </div>
        );
    };

    const getItemsCount = (order: Order) => {
        const count = order.items.length;
        return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 flex-shrink-0" />
                {count} item{count !== 1 ? "s" : ""}
            </span>
        );
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Orders"
                description={
                    ordersMeta?.total !== undefined
                        ? `${ordersMeta.total} total order${ordersMeta.total !== 1 ? "s" : ""}`
                        : "Manage customer orders and transactions"
                }
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Orders" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Orders"
                        value={
                            isLoadingStats
                                ? "..."
                                : computedStats.totalOrders.toLocaleString()
                        }
                        icon={
                            <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        }
                        iconBgClass="bg-indigo-100 dark:bg-indigo-900/40"
                    />
                    <StatsCard
                        label="Revenue"
                        value={
                            isLoadingStats ? "..." : computedStats.totalRevenue
                        }
                        icon={
                            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
                        description="From completed orders"
                    />
                    <StatsCard
                        label="Pending Orders"
                        value={
                            isLoadingStats
                                ? "..."
                                : computedStats.pendingOrders.toLocaleString()
                        }
                        icon={
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        }
                        iconBgClass="bg-amber-100 dark:bg-amber-900/40"
                        description="Pending & processing"
                    />
                    <StatsCard
                        label="Refunded"
                        value={
                            isLoadingStats
                                ? "..."
                                : computedStats.refundedOrders.toLocaleString()
                        }
                        icon={
                            <RotateCcw className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                        }
                        iconBgClass="bg-zinc-100 dark:bg-zinc-700/40"
                    />
                </div>

                {/* Search, Filters */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search by order number or email..."
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
                                    <SelectItem value="refunded">
                                        Refunded
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortOption}
                                onValueChange={(v) =>
                                    setSortOption(v as SortOption)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
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
                                    <SelectItem value="value-high">
                                        Highest Value
                                    </SelectItem>
                                    <SelectItem value="value-low">
                                        Lowest Value
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
                {isLoadingOrders && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading orders...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoadingOrders && ordersError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load orders
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {ordersError.message ||
                                "An error occurred while fetching orders."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoadingOrders && !ordersError && (
                    <>
                        {/* Bulk select all header */}
                        {orders.length > 0 && (
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
                                    {orders.length} order
                                    {orders.length !== 1 ? "s" : ""} shown
                                    {ordersMeta?.total !== undefined &&
                                        ordersMeta.total > orders.length && (
                                            <span>
                                                {" "}
                                                of {ordersMeta.total} total
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

                        {/* Orders Table */}
                        {orders.length > 0 ? (
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
                                                    Order #
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Items
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                    Total
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                    Date
                                                </th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors ${
                                                        selectedIds.has(
                                                            order.id
                                                        )
                                                            ? "bg-primary/5 dark:bg-primary/10"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="w-10 px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(
                                                                order.id
                                                            )}
                                                            onChange={() =>
                                                                toggleSelectOrder(
                                                                    order.id
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="text-sm font-medium font-mono text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            {order.orderNumber}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getCustomerDisplay(
                                                            order
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        {getItemsCount(order)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(
                                                            order.status
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {formatPrice(
                                                                    order.total,
                                                                    order.currency
                                                                )}
                                                            </span>
                                                            {order.discountAmount >
                                                                0 && (
                                                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                                    -
                                                                    {formatPrice(
                                                                        order.discountAmount,
                                                                        order.currency
                                                                    )}{" "}
                                                                    discount
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {formatDate(
                                                                    order.createdAt
                                                                )}
                                                            </span>
                                                            {order.completedAt && (
                                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                    Completed{" "}
                                                                    {formatDate(
                                                                        order.completedAt
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/orders/${order.id}`}
                                                                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                title="View order"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            {order.status ===
                                                                OrderStatus.COMPLETED && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleRefundClick(
                                                                            order
                                                                        )
                                                                    }
                                                                    className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                    title="Refund order"
                                                                >
                                                                    <RotateCcw className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination / Load More */}
                                {ordersMeta?.hasNextPage && (
                                    <div className="flex items-center justify-center py-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLoadMore}
                                            className="gap-1.5"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                            Load More Orders
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No orders found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || searchQuery
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Orders will appear here once customers make purchases."}
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
                                {selectedIds.size} order
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
                                onClick={handleBulkRefund}
                                disabled={isBulkLoading}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs"
                            >
                                {isBulkLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                )}
                                Refund
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

            {/* Refund Confirmation Modal */}
            <ConfirmModal
                open={isRefundOpen}
                onOpenChange={setIsRefundOpen}
                title="Refund Order"
                description={
                    orderToRefund
                        ? `Are you sure you want to refund order ${orderToRefund.orderNumber} for ${formatPrice(orderToRefund.total, orderToRefund.currency)}? This will issue a full refund through Stripe. This action cannot be undone.`
                        : "Are you sure you want to refund this order?"
                }
                confirmLabel="Refund Order"
                cancelLabel="Cancel"
                onConfirm={handleConfirmRefund}
                isLoading={refundOrderMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
