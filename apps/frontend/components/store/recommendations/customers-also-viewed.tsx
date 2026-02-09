"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Eye } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { ProductRecommendation } from "@/types/analytics";

// =============================================================================
// Types
// =============================================================================

interface CustomersAlsoViewedProps {
  products: ProductRecommendation[];
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
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
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

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// =============================================================================
// Component
// =============================================================================

export function CustomersAlsoViewed({
  products,
  className = "",
}: CustomersAlsoViewedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className={`py-10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500/10">
            <Eye className="h-5 w-5 text-[#1E4DB7]" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Customers Also Viewed
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Fade edges for scroll indication */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none" />
        )}

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
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                className="group min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] snap-start"
              >
                <Link
                  href={`/store/solutions/${product.slug || product.id}`}
                  className="block h-full"
                >
                  <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500">
                    {/* Image */}
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
                            sizes="(max-width: 640px) 260px, 280px"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                          <Eye className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                        </div>
                      )}

                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {product.category}
                          </span>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {product.compareAtPrice != null &&
                        product.compareAtPrice > product.price && (
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                              -
                              {Math.round(
                                ((product.compareAtPrice - product.price) /
                                  product.compareAtPrice) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
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
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice != null &&
                          product.compareAtPrice > product.price && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CustomersAlsoViewed;
