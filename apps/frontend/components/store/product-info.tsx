"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import {
  Star,
  Download,
  Eye,
  ShoppingCart,
  Zap,
  Check,
  FileText,
  Monitor,
  Layers,
  Package,
  Tag,
  Heart,
  Lock,
  Shield,
  ExternalLink,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import type {
  DigitalProduct,
  DigitalProductVariant,
  DigitalProductPreviewType,
} from "@/types/digital-product";
import {
  DIGITAL_PRODUCT_TYPE_LABELS,
  DIGITAL_PRODUCT_TYPE_COLORS,
  DigitalProductType,
} from "@/types/digital-product";
import { SrOnly } from "@/components/ui/accessibility";

// =============================================================================
// Types
// =============================================================================

interface ProductInfoProps {
  product: DigitalProduct;
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

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function getDiscountPercentage(
  price: number,
  compareAtPrice: number,
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function renderStars(rating: number): React.ReactNode[] {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 text-neutral-300 dark:text-neutral-600"
        />,
      );
    }
  }

  return stars;
}

// =============================================================================
// Metadata Display
// =============================================================================

interface MetadataItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function getMetadataItems(product: DigitalProduct): MetadataItem[] {
  const items: MetadataItem[] = [];
  const meta = product.metadata || {};

  if (meta.slideCount) {
    items.push({
      icon: <Layers className="h-4 w-4" />,
      label: "Slides",
      value: String(meta.slideCount),
    });
  }

  if (meta.pageCount) {
    items.push({
      icon: <FileText className="h-4 w-4" />,
      label: "Pages",
      value: String(meta.pageCount),
    });
  }

  if (meta.format) {
    items.push({
      icon: <Package className="h-4 w-4" />,
      label: "Format",
      value: String(meta.format),
    });
  }

  if (meta.compatibility) {
    const compat = Array.isArray(meta.compatibility)
      ? (meta.compatibility as string[]).join(", ")
      : String(meta.compatibility);
    items.push({
      icon: <Monitor className="h-4 w-4" />,
      label: "Compatible With",
      value: compat,
    });
  }

  if (meta.fileSize) {
    items.push({
      icon: <Download className="h-4 w-4" />,
      label: "File Size",
      value: String(meta.fileSize),
    });
  }

  return items;
}

// =============================================================================
// Animated Price Hook
// =============================================================================

