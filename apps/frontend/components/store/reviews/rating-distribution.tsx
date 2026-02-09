"use client";

import { useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface RatingRow {
  rating: number;
  count: number;
  percentage: number;
}

interface RatingDistributionProps {
  distribution: RatingRow[];
  totalReviews: number;
  activeFilter: number | null;
  onRatingFilter: (rating: number | null) => void;
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function RatingDistribution({
  distribution,
  totalReviews,
  activeFilter,
  onRatingFilter,
}: RatingDistributionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });

  const handleRowClick = useCallback(
    (rating: number) => {
      if (activeFilter === rating) {
        onRatingFilter(null);
      } else {
        onRatingFilter(rating);
      }
    },
    [onRatingFilter, activeFilter],
  );

  // Sort descending 5 -> 1
  const sorted = [...distribution].sort((a, b) => b.rating - a.rating);

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-1.5"
    >
      {sorted.map((row, i) => {
        const isActive = activeFilter === row.rating;
        const isDimmed = activeFilter !== null && !isActive;

        return (
          <motion.div key={row.rating} variants={rowVariants}>
            <button
              type="button"
              onClick={() => handleRowClick(row.rating)}
              className={`
                group flex items-center w-full gap-3 py-1.5 px-2 rounded-lg text-sm
                transition-all duration-200 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1
                dark:focus-visible:ring-offset-neutral-900
                ${
                  isActive
                    ? "bg-amber-50 dark:bg-amber-900/25 shadow-[0_0_12px_rgba(245,158,11,0.25)] dark:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }
                ${isDimmed ? "opacity-50" : "opacity-100"}
              `}
              aria-label={`${row.rating} star reviews: ${row.count} reviews, ${row.percentage}%. ${isActive ? "Currently filtered. Click to clear." : "Click to filter."}`}
              aria-pressed={isActive}
            >
              {/* Star label */}
              <span className="flex items-center gap-1 w-10 shrink-0 font-medium text-neutral-700 dark:text-neutral-300">
                {row.rating}
                <Star
                  className="h-3.5 w-3.5 text-amber-400"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>

              {/* Progress bar */}
              <div className="relative flex-1 h-3 bg-neutral-200/70 dark:bg-neutral-700/60 rounded-full overflow-hidden">
                <motion.div
                  className={`
                    absolute inset-y-0 left-0 rounded-full
                    bg-gradient-to-r from-amber-400 to-amber-500
                    dark:from-amber-500 dark:to-amber-400
                    ${isActive ? "shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""}
                  `}
                  initial={{ width: 0 }}
                  animate={
                    isInView
                      ? { width: `${row.percentage}%` }
                      : { width: 0 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 14,
                    delay: i * 0.1,
                  }}
                />
              </div>

              {/* Count */}
              <span className="w-12 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 tabular-nums shrink-0">
                {row.count.toLocaleString()}
              </span>

              {/* Percentage */}
              <span className="w-11 text-right text-xs text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0">
                {row.percentage}%
              </span>
            </button>
          </motion.div>
        );
      })}

      {/* Active filter hint */}
      {activeFilter !== null && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-amber-600 dark:text-amber-400 text-center pt-1"
        >
          Showing {activeFilter}-star reviews. Click again to clear.
        </motion.p>
      )}
    </motion.div>
  );
}

export default RatingDistribution;
