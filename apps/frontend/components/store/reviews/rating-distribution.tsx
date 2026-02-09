"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface RatingDistributionProps {
  distribution: Record<number, number>;
  totalReviews: number;
  onRatingFilter?: (rating: number | null) => void;
  activeFilter?: number | null;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const barVariants = {
  hidden: { scaleX: 0 },
  visible: (percent: number) => ({
    scaleX: percent / 100,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
      delay: 0.05,
    },
  }),
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.3,
    },
  }),
};

// =============================================================================
// Component
// =============================================================================

export function RatingDistribution({
  distribution,
  totalReviews,
  onRatingFilter,
  activeFilter,
  className = "",
}: RatingDistributionProps) {
  const handleRowClick = useCallback(
    (rating: number) => {
      if (!onRatingFilter) return;
      if (activeFilter === rating) {
        onRatingFilter(null);
      } else {
        onRatingFilter(rating);
      }
    },
    [onRatingFilter, activeFilter],
  );

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className={`space-y-2 ${className}`}>
      {ratings.map((rating, i) => {
        const count = distribution[rating] ?? 0;
        const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        const isActive = activeFilter === rating;
        const isClickable = !!onRatingFilter;

        return (
          <motion.div
            key={rating}
            custom={i}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              type="button"
              onClick={() => handleRowClick(rating)}
              disabled={!isClickable}
              className={`
                flex items-center w-full gap-2 py-1 px-1.5 rounded-md text-sm transition-colors
                ${isClickable ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" : "cursor-default"}
                ${isActive ? "bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-300 dark:ring-amber-700" : ""}
              `}
              aria-label={`${rating} star reviews: ${count} reviews, ${percent.toFixed(0)}%`}
            >
              {/* Star Label */}
              <span className="flex items-center gap-0.5 w-10 shrink-0 text-neutral-600 dark:text-neutral-400 font-medium">
                {rating}
                <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>

              {/* Bar */}
              <div className="flex-1 h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  custom={percent}
                  variants={barVariants}
                  initial="hidden"
                  animate="visible"
                  className={`h-full rounded-full origin-left ${
                    isActive
                      ? "bg-amber-500"
                      : "bg-amber-400 dark:bg-amber-500"
                  }`}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Count */}
              <span className="w-10 text-right text-xs text-neutral-500 dark:text-neutral-400 tabular-nums shrink-0">
                {count}
              </span>

              {/* Percentage */}
              <span className="w-10 text-right text-xs text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0">
                {percent.toFixed(0)}%
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

export default RatingDistribution;
