"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Download,
  Check,
  X,
  Award,
  TrendingDown,
  Crown,
  Share2,
  Link2,
  ShoppingCart,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge, cn } from "@ktblog/ui/components";
import { useQuickCompare } from "@/hooks/use-comparison";
import { useComparison } from "@/providers/comparison-provider";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useTranslations } from "next-intl";
import type {
  ComparisonAttribute,
  ComparisonHighlights,
} from "@/types/comparison";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Skeleton Loader
// =============================================================================

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <div className="aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-800 mb-4" />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mb-4" />
      <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
      <div className="h-9 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
    </div>
  );
}

function ComparisonSkeleton({ count = 3 }: { count?: number }) {
  const cols = Math.min(count, 4);
  return (
    <div className="space-y-8">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="space-y-0 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "grid gap-4 px-4 py-3",
              i % 2 === 0
                ? "bg-white dark:bg-neutral-900"
                : "bg-neutral-50 dark:bg-neutral-900/50",
            )}
            style={{ gridTemplateColumns: `160px repeat(${cols}, 1fr)` }}
          >
            <div className="animate-pulse h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="animate-pulse h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16 mx-auto"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getBestIndex(attr: ComparisonAttribute): number {
  if (attr.type === "price") {
    const nums = attr.values.map((v) =>
      typeof v === "number" ? v : Infinity,
    );
    const min = Math.min(...nums);
    return min === Infinity ? -1 : nums.indexOf(min);
  }
  if (attr.type === "rating" || attr.type === "number") {
    const nums = attr.values.map((v) =>
      typeof v === "number" ? v : -Infinity,
    );
    const max = Math.max(...nums);
    return max === -Infinity ? -1 : nums.indexOf(max);
  }
  return -1;
}

function allIdentical(attr: ComparisonAttribute): boolean {
  const unique = new Set(attr.values.map((v) => JSON.stringify(v)));
  return unique.size <= 1;
}

// =============================================================================
// Highlight Badge
// =============================================================================

