"use client";

// =============================================================================
// Search Results Grid
// =============================================================================
// Displays AI-powered smart search results in a responsive grid with support
// for "did you mean" correction, search intent badges, related searches,
// loading skeletons, and empty states.

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Package, Star, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { cn } from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { SearchIntentBadge } from "./search-intent-badge";
import type { SmartSearchResponse, SmartSearchResult } from "./types";

// =============================================================================
// Types
// =============================================================================

interface SearchResultsGridProps {
  data: SmartSearchResponse | undefined;
  isLoading: boolean;
  query: string;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 16 },
  },
};

// =============================================================================
// Sub-components
// =============================================================================

function ResultCard({ item, index }: { item: SmartSearchResult; index: number }) {
  const { addToCart, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();

  const discount =
    item.compareAtPrice && item.compareAtPrice > item.price
      ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await addToCart(item.id);
      openCart();
    },
    [addToCart, openCart, item.id],
  );

  return (
    <motion.div custom={index} variants={cardVariants} className="group">
      <Link
        href={`/store/${item.slug}`}
        className="block h-full"
        aria-label={`${item.title}, ${formatPrice(convertPrice(item.price), currency)}`}
      >
        <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
            {item.featuredImage ? (
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                  -{discount}%
                </span>
              </div>
            )}

            {/* Add to cart overlay */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1E4DB7] to-[#2B5FC7] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-colors duration-200"
                aria-label={`Add ${item.title} to cart`}
              >
                <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                Add to Cart
              </button>
            </div>

            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            {item.type && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#1E4DB7] dark:text-blue-400 mb-1">
                {item.type}
              </span>
            )}

            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {item.title}
            </h3>

            {item.shortDescription && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                {item.shortDescription}
              </p>
            )}

            {/* Rating */}
            {item.averageRating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  {item.averageRating.toFixed(1)}
                </span>
                {item.totalReviews > 0 && (
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    ({item.totalReviews})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatPrice(convertPrice(item.price), currency)}
              </span>
              {item.compareAtPrice != null && item.compareAtPrice > item.price && (
                <span className="text-[10px] text-neutral-400 line-through">
                  {formatPrice(convertPrice(item.compareAtPrice), currency)}
                </span>
              )}
            </div>
          </div>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-md overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-2.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="h-4 w-14 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function SearchResultsGrid({
  data,
  isLoading,
  query,
  className,
}: SearchResultsGridProps) {
  const router = useRouter();

  const handleRelatedSearch = useCallback(
    (term: string) => {
      router.push(`/store?q=${encodeURIComponent(term)}`);
    },
    [router],
  );

  const handleDidYouMean = useCallback(
    (corrected: string) => {
      router.push(`/store?q=${encodeURIComponent(corrected)}`);
    },
    [router],
  );

  // ---- Loading ----
  if (isLoading) {
    return (
      <section className={cn("py-6", className)} aria-label="Loading search results">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
        <SkeletonGrid />
      </section>
    );
  }

  // ---- No data or empty query ----
  if (!data || !query) return null;

  // ---- No results ----
  if (data.items.length === 0) {
    return (
      <section className={cn("py-6", className)} aria-label="No search results">
        <div className="text-center py-16">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mx-auto mb-4">
            <Search className="h-7 w-7 text-neutral-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            No results for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Try different keywords, check spelling, or browse our categories.
          </p>

          {/* Did you mean */}
          {data.didYouMean && (
            <button
              onClick={() => handleDidYouMean(data.didYouMean!)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline"
            >
              Did you mean: <span className="font-semibold">{data.didYouMean}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Related searches */}
          {data.relatedSearches.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
                Related searches
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {data.relatedSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleRelatedSearch(term)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ---- Results ----
  return (
    <section className={cn("py-6", className)} aria-label="Search results">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-900 dark:text-white">
              {data.total}
            </span>{" "}
            {data.total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>

          {/* Intent badge */}
          {data.intent?.isNaturalLanguage && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#1E4DB7]" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-[#1E4DB7] dark:text-blue-400">
                AI-enhanced
              </span>
            </div>
          )}
        </div>

        {/* Intent details */}
        {data.intent && (
          <div className="flex items-center gap-2 flex-wrap">
            {data.intent.category && (
              <SearchIntentBadge label={`Category: ${data.intent.category}`} />
            )}
            {data.intent.productType && (
              <SearchIntentBadge label={`Type: ${data.intent.productType}`} />
            )}
          </div>
        )}
      </div>

      {/* Did you mean */}
      <AnimatePresence>
        {data.didYouMean && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 px-4 py-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30"
          >
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Did you mean:{" "}
              <button
                onClick={() => handleDidYouMean(data.didYouMean!)}
                className="font-semibold text-[#1E4DB7] dark:text-blue-400 hover:underline"
              >
                {data.didYouMean}
              </button>
              ?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results grid */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        role="list"
        aria-label="Search results list"
      >
        {data.items.map((item, i) => (
          <div key={item.id} role="listitem">
            <ResultCard item={item} index={i} />
          </div>
        ))}
      </motion.div>

      {/* Related searches */}
      {data.relatedSearches.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
            Related searches
          </p>
          <div className="flex flex-wrap gap-2">
            {data.relatedSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleRelatedSearch(term)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default SearchResultsGrid;
