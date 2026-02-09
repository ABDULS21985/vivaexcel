"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useTrending } from "@/hooks/use-recommendations";
import { ProductBadge } from "./product-badge";
import type { TrendingProduct } from "@/types/analytics";

// =============================================================================
// Types
// =============================================================================

interface TrendingSectionProps {
  products?: TrendingProduct[];
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// =============================================================================
// Helpers
// =============================================================================

// =============================================================================
// Component
// =============================================================================

export function TrendingSection({
  products: propProducts,
  className = "",
}: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const { data: fetchedProducts, isLoading } = useTrending(10);

  const products = propProducts ?? fetchedProducts ?? [];

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Loading skeleton
  if (!propProducts && isLoading) {
    return (
      <section className={`py-10 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="h-7 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[260px] h-[340px] rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`py-10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500/10">
            <Flame className="h-5 w-5 text-[#F59A23]" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Trending Now
          </h2>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        <motion.div
          className="flex gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] snap-start"
            >
              <Link
                href={`/store/solutions/${product.slug || product.id}`}
                className="block h-full"
              >
                <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500">
                  {/* Image Section */}
                  <div className="relative h-44 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {product.featuredImage ? (
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 240px, 260px"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                        <Flame className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    )}

                    {/* Rank Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
                        #{product.rank}
                      </span>
                    </div>

                    {/* Trending Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <ProductBadge badge="trending" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    {product.averageRating != null &&
                      product.averageRating > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.round(product.averageRating!)
                                    ? "text-amber-400"
                                    : "text-zinc-300 dark:text-zinc-600"
                                }`}
                                fill="currentColor"
                                strokeWidth={0}
                              />
                            ))}
                          </div>
                          {product.totalReviews != null && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              ({product.totalReviews})
                            </span>
                          )}
                        </div>
                      )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-base font-bold text-neutral-900 dark:text-white">
                        {formatPrice(convertPrice(product.price), currency)}
                      </span>
                      {product.compareAtPrice != null &&
                        product.compareAtPrice > product.price && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatPrice(convertPrice(product.compareAtPrice), currency)}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-[#F59A23] to-[#1E4DB7]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TrendingSection;
