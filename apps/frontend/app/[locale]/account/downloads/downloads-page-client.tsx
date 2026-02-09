"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  KeyRound,
  Bell,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpCircle,
  ChevronRight,
  FileDown,
  ShieldCheck,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import {
  useMyDownloads,
  useMyLicenses,
  useMyUpdates,
  useRefreshDownloadLink,
} from "@/hooks/use-delivery";
import DownloadButton from "@/components/delivery/download-button";
import LicenseKeyDisplay from "@/components/delivery/license-key-display";
import LicenseActivationManager from "@/components/delivery/license-activation-manager";
import UpdateNotification from "@/components/delivery/update-notification";
import VersionTimeline from "@/components/delivery/version-timeline";
import type {
  DownloadLink,
  DownloadLinkStatus,
  License,
  UserProductUpdate,
} from "@/types/delivery";
import {
  downloadLinkStatusColors,
  downloadLinkStatusLabels,
} from "@/types/delivery";

// =============================================================================
// Tab Definitions
// =============================================================================

type TabId = "downloads" | "licenses" | "updates";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "downloads", label: "Downloads", icon: <Download className="h-4 w-4" /> },
  { id: "licenses", label: "Licenses", icon: <KeyRound className="h-4 w-4" /> },
  { id: "updates", label: "Updates", icon: <Bell className="h-4 w-4" /> },
];

// =============================================================================
// Animation Variants
// =============================================================================

const tabContentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

// =============================================================================
// Page Client Component
// =============================================================================

