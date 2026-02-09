"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const SIZE_MAP = {
  sm: { star: "h-4 w-4", text: "text-sm", gap: "gap-0.5" },
  md: { star: "h-5 w-5", text: "text-base", gap: "gap-1" },
  lg: { star: "h-7 w-7", text: "text-lg", gap: "gap-1.5" },
} as const;

const starVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.9 },
  filled: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// =============================================================================
// Component
// =============================================================================

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = !readOnly && !!onChange;
  const displayValue = hoverValue ?? value;
  const sizeConfig = SIZE_MAP[size];

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (isInteractive) setHoverValue(star);
    },
    [isInteractive],
  );

  const handleMouseLeave = useCallback(() => {
    if (isInteractive) setHoverValue(null);
  }, [isInteractive]);

  const handleClick = useCallback(
    (star: number) => {
      if (isInteractive && onChange) {
        onChange(star);
      }
    },
    [isInteractive, onChange],
  );

  /**
   * Render a single star. Supports filled, half-filled, and empty states.
   * Half-star rendering is only used in read-only display mode.
   */
  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const fillPercent = Math.min(1, Math.max(0, displayValue - index));
    const isFull = fillPercent >= 0.75;
    const isHalf = !isFull && fillPercent >= 0.25;
    const isEmpty = !isFull && !isHalf;

    const starElement = (
      <span className="relative inline-block">
        {/* Empty star (background) */}
        <Star
          className={`${sizeConfig.star} text-zinc-300 dark:text-zinc-600`}
          fill="currentColor"
          strokeWidth={0}
        />
        {/* Filled star (overlay) */}
        {!isEmpty && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: isHalf ? "50%" : "100%" }}
          >
            <Star
              className={`${sizeConfig.star} text-amber-400`}
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        )}
      </span>
    );

    if (isInteractive) {
      return (
        <motion.button
          key={index}
          type="button"
          variants={starVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          animate={starNumber <= value ? "filled" : "initial"}
          onMouseEnter={() => handleMouseEnter(starNumber)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(starNumber)}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 rounded-sm"
          aria-label={`Rate ${starNumber} out of 5 stars`}
        >
          {starElement}
        </motion.button>
      );
    }

    return (
      <span key={index} className="inline-block">
        {starElement}
      </span>
    );
  };

  return (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} ${className}`}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => renderStar(i))}
      {showValue && (
        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue.toFixed(1)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={`ml-1.5 font-semibold text-neutral-700 dark:text-neutral-300 ${sizeConfig.text}`}
          >
            {displayValue.toFixed(1)}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

export default StarRating;
