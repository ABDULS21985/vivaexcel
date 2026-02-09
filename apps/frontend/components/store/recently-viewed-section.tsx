"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import type { RecentlyViewedItem } from "@/hooks/use-recently-viewed";

// =============================================================================
// Constants
// =============================================================================

const MAX_DISPLAY = 8;
const SCROLL_AMOUNT = 260;

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

function getItemHref(item: RecentlyViewedItem): string {
  if (item.type === "template") return `/store/templates/${item.slug}`;
  return `/store/${item.slug}`;
}

// =============================================================================
// Animation Variants
// =============================================================================

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const arrowVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// =============================================================================
// Compact Card for Recently Viewed Items
// =============================================================================

interface RecentlyViewedCardProps {
  item: RecentlyViewedItem;
  index: number;
  onRemove: (id: string) => void;
}

function RecentlyViewedCard({ item, index, onRemove }: RecentlyViewedCardProps) {
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="snap-start flex-shrink-0 w-[200px] md:w-[220px] group/card"
    >
      <div className="card-interactive relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover-lift">
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-950"
          aria-label={`Remove ${item.title} from recently viewed`}
        >
          <X className="h-3 w-3 text-neutral-500 hover:text-red-500" />
        </button>

        <Link href={getItemHref(item)} className="block">
          {/* Image */}
          <div className="relative h-32 md:h-36 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            {item.featuredImage ? (
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                sizes="220px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-600">
                  {item.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute bottom-2 left-2 z-10">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded-md bg-[#1E4DB7]/90 backdrop-blur-sm">
                {item.type === "template" ? "Template" : "Product"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover/card:text-[#1E4DB7] dark:group-hover/card:text-blue-400 transition-colors duration-200">
              {item.title}
            </h4>
            <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">
              {formatPrice(item.price)}
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Recently Viewed Section
// =============================================================================

export function RecentlyViewedSection() {
  const { items, removeItem, clearAll } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const displayItems = items.slice(0, MAX_DISPLAY);

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

    checkScrollPosition();

    el.addEventListener("scroll", checkScrollPosition, { passive: true });
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition, displayItems.length]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Hide entire section when there are no items
  if (displayItems.length === 0) return null;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="py-10 md:py-14"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* -----------------------------------------------------------------
            Section Header
        ----------------------------------------------------------------- */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20">
              <Clock className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Recently Viewed
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop navigation arrows */}
            <div className="hidden md:flex items-center gap-2">
              <AnimatePresence>
                {canScrollLeft && (
                  <motion.button
                    key="rv-arrow-left"
                    variants={arrowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => scrollBy("left")}
                    aria-label="Scroll left"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-[#1E4DB7]/40 dark:hover:border-blue-500/40 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {canScrollRight && (
                  <motion.button
                    key="rv-arrow-right"
                    variants={arrowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => scrollBy("right")}
                    aria-label="Scroll right"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-[#1E4DB7]/40 dark:hover:border-blue-500/40 transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Clear History button */}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            Horizontal Scroll Row
        ----------------------------------------------------------------- */}
        <div className="relative group/carousel">
          {/* Left gradient fade */}
          <div
            className={`
              pointer-events-none absolute left-0 top-0 bottom-0 w-8 md:w-12 z-10
              bg-gradient-to-r from-white dark:from-neutral-950 to-transparent
              transition-opacity duration-300
              ${canScrollLeft ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* Right gradient fade */}
          <div
            className={`
              pointer-events-none absolute right-0 top-0 bottom-0 w-8 md:w-12 z-10
              bg-gradient-to-l from-white dark:from-neutral-950 to-transparent
              transition-opacity duration-300
              ${canScrollRight ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide flex gap-4 snap-x snap-mandatory -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pb-4"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <AnimatePresence mode="popLayout">
              {displayItems.map((item, index) => (
                <RecentlyViewedCard
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>

            {/* Trailing spacer */}
            <div className="snap-start flex-shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default RecentlyViewedSection;
