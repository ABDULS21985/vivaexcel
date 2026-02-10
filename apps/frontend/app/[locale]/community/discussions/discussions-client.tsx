"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Loader2,
  MessageSquare,
  ChevronDown,
  X,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Input, Badge } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import {
  useDiscussionCategories,
  useDiscussionThreads,
} from "@/hooks/use-discussions";
import { ThreadSortBy } from "@/types/discussion";
import type { ThreadQueryParams } from "@/types/discussion";
import { ThreadCard } from "@/components/community/thread-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// =============================================================================
// Sort options
// =============================================================================

const SORT_OPTIONS: { value: ThreadQueryParams["sortBy"]; labelKey: string }[] = [
  { value: ThreadSortBy.NEWEST, labelKey: "sortNewest" },
  { value: ThreadSortBy.ACTIVE, labelKey: "sortActive" },
  { value: ThreadSortBy.POPULAR, labelKey: "sortPopular" },
];

// =============================================================================
// Component
// =============================================================================

export default function DiscussionsClient() {
  const t = useTranslations("discussion");
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  // State
  const initialCategory = searchParams.get("category") || "";
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<ThreadQueryParams["sortBy"]>(ThreadSortBy.NEWEST);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  // Build query params
  const queryParams: ThreadQueryParams = useMemo(
    () => ({
      categorySlug: activeCategory || undefined,
      sortBy,
      search: debouncedSearch || undefined,
      limit: 15,
    }),
    [activeCategory, sortBy, debouncedSearch],
  );

  // Fetch data
  const categoriesQuery = useDiscussionCategories();
  const threadsQuery = useDiscussionThreads(queryParams);

  const categories = categoriesQuery.data ?? [];
  const allThreads = useMemo(() => {
    if (!threadsQuery.data?.pages) return [];
    return threadsQuery.data.pages.flatMap((page) => page.items);
  }, [threadsQuery.data]);

  // Separate pinned from regular
  const pinnedThreads = useMemo(
    () => allThreads.filter((thread) => thread.isPinned),
    [allThreads],
  );
  const regularThreads = useMemo(
    () => allThreads.filter((thread) => !thread.isPinned),
    [allThreads],
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.labelKey || "sortNewest";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: t("community"), href: "/community" },
            { label: t("discussions") },
          ]}
          className="mb-6"
        />

        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("discussionsTitle")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {t("discussionsSubtitle")}
            </p>
          </div>

          {isAuthenticated ? (
            <Link href="/community/discussions/new">
              <Button className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white">
                <Plus className="h-4 w-4 me-2" />
                {t("newThread")}
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white">
                <Plus className="h-4 w-4 me-2" />
                {t("newThread")}
              </Button>
            </Link>
          )}
        </div>

        {/* ================================================================= */}
        {/* FILTERS: Category chips + Sort + Search                           */}
        {/* ================================================================= */}
        <div className="space-y-4 mb-8">
          {/* Category filter — horizontal scrollable */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {/* All chip */}
            <button
              onClick={() => setActiveCategory("")}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border",
                !activeCategory
                  ? "bg-[#1E4DB7] text-white border-[#1E4DB7]"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800",
              )}
            >
              {t("allCategories")}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === cat.slug ? "" : cat.slug,
                  )
                }
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  "border",
                  activeCategory === cat.slug
                    ? "bg-[#1E4DB7] text-white border-[#1E4DB7]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800",
                )}
              >
                {cat.name}
                <span className="ms-1.5 text-xs opacity-70">
                  {cat.threadCount}
                </span>
              </button>
            ))}
          </div>

          {/* Sort + Search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="ps-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="w-full sm:w-auto gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t(currentSortLabel)}
                <ChevronDown className="h-3 w-3" />
              </Button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full mt-1 w-48 z-20 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={cn(
                          "w-full text-start px-4 py-2 text-sm transition-colors",
                          sortBy === option.value
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
                        )}
                      >
                        {t(option.labelKey)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overlay to close dropdown */}
              {showSortDropdown && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* THREAD LIST                                                       */}
        {/* ================================================================= */}

        {/* Loading skeleton */}
        {threadsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded mt-0.5" />
                  <div className="flex-1">
                    <div className="h-4 w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                    <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
                    <div className="flex gap-4">
                      <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allThreads.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {t("noThreadsFound")}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              {debouncedSearch || activeCategory
                ? t("noThreadsMatchFilter")
                : t("noThreadsYet")}
            </p>
            {isAuthenticated && (
              <Link href="/community/discussions/new">
                <Button>
                  <Plus className="h-4 w-4 me-2" />
                  {t("startFirstThread")}
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Pinned threads */}
            {pinnedThreads.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase mb-3">
                  {t("pinnedThreads")}
                </h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {pinnedThreads.map((thread) => (
                    <motion.div key={thread.id} variants={itemVariants}>
                      <ThreadCard thread={thread} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Regular threads */}
            {regularThreads.length > 0 && (
              <div>
                {pinnedThreads.length > 0 && (
                  <h3 className="text-xs font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-3">
                    {t("allThreads")}
                  </h3>
                )}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {regularThreads.map((thread) => (
                    <motion.div key={thread.id} variants={itemVariants}>
                      <ThreadCard thread={thread} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Load more button */}
            {threadsQuery.hasNextPage && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => threadsQuery.fetchNextPage()}
                  disabled={threadsQuery.isFetchingNextPage}
                  className="min-w-[160px]"
                >
                  {threadsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                      {t("loading")}
                    </>
                  ) : (
                    t("loadMore")
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
