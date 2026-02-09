"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Download,
  ArrowRight,
  Package,
  ShoppingBag,
  Copy,
  Mail,
  Star,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import { useCheckoutSuccess } from "@/hooks/use-cart";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/types/order";
import { toast } from "sonner";
import { trackConversion } from "@/lib/conversion-tracking";
import { useTranslations } from "next-intl";
import { formatPrice, formatDateTime } from "@/lib/format";

// =============================================================================
// Premium Checkout Success Page
// =============================================================================
// Verifies the Stripe session and displays a premium order confirmation
// with confetti, animations, download management, and social sharing.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Resolve the full download URL for a token
function getDownloadUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  return `${baseUrl}/downloads/${token}`;
}

// -----------------------------------------------------------------------------
// CSS Confetti Animation
// -----------------------------------------------------------------------------

const confettiColors = [
  "bg-blue-500",
  "bg-blue-400",
  "bg-orange-500",
  "bg-orange-400",
  "bg-green-500",
  "bg-green-400",
  "bg-rose-500",
  "bg-rose-400",
  "bg-amber-500",
  "bg-amber-400",
  "bg-violet-500",
  "bg-violet-400",
];

function Confetti() {
  const [visible, setVisible] = useState(true);

  // Hide confetti after 3 seconds
  useState(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  });

  if (!visible) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.3;
          }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => {
          const randomColor =
            confettiColors[Math.floor(Math.random() * confettiColors.length)];
          const randomLeft = Math.random() * 100;
          const randomDelay = Math.random() * 2;
          const randomDuration = 2 + Math.random() * 2;

          return (
            <div
              key={i}
              className={cn("absolute w-2 h-2 rounded-sm", randomColor)}
              style={{
                left: `${randomLeft}%`,
                top: "-10px",
                animation: `confetti-fall ${randomDuration}s linear ${randomDelay}s 1`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Success Checkmark with Pulse Rings
// -----------------------------------------------------------------------------

function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      className="relative w-24 h-24 mx-auto mb-6"
    >
      {/* Outer gradient ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30"
      />
      {/* Inner check icon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
      </motion.div>
      {/* Pulse ring 1 */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 1.6 }}
        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-green-400"
      />
      {/* Pulse ring 2 */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 1.8 }}
        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-green-300"
      />
      {/* Pulse ring 3 */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ delay: 1, duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-green-200"
      />
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Order Timeline
// -----------------------------------------------------------------------------

function OrderTimeline({ t }: { t: ReturnType<typeof useTranslations> }) {
  const timelineSteps = [
    { label: t("success.timeline.orderPlaced"), key: "placed" },
    { label: t("success.timeline.paymentConfirmed"), key: "confirmed" },
    { label: t("success.timeline.readyToDownload"), key: "ready" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {timelineSteps.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.5, duration: 0.4 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-2"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
              {/* Label */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.5 }}
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center"
              >
                {step.label}
              </motion.p>
            </div>
            {/* Connecting line */}
            {index < timelineSteps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 1 + index * 0.5,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 mx-2 origin-left"
                style={{ maxWidth: "100px" }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Loading State
// -----------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6 bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="w-64 h-8 mx-auto mb-3 bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="w-48 h-5 mx-auto bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="w-full h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CheckoutSuccessPage() {
  const t = useTranslations("checkout");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const { data: order, isLoading, isError } = useCheckoutSuccess(sessionId);

  useEffect(() => {
    if (order) {
      trackConversion("CHECKOUT_COMPLETED", {
        orderId: order.orderNumber,
        revenue: order.total,
        currency: order.currency,
        quantity: order.items.length,
      });
    }
  }, [order]);

  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Copy order number to clipboard
  const handleCopyOrderNumber = useCallback(() => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedOrderNumber(true);
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    }
  }, [order?.orderNumber]);

  // Copy share link to clipboard
  const handleCopyLink = useCallback(() => {
    const url = window.location.origin + "/store";
    navigator.clipboard.writeText(url);
    toast.success(t("success.linkCopied"));
  }, []);

  // Download all items
  const handleDownloadAll = useCallback(() => {
    if (!order?.items) return;
    order.items.forEach((item) => {
      const activeToken = item.downloadTokens?.find(
        (t) => t.isActive && t.downloadCount < t.maxDownloads,
      );
      if (activeToken) {
        window.open(getDownloadUrl(activeToken.token), "_blank");
      }
    });
  }, [order?.items]);

  // No session ID
  if (!sessionId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {t("success.noSession")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          {t("success.noSessionDescription")}
        </p>
        <Button asChild>
          <Link href="/store">{t("success.browseProducts")}</Link>
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
          {t("success.errorTitle")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
          {t("success.errorDescription")}
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/store">{t("success.backToStore")}</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">{t("success.contactSupport")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Count items with available downloads
  const itemsWithDownloads = order.items.filter((item) =>
    item.downloadTokens?.some(
      (t) => t.isActive && t.downloadCount < t.maxDownloads,
    ),
  );
  const hasMultipleDownloads = itemsWithDownloads.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white">
      {/* Confetti */}
      <Confetti />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <SuccessCheckmark />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {t("success.title")}
          </h1>
          <p className="text-neutral-400 text-lg">
            {t("success.description")}
          </p>
        </motion.div>

        {/* Order Timeline */}
        <OrderTimeline t={t} />

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6"
        >
          {/* Order header */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-neutral-400 mb-1">{t("success.orderNumber")}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{order.orderNumber}</p>
                <button
                  onClick={handleCopyOrderNumber}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title={t("success.copyOrderNumber")}
                >
                  {copiedOrderNumber ? (
                    <span className="text-xs text-green-400 font-medium">
                      {t("success.copied")}
                    </span>
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full",
                  ORDER_STATUS_COLORS[order.status] ||
                    "bg-neutral-100 text-neutral-700",
                )}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
              <p className="text-sm text-neutral-400">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-white/10">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#1E4DB7]/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-[#1E4DB7]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {formatPrice(item.price, { currency: item.currency })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">{t("success.totalPaid")}</span>
              <span className="text-2xl font-bold">
                {formatPrice(order.total, { currency: order.currency })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-[#1E4DB7]/10 border border-[#1E4DB7]/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-[#1E4DB7]" />
            <h2 className="text-xl font-bold">{t("success.yourDownloads")}</h2>
          </div>

          {itemsWithDownloads.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item) => {
                const activeToken = item.downloadTokens?.find(
                  (t) => t.isActive && t.downloadCount < t.maxDownloads,
                );
                if (!activeToken) return null;

                const remainingDownloads =
                  activeToken.maxDownloads - activeToken.downloadCount;

                return (
                  <div
                    key={item.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium mb-1">{item.productTitle}</p>
                      <p className="text-sm text-neutral-400">
                        {t("success.downloadsRemaining", { remaining: remainingDownloads, max: activeToken.maxDownloads })}
                      </p>
                    </div>
                    <a
                      href={getDownloadUrl(activeToken.token)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#0d2661] text-white font-semibold rounded-lg transition-all shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/40"
                    >
                      <Download className="w-4 h-4" />
                      {t("success.downloadNow")}
                    </a>
                  </div>
                );
              })}

              {/* Download All button */}
              {hasMultipleDownloads && (
                <button
                  onClick={handleDownloadAll}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("success.downloadAll")}
                </button>
              )}
            </div>
          ) : (
            <p className="text-neutral-400 text-center py-4">
              {t("success.noDownloads")}
            </p>
          )}
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">{t("success.whatsNext")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Rate purchase */}
            {order.items[0] && (
              <Link
                href={`/store/${order.items[0].productSlug}#reviews`}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <Star className="w-8 h-8 text-[#F59A23] mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium mb-1">{t("success.ratePurchase")}</p>
                <p className="text-sm text-neutral-400">
                  {t("success.shareExperience")}
                </p>
              </Link>
            )}

            {/* Share */}
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <Share2 className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-medium mb-2">Share with Friends</p>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=Just%20purchased%20amazing%20products%20from%20VivaExcel!&url=${encodeURIComponent(window.location.origin + "/store")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                  title="Share on Twitter"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/store")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                  title="Share on LinkedIn"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-300 transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Browse more */}
            <Link
              href="/store"
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <ShoppingBag className="w-8 h-8 text-[#F59A23] mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium mb-1">Browse More Products</p>
              <p className="text-sm text-neutral-400">Discover more tools</p>
            </Link>
          </div>
        </motion.div>

        {/* Email confirmation notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-400"
        >
          <Mail className="w-4 h-4" />
          <p>
            Confirmation sent to <span className="font-medium text-white">{order.billingEmail}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
