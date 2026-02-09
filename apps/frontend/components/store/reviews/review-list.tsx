"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Search,
  X,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  useProductReviews,
  useVoteOnReview,
  useReportReview,
} from "@/hooks/use-reviews";
import {
  ReviewSortBy as ReviewSortByEnum,
  REVIEW_SORT_LABELS,
} from "@/types/review";
import type { ReviewSortBy, VoteType } from "@/types/review";
import { ReviewCard } from "./review-card";

// =============================================================================
// Types
// =============================================================================

interface ReviewListProps {
  productId: string;
  ratingFilter?: number | null;
  onRatingFilterChange?: (rating: number | null) => void;
}

// =============================================================================
// Constants
// =============================================================================

const RATING_FILTERS = [
  { label: "All", value: null },
  { label: "5\u2605", value: 5 },
  { label: "4\u2605", value: 4 },
  { label: "3\u2605", value: 3 },
  { label: "2\u2605", value: 2 },
  { label: "1\u2605", value: 1 },
] as const;

const SORT_OPTIONS: { value: ReviewSortBy; label: string }[] = [
  { value: ReviewSortByEnum.MOST_HELPFUL, label: "Most Helpful" },
  { value: ReviewSortByEnum.NEWEST, label: "Newest" },
  { value: ReviewSortByEnum.HIGHEST, label: "Highest Rating" },
  { value: ReviewSortByEnum.LOWEST, label: "Lowest Rating" },
];

const DEBOUNCE_MS = 300;

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -4,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// Skeleton
// =============================================================================

function ReviewSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 md:p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex-1">
          <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mt-3" />
      <div className="flex items-center gap-3 mt-3">
        <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// Custom Sort Dropdown
// =============================================================================

