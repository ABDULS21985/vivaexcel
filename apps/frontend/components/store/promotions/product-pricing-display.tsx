"use client";

import { motion } from "framer-motion";
import { Tag, Zap, Crown } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface PricingInfo {
  originalPrice: number;
  salePrice?: number;
  discountPercent?: number;
  currency?: string;
  promotionType?: "flash-sale" | "bundle" | "loyalty" | "coupon";
  promotionLabel?: string;
}

interface ProductPricingDisplayProps {
  pricing: PricingInfo;
  size?: "sm" | "md" | "lg";
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
// Size Configs
// =============================================================================

const sizeConfig = {
  sm: {
    original: "text-xs",
    sale: "text-sm font-bold",
    badge: "text-[9px] px-1.5 py-0.5",
    gap: "gap-1.5",
  },
  md: {
    original: "text-sm",
    sale: "text-lg font-bold",
    badge: "text-[10px] px-2 py-0.5",
    gap: "gap-2",
  },
  lg: {
    original: "text-base",
    sale: "text-2xl font-bold",
    badge: "text-xs px-2.5 py-1",
    gap: "gap-2.5",
  },
};

const promoIcons = {
  "flash-sale": Zap,
  bundle: Tag,
  loyalty: Crown,
  coupon: Tag,
};

// =============================================================================
// Component
// =============================================================================

export function ProductPricingDisplay({
  pricing,
  size = "md",
  className = "",
}: ProductPricingDisplayProps) {
  const config = sizeConfig[size];
  const hasSale =
    pricing.salePrice !== undefined && pricing.salePrice < pricing.originalPrice;
  const discountPercent =
    pricing.discountPercent ??
    (hasSale
      ? Math.round(
          ((pricing.originalPrice - pricing.salePrice!) / pricing.originalPrice) *
            100,
        )
      : 0);
  const PromoIcon = pricing.promotionType
    ? promoIcons[pricing.promotionType]
    : null;

  return (
    <div className={`flex items-center flex-wrap ${config.gap} ${className}`}>
      {/* Sale price */}
      {hasSale ? (
        <>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${config.sale} text-red-600 dark:text-red-400`}
          >
            {formatPrice(pricing.salePrice!, pricing.currency)}
          </motion.span>
          <span
            className={`${config.original} text-neutral-400 dark:text-neutral-500 line-through`}
          >
            {formatPrice(pricing.originalPrice, pricing.currency)}
          </span>
          {discountPercent > 0 && (
            <span
              className={`${config.badge} inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-full`}
            >
              {PromoIcon && <PromoIcon className="h-3 w-3" />}
              -{discountPercent}%
            </span>
          )}
        </>
      ) : (
        <span
          className={`${config.sale} text-neutral-900 dark:text-white`}
        >
          {formatPrice(pricing.originalPrice, pricing.currency)}
        </span>
      )}

      {/* Promotion label */}
      {pricing.promotionLabel && (
        <span
          className={`${config.badge} inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold rounded-full`}
        >
          {pricing.promotionLabel}
        </span>
      )}
    </div>
  );
}

export default ProductPricingDisplay;
