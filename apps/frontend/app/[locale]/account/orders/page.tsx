"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Hash,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
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
// Order History Page
// =============================================================================
// Lists all orders for the authenticated user with pagination.

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
// Loading Skeleton
// -----------------------------------------------------------------------------

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full h-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl"
        />
      ))}
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
  });

  const orders = data?.items ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // Auth loading
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/account">Account</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8">
        Order History
      </h1>

      {/* Loading */}
      {isLoading && <OrdersSkeleton />}

      {/* Error */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400 mb-4">
            Failed to load orders. Please try again.
          </p>
          <Button onClick={() => setPage(1)} variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No orders yet
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
            When you purchase digital products, your orders will appear here.
          </p>
          <Button asChild className="gap-2">
            <Link href="/store">
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      )}

      {/* Order list */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                href={`/account/orders/${order.id}`}
                className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 hover:border-[#1E4DB7]/30 dark:hover:border-[#1E4DB7]/40 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Order icon */}
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E4DB7]/10 dark:group-hover:bg-[#1E4DB7]/20 transition-colors">
                      <Package className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-[#1E4DB7] transition-colors" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full",
                            ORDER_STATUS_COLORS[order.status as OrderStatus] ||
                              "bg-neutral-100 text-neutral-700",
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price + chevron */}
                  <div className="flex items-center gap-3 sm:flex-shrink-0">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatPrice(order.total, order.currency)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-[#1E4DB7] transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
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

              <span className="px-4 text-sm text-neutral-500 dark:text-neutral-400">
                Page {page} of {totalPages}
              </span>

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
          )}
        </div>
      )}
    </div>
  );
}
