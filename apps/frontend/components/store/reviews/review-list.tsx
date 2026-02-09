"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquareOff } from "lucide-react";
import { Button } from "ktblog-ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ktblog-ui/components";
import { useProductReviews, useVoteOnReview, useReportReview } from "@/hooks/use-reviews";
import type { ReviewSortBy, VoteType } from "@/types/review";
import { ReviewSortBy as ReviewSortByEnum, REVIEW_SORT_LABELS } from "@/types/review";
import { ReviewCard } from "./review-card";

// =============================================================================
// Types
// =============================================================================

interface ReviewListProps {
  productId: string;
  className?: string;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
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
// Component
// =============================================================================

export function ReviewList({ productId, className = "" }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<ReviewSortBy>(ReviewSortByEnum.MOST_HELPFUL);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useProductReviews(productId, sortBy, ratingFilter);

  const voteMutation = useVoteOnReview();
  const reportMutation = useReportReview();

  const allReviews = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as ReviewSortBy);
  }, []);

  const handleRatingFilter = useCallback((value: number | null) => {
    setRatingFilter(value ?? undefined);
  }, []);

  const handleVote = useCallback(
    (reviewId: string, vote: VoteType) => {
      voteMutation.mutate({ reviewId, vote });
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

  return (
    <div className={className}>
      {/* Controls: Sort + Rating Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {RATING_FILTERS.map((filter) => {
            const isActive =
              filter.value === null
                ? ratingFilter === undefined
                : ratingFilter === filter.value;

            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => handleRatingFilter(filter.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                  ${
                    isActive
                      ? "bg-[#1E4DB7] text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }
                `}
              >
                {filter.label}
              </button>
            );
          })}
          {totalCount > 0 && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-2">
              {totalCount} review{totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REVIEW_SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-sm text-red-500 dark:text-red-400">
            Failed to load reviews. Please try again later.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allReviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <MessageSquareOff className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            No reviews yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {ratingFilter
              ? `No ${ratingFilter}-star reviews found. Try a different filter.`
              : "Be the first to share your experience with this product."}
          </p>
        </motion.div>
      )}

      {/* Review Cards */}
      {!isLoading && allReviews.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {allReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={handleVote}
                onReport={handleReport}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={isFetchingNextPage}
            className="min-w-[160px]"
          >
            {isFetchingNextPage ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
