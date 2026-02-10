"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  CreditCard,
  Download,
  History,
  TrendingUp,
  Pause,
  Play,
  X,
  AlertTriangle,
  Check,
  ChevronRight,
  Package,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSubscription } from "@/providers/subscription-provider";
import {
  useCreditHistory,
  useSubscriptionDownloads,
  useUsageAnalytics,
  useCancelMarketplaceSubscription,
  usePauseSubscription,
} from "@/hooks/use-marketplace-subscription";
import {
  MarketplaceSubscriptionStatus,
  CreditTransactionType,
} from "@/types/marketplace-subscription";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusColor(
  status: MarketplaceSubscriptionStatus,
): { bg: string; text: string; dot: string } {
  const map: Record<
    MarketplaceSubscriptionStatus,
    { bg: string; text: string; dot: string }
  > = {
    [MarketplaceSubscriptionStatus.ACTIVE]: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    [MarketplaceSubscriptionStatus.TRIALING]: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    [MarketplaceSubscriptionStatus.PAST_DUE]: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    [MarketplaceSubscriptionStatus.CANCELED]: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    },
    [MarketplaceSubscriptionStatus.PAUSED]: {
      bg: "bg-slate-100 dark:bg-slate-700",
      text: "text-slate-700 dark:text-slate-300",
      dot: "bg-slate-500",
    },
    [MarketplaceSubscriptionStatus.EXPIRED]: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-400",
      dot: "bg-gray-500",
    },
  };
  return map[status] ?? map[MarketplaceSubscriptionStatus.EXPIRED];
}

function getTransactionColor(type: CreditTransactionType): string {
  const map: Record<CreditTransactionType, string> = {
    [CreditTransactionType.CREDIT_GRANT]: "text-emerald-500",
    [CreditTransactionType.CREDIT_USED]: "text-blue-500",
    [CreditTransactionType.CREDIT_ROLLOVER]: "text-purple-500",
    [CreditTransactionType.CREDIT_EXPIRED]: "text-slate-400",
    [CreditTransactionType.CREDIT_BONUS]: "text-amber-500",
    [CreditTransactionType.CREDIT_REFUND]: "text-indigo-500",
  };
  return map[type] ?? "text-slate-400";
}