function HighlightBadge({
  type,
  productId,
  currentProductId,
  t,
}: {
  type: "bestValue" | "bestRated" | "mostPopular";
  productId: string | undefined;
  currentProductId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if (!productId || productId !== currentProductId) return null;

  const config = {
    bestValue: {
      label: t("bestValue"),
      icon: TrendingDown,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    },
    bestRated: {
      label: t("bestRated"),
      icon: Award,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    mostPopular: {
      label: t("mostPopular"),
      icon: Crown,
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
  }[type];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs gap-1 font-medium", config.className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ComparisonClient() {
  const t = useTranslations("comparison");
  const searchParams = useSearchParams();
  const { comparedIds } = useComparison();
  const { addToCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();

  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // ---------------------------------------------------------------------------
  // Resolve product IDs -- URL params take precedence, fall back to context
  // ---------------------------------------------------------------------------
  const ids = useMemo(() => {
    const raw = searchParams.get("ids");
    if (raw) {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return comparedIds;
  }, [searchParams, comparedIds]);

  const { data: comparisonData, isLoading } = useQuickCompare(ids);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const products = comparisonData?.products ?? [];
  const attributes = comparisonData?.attributes ?? [];
  const highlights: ComparisonHighlights = comparisonData?.highlights ?? {};
  const aiInsight = comparisonData?.aiInsight;

  const filteredAttributes = useMemo(() => {
    if (!differencesOnly) return attributes;
    return attributes.filter((attr: ComparisonAttribute) => !allIdentical(attr));
  }, [attributes, differencesOnly]);

  const gridCols = useMemo(() => {
    const count = products.length;
    if (count <= 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-4";
  }, [products.length]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await addToCart(productId);
    } catch {
      // handled by cart provider
    } finally {
      setAddingId(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderValue = (
    attr: ComparisonAttribute,
    value: string | number | boolean | null,
    isBest: boolean,
  ) => {
    if (value === null || value === undefined) {
      return (
        <span className="text-neutral-300 dark:text-neutral-600">--</span>
      );
    }

    switch (attr.type) {
      case "boolean":
        return value ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-400" />
        );

      case "price":
        return (
          <span
            className={cn(
              "font-semibold",
              isBest
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-900 dark:text-white",
            )}
          >
            {formatPrice(Number(value))}
          </span>
        );

      case "rating":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold",
              isBest
                ? "text-amber-600 dark:text-amber-400"
                : "text-neutral-900 dark:text-white",
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                isBest
                  ? "fill-amber-500 text-amber-500"
                  : "fill-neutral-400 text-neutral-400",
              )}
            />
            {Number(value).toFixed(1)}
          </span>
        );

      case "number":
        return (
          <span
            className={cn(
              "font-medium",
              isBest
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-neutral-900 dark:text-white",
            )}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        );

      default:
        return (
          <span className="text-neutral-700 dark:text-neutral-300">
            {String(value)}
          </span>
        );
    }
  };

  // ---------------------------------------------------------------------------
  // Empty state -- fewer than 2 products
  // ---------------------------------------------------------------------------
  if (ids.length < 2 && !isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <Download className="h-8 w-8 text-neutral-400" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
              {t("selectAtLeastDesc")}
            </p>
            <Button asChild>
              <Link href="/store">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("browseProducts")}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main comparison view
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        {/* ── Back button ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href="/store">
              <ArrowLeft className="h-4 w-4 me-2" />
              {t("backToStore")}
            </Link>
          </Button>
        </motion.div>

        {/* ── Title + share ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {t("compareDescription", { count: ids.length })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5"
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  {t("linkCopied")}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  {t("copyLink")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: t("title"),
                    url: window.location.href,
                  });
                } else {
                  handleCopyLink();
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* ── Loading ───────────────────────────────────────────────── */}
        {isLoading ? (
          <ComparisonSkeleton count={ids.length} />
        ) : products.length > 0 ? (
          <div className="space-y-8">
            {/* ── Product cards ────────────────────────────────────── */}
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div
                className={cn(
                  "grid gap-4 min-w-[600px] sm:min-w-0",
                  gridCols,
                )}
              >
                {products.map((product: DigitalProduct, i: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="snap-start bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col"
                  >
                    {/* Image */}
                    <div className="aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3 relative">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Download className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Highlight badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                      <HighlightBadge
                        type="bestValue"
                        productId={highlights.bestValue}
                        currentProductId={product.id}
                        t={t}
                      />
                      <HighlightBadge
                        type="bestRated"
                        productId={highlights.bestRated}
                        currentProductId={product.id}
                        t={t}
                      />
                      <HighlightBadge
                        type="mostPopular"
                        productId={highlights.mostPopular}
                        currentProductId={product.id}
                        t={t}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-2 mb-1">
                      <Link
                        href={`/store/${product.slug}`}
                        className="hover:underline"
                      >
                        {product.title}
                      </Link>
                    </h3>

                    {/* Category */}
                    {product.category && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        {product.category.name}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">
                        {product.averageRating.toFixed(1)}
                      </span>
                      <span className="text-neutral-400">
                        ({product.totalReviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4 mt-auto">
                      <span className="text-xl font-bold text-neutral-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice != null &&
                        product.compareAtPrice > product.price && (
                          <span className="text-sm text-neutral-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={addingId === product.id}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      {addingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 me-1.5" />
                          {t("addToCart")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── AI Insight panel ─────────────────────────────────── */}
            <AnimatePresence>
              {aiInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {t("aiInsight")}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {aiInsight}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Differences-only toggle ──────────────────────────── */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDifferencesOnly((prev) => !prev)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  differencesOnly
                    ? "bg-blue-600"
                    : "bg-neutral-200 dark:bg-neutral-700",
                )}
                role="switch"
                aria-checked={differencesOnly}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                    differencesOnly
                      ? "translate-x-5 rtl:-translate-x-5"
                      : "translate-x-0",
                  )}
                />
              </button>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("differencesOnly")}
              </span>
            </div>

            {/* ── Attribute comparison rows ────────────────────────── */}
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="min-w-[600px] sm:min-w-0 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                {filteredAttributes.map((attr: ComparisonAttribute, rowIdx: number) => {
                  const bestIdx = getBestIndex(attr);
                  return (
                    <motion.div
                      key={attr.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: rowIdx * 0.03 }}
                      className={cn(
                        "grid items-center gap-4 px-4 py-3",
                        rowIdx % 2 === 0
                          ? "bg-white dark:bg-neutral-900"
                          : "bg-muted/30",
                      )}
                      style={{
                        gridTemplateColumns: `160px repeat(${products.length}, 1fr)`,
                      }}
                    >
                      <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {attr.name}
                      </div>
                      {attr.values.map((value: string | number | boolean | null, colIdx: number) => (
                        <div
                          key={colIdx}
                          className="flex items-center justify-center text-sm"
                        >
                          {renderValue(attr, value, colIdx === bestIdx)}
                        </div>
                      ))}
                    </motion.div>
                  );
                })}

                {filteredAttributes.length === 0 && (
                  <div className="p-10 text-center text-neutral-400 dark:text-neutral-500">
                    {differencesOnly
                      ? t("noAttributeDifferences")
                      : t("noAttributes")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── No data fallback ──────────────────────────────────── */
          <div className="text-center py-20">
            <Download className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              {t("noProducts")}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              {t("selectAtLeastDesc")}
            </p>
            <Button asChild variant="outline">
              <Link href="/store">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("browseProducts")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
