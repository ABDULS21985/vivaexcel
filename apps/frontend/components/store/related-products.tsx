"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/store/product-card";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface RelatedProductsProps {
  products: DigitalProduct[];
  title?: string;
  showViewAll?: boolean;
}

// =============================================================================
// Animation Variants
// =============================================================================

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardWrapperVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const arrowVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// =============================================================================
// Constants
// =============================================================================

const SCROLL_AMOUNT = 340;

// =============================================================================
// Component
// =============================================================================

export function RelatedProducts({
  products,
  title,
  showViewAll = true,
}: RelatedProductsProps) {
  const t = useTranslations("store");
  const displayTitle = title ?? t("sections.youMightAlsoLike");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // -------------------------------------------------------------------------
  // Scroll state detection
  // -------------------------------------------------------------------------

  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Initial check
    checkScrollPosition();

    el.addEventListener("scroll", checkScrollPosition, { passive: true });
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition, products]);

  // -------------------------------------------------------------------------
  // Programmatic scrolling
  // -------------------------------------------------------------------------

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!products.length) return null;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-16 md:py-20"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* ----------------------------------------------------------------- */}
        {/* Section Header                                                     */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            {/* Personalization indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20">
                <Sparkles className="h-3.5 w-3.5 text-[#1E4DB7] dark:text-blue-400" />
                <span className="text-[11px] font-semibold tracking-wide text-[#1E4DB7] dark:text-blue-400 uppercase">
                  {t("sections.personalized")}
                </span>
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {displayTitle}
            </h2>

            {/* Subtitle */}
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {t("sections.basedOnViews")}
            </p>
          </div>

          {/* Desktop "View All" + navigation arrows */}
          <div className="hidden md:flex items-center gap-3">
            {showViewAll && (
              <Link
                href="/store"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300 transition-colors group me-2"
              >
                {t("cta.viewAll")}
                <ArrowRight className="h-4 w-4 rtl-flip transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            {/* Navigation arrows */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  key="arrow-left"
                  variants={arrowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => scrollBy("left")}
                  aria-label="Scroll left"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-[#1E4DB7]/40 dark:hover:border-blue-500/40 transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  key="arrow-right"
                  variants={arrowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => scrollBy("right")}
                  aria-label="Scroll right"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-[#1E4DB7]/40 dark:hover:border-blue-500/40 transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Carousel                                                           */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative group/carousel">
          {/* Left gradient fade */}
          <div
            className={`
              pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-16 z-10
              bg-gradient-to-r from-white dark:from-neutral-950 to-transparent
              transition-opacity duration-300
              ${canScrollLeft ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* Right gradient fade */}
          <div
            className={`
              pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10
              bg-gradient-to-l from-white dark:from-neutral-950 to-transparent
              transition-opacity duration-300
              ${canScrollRight ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide flex gap-6 snap-x snap-mandatory -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pb-4"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                custom={index}
                variants={cardWrapperVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="snap-start flex-shrink-0 w-[280px] md:w-[320px] hover:shadow-lg/20 rounded-2xl transition-shadow duration-300"
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}

            {/* Trailing spacer so the last card can fully peek */}
            <div className="snap-start flex-shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Mobile "View All"                                                  */}
        {/* ----------------------------------------------------------------- */}
        {showViewAll && (
          <div className="flex justify-center mt-10 md:hidden">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {t("cta.viewAllProducts")}
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default RelatedProducts;