function getTransactionSign(type: CreditTransactionType): string {
  if (
    type === CreditTransactionType.CREDIT_USED ||
    type === CreditTransactionType.CREDIT_EXPIRED
  )
    return "-";
  return "+";
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SubscriptionDashboardClient() {
  const t = useTranslations("pricing");
  const {
    subscription,
    credits,
    isSubscribed,
    isLoading,
    currentPlanSlug,
  } = useSubscription();
  const { data: analytics } = useUsageAnalytics();
  const { data: creditHistoryData } = useCreditHistory();
  const { data: downloadsData } = useSubscriptionDownloads();
  const cancelMutation = useCancelMarketplaceSubscription();
  const pauseMutation = usePauseSubscription();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [historyCursor, setHistoryCursor] = useState<string | undefined>();
  const [downloadsCursor, setDownloadsCursor] = useState<string | undefined>();

  // Credit progress ring values
  const totalCredits = credits
    ? credits.remaining + credits.usedThisPeriod
    : 0;
  const usedPercent = totalCredits > 0
    ? (credits?.usedThisPeriod ?? 0) / totalCredits
    : 0;
  const remainingPercent = 1 - usedPercent;
  const circumference = 2 * Math.PI * 54; // radius=54
  const strokeDashoffset = circumference * (1 - remainingPercent);

  const daysLeft = credits?.periodEnd ? daysUntil(credits.periodEnd) : 0;

  const statusColorMap: Record<string, string> = {
    active: t("subscription.active"),
    trialing: t("subscription.trialing"),
    past_due: t("subscription.pastDue"),
    canceled: t("subscription.canceled"),
    paused: t("subscription.paused"),
    expired: t("subscription.expired"),
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent"
        />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // No subscription state
  // -----------------------------------------------------------------------
  if (!isSubscribed || !subscription) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("subscription.noSubscription")}
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {t("subscription.noSubscriptionDescription")}
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
          >
            {t("subscription.viewPricing")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const statusColors = getStatusColor(
    subscription.status as MarketplaceSubscriptionStatus,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t("subscription.title")}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ============================================================= */}
        {/* Current Plan Card                                               */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {subscription.plan.name}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`}
                    />
                    {statusColorMap[subscription.status] ?? subscription.status}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {subscription.billingPeriod === "monthly"
                      ? t("billing.monthly")
                      : t("billing.annual")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {subscription.plan.features?.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Next billing */}
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
            <CreditCard className="h-4 w-4 text-slate-400" />
            {t("subscription.nextBillingDate")}:{" "}
            <span className="font-medium">
              {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              {t("subscription.changePlan")}
            </Link>

            {subscription.status === MarketplaceSubscriptionStatus.ACTIVE && (
              <button
                onClick={() => setShowPauseModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <Pause className="h-4 w-4" />
                {t("subscription.pause")}
              </button>
            )}

            {subscription.status === MarketplaceSubscriptionStatus.PAUSED && (
              <button
                onClick={() => pauseMutation.mutate("resume")}
                disabled={pauseMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <Play className="h-4 w-4" />
                {t("subscription.resume")}
              </button>
            )}

            {!subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t("subscription.cancel")}
              </button>
            )}
          </div>
        </motion.div>

        {/* ============================================================= */}
        {/* Credit Balance with SVG Ring                                    */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            {t("subscription.creditBalance")}
          </h3>

          {/* SVG Circular progress */}
          <div className="flex justify-center">
            <div className="relative h-36 w-36">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 120 120"
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#creditGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
                <defs>
                  <linearGradient
                    id="creditGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl font-bold text-slate-900 dark:text-white"
                >
                  {credits?.remaining ?? 0}
                </motion.span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t("subscription.creditsRemaining")}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {t("subscription.creditsUsed")}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {credits?.usedThisPeriod ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {t("subscription.rolloverCredits")}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {credits?.rollover ?? 0}
              </span>
            </div>
          </div>

          {/* Reset countdown */}
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            {t("subscription.creditsResetIn", { days: daysLeft })}
          </div>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* Usage Analytics                                                    */}
      {/* ================================================================= */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {/* Savings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("subscription.savings")}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ${analytics.estimatedSavings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Utilization */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("subscription.utilizationRate")}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {Math.round(analytics.utilizationRate)}%
                </p>
              </div>
            </div>
            {/* Utilization bar */}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, analytics.utilizationRate)}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
              />
            </div>
          </div>

          {/* Downloads this period */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Download className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("subscription.downloadsThisPeriod")}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {analytics.downloadsThisPeriod}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Credit History                                                     */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("subscription.history")}
          </h3>
        </div>

        {creditHistoryData?.items?.length ? (
          <>
            <div className="space-y-3">
              {creditHistoryData.items.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-600 ${getTransactionColor(tx.type)}`}
                    >
                      {tx.type === CreditTransactionType.CREDIT_GRANT && (
                        <Check className="h-4 w-4" />
                      )}
                      {tx.type === CreditTransactionType.CREDIT_USED && (
                        <Download className="h-4 w-4" />
                      )}
                      {tx.type === CreditTransactionType.CREDIT_ROLLOVER && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {tx.type === CreditTransactionType.CREDIT_EXPIRED && (
                        <X className="h-4 w-4" />
                      )}
                      {tx.type === CreditTransactionType.CREDIT_BONUS && (
                        <Crown className="h-4 w-4" />
                      )}
                      {tx.type === CreditTransactionType.CREDIT_REFUND && (
                        <TrendingUp className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {t(
                          `subscription.transactionTypes.${tx.type}`,
                        )}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {tx.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        getTransactionSign(tx.type) === "+"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {getTransactionSign(tx.type)}
                      {Math.abs(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {creditHistoryData.meta?.hasNextPage && (
              <button
                onClick={() =>
                  setHistoryCursor(creditHistoryData.meta.nextCursor)
                }
                className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Load more
              </button>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">
            No credit history yet.
          </p>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* Subscription Downloads                                             */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("subscription.downloads")}
          </h3>
        </div>

        {downloadsData?.items?.length ? (
          <>
            <div className="space-y-3">
              {downloadsData.items.map((dl) => (
                <div
                  key={dl.id}
                  className="flex items-center gap-4 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700/50"
                >
                  {/* Product image */}
                  {dl.digitalProduct?.featuredImage ? (
                    <img
                      src={dl.digitalProduct.featuredImage}
                      alt={dl.digitalProduct.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-600">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {dl.digitalProduct?.title ?? "Product"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(dl.downloadedAt)} &middot;{" "}
                      {dl.creditsCost}{" "}
                      {dl.creditsCost === 1 ? "credit" : "credits"}
                    </p>
                  </div>
                  {/* Link */}
                  {dl.digitalProduct?.slug && (
                    <Link
                      href={`/store/${dl.digitalProduct.slug}`}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {downloadsData.meta?.hasNextPage && (
              <button
                onClick={() =>
                  setDownloadsCursor(downloadsData.meta.nextCursor)
                }
                className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Load more
              </button>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">
            No downloads yet. Start browsing the{" "}
            <Link
              href="/store"
              className="text-emerald-600 underline dark:text-emerald-400"
            >
              store
            </Link>{" "}
            to use your credits.
          </p>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* Cancel Modal                                                       */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("subscription.cancelConfirm")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("subscription.cancelDescription")}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {t("subscription.actions") === "Actions"
                    ? "Keep Subscription"
                    : "Keep"}
                </button>
                <button
                  onClick={() => {
                    cancelMutation.mutate({ immediate: false });
                    setShowCancelModal(false);
                  }}
                  disabled={cancelMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  {cancelMutation.isPending
                    ? "Canceling..."
                    : t("subscription.cancelAtPeriodEnd")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* Pause Modal                                                        */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showPauseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowPauseModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Pause className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("subscription.pauseConfirm")}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("subscription.pauseDescription")}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPauseModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    pauseMutation.mutate("pause");
                    setShowPauseModal(false);
                  }}
                  disabled={pauseMutation.isPending}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                >
                  {pauseMutation.isPending
                    ? "Pausing..."
                    : t("subscription.pause")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
