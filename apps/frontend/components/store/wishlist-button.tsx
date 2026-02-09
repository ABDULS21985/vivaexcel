"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import type { WishlistItem } from "@/hooks/use-wishlist";

// =============================================================================
// Types
// =============================================================================

interface WishlistButtonProps {
  item: Omit<WishlistItem, "addedAt">;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// =============================================================================
// Size Map
// =============================================================================

const sizeConfig = {
  sm: {
    button: "w-7 h-7",
    icon: "h-3.5 w-3.5",
    feedback: "text-[10px] -top-5",
  },
  md: {
    button: "w-9 h-9",
    icon: "h-4 w-4",
    feedback: "text-xs -top-6",
  },
  lg: {
    button: "w-11 h-11",
    icon: "h-5 w-5",
    feedback: "text-sm -top-7",
  },
} as const;

// =============================================================================
// Animation Variants
// =============================================================================

const feedbackVariants = {
  initial: { opacity: 0, y: 4, scale: 0.8 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [4, -4, -8, -16],
    scale: [0.8, 1.1, 1, 0.9],
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

// =============================================================================
// Component
// =============================================================================

/**
 * Animated heart button for toggling wishlist state.
 * Shows visual feedback (floating text) on toggle.
 */
export function WishlistButton({
  item,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [feedbackKey, setFeedbackKey] = useState<number | null>(null);
  const [feedbackAdded, setFeedbackAdded] = useState(true);

  const wishlisted = isInWishlist(item.id);
  const config = sizeConfig[size];

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const wasWishlisted = isInWishlist(item.id);
      setFeedbackAdded(!wasWishlisted);
      setFeedbackKey(Date.now());
      toggleWishlist(item);
    },
    [item, isInWishlist, toggleWishlist],
  );

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Floating feedback text */}
      <AnimatePresence>
        {feedbackKey !== null && (
          <motion.span
            key={feedbackKey}
            variants={feedbackVariants}
            initial="initial"
            animate="animate"
            className={`absolute left-1/2 -translate-x-1/2 ${config.feedback} font-semibold pointer-events-none whitespace-nowrap z-30 ${
              feedbackAdded
                ? "text-red-500"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
            onAnimationComplete={() => setFeedbackKey(null)}
          >
            {feedbackAdded ? "Added" : "Removed"}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Heart button */}
      <motion.button
        onClick={handleToggle}
        whileTap={{ scale: 0.8 }}
        className={`
          ${config.button}
          relative flex items-center justify-center rounded-full
          border backdrop-blur-sm transition-all duration-200 z-10
          ${
            wishlisted
              ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 shadow-sm shadow-red-100 dark:shadow-red-950/30"
              : "bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          }
        `}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <motion.div
          animate={
            wishlisted
              ? { scale: [1, 1.3, 1], transition: { duration: 0.3 } }
              : { scale: 1 }
          }
        >
          <Heart
            className={`
              ${config.icon} transition-colors duration-200
              ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "fill-transparent text-neutral-400 dark:text-neutral-500"
              }
            `}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default WishlistButton;
