"use client";

// =============================================================================
// Mobile Sticky Bar
// =============================================================================
// A fixed bottom bar visible on mobile product detail pages that shows the
// current price and a prominent "Add to Cart" CTA. Appears after the user
// scrolls past the main Add to Cart button in the product info section.
// Features: glass morphism, gradient CTA, loading/success states,
// RTL support, safe-area insets, and framer-motion entrance animation.

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { isRtlLocale, type Locale } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface MobileStickyBarProps {
  /** Product ID for the add-to-cart action */
  productId: string;
  /** Optional variant ID if a specific variant is selected */
  variantId?: string;
  /** Current selling price */
  price: number;
  /** Original price before discount (shown with strikethrough) */
  originalPrice?: number;
  /** Currency code (e.g. "USD") */
  currency: string;
  /** Pre-computed discount percentage to display */
  discountPercentage?: number;
  /** Whether the product is currently in stock */
  inStock?: boolean;
  /** Product title for accessibility */
  productTitle: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Spring animation for the bar entrance */
const BAR_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
};

/** Duration (ms) to show the success state after adding to cart */
const SUCCESS_DURATION = 1800;

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
// Hook: Intersection Observer for visibility trigger
// =============================================================================

/**
 * Returns `true` once the user has scrolled past the sentinel element
 * (i.e. the main Add to Cart button area). The sticky bar should only
 * appear when the sentinel is NOT intersecting the viewport.
 */
function useShowOnScroll(): {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Try to find the main "Add to Cart" button in the product info section.
    // We look for a sentinel element with the data attribute first, then
    // fall back to looking for the product-info container's CTA.
    const sentinel =
      document.querySelector<HTMLElement>("[data-sticky-bar-sentinel]") ??
      document.querySelector<HTMLElement>("[data-product-cta]");

    if (!sentinel) {
      // If no sentinel is found, always show after a short scroll
      const handleScroll = () => {
        setIsVisible(window.scrollY > 300);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the bar when the sentinel is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { sentinelRef, isVisible };
}

// =============================================================================
// Component
// =============================================================================

export function MobileStickyBar({
  productId,
  variantId,
  price,
  originalPrice,
  currency,
  discountPercentage,
  inStock = true,
  productTitle,
}: MobileStickyBarProps) {
  const locale = useLocale() as Locale;
  const isRtl = isRtlLocale(locale);
  const { addToCart, openCart } = useCart();

  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isVisible } = useShowOnScroll();

  // Clean up the success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Add to Cart handler
  // ---------------------------------------------------------------------------

  const handleAddToCart = useCallback(async () => {
    if (isAdding || showSuccess || !inStock) return;

    setIsAdding(true);
    try {
      await addToCart(productId, variantId);
      setShowSuccess(true);
      openCart();

      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, SUCCESS_DURATION);
    } catch {
      // Error handling is managed by the cart provider
    } finally {
      setIsAdding(false);
    }
  }, [addToCart, productId, variantId, inStock, isAdding, showSuccess, openCart]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const hasDiscount =
    discountPercentage !== undefined &&
    discountPercentage > 0 &&
    originalPrice !== undefined &&
    originalPrice > price;

  const formattedPrice = formatPrice(price, currency);
  const formattedOriginalPrice = originalPrice
    ? formatPrice(originalPrice, currency)
    : null;

  const isDisabled = isAdding || !inStock;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={BAR_SPRING}
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            // Positioning
            "fixed bottom-0 left-0 right-0 z-40",
            // Only on mobile
            "flex lg:hidden",
            // Glass morphism
            "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
            // Top shadow
            "shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
            // Safe area inset for notched devices
            "pb-[env(safe-area-inset-bottom,0px)]",
          )}
          role="region"
          aria-label={`Quick add ${productTitle} to cart`}
        >
          <div className="flex w-full items-center justify-between gap-4 px-4 h-[72px]">
            {/* ============================================================= */}
            {/* Price Section                                                  */}
            {/* ============================================================= */}
            <div className="flex flex-col justify-center min-w-0 shrink-0">
              <div className="flex items-baseline gap-2">
                {/* Current price */}
                <span className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums truncate">
                  {formattedPrice}
                </span>

                {/* Original price (strikethrough) */}
                {hasDiscount && formattedOriginalPrice && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through tabular-nums">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>

              {/* Discount badge */}
              {hasDiscount && discountPercentage && (
                <span className="mt-0.5 inline-flex items-center self-start px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#F59A23]/15 text-[#E86A1D] dark:bg-[#F59A23]/20 dark:text-[#F59A23]">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* ============================================================= */}
            {/* Add to Cart Button                                             */}
            {/* ============================================================= */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isDisabled}
              whileTap={{ scale: isDisabled ? 1 : 0.97 }}
              className={cn(
                "relative flex items-center justify-center gap-2",
                "h-12 min-w-[160px] px-6",
                "rounded-xl font-semibold text-white text-sm",
                "transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                // Success state: green flash
                showSuccess
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
                  : "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30",
              )}
              aria-label={
                !inStock
                  ? "Out of stock"
                  : showSuccess
                    ? "Added to cart"
                    : isAdding
                      ? "Adding to cart"
                      : `Add ${productTitle} to cart`
              }
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </motion.span>
                ) : showSuccess ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                    <span>Added!</span>
                  </motion.span>
                ) : !inStock ? (
                  <motion.span
                    key="oos"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Out of Stock</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileStickyBar;
