"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { Button } from "ktblog-ui/components";
import { useReviewStats } from "@/hooks/use-reviews";
import { StarRating } from "./star-rating";
import { RatingDistribution } from "./rating-distribution";
import { ReviewForm } from "./review-form";

// =============================================================================
// Types
// =============================================================================

interface ReviewSummaryProps {
  productId: string;
  onRatingFilter?: (rating: number | null) => void;
  activeRatingFilter?: number | null;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// =============================================================================
// Skeleton
// =============================================================================

function ReviewSummarySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-6">
        <div className="text-center">
          <div className="h-12 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto mb-1" />
          <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto" />
        </div>
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-2.5 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
              <div className="h-3 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ReviewSummary({
  productId,
  onRatingFilter,
  activeRatingFilter,
  className = "",
}: ReviewSummaryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading, isError } = useReviewStats(productId);

  const handleWriteReview = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-6 ${className}`}>
        <ReviewSummarySkeleton />
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  return (
    <>
      <motion.div
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-6 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Average Rating */}
          <div className="text-center sm:text-left shrink-0">
            <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating
              value={stats.averageRating}
              size="md"
              readOnly
            />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
              Based on{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {stats.totalReviews}
              </span>{" "}
              review{stats.totalReviews !== 1 ? "s" : ""}
            </p>
            {stats.verifiedPurchasePercent > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                {stats.verifiedPurchasePercent}% verified purchases
              </p>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full">
            <RatingDistribution
              distribution={stats.ratingDistribution}
              totalReviews={stats.totalReviews}
              onRatingFilter={onRatingFilter}
              activeFilter={activeRatingFilter}
            />
          </div>
        </div>

        {/* Write a Review CTA */}
        <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            onClick={handleWriteReview}
            leftIcon={<Pencil className="h-4 w-4" />}
            className="w-full sm:w-auto bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
          >
            Write a Review
          </Button>
        </div>
      </motion.div>

      {/* Review Form Dialog */}
      <ReviewForm
        productId={productId}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </>
  );
}

export default ReviewSummary;
