"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import { useCheckoutSuccess } from "@/hooks/use-cart";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/types/order";

// =============================================================================
// Checkout Success Page
// =============================================================================
// Verifies the Stripe session and displays the order confirmation.

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

// Resolve the full download URL for a token
function getDownloadUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  return `${baseUrl}/downloads/${token}`;
}

// -----------------------------------------------------------------------------
// Success Animation
// -----------------------------------------------------------------------------

function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      className="relative w-24 h-24 mx-auto mb-6"
    >
      {/* Outer ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30"
      />
      {/* Inner check */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
      </motion.div>
      {/* Pulse ring */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 1.6 }}
        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-green-400"
      />
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Loading State
// -----------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6 bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="w-64 h-8 mx-auto mb-3 bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="w-48 h-5 mx-auto bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const { data: order, isLoading, isError } = useCheckoutSuccess(sessionId);

  // No session ID
  if (!sessionId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          No session found
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          It looks like you arrived here without completing a checkout.
        </p>
        <Button asChild>
          <Link href="/store">Browse Products</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
          We could not verify your payment. If you were charged, please contact
          support and we will resolve this immediately.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/store">Back to Store</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <SuccessCheckmark />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </motion.div>

      {/* Order Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden mb-8"
      >
        {/* Order header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Order Number
            </p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {order.orderNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full",
                ORDER_STATUS_COLORS[order.status] ||
                  "bg-neutral-100 text-neutral-700",
              )}
            >
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {order.items.map((item) => {
            const activeToken = item.downloadTokens?.find(
              (t) => t.isActive && t.downloadCount < t.maxDownloads,
            );
            const hasDownloads = !!activeToken;
            const remainingDownloads = activeToken
              ? activeToken.maxDownloads - activeToken.downloadCount
              : 0;

            return (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {item.productTitle}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatPrice(item.price, item.currency)}
                  </p>
                </div>

                {hasDownloads && activeToken ? (
                  <a
                    href={getDownloadUrl(activeToken.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4DB7] hover:bg-[#143A8F] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download ({remainingDownloads}/{activeToken.maxDownloads})
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    No downloads available
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-900 dark:text-white">
              Total Paid
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(order.total, order.currency)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button asChild variant="outline" className="gap-2">
          <Link href="/account/orders">
            <ShoppingBag className="w-4 h-4" />
            View All Orders
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link href="/store">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