export default function DownloadsPageClient() {
  const [activeTab, setActiveTab] = useState<TabId>("downloads");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  My Products
                </h1>
                <p className="text-white/70 text-sm mt-0.5">
                  Manage your downloads, licenses, and product updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <nav className="flex gap-1 -mb-px" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? "text-[#1E4DB7] dark:text-blue-400"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1E4DB7] dark:bg-blue-400 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {activeTab === "downloads" && <DownloadsTab />}
              {activeTab === "licenses" && <LicensesTab />}
              {activeTab === "updates" && <UpdatesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Downloads Tab
// =============================================================================

function DownloadsTab() {
  const { data, isLoading, isError, error } = useMyDownloads();
  const refreshMutation = useRefreshDownloadLink();

  const downloads = data?.items ?? [];

  const handleRefresh = useCallback(
    async (linkId: string) => {
      await refreshMutation.mutateAsync(linkId);
    },
    [refreshMutation],
  );

  if (isLoading) {
    return <LoadingState message="Loading your downloads..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load downloads. Please try again."
        }
      />
    );
  }

  if (downloads.length === 0) {
    return (
      <EmptyState
        icon={<FileDown className="h-12 w-12" />}
        title="No Downloads Yet"
        description="Products you purchase will appear here with download links."
        actionLabel="Browse Store"
        actionHref="/store"
      />
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((link: DownloadLink, index: number) => (
        <motion.div
          key={link.id}
          custom={index}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Product thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                {link.product?.featuredImage ? (
                  <img
                    src={link.product.featuredImage}
                    alt={link.product?.title ?? "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-neutral-400" />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                      {link.product?.title ?? "Digital Product"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {link.product?.type && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                          {link.product.type.replace(/_/g, " ")}
                        </span>
                      )}
                      {link.order?.orderNumber && (
                        <>
                          <span className="text-neutral-300 dark:text-neutral-600">
                            |
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Order #{link.order.orderNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${downloadLinkStatusColors[link.status as DownloadLinkStatus]}`}
                  >
                    {downloadLinkStatusLabels[link.status as DownloadLinkStatus] ??
                      link.status}
                  </span>
                </div>

                {/* Metadata row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                  {link.product?.version != null && (
                    <span className="flex items-center gap-1">
                      <ArrowUpCircle className="h-3 w-3" />
                      v{link.product.version}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Purchased{" "}
                    {new Date(link.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {link.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires{" "}
                      {new Date(link.expiresAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Update available notification */}
                {link.latestUpdate && (
                  <div className="mt-3">
                    <UpdateNotification
                      update={link.latestUpdate}
                      className="!p-3"
                    />
                  </div>
                )}

                {/* Download button row */}
                <div className="mt-4">
                  <DownloadButton
                    downloadLink={link}
                    onRefreshNeeded={() => handleRefresh(link.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Pagination info */}
      {data?.meta?.hasNextPage && (
        <div className="text-center pt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {downloads.length} of {data.meta.total ?? "many"} downloads
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Licenses Tab
// =============================================================================

function LicensesTab() {
  const { data, isLoading, isError, error } = useMyLicenses();
  const [expandedLicenseId, setExpandedLicenseId] = useState<string | null>(null);

  const licenses = data?.items ?? [];

  const toggleExpanded = useCallback((licenseId: string) => {
    setExpandedLicenseId((prev) => (prev === licenseId ? null : licenseId));
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading your licenses..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load licenses. Please try again."
        }
      />
    );
  }

  if (licenses.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-12 w-12" />}
        title="No Licenses Yet"
        description="License keys for your purchased products will appear here."
        actionLabel="Browse Store"
        actionHref="/store"
      />
    );
  }

  return (
    <div className="space-y-4">
      {licenses.map((license: License, index: number) => (
        <motion.div
          key={license.id}
          custom={index}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Product thumbnail */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                  {license.product?.featuredImage ? (
                    <img
                      src={license.product.featuredImage}
                      alt={license.product?.title ?? "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <KeyRound className="h-6 w-6 text-neutral-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                    {license.product?.title ?? "Digital Product"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Licensed{" "}
                    {new Date(license.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  {/* License Key Display */}
                  <div className="mt-3">
                    <LicenseKeyDisplay license={license} />
                  </div>

                  {/* Expand / collapse activations */}
                  <button
                    onClick={() => toggleExpanded(license.id)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {expandedLicenseId === license.id
                      ? "Hide Activations"
                      : "Manage Activations"}
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedLicenseId === license.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded activation manager */}
            <AnimatePresence>
              {expandedLicenseId === license.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
                >
                  <div className="p-5">
                    <LicenseActivationManager license={license} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      {/* Pagination info */}
      {data?.meta?.hasNextPage && (
        <div className="text-center pt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {licenses.length} of {data.meta.total ?? "many"} licenses
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Updates Tab
// =============================================================================

function UpdatesTab() {
  const { data, isLoading, isError, error } = useMyUpdates();
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const productUpdates = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  const toggleExpanded = useCallback((productId: string) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  }, []);

  if (isLoading) {
    return <LoadingState message="Checking for updates..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load updates. Please try again."
        }
      />
    );
  }

  if (productUpdates.length === 0) {
    return (
      <EmptyState
        icon={<ArrowUpCircle className="h-12 w-12" />}
        title="All Caught Up"
        description="No new updates available for your products. Check back later!"
      />
    );
  }

  return (
    <div className="space-y-6">
      {productUpdates.map(
        (productUpdate: UserProductUpdate, index: number) => {
          const latestUpdate = productUpdate.updates[0];
          const hasMultiple = productUpdate.updates.length > 1;
          const isExpanded = expandedProductId === productUpdate.product.id;

          return (
            <motion.div
              key={productUpdate.product.id}
              custom={index}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                    {productUpdate.product.featuredImage ? (
                      <img
                        src={productUpdate.product.featuredImage}
                        alt={productUpdate.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ArrowUpCircle className="h-7 w-7 text-neutral-400" />
                    )}
                  </div>

                  {/* Update info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                      {productUpdate.product.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {productUpdate.currentVersion && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Current: v{productUpdate.currentVersion}
                        </span>
                      )}
                      {latestUpdate && (
                        <>
                          <ChevronRight className="h-3 w-3 text-neutral-400" />
                          <span className="text-xs font-medium text-[#1E4DB7] dark:text-blue-400">
                            Latest: v{latestUpdate.version}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Latest update notification */}
                    {latestUpdate && (
                      <div className="mt-3">
                        <UpdateNotification
                          update={latestUpdate}
                          className="!p-3"
                        />
                      </div>
                    )}

                    {/* Expand to see version timeline */}
                    {hasMultiple && (
                      <button
                        onClick={() => toggleExpanded(productUpdate.product.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        {isExpanded
                          ? "Hide Version History"
                          : `View All ${productUpdate.updates.length} Updates`}
                        <ChevronRight
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded timeline */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <div className="p-5">
                      <VersionTimeline
                        updates={productUpdate.updates}
                        currentVersion={productUpdate.currentVersion}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        },
      )}
    </div>
  );
}

// =============================================================================
// Shared UI: Loading State
// =============================================================================

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 text-[#1E4DB7] animate-spin mb-4" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {message}
      </p>
    </div>
  );
}

// =============================================================================
// Shared UI: Error State
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 text-center max-w-md">
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// =============================================================================
// Shared UI: Empty State
// =============================================================================

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5 text-neutral-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
        {description}
      </p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#1E4DB7] text-white hover:bg-[#143A8F] transition-colors shadow-sm"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
