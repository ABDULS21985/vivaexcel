"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import { useFormat } from "@/hooks/use-format";

// =============================================================================
// Cart Icon with Hover Preview & Toast Notifications
// =============================================================================
// Premium navbar cart button with:
// - Animated badge counter with gradient background
// - Shake/wiggle animation when items are added
// - Hover mini-cart preview dropdown (desktop only)
// - Sonner toast notifications on item addition

// -----------------------------------------------------------------------------
// Mini Cart Preview Item
// -----------------------------------------------------------------------------

interface PreviewItemProps {
  item: {
    id: string;
    product: {
      title: string;
      slug: string;
      featuredImage?: string | null;
      currency: string;
    };
    unitPrice: number;
  };
}

function PreviewItem({ item }: PreviewItemProps) {
  const { formatPrice } = useFormat();
  return (
    <Link
      href={`/store/${item.product.slug}`}
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
        {item.product.featuredImage ? (
          <Image
            src={item.product.featuredImage}
            alt={item.product.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
          {item.product.title}
        </p>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {formatPrice(item.unitPrice, item.product.currency)}
        </p>
      </div>
    </Link>
  );
}

// -----------------------------------------------------------------------------
// Hover Preview Dropdown
// -----------------------------------------------------------------------------

interface HoverPreviewProps {
  items: PreviewItemProps["item"][];
  subtotal: number;
  currency: string;
  itemCount: number;
  onOpenCart: () => void;
}

function HoverPreview({
  items,
  subtotal,
  currency,
  itemCount,
  onOpenCart,
}: HoverPreviewProps) {
  const t = useTranslations("cart");
  const { formatPrice } = useFormat();
  const previewItems = items.slice(0, 3);
  const remainingCount = itemCount - previewItems.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
      className="absolute top-full right-0 mt-2 w-80 z-50 hidden lg:block"
    >
      {/* Arrow pointer */}
      <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white dark:bg-neutral-900 border-l border-t border-neutral-200 dark:border-neutral-700 rotate-45" />

      <div className="relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden" aria-label="Cart preview">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {t("preview")}
          </h3>
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {t("item", { count: itemCount })}
          </span>
        </div>

        {/* Items */}
        <div className="px-3 pb-2">
          {previewItems.map((item) => (
            <PreviewItem key={item.id} item={item} />
          ))}
          {remainingCount > 0 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-1.5">
              {t("moreItems", { count: remainingCount })}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-neutral-100 dark:border-neutral-800" />

        {/* Footer */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("subtotal")}
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {formatPrice(subtotal, currency)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCart();
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-9 px-4",
              "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]",
              "hover:from-[#143A8F] hover:to-[#1E4DB7]",
              "text-white text-sm font-semibold rounded-lg",
              "shadow-md shadow-[#1E4DB7]/20 hover:shadow-lg hover:shadow-[#1E4DB7]/30",
              "transition-all duration-200",
            )}
          >
            View Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Cart Icon Component
// -----------------------------------------------------------------------------

export function CartIcon() {
  const { items, summary, toggleCart } = useCart();
  const badgeControls = useAnimation();
  const iconControls = useAnimation();
  const prevCountRef = useRef(summary.itemCount);
  const prevItemsLengthRef = useRef(items.length);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Badge bounce + icon wiggle when item count changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (summary.itemCount !== prevCountRef.current && summary.itemCount > 0) {
      // Badge pulse
      badgeControls.start({
        scale: [1, 1.3, 1],
        transition: { type: "spring", stiffness: 500, damping: 15, duration: 0.4 },
      });

      // Icon shake/wiggle
      iconControls.start({
        rotate: [0, -8, 8, -4, 4, 0],
        transition: { type: "spring", stiffness: 600, damping: 12, duration: 0.5 },
      });
    }
    prevCountRef.current = summary.itemCount;
  }, [summary.itemCount, badgeControls, iconControls]);

  // ---------------------------------------------------------------------------
  // Toast notification when a new item is added
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (items.length > prevItemsLengthRef.current && items.length > 0) {
      const newestItem = items[items.length - 1];
      if (newestItem) {
        toast.success("Added to cart!", {
          description: newestItem.product.title,
        });
      }
    }
    prevItemsLengthRef.current = items.length;
  }, [items]);

  // ---------------------------------------------------------------------------
  // Hover handlers with delayed close
  // ---------------------------------------------------------------------------
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        onClick={toggleCart}
        animate={iconControls}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-lg",
          "text-neutral-500 dark:text-neutral-400",
          "hover:text-neutral-900 dark:hover:text-white",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "transition-colors",
        )}
        aria-label={`Shopping cart${summary.itemCount > 0 ? `, ${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"}` : ""}`}
      >
        <ShoppingBag className="w-[18px] h-[18px]" />

        <AnimatePresence>
          {summary.itemCount > 0 && (
            <motion.span
              key="cart-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={cn(
                "absolute -top-0.5 -right-0.5",
                "flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1",
                "bg-gradient-to-r from-red-500 to-rose-500",
                "text-white text-[10px] font-bold rounded-full leading-none",
                "shadow-sm shadow-red-500/30",
              )}
            >
              <motion.span animate={badgeControls}>
                {summary.itemCount > 99 ? "99+" : summary.itemCount}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Hover preview dropdown -- desktop only */}
      <AnimatePresence>
        {isHovered && items.length > 0 && (
          <HoverPreview
            items={items}
            subtotal={summary.subtotal}
            currency={summary.currency}
            itemCount={summary.itemCount}
            onOpenCart={toggleCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CartIcon;
