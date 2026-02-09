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
  GripVertical,
  Search,
  Filter,
  Sparkles,
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
import { cn } from "@ktblog/ui/components";

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

const statsCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 + 0.2, duration: 0.4 },
  }),
};

// =============================================================================
// Utility: Animated Number Counter
// =============================================================================

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useState(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  });

  return <span>{count}</span>;
}

// =============================================================================
// Page Client Component
// =============================================================================

export default function DownloadsPageClient() {
  const [activeTab, setActiveTab] = useState<TabId>("downloads");

  // Fetch all data for stats
  const { data: downloadsData } = useMyDownloads();
  const { data: licensesData } = useMyLicenses();
  const { data: updatesData } = useMyUpdates();

  const stats = useMemo(() => {
    const downloads = downloadsData?.items ?? [];
    const licenses = licensesData?.items ?? [];
    const updates = Array.isArray(updatesData) ? updatesData : [];

    return {
      totalDownloads: downloads.length,
      activeLicenses: licenses.length,
      updatesAvailable: updates.length,
    };
  }, [downloadsData, licensesData, updatesData]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Enhanced Header with Animated Gradient */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] animate-gradient-shift" />

        {/* Dot pattern overlay */}
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

        {/* Add CSS animation for gradient shift */}
        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient-shift {
            background-size: 200% 200%;
            animation: gradient-shift 8s ease infinite;
          }
        `}</style>
      </section>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Downloads */}
            <motion.div
              custom={0}
              variants={statsCardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Total Downloads
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    <AnimatedNumber value={stats.totalDownloads} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#1E4DB7]/10 flex items-center justify-center">
                  <Download className="h-6 w-6 text-[#1E4DB7] dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            {/* Active Licenses */}
            <motion.div
              custom={1}
              variants={statsCardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Active Licenses
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    <AnimatedNumber value={stats.activeLicenses} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </motion.div>

            {/* Updates Available */}
            <motion.div
              custom={2}
              variants={statsCardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Updates Available
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    <AnimatedNumber value={stats.updatesAvailable} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#F59A23]/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-[#F59A23]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm mt-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <nav className="flex gap-1 -mb-px" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "text-[#1E4DB7] dark:text-blue-400"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  )}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const downloads = data?.items ?? [];

  // Filter downloads
  const filteredDownloads = useMemo(() => {
    return downloads.filter((link: DownloadLink) => {
      const matchesSearch = link.product?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || link.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [downloads, searchQuery, statusFilter]);

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
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:focus:ring-blue-400/20 transition-shadow"
          />
        </div>

        {/* Status Filter */}
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:focus:ring-blue-400/20 transition-shadow appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
            <option value="exhausted">Exhausted</option>
          </select>
        </div>
      </div>

      {/* Downloads List */}
      <div className="space-y-4">
        {filteredDownloads.map((link: DownloadLink, index: number) => {
          // Calculate download progress percentage
          const maxDownloads = (link as any).maxDownloads ?? 5;
          const downloadCount = (link as any).downloadCount ?? 0;
          const progressPercent = (downloadCount / maxDownloads) * 100;
          const remaining = maxDownloads - downloadCount;

          // Color based on remaining downloads
          const progressColor =
            remaining > maxDownloads / 2
              ? "stroke-emerald-500"
              : remaining > maxDownloads / 4
              ? "stroke-amber-500"
              : "stroke-red-500";

          // Product type color mapping
          const productTypeColors: Record<string, string> = {
            template: "bg-blue-500",
            plugin: "bg-purple-500",
            addon: "bg-emerald-500",
            toolkit: "bg-amber-500",
          };
          const typeColor =
            productTypeColors[link.product?.type ?? ""] ?? "bg-neutral-400";

          return (
            <motion.div
              key={link.id}
              custom={index}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              className="group relative rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
            >
              {/* Product type color bar */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1", typeColor)} />

              <div className="p-5 pl-6">
                <div className="flex items-start gap-4">
                  {/* Grip handle (visual only) */}
                  <div className="flex-shrink-0 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Product thumbnail - larger on desktop */}
                  <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                    {link.product?.featuredImage ? (
                      <img
                        src={link.product.featuredImage}
                        alt={link.product?.title ?? "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-neutral-400" />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
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
                      <div className="flex items-center gap-2">
                        {/* Update available pulse badge */}
                        {link.latestUpdate && (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-sm opacity-75" />
                            <span className="relative flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                              <Sparkles className="h-3 w-3" />
                              Update
                            </span>
                          </motion.div>
                        )}

                        <span
                          className={cn(
                            "flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            downloadLinkStatusColors[link.status as DownloadLinkStatus]
                          )}
                        >
                          {downloadLinkStatusLabels[link.status as DownloadLinkStatus] ??
                            link.status}
                        </span>
                      </div>
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

                    {/* Download button row with circular progress */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative">
                        {/* Circular progress ring */}
                        <svg
                          className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          {/* Background circle */}
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-neutral-200 dark:stroke-neutral-700"
                            strokeWidth="2"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className={progressColor}
                            strokeWidth="2"
                            strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <DownloadButton
                          downloadLink={link}
                          onRefreshNeeded={() => handleRefresh(link.id)}
                        />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {remaining} of {maxDownloads} downloads remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredDownloads.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No downloads match your search criteria
          </p>
        </div>
      )}

      {/* Pagination info */}
      {data?.meta?.hasNextPage && filteredDownloads.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filteredDownloads.length} of {data.meta.total ?? "many"} downloads
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
  const [searchQuery, setSearchQuery] = useState("");

  const licenses = data?.items ?? [];

  // Filter licenses
  const filteredLicenses = useMemo(() => {
    return licenses.filter((license: License) =>
      license.product?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [licenses, searchQuery]);

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
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search licenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:focus:ring-blue-400/20 transition-shadow"
        />
      </div>

      {/* Licenses List */}
      <div className="space-y-4">
        {filteredLicenses.map((license: License, index: number) => (
          <motion.div
            key={license.id}
            custom={index}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Product thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                    {license.product?.featuredImage ? (
                      <img
                        src={license.product.featuredImage}
                        alt={license.product?.title ?? "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <KeyRound className="h-7 w-7 text-neutral-400" />
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
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedLicenseId === license.id && "rotate-90"
                        )}
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
      </div>

      {/* No results message */}
      {filteredLicenses.length === 0 && licenses.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No licenses match your search criteria
          </p>
        </div>
      )}

      {/* Pagination info */}
      {data?.meta?.hasNextPage && filteredLicenses.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filteredLicenses.length} of {data.meta.total ?? "many"} licenses
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
  const [searchQuery, setSearchQuery] = useState("");

  const productUpdates = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  // Filter updates
  const filteredUpdates = useMemo(() => {
    return productUpdates.filter((update: UserProductUpdate) =>
      update.product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productUpdates, searchQuery]);

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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search updates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:focus:ring-blue-400/20 transition-shadow"
        />
      </div>

      {/* Updates List */}
      <div className="space-y-6">
        {filteredUpdates.map(
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
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Product image */}
                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                      {productUpdate.product.featuredImage ? (
                        <img
                          src={productUpdate.product.featuredImage}
                          alt={productUpdate.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ArrowUpCircle className="h-8 w-8 text-neutral-400" />
                      )}
                    </div>

                    {/* Update info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                          {productUpdate.product.title}
                        </h3>

                        {/* Update badge with pulse */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative flex-shrink-0"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-sm opacity-75" />
                          <span className="relative flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                            <Sparkles className="h-3 w-3" />
                            New
                          </span>
                        </motion.div>
                      </div>

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
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )}
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

      {/* No results message */}
      {filteredUpdates.length === 0 && productUpdates.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No updates match your search criteria
          </p>
        </div>
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
      {/* Inline SVG illustration background */}
      <div className="relative w-32 h-32 mb-6">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="80"
            className="fill-neutral-100 dark:fill-neutral-800"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            className="fill-neutral-50 dark:fill-neutral-900"
          />
          <circle
            cx="100"
            cy="100"
            r="40"
            className="fill-neutral-100 dark:fill-neutral-800"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
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
