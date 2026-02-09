"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  SortAsc,
  X,
  Package,
  Layout,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useWishlist } from "@/hooks/use-wishlist";
import type { WishlistItem } from "@/hooks/use-wishlist";

// =============================================================================
// Constants
// =============================================================================

type SortOption = "recent" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Recently Added",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
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

function getItemHref(item: WishlistItem): string {
  if (item.type === "template") return `/store/templates/${item.slug}`;
  return `/store/${item.slug}`;
}

function sortItems(items: WishlistItem[], sort: SortOption): WishlistItem[] {
  const sorted = [...items];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => b.addedAt - a.addedAt);
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

// =============================================================================
// Animation Variants
// =============================================================================

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.05 },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: -20,
    transition: { duration: 0.25 },
  },
};

const emptyVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// =============================================================================
// Wishlist Card
// =============================================================================

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
}

function WishlistCard({ item, onRemove }: WishlistCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group"
    >
      <div className="card-interactive relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover-lift">
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-950 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-700"
          aria-label={`Remove ${item.title} from wishlist`}
        >
          <X className="h-4 w-4 text-neutral-500 hover:text-red-500 transition-colors" />
        </button>

        <Link href={getItemHref(item)} className="block">
          {/* Image */}
          <div className="relative h-48 md:h-52 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            {item.featuredImage ? (
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <span className="text-4xl font-bold text-neutral-300 dark:text-neutral-600">
                  {item.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Type badge */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`
                  inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-lg shadow-md backdrop-blur-sm
                  ${item.type === "template" ? "bg-purple-600/90" : "bg-[#1E4DB7]/90"}
                `}
              >
                {item.type === "template" ? (
                  <Layout className="h-3 w-3" />
                ) : (
                  <Package className="h-3 w-3" />
                )}
                {item.type === "template" ? "Template" : "Product"}
              </span>
            </div>

            {/* Wishlisted heart indicator */}
            <div className="absolute bottom-3 right-3 z-10">
              <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center shadow-sm">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-200 leading-tight">
              {item.title}
            </h3>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {formatPrice(item.price)}
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E4DB7] dark:text-blue-400 group-hover:underline">
                View Details
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* Bottom accent on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1E4DB7] to-[#F59A23] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.div>
  );
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyWishlist() {
  return (
    <motion.div
      variants={emptyVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-20 md:py-32"
    >
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <Heart className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        Your wishlist is empty
      </h2>

      <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-8">
        Save products and templates you love to your wishlist. They will appear
        here for easy access.
      </p>

      <Link
        href="/store"
        className="btn-premium inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ShoppingBag className="h-4 w-4" />
        Browse Products
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function WishlistPage() {
  const { items, removeFromWishlist, clearAll, count } = useWishlist();
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-white dark:bg-neutral-950"
    >
      {/* =================================================================
          Hero Header
      ================================================================= */}
      <motion.section
        variants={heroVariants}
        className="relative overflow-hidden border-b border-neutral-100 dark:border-neutral-800"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7]/[0.03] via-transparent to-[#F59A23]/[0.03] dark:from-[#1E4DB7]/[0.06] dark:to-[#F59A23]/[0.04]" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Title + count */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  My Collection
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                Your Wishlist
              </h1>

              {count > 0 && (
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                  {count} {count === 1 ? "item" : "items"} saved
                </p>
              )}
            </div>

            {/* Actions */}
            {count > 0 && (
              <div className="flex items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-[#1E4DB7]/40 dark:hover:border-blue-500/40 transition-colors duration-200"
                  >
                    <SortAsc className="h-4 w-4" />
                    {SORT_LABELS[sortBy]}
                  </button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <>
                        {/* Backdrop to close menu */}
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowSortMenu(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-40 overflow-hidden"
                        >
                          {(Object.keys(SORT_LABELS) as SortOption[]).map(
                            (option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setSortBy(option);
                                  setShowSortMenu(false);
                                }}
                                className={`
                                  w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                                  ${
                                    sortBy === option
                                      ? "bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                  }
                                `}
                              >
                                {SORT_LABELS[option]}
                              </button>
                            ),
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear All */}
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* =================================================================
          Content
      ================================================================= */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        {count === 0 ? (
          <EmptyWishlist />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
