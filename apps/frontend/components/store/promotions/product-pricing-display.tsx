"use client";

import { motion } from "framer-motion";
import { FlashSaleCountdown } from "./flash-sale-countdown";

// =============================================================================
// Types
// =============================================================================

interface ProductPricingDisplayProps {
  currentPrice: number;
  originalPrice?: number;
  discountBadge?: string;
  saleEndsAt?: string;
  currency?: string;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ProductPricingDisplay({
  currentPrice,
  originalPrice,
  discountBadge,
  saleEndsAt,
  currency = "USD",
  className = "",
}: ProductPricingDisplayProps) {
  const hasDiscount = originalPrice !== undefined && originalPrice > currentPrice;
  const computedDiscountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const badgeText =
    discountBadge || (hasDiscount ? `${computedDiscountPercent}% OFF` : null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-3 ${className}`}
    >
      {/* Price Row */}
      <div className="flex items-baseline gap-3 flex-wrap">
        {/* Current Price */}
        <motion.span
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white"
        >
          {formatPrice(currentPrice, currency)}
        </motion.span>

        {/* Original Price (Strikethrough) */}
        {hasDiscount && (
          <motion.span
            variants={itemVariants}
            className="text-lg text-neutral-400 dark:text-neutral-500 line-through"
          >
            {formatPrice(originalPrice, currency)}
          </motion.span>
        )}

        {/* Discount Badge */}
        {badgeText && (
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg"
          >
            {badgeText}
          </motion.span>
        )}
      </div>

      {/* Savings Detail */}
      {hasDiscount && (
        <motion.p
          variants={itemVariants}
          className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
        >
          You save {formatPrice(originalPrice - currentPrice, currency)}
        </motion.p>
      )}

      {/* Sale Countdown */}
      {saleEndsAt && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Sale ends in
            </span>
          </div>
          <FlashSaleCountdown endsAt={saleEndsAt} size="sm" />
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductPricingDisplay;
