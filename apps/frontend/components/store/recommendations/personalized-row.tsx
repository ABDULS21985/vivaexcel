"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useForYouFeed } from "@/hooks/use-ai-recommendations";
import { useAuth } from "@/providers/auth-provider";
import { ProductRecommendationCard } from "./product-recommendation-card";

// =============================================================================
// Types
// =============================================================================

interface PersonalizedRowProps {
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

export function PersonalizedRow({ className = "" }: PersonalizedRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: products, isLoading, isError } = useForYouFeed(12);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // -------------------------------------------------------------------------
  // Scroll state management
  // -------------------------------------------------------------------------
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
  }, [updateScrollState, products]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // -------------------------------------------------------------------------
  // Unauthenticated empty state
  // -------------------------------------------------------------------------
  if (!authLoading && !isAuthenticated) {
    return (
      <section className={`py-10 ${className}`} aria-label="Personalized recommendations">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#1E4DB7]/10 to-[#F59A23]/10">
            <Sparkles className="h-5 w-5 text-[#1E4DB7]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Recommended For You
          </h2>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 p-8 md:p-12 text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1E4DB7]/10 mx-auto mb-4">
            <LogIn className="h-7 w-7 text-[#1E4DB7]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            Get Personalized Recommendations
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Sign in to discover products tailored to your interests and browsing history.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E4DB7] to-[#2B5FC7] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------
  if (isLoading || authLoading) {
    return (
      <section className={`py-10 ${className}`} aria-label="Loading personalized recommendations">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="h-7 w-52 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (isError) {
    return null;
  }

  // -------------------------------------------------------------------------
  // Empty state (authenticated but no recommendations)
  // -------------------------------------------------------------------------
  if (!products || products.length === 0) {
    return null;
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <section className={`py-10 ${className}`} aria-label="Personalized recommendations">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#1E4DB7]/10 to-[#F59A23]/10">
            <Sparkles className="h-5 w-5 text-[#1E4DB7]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Recommended For You
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* See All link */}
          <Link
            href="/store?tab=for-you"
            className="hidden sm:inline-flex text-sm font-semibold text-[#1E4DB7] dark:text-blue-400 hover:text-[#143A8F] dark:hover:text-blue-300 transition-colors"
          >
            See All
          </Link>

          {/* Scroll Arrows (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll recommendations left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll recommendations right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Scrollable row */}
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
          aria-label="Personalized product recommendations"
        >
          {products.map((product, index) => (
            <div key={product.id} className="snap-start" role="listitem">
              <ProductRecommendationCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PersonalizedRow;
