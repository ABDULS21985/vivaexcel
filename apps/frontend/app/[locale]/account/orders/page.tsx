"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Hash,
  Search,
  Download,
  FileText,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton, Input } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/hooks/use-cart";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/order";

// =============================================================================
// Order History Page - Premium Edition
// =============================================================================
// Enhanced order history with search, filters, stats, and premium UI.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

// -----------------------------------------------------------------------------
// Status Timeline Component
// -----------------------------------------------------------------------------

function StatusTimeline({ status }: { status: OrderStatus }) {
  const steps = [
    { key: "pending", label: "Placed" },
    { key: "paid", label: "Paid" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (s: OrderStatus) => {
    if (s === "pending") return 0;
    if (s === "paid" || s === "processing") return 1;
    if (s === "delivered" || s === "completed") return 2;
    return -1;
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isCompleted && "bg-green-500",
                  isCurrent && "bg-[#F59A23] animate-pulse",
                  isPending && "bg-neutral-300 dark:bg-neutral-700"
                )}
              />
              <span className="text-[9px] text-neutral-400 dark:text-neutral-600 mt-1">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-6 h-0.5 transition-all",
                  idx < currentIndex
                    ? "bg-green-500"
                    : "bg-neutral-200 dark:bg-neutral-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-32 h-32 mb-6">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <circle cx="100" cy="100" r="80" fill="currentColor" className="text-neutral-100 dark:text-neutral-800" />
          <path
            d="M70 90h60M70 110h40"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-neutral-300 dark:text-neutral-700"
          />
          <rect
            x="60"
            y="60"
            width="80"
            height="80"
            rx="8"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-neutral-400 dark:text-neutral-600"
          />
          <circle cx="100" cy="100" r="8" fill="currentColor" className="text-neutral-400 dark:text-neutral-600" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        No orders yet
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm">
        Start shopping and your order history will appear here. Explore our store to find amazing digital products.
      </p>
      <Button asChild className="gap-2 bg-[#1E4DB7] hover:bg-[#143A8F]">
        <Link href="/store">
          <ShoppingBag className="w-4 h-4" />
          Browse Products
        </Link>
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "3m" | "all">("all");
  const limit = 10;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading, isError } = useOrders({
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const orders = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Filter orders by search and date
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) =>
        order.orderNumber.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === "7d") cutoff.setDate(now.getDate() - 7);
      if (dateFilter === "30d") cutoff.setDate(now.getDate() - 30);
      if (dateFilter === "3m") cutoff.setMonth(now.getMonth() - 3);

      filtered = filtered.filter((order) => new Date(order.createdAt) >= cutoff);
    }

    return filtered;
  }, [orders, searchQuery, dateFilter]);

  // Calculate stats
  const totalOrders = meta?.total ?? 0;
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  // Auth loading
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Premium Header with Gradient */}
      <div className="relative bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/70 hover:text-white">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/account" className="text-white/70 hover:text-white">
                    Account
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-6">
            {/* Glassmorphism Icon Container */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Order History
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Track and manage all your purchases in one place
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <FileText className="w-3.5 h-3.5" />
                Total Orders
              </div>
              <div className="text-2xl font-bold text-white">{totalOrders}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Total Spent
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPrice(totalSpent, orders[0]?.currency || "USD")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 mb-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
            />
          </div>

          {/* Status Filters */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "completed", label: "Completed" },
                { key: "processing", label: "Processing" },
                { key: "pending", label: "Pending" },
                { key: "failed", label: "Failed" },
              ].map((status) => (
                <Button
                  key={status.key}
                  variant={statusFilter === status.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status.key as OrderStatus | "all");
                    setPage(1);
                  }}
                  className={cn(
                    statusFilter === status.key &&
                      "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                  )}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
              Date Range
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "7d", label: "Last 7 days" },
                { key: "30d", label: "Last 30 days" },
                { key: "3m", label: "Last 3 months" },
                { key: "all", label: "All time" },
              ].map((date) => (
                <Button
                  key={date.key}
                  variant={dateFilter === date.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDateFilter(date.key as typeof dateFilter);
                    setPage(1);
                  }}
                  className={cn(
                    dateFilter === date.key &&
                      "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                  )}
                >
                  {date.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <OrdersSkeleton />}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 mb-4 font-medium">
              Failed to load orders. Please try again.
            </p>
            <Button
              onClick={() => setPage(1)}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredOrders.length === 0 && (
          <EmptyState />
        )}

        {/* Order list */}
        {!isLoading && !isError && filteredOrders.length > 0 && (
          <>
            {/* Results count */}
            <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, meta?.total ?? 0)} of {meta?.total ?? 0} orders
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, index) => {
                  const isCompleted =
                    order.status === "completed" || order.status === "delivered";
                  const firstProduct = order.items[0];

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-[#1E4DB7]/30 dark:hover:border-[#1E4DB7]/40 hover:shadow-lg transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-6 h-6 text-white" />
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-base font-bold text-neutral-900 dark:text-white">
                                {order.orderNumber}
                              </span>
                              <span
                                className={cn(
                                  "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                                  ORDER_STATUS_COLORS[order.status as OrderStatus] ||
                                    "bg-neutral-100 text-neutral-700"
                                )}
                              >
                                {ORDER_STATUS_LABELS[order.status as OrderStatus] ||
                                  order.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                {order.items.length}{" "}
                                {order.items.length === 1 ? "item" : "items"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {formatPrice(order.total, order.currency)}
                          </div>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="mb-4 py-3 border-y border-neutral-100 dark:border-neutral-800">
                        <StatusTimeline status={order.status as OrderStatus} />
                      </div>

                      {/* Product Preview */}
                      <div className="mb-4 space-y-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                          >
                            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <span className="truncate">{item.productTitle}</span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-600">
                              {formatPrice(item.price, item.currency)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-xs text-neutral-400 dark:text-neutral-600 pl-3">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={`/account/orders/${order.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>

                        {isCompleted && firstProduct && (
                          <>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Link href="/account/downloads">
                                <Download className="w-4 h-4" />
                                Downloads
                              </Link>
                            </Button>

                            <Button
                              asChild
                              size="sm"
                              className="gap-2 bg-[#1E4DB7] hover:bg-[#143A8F]"
                            >
                              <Link href={`/store/${firstProduct.productSlug}`}>
                                <RotateCcw className="w-4 h-4" />
                                Buy Again
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-9 h-9 p-0",
                            page === pageNum &&
                              "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