function SortDropdown({
  value,
  onChange,
}: {
  value: ReviewSortBy;
  onChange: (v: ReviewSortBy) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort by";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-700
          text-neutral-700 dark:text-neutral-300
          hover:border-neutral-300 dark:hover:border-neutral-600
          transition-colors focus:outline-none focus-visible:ring-2
          focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
        "
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLabel}
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="listbox"
            className="
              absolute right-0 top-full mt-1.5 z-20
              w-48 py-1 rounded-lg shadow-lg
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-700
              overflow-hidden
            "
          >
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`
                      w-full text-left px-3.5 py-2 text-sm transition-colors
                      ${
                        isSelected
                          ? "bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// useDebounce
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// Component
// =============================================================================

export function ReviewList({
  productId,
  ratingFilter: externalRatingFilter,
  onRatingFilterChange,
}: ReviewListProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [sortBy, setSortBy] = useState<ReviewSortBy>(
    ReviewSortByEnum.MOST_HELPFUL,
  );
  const [internalRatingFilter, setInternalRatingFilter] = useState<
    number | null
  >(null);
  const [searchInput, setSearchInput] = useState("");

  // Sync external rating filter prop
  const ratingFilter =
    externalRatingFilter !== undefined ? externalRatingFilter : internalRatingFilter;

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);

  // Convert null to undefined for the hook
  const hookRatingFilter = ratingFilter ?? undefined;

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProductReviews(productId, sortBy, hookRatingFilter);

  const voteMutation = useVoteOnReview();
  const reportMutation = useReportReview();

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const allReviews = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  // Client-side search filtering
  const filteredReviews = useMemo(() => {
    if (!debouncedSearch.trim()) return allReviews;
    const query = debouncedSearch.toLowerCase().trim();
    return allReviews.filter(
      (review) =>
        review.title.toLowerCase().includes(query) ||
        review.body.toLowerCase().includes(query),
    );
  }, [allReviews, debouncedSearch]);

  // ---------------------------------------------------------------------------
  // Infinite Scroll - IntersectionObserver
  // ---------------------------------------------------------------------------
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleRatingFilter = useCallback(
    (value: number | null) => {
      // Toggle: clicking the active filter clears it
      const newValue = ratingFilter === value ? null : value;
      if (onRatingFilterChange) {
        onRatingFilterChange(newValue);
      } else {
        setInternalRatingFilter(newValue);
      }
    },
    [ratingFilter, onRatingFilterChange],
  );

  const handleVote = useCallback(
    (reviewId: string, vote: string) => {
      voteMutation.mutate({ reviewId, vote: vote as VoteType });
    },
    [voteMutation],
  );

  const handleReport = useCallback(
    (reviewId: string) => {
      reportMutation.mutate({ reviewId, reason: "Inappropriate content" });
    },
    [reportMutation],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Header: Total count + Sort dropdown                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {isLoading ? (
            <span className="inline-block h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse align-middle" />
          ) : (
            <>
              {totalCount} Review{totalCount !== 1 ? "s" : ""}
            </>
          )}
        </h2>
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Rating filter chips                                                */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="
          flex items-center gap-2 mb-5 pb-1
          overflow-x-auto scrollbar-hide
          snap-x snap-mandatory
          -mx-1 px-1
        "
      >
        {RATING_FILTERS.map((filter) => {
          const isActive =
            filter.value === null
              ? ratingFilter === null || ratingFilter === undefined
              : ratingFilter === filter.value;

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => handleRatingFilter(filter.value)}
              className={`
                snap-start shrink-0
                px-4 py-1.5 text-sm font-medium rounded-full
                transition-all duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
                ${
                  isActive
                    ? "bg-[#1E4DB7] text-white shadow-[0_0_12px_rgba(30,77,183,0.35)]"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search within reviews                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search reviews..."
          className="
            w-full pl-9 pr-9 py-2.5 text-sm rounded-lg
            bg-neutral-50 dark:bg-neutral-900
            border border-neutral-200 dark:border-neutral-700
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            focus:outline-none focus:border-[#1E4DB7] dark:focus:border-[#1E4DB7]
            focus:ring-2 focus:ring-[#1E4DB7]/20
            transition-colors
          "
        />
        <AnimatePresence>
          {searchInput && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSearchInput("")}
              className="
                absolute right-2.5 top-1/2 -translate-y-1/2
                p-0.5 rounded-full
                text-neutral-400 dark:text-neutral-500
                hover:text-neutral-600 dark:hover:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                transition-colors
              "
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading state                                                      */}
      {/* ------------------------------------------------------------------ */}
      {isLoading && (
        <div className="space-y-4">
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Error state                                                        */}
      {/* ------------------------------------------------------------------ */}
      {isError && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            flex flex-col items-center gap-3 py-10 px-6 rounded-xl
            bg-red-50/60 dark:bg-red-950/20
            border border-red-200 dark:border-red-900/40
          "
        >
          <AlertCircle className="h-10 w-10 text-red-400 dark:text-red-500" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Failed to load reviews
          </p>
          <p className="text-xs text-red-500/80 dark:text-red-400/60">
            Something went wrong while fetching reviews.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="
              mt-1 px-4 py-2 text-sm font-medium rounded-lg
              bg-red-600 hover:bg-red-700
              text-white transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2
            "
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty state                                                        */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && !isError && allReviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            relative flex flex-col items-center justify-center text-center
            py-20 px-6 rounded-2xl overflow-hidden
            bg-gradient-to-b from-neutral-50 to-white
            dark:from-neutral-900 dark:to-neutral-950
            border border-neutral-100 dark:border-neutral-800
          "
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-5 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60">
              <MessageSquare className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              No reviews yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
              {ratingFilter
                ? `No ${ratingFilter}-star reviews found. Try a different filter.`
                : "Be the first to share your experience with this product!"}
            </p>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty search results (reviews exist but search has no matches)     */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading &&
        !isError &&
        allReviews.length > 0 &&
        filteredReviews.length === 0 &&
        debouncedSearch.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              No reviews matching &ldquo;{debouncedSearch}&rdquo;
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Try a different search term.
            </p>
          </motion.div>
        )}

      {/* ------------------------------------------------------------------ */}
      {/* Review cards                                                       */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && filteredReviews.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <ReviewCard
                  review={review}
                  onVote={handleVote}
                  onReport={handleReport}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Infinite scroll sentinel + loading skeletons                       */}
      {/* ------------------------------------------------------------------ */}
      {hasNextPage && (
        <>
          {/* Sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

          {/* Loading indicator while fetching next page */}
          {isFetchingNextPage && (
            <div className="space-y-4 mt-4">
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          )}

          {/* Fallback Load More button */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="
                inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg
                bg-neutral-100 dark:bg-neutral-800
                text-neutral-700 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                focus:outline-none focus-visible:ring-2
                focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
              "
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Reviews"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewList;
