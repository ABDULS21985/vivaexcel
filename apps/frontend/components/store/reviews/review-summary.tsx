"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, ThumbsUp, MessageSquarePlus } from "lucide-react";
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
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Animated counter that counts from 0 to `target` over `duration` ms
 * using requestAnimationFrame. Only triggers when `shouldAnimate` is true.
 */
function useAnimatedCounter(
  target: number,
  shouldAnimate: boolean,
  duration: number = 1200,
  decimals: number = 0,
): string {
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setDisplay(
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString(),
      );

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(
          decimals > 0
            ? target.toFixed(decimals)
            : target.toLocaleString(),
        );
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, shouldAnimate, duration, decimals]);

  return display;
}

// =============================================================================
// Skeleton
// =============================================================================

function ReviewSummarySkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Left side skeleton */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-start gap-3 md:min-w-[200px]">
          <div className="h-16 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="flex gap-3 mt-2">
            <div className="h-8 w-36 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            <div className="h-8 w-36 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          </div>
          <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg mt-3" />
        </div>

        {/* Right side skeleton (distribution bars) */}
        <div className="flex-1 w-full space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
              <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-11 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Transform the `ratingDistribution` record from the API into the array
 * format expected by the RatingDistribution component.
 */
function buildDistributionRows(
  dist: { [key: number]: number },
  totalReviews: number,
): { rating: number; count: number; percentage: number }[] {
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = dist[rating] ?? 0;
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { rating, count, percentage };
  });
}

// =============================================================================
// Animation Variants
// =============================================================================

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ReviewSummary({ productId }: ReviewSummaryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const { data: stats, isLoading, isError } = useReviewStats(productId);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  // Animated counters
  const animatedRating = useAnimatedCounter(
    stats?.averageRating ?? 0,
    isInView && !!stats,
    1200,
    1,
  );
  const animatedTotal = useAnimatedCounter(
    stats?.totalReviews ?? 0,
    isInView && !!stats,
    1200,
    0,
  );

  const handleWriteReview = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleRatingFilter = useCallback((rating: number | null) => {
    setRatingFilter(rating);
  }, []);

  // Loading state
  if (isLoading) {
    return <ReviewSummarySkeleton />;
  }

  // Error / empty state
  if (isError || !stats) {
    return null;
  }

  const distributionRows = buildDistributionRows(
    stats.ratingDistribution,
    stats.totalReviews,
  );

  // Compute recommendation percentage (high ratings / total)
  const positiveCount =
    (stats.ratingDistribution[4] ?? 0) + (stats.ratingDistribution[5] ?? 0);
  const recommendPercent =
    stats.totalReviews > 0
      ? Math.round((positiveCount / stats.totalReviews) * 100)
      : 0;

  return (
    <>
      <motion.section
        ref={sectionRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* ================================================================ */}
          {/* LEFT: Hero rating + badges + CTA                                */}
          {/* ================================================================ */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-start shrink-0 md:min-w-[220px]">
            {/* Big animated rating number */}
            <span className="text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums leading-none">
              {animatedRating}
            </span>

            {/* Star rating */}
            <div className="mt-2">
              <StarRating value={stats.averageRating} size="lg" readOnly />
            </div>

            {/* Total reviews */}
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Based on{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums">
                {animatedTotal}
              </span>{" "}
              review{stats.totalReviews !== 1 ? "s" : ""}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              {/* Verified Purchase badge */}
              {stats.verifiedPurchasePercent > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {stats.verifiedPurchasePercent}% verified purchases
                </span>
              )}

              {/* Recommendation badge */}
              {recommendPercent > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-[#1E4DB7] dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {recommendPercent}% would recommend
                </span>
              )}
            </div>

            {/* Write review CTA */}
            <Button
              onClick={handleWriteReview}
              className="mt-5 w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1E4DB7] hover:bg-[#163d96] active:bg-[#12337e] transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Share your experience
            </Button>
          </div>

          {/* ================================================================ */}
          {/* RIGHT: Rating distribution bars                                  */}
          {/* ================================================================ */}
          <div className="flex-1 w-full">
            <RatingDistribution
              distribution={distributionRows}
              totalReviews={stats.totalReviews}
              activeFilter={ratingFilter}
              onRatingFilter={handleRatingFilter}
            />
          </div>
        </div>
      </motion.section>

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