function useAnimatedPrice(targetPrice: number, duration: number = 600) {
  const [displayPrice, setDisplayPrice] = useState(0);
  const prevTargetRef = useRef(targetPrice);

  useEffect(() => {
    if (targetPrice === 0) {
      setDisplayPrice(0);
      prevTargetRef.current = 0;
      return;
    }

    const startPrice = prevTargetRef.current !== targetPrice ? 0 : displayPrice;
    prevTargetRef.current = targetPrice;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startPrice + (targetPrice - startPrice) * eased;
      setDisplayPrice(currentValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayPrice(targetPrice);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPrice, duration]);

  return displayPrice;
}

// =============================================================================
// Animated Star Rating Component
// =============================================================================

function AnimatedStarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i < fullStars;
        const isHalf = i === fullStars && hasHalfStar;

        return (
          <motion.span
            key={i}
            initial={{ scale: 0, color: "#d1d5db" }}
            animate={{
              scale: 1,
              color: isFull || isHalf ? "#fbbf24" : "#d1d5db",
            }}
            transition={{
              delay: i * 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className="inline-flex"
          >
            {isHalf ? (
              <span className="relative inline-flex">
                <Star className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                <motion.span
                  className="absolute inset-0 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: "50%" }}
                  transition={{ delay: i * 0.1 + 0.15, duration: 0.3 }}
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </motion.span>
              </span>
            ) : (
              <Star
                className={`h-4 w-4 ${
                  isFull
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300 dark:text-neutral-600"
                }`}
              />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}

// =============================================================================
// Trust Signal Component
// =============================================================================

function TrustSignal({
  icon,
  text,
  index,
}: {
  icon: React.ReactNode;
  text: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        delay: index * 0.12,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400"
    >
      <span className="flex-shrink-0 text-emerald-500">{icon}</span>
      <span>{text}</span>
    </motion.div>
  );
}

// =============================================================================
// Types for preview-aware logic
// =============================================================================

const PREVIEWABLE_TYPES = new Set<string>([
  DigitalProductType.WEB_TEMPLATE,
  DigitalProductType.DESIGN_SYSTEM,
  DigitalProductType.CODE_TEMPLATE,
]);

function getLiveDemoUrl(product: DigitalProduct): string | null {
  if (!PREVIEWABLE_TYPES.has(product.type)) return null;
  const demoPreview = product.previews?.find(
    (p) => p.type === ("live_demo_url" as DigitalProductPreviewType),
  );
  return demoPreview?.url ?? null;
}

// =============================================================================
// Component
// =============================================================================

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] =
    useState<DigitalProductVariant | null>(
      product.variants?.length ? product.variants[0] : null,
    );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant?.id);
      setShowAddedFeedback(true);
      openCart();
      setTimeout(() => setShowAddedFeedback(false), 2000);
    } catch {
      // Error is handled silently; the cart provider logs it
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, product.id, selectedVariant?.id, openCart]);

  const handleBuyNow = useCallback(async () => {
    setIsBuyingNow(true);
    try {
      await addToCart(product.id, selectedVariant?.id);
      router.push("/checkout");
    } catch {
      // Error is handled silently
    } finally {
      setIsBuyingNow(false);
    }
  }, [addToCart, product.id, selectedVariant?.id, router]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const typeLabel = DIGITAL_PRODUCT_TYPE_LABELS[product.type] || "Product";
  const typeColor = DIGITAL_PRODUCT_TYPE_COLORS[product.type] || "#1E4DB7";

  const activePrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const discount = product.compareAtPrice
    ? getDiscountPercentage(activePrice, product.compareAtPrice)
    : 0;

  const metadataItems = getMetadataItems(product);
  const animatedPrice = useAnimatedPrice(activePrice);
  const liveDemoUrl = getLiveDemoUrl(product);

  // Determine which variant gets the "Most Popular" badge
  const sortedVariants = product.variants
    ? [...product.variants].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    : [];
  const recommendedVariantId = (() => {
    if (sortedVariants.length < 2) return null;
    // Use variant with isRecommended if present in metadata, otherwise second variant for 3+
    const recommended = sortedVariants.find(
      (v) => (v as unknown as Record<string, unknown>).isRecommended === true,
    );
    if (recommended) return recommended.id;
    if (sortedVariants.length >= 3) return sortedVariants[1].id;
    return null;
  })();

  // Collect all unique features across variants for comparison matrix
  const allFeatures = (() => {
    const featureSet = new Set<string>();
    sortedVariants.forEach((v) => {
      v.features?.forEach((f) => featureSet.add(f));
    });
    return Array.from(featureSet);
  })();

  // Installment price
  const installmentPrice =
    activePrice > 20 ? (activePrice / 4).toFixed(2) : null;

  return (
    <div className="lg:sticky lg:top-24">
      <div className="space-y-6">
        {/* ================================================================= */}
        {/* Type Badge + Featured / Bestseller                                */}
        {/* ================================================================= */}
        <div className="flex items-center gap-3 flex-wrap">
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg"
            style={{ backgroundColor: typeColor }}
          >
            <Tag className="h-3 w-3" />
            {typeLabel}
          </motion.span>

          {product.isFeatured && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              <Sparkles className="h-3 w-3" />
              Featured
            </motion.span>
          )}

          {product.isBestseller && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              Bestseller
            </motion.span>
          )}
        </div>

        {/* ================================================================= */}
        {/* Title                                                             */}
        {/* ================================================================= */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight"
        >
          {product.title}
        </motion.h1>

        {/* ================================================================= */}
        {/* Animated Star Rating, Downloads, Views                            */}
        {/* ================================================================= */}
        <div className="flex items-center gap-4 flex-wrap">
          {product.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <AnimatedStarRating rating={product.averageRating} />
              <SrOnly>{product.averageRating.toFixed(1)} out of 5 stars</SrOnly>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300" aria-hidden="true">
                {product.averageRating.toFixed(1)}
              </span>
              {product.totalReviews > 0 && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  ({product.totalReviews}{" "}
                  {product.totalReviews === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          )}

          {product.downloadCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Download className="h-4 w-4" />
              <span>{formatCount(product.downloadCount)} downloads</span>
            </div>
          )}

          {product.viewCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Eye className="h-4 w-4" />
              <span>{formatCount(product.viewCount)} views</span>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Creator                                                           */}
        {/* ================================================================= */}
        {product.creator && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              By
            </span>
            <div className="flex items-center gap-2">
              {product.creator.avatar ? (
                <img
                  src={product.creator.avatar}
                  alt={product.creator.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-[10px] font-bold">
                  {product.creator.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {product.creator.name}
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-700" />

        {/* ================================================================= */}
        {/* Animated Price Display                                            */}
        {/* ================================================================= */}
        <div className="space-y-2">
          <div
            className="flex items-baseline gap-3 flex-wrap"
            aria-label={`Price: ${formatPrice(activePrice, product.currency)}${product.compareAtPrice && product.compareAtPrice > activePrice ? `, was ${formatPrice(product.compareAtPrice, product.currency)}, save ${discount}%` : ''}`}
          >
            {activePrice === 0 ? (
              /* Free badge with animated gradient */
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="animate-gradient-shift text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "var(--gradient-premium, linear-gradient(135deg, #1E4DB7 0%, #6366F1 50%, #8B5CF6 100%))",
                  backgroundSize: "200% 200%",
                }}
              >
                FREE
              </motion.span>
            ) : (
              <motion.span
                key={activePrice}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tabular-nums"
              >
                {formatPrice(
                  Math.round(animatedPrice * 100) / 100,
                  product.currency,
                )}
              </motion.span>
            )}

            {product.compareAtPrice &&
              product.compareAtPrice > activePrice && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}

            {discount > 0 && (
              <span className="animate-pulse-glow px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Installment price */}
          {installmentPrice && activePrice > 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              or{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                ${installmentPrice}/mo
              </span>{" "}
              with installments
            </p>
          )}
        </div>

        {/* ================================================================= */}
        {/* Variant Selector - Visual Cards                                   */}
        {/* ================================================================= */}
        {sortedVariants.length > 1 && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Choose a plan
            </label>
            <div className="grid gap-3" role="radiogroup" aria-label="Select variant">
              {sortedVariants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const isRecommended = variant.id === recommendedVariantId;

                return (
                  <motion.button
                    key={variant.id}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative text-left rounded-xl border-2 p-4 transition-colors duration-200 ${
                      isSelected
                        ? "border-transparent bg-white dark:bg-neutral-800/80"
                        : "border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                    animate={{
                      y: isSelected ? -2 : 0,
                      boxShadow: isSelected
                        ? "var(--shadow-glow, 0 0 20px rgba(99,102,241,0.35)), 0 4px 24px rgba(30,77,183,0.18)"
                        : "0 0 0 rgba(0,0,0,0)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    whileTap={{ scale: 0.985 }}
                    style={
                      isSelected
                        ? {
                            backgroundImage:
                              "linear-gradient(white, white), var(--gradient-premium, linear-gradient(135deg, #1E4DB7 0%, #6366F1 50%, #8B5CF6 100%))",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                          }
                        : undefined
                    }
                  >
                    {/* Most Popular badge */}
                    {isRecommended && (
                      <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                        <Sparkles className="h-2.5 w-2.5" />
                        Most Popular
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "border-[#6366F1] bg-[#6366F1]"
                                : "border-neutral-300 dark:border-neutral-600"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 20,
                                }}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <span
                            className={`font-semibold text-base ${
                              isSelected
                                ? "text-[#1E4DB7] dark:text-indigo-400"
                                : "text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {variant.name}
                          </span>
                        </div>

                        {/* Feature bullets */}
                        {variant.features && variant.features.length > 0 && (
                          <ul className="mt-2.5 ml-7 space-y-1.5">
                            {variant.features.map((feature, i) => (
                              <li
                                key={i}
                                className="text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5"
                              >
                                <Check className="h-3 w-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <span className="text-lg font-bold text-neutral-900 dark:text-white flex-shrink-0">
                        {formatPrice(variant.price, product.currency)}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feature Comparison Matrix Toggle */}
            {allFeatures.length > 0 && sortedVariants.length > 1 && (
              <div>
                <button
                  onClick={() =>
                    setShowFeatureComparison(!showFeatureComparison)
                  }
                  className="flex items-center gap-1.5 text-sm font-medium text-[#1E4DB7] dark:text-indigo-400 hover:underline transition-colors"
                >
                  <motion.span
                    animate={{ rotate: showFeatureComparison ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="inline-flex"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                  {showFeatureComparison
                    ? "Hide comparison"
                    : "Compare all features"}
                </button>

                <AnimatePresence>
                  {showFeatureComparison && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                              <th scope="col" className="text-left px-3 py-2 text-neutral-600 dark:text-neutral-400 font-medium">
                                Feature
                              </th>
                              {sortedVariants.map((v) => (
                                <th
                                  key={v.id}
                                  scope="col"
                                  className="text-center px-3 py-2 text-neutral-700 dark:text-neutral-300 font-semibold"
                                >
                                  {v.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allFeatures.map((feature, idx) => (
                              <tr
                                key={feature}
                                className={
                                  idx % 2 === 0
                                    ? "bg-white dark:bg-neutral-900/20"
                                    : "bg-neutral-50/50 dark:bg-neutral-800/20"
                                }
                              >
                                <td scope="row" className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                                  {feature}
                                </td>
                                {sortedVariants.map((v) => (
                                  <td
                                    key={v.id}
                                    className="text-center px-3 py-2"
                                  >
                                    {v.features?.includes(feature) ? (
                                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                    ) : (
                                      <span className="text-neutral-300 dark:text-neutral-600">
                                        —
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CTA Buttons                                                       */}
        {/* ================================================================= */}
        <div className="space-y-3">
          {/* Add to Cart - Full width with shimmer */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            whileHover={{ scale: isAddingToCart ? 1 : 1.015 }}
            whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
            className="relative w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#1E4DB7] via-[#6366F1] to-[#8B5CF6] text-white font-semibold text-base rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#6366F1]/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Shimmer overlay */}
            <span className="animate-shimmer-slide absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <AnimatePresence mode="wait">
              {isAddingToCart ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative z-10 flex items-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </motion.span>
              ) : showAddedFeedback ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative z-10 flex items-center gap-2"
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
                    <Check className="h-5 w-5" />
                  </motion.div>
                  Added to Cart!
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex items-center gap-2"
                >
                  <motion.div
                    whileTap={{
                      rotate: [0, -15, 15, -10, 10, 0],
                      transition: { duration: 0.5 },
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </motion.div>
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Buy Now + Wishlist row */}
          <div className="flex gap-3">
            {/* Buy Now - gradient outline with gradient text */}
            <motion.button
              onClick={handleBuyNow}
              disabled={isBuyingNow}
              whileHover={{ scale: isBuyingNow ? 1 : 1.015 }}
              whileTap={{ scale: isBuyingNow ? 1 : 0.98 }}
              className="relative flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden border-2 border-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-white, #fff), var(--color-white, #fff)), var(--gradient-premium, linear-gradient(135deg, #1E4DB7 0%, #6366F1 50%, #8B5CF6 100%))",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              {isBuyingNow ? (
                <span className="flex items-center gap-2 text-neutral-500">
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span
                  className="flex items-center gap-2 font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "var(--gradient-premium, linear-gradient(135deg, #1E4DB7 0%, #6366F1 50%, #8B5CF6 100%))",
                  }}
                >
                  <Zap
                    className="h-5 w-5"
                    style={{
                      color: "#6366F1",
                    }}
                  />
                  Buy Now
                </span>
              )}
            </motion.button>

            {/* Wishlist heart button */}
            <motion.button
              onClick={() => setIsWishlisted(!isWishlisted)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center justify-center w-14 rounded-xl border-2 transition-all duration-300 ${
                isWishlisted
                  ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-red-300 dark:hover:border-red-700"
              }`}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <motion.div
                animate={{
                  scale: isWishlisted ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
              >
                <Heart
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Live Preview button (only for web_template, design_system, code_template) */}
          {liveDemoUrl && (
            <motion.a
              href={liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:border-[#1E4DB7] dark:hover:border-indigo-500 hover:text-[#1E4DB7] dark:hover:text-indigo-400 transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              Live Preview
            </motion.a>
          )}
        </div>

        {/* ================================================================= */}
        {/* Trust Signals                                                     */}
        {/* ================================================================= */}
        <div className="space-y-3 pt-2">
          <TrustSignal
            icon={<Lock className="h-4 w-4" />}
            text="Secure checkout via Stripe"
            index={0}
          />
          <TrustSignal
            icon={<Download className="h-4 w-4" />}
            text="Instant download after purchase"
            index={1}
          />
          <TrustSignal
            icon={<Shield className="h-4 w-4" />}
            text="30-day money-back guarantee"
            index={2}
          />
        </div>

        {/* ================================================================= */}
        {/* Metadata                                                          */}
        {/* ================================================================= */}
        {metadataItems.length > 0 && (
          <div className="space-y-3">
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {metadataItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.35 }}
                    className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl"
                  >
                    <div className="text-[#1E4DB7] dark:text-blue-400">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* Tags                                                              */}
        {/* ================================================================= */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {product.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/store?tag=${tag.slug}`}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-full transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductInfo;
