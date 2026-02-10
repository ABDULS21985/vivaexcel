"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useSimilarProducts } from "@/hooks/use-ai-recommendations";
import { ProductRecommendationCard } from "./product-recommendation-card";

// =============================================================================
// Types
// =============================================================================

interface SimilarProductsProps {
  productId: string;
  limit?: number;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// =============================================================================
// Skeleton Card
// =============================================================================

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[180px] sm:w-[220px]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-md overflow-hidden">
        <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        <div className="p-3 sm:p-4 space-y-2">
          <div className="h-2.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="h-4 w-14 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function SimilarProducts({
  productId,
  limit = 8,
  className = "",
}: SimilarProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products, isLoading, isError } = useSimilarProducts(productId, limit);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [viewMode, setViewMode] = useState<"scroll" | "grid">("scroll");

  // -------------------------------------------------------------------------
  // Scroll state management
  // -------------------------------------------------------------------------
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current || viewMode !== "scroll") return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, [viewMode]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || viewMode !== "scroll") return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, viewMode, products]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <section className={`py-10 ${className}`} aria-label="Loading similar products">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="h-7 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Error / Empty state
  // -------------------------------------------------------------------------
  if (isError || !products || products.length === 0) {
    return null;
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <section className={`py-10 ${className}`} aria-label="Similar products">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#1E4DB7]/10">
            <Layers className="h-5 w-5 text-[#1E4DB7]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            You Might Also Like
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle (desktop) */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                viewMode === "scroll"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-label="Scroll view"
              aria-pressed={viewMode === "scroll"}
            >
              Row
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              Grid
            </button>
          </div>

          {/* Scroll Arrows (desktop, scroll mode) */}
          {viewMode === "scroll" && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll similar products left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll similar products right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Scroll view */}
      {viewMode === "scroll" && (
        <div className="relative">
          {/* Fade edges */}
          {canScrollLeft && (
            <div
              className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
          )}
          {canScrollRight && (
            <div
              className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
            role="list"
            aria-label="Similar products list"
          >
            {products.map((product, index) => (
              <div key={product.id} className="snap-start" role="listitem">
                <ProductRecommendationCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid view */}
      {viewMode === "grid" && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Similar products grid"
        >
          {products.map((product, index) => (
            <div key={product.id} role="listitem">
              <ProductRecommendationCard product={product} index={index} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SimilarProducts;
