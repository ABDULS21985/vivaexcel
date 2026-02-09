"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download,
  Package,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Mail,
  Calendar,
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
import { useOrder } from "@/hooks/use-cart";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/order";

// =============================================================================
// Order Detail Page
// =============================================================================
// Shows full order details with download links for purchased items.

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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

function getDownloadUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  return `${baseUrl}/downloads/${token}`;
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
      <Skeleton className="w-64 h-6 mb-8 bg-neutral-200 dark:bg-neutral-800" />
      <Skeleton className="w-48 h-10 mb-8 bg-neutral-200 dark:bg-neutral-800" />
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=/account/orders/${orderId}`);
    }
  }, [authLoading, isAuthenticated, router, orderId]);

  const { data: order, isLoading, isError } = useOrder(orderId);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Order not found
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          We could not find this order. It may have been removed or the link is invalid.
        </p>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/account/orders">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </Button>
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
            <BreadcrumbLink asChild>
              <Link href="/account/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex self-start px-4 py-1.5 text-sm font-semibold rounded-full",
            ORDER_STATUS_COLORS[order.status as OrderStatus] ||
              "bg-neutral-100 text-neutral-700",
          )}
        >
          {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Items ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items.map((item) => {
                const activeToken = item.downloadTokens?.find(
                  (t) => t.isActive && t.downloadCount < t.maxDownloads,
                );
                const exhaustedToken = item.downloadTokens?.find(
                  (t) => t.downloadCount >= t.maxDownloads,
                );
                const hasDownloads = !!activeToken;
                const downloadsExhausted = !hasDownloads && !!exhaustedToken;

                return (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/store/${item.productSlug}`}
                          className="text-sm font-medium text-neutral-900 dark:text-white hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
                        >
                          {item.productTitle}
                        </Link>
                        {item.variantId && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Variant: {item.variantId}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {hasDownloads && activeToken ? (
                          <a
                            href={getDownloadUrl(activeToken.token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4DB7] hover:bg-[#143A8F] text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download ({activeToken.maxDownloads - activeToken.downloadCount}/{activeToken.maxDownloads} remaining)
                          </a>
                        ) : downloadsExhausted ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 text-sm font-medium rounded-lg cursor-not-allowed">
                            <Download className="w-4 h-4" />
                            Downloads exhausted
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            Download unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Payment Details Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 sticky top-24">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Payment Details
            </h3>

            {/* Price breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="text-neutral-900 dark:text-white font-medium">
                  {formatPrice(order.subtotal, order.currency)}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Discount</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    -{formatPrice(order.discountAmount, order.currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-base font-semibold text-neutral-900 dark:text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </div>

            {/* Billing info */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Stripe
                </span>
              </div>

              {order.billingEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-neutral-700 dark:text-neutral-300 truncate">
                    {order.billingEmail}
                  </span>
                </div>
              )}

              {order.billingName && (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {order.billingName}
                </p>
              )}

              {order.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Completed {formatShortDate(order.completedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button asChild variant="outline" size="sm" className="w-full gap-2">
                <Link href="/account/orders">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
