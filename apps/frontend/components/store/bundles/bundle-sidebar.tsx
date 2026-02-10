"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, TrendingUp, Sparkles, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { getBundleDiscountPercent, BUNDLE_TIERS } from "@/types/custom-bundle";
import type { DigitalProduct } from "@/types/digital-product";
import type { BundleNextTier } from "@/types/custom-bundle";

// =============================================================================
// Types
// =============================================================================

interface BundleSidebarProps {
  products: DigitalProduct[];
  /** Pre-computed pricing — if omitted, computed internally */
  totalRetailPrice?: number;
  bundlePrice?: number;
  savings?: number;
  discountPercentage?: number;
  nextTier?: BundleNextTier | null;
  /** Callbacks */
  onRemoveProduct: (productId: string) => void;
  onReviewBundle?: () => void;
  onCheckout?: () => void;
  isCheckingOut?: boolean;
  /** Mobile sheet mode */
  isMobileSheet?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BundleSidebar({
  products,
  totalRetailPrice: externalRetailTotal,
  bundlePrice: externalBundlePrice,
  savings: externalSavings,
  discountPercentage: externalDiscount,
  nextTier: externalNextTier,
  onRemoveProduct,
  onReviewBundle,
  onCheckout,
  isCheckingOut = false,
  isMobileSheet = false,
  isOpen = false,
  onToggle,
  className,
}: BundleSidebarProps) {
  const t = useTranslations("bundle");
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();

  // ---------------------------------------------------------------------------
  // Pricing — use external values or compute internally
  // ---------------------------------------------------------------------------

  const retailTotal =
    externalRetailTotal ?? products.reduce((sum, p) => sum + p.price, 0);
  const discountPercent =
    externalDiscount ?? getBundleDiscountPercent(products.length);
  const bundlePrice =
    externalBundlePrice ?? retailTotal * (1 - discountPercent / 100);
  const savings = externalSavings ?? retailTotal - bundlePrice;
  const hasDiscount = discountPercent > 0;

  // Tier progress
  const nextTier =
    externalNextTier !== undefined
      ? externalNextTier
      : (() => {
          for (const tier of BUNDLE_TIERS) {
            if (products.length < tier.minProducts) {
              return {
                productsNeeded: tier.minProducts - products.length,
                discountPercent: tier.discountPercent,
              };
            }
          }
          return null;
        })();

  const maxProducts = BUNDLE_TIERS[BUNDLE_TIERS.length - 1].minProducts;
  const progressPercent = Math.min(
    100,
    (products.length / maxProducts) * 100,
  );

  const handleAction = onReviewBundle ?? onCheckout;
  const actionLabel = onReviewBundle ? t("reviewBundle") : t("checkout");

  // ---------------------------------------------------------------------------
  // Mobile sheet wrapper
  // ---------------------------------------------------------------------------

  if (isMobileSheet) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40">
        {/* Toggle bar */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              {products.length} {t("items")}
            </span>
            {hasDiscount && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px]">
                {discountPercent}% {t("off")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {formatPrice(convertPrice(bundlePrice), currency)}
            </span>
            <ChevronUp
              className={cn(
                "h-4 w-4 text-neutral-400 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </div>
        </button>

        {/* Expandable content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800"
            >
              <SidebarContent
                products={products}
                retailTotal={retailTotal}
                bundlePrice={bundlePrice}
                savings={savings}
                discountPercent={discountPercent}
                hasDiscount={hasDiscount}
                nextTier={nextTier}
                progressPercent={progressPercent}
                onRemoveProduct={onRemoveProduct}
                handleAction={handleAction}
                actionLabel={actionLabel}
                isCheckingOut={isCheckingOut}
                formatPrice={formatPrice}
                convertPrice={convertPrice}
                currency={currency}
                t={t}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Desktop sidebar
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white">
            {t("yourBundle")}
          </h3>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {products.length} {t("items")}
          </Badge>
        </div>

        {hasDiscount && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px]">
            <Sparkles className="h-3 w-3 me-1" />
            {discountPercent}% {t("off")}
          </Badge>
        )}
      </div>

      <SidebarContent
        products={products}
        retailTotal={retailTotal}
        bundlePrice={bundlePrice}
        savings={savings}
        discountPercent={discountPercent}
        hasDiscount={hasDiscount}
        nextTier={nextTier}
        progressPercent={progressPercent}
        onRemoveProduct={onRemoveProduct}
        handleAction={handleAction}
        actionLabel={actionLabel}
        isCheckingOut={isCheckingOut}
        formatPrice={formatPrice}
        convertPrice={convertPrice}
        currency={currency}
        t={t}
      />
    </div>
  );
}

// =============================================================================
// Sidebar inner content (shared between desktop & mobile)
// =============================================================================

interface SidebarContentProps {
  products: DigitalProduct[];
  retailTotal: number;
  bundlePrice: number;
  savings: number;
  discountPercent: number;
  hasDiscount: boolean;
  nextTier: BundleNextTier | null;
  progressPercent: number;
  onRemoveProduct: (productId: string) => void;
  handleAction?: () => void;
  actionLabel: string;
  isCheckingOut: boolean;
  formatPrice: (price: number, currency?: string) => string;
  convertPrice: (price: number) => number;
  currency: string;
  t: (key: string, values?: Record<string, unknown>) => string;
}

function SidebarContent({
  products,
  retailTotal,
  bundlePrice,
  savings,
  hasDiscount,
  nextTier,
  progressPercent,
  onRemoveProduct,
  handleAction,
  actionLabel,
  isCheckingOut,
  formatPrice,
  convertPrice,
  currency,
  t,
}: SidebarContentProps) {
  return (
    <>
      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[320px]">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage}
                    alt={product.title}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                  {product.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatPrice(convertPrice(product.price), currency)}
                </p>
              </div>
              <button
                onClick={() => onRemoveProduct(product.id)}
                aria-label={t("removeFromBundle")}
                className="p-1 shrink-0 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {products.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">{t("emptyBundle")}</p>
          </div>
        )}
      </div>

      {/* Tier Progress + Pricing + Action */}
      {products.length > 0 && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
          {/* Tier Progress Bar */}
          {nextTier && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {t("tierProgress", {
                    count: nextTier.productsNeeded,
                    percent: nextTier.discountPercent,
                  })}
                </p>
              </div>
              <div className="h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">
                {t("retailTotal")}
              </span>
              <span
                className={cn(
                  hasDiscount &&
                    "line-through text-neutral-400 dark:text-neutral-500",
                  !hasDiscount && "text-neutral-700 dark:text-neutral-300",
                )}
              >
                {formatPrice(convertPrice(retailTotal), currency)}
              </span>
            </div>

            {hasDiscount && (
              <div className="flex justify-between text-xs">
                <span className="text-green-600 dark:text-green-400">
                  {t("savings")}
                </span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px] px-1.5 py-0">
                  -{formatPrice(convertPrice(savings), currency)}
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                {t("bundlePrice")}
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {formatPrice(convertPrice(bundlePrice), currency)}
              </span>
            </div>
          </div>

          {/* Minimum warning */}
          {products.length < 2 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
              {t("minItems")}
            </p>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            disabled={products.length < 2 || isCheckingOut}
            onClick={handleAction}
          >
            {isCheckingOut ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("processing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {actionLabel}
              </span>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

export default BundleSidebar;
