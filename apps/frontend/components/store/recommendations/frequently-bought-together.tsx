"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, Package, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useProductRecommendations } from "@/hooks/use-recommendations";

// =============================================================================
// Types
// =============================================================================

interface FrequentlyBoughtTogetherProps {
  productId: string;
  currentProduct: {
    id: string;
    title: string;
    slug: string;
    price: number;
    featuredImage?: string;
  };
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const plusVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.05,
    },
  },
};

// =============================================================================
// Skeleton
// =============================================================================

function FBTSkeleton() {
  return (
    <div className="py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-7 w-56 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="contents">
              {i > 0 && (
                <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              )}
              <div className="w-[180px] md:w-[200px] rounded-xl border-2 border-neutral-200 dark:border-neutral-700 p-4">
                <div className="h-28 w-28 mx-auto rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-3" />
                <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2 mx-auto" />
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mx-auto" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function FrequentlyBoughtTogether({
  productId,
  currentProduct,
  className = "",
}: FrequentlyBoughtTogetherProps) {
  const { addToCart, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const { data, isLoading } = useProductRecommendations(productId);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fbtProducts = useMemo(
    () => data?.frequentlyBoughtTogether?.slice(0, 3) ?? [],
    [data],
  );

  // Track selected products (current product + FBT items)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initialize selected IDs when products load
  useMemo(() => {
    if (fbtProducts.length > 0 && selectedIds.size === 0) {
      const initial = new Set<string>([currentProduct.id]);
      fbtProducts.forEach((p) => initial.add(p.id));
      setSelectedIds(initial);
    }
  }, [fbtProducts, currentProduct.id, selectedIds.size]);

  // All display items: current product + FBT products
  const allItems = useMemo(() => {
    const current = {
      id: currentProduct.id,
      title: currentProduct.title,
      slug: currentProduct.slug,
      price: currentProduct.price,
      featuredImage: currentProduct.featuredImage,
      isCurrent: true,
    };
    const extras = fbtProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      featuredImage: p.featuredImage,
      compareAtPrice: p.compareAtPrice,
      isCurrent: false,
    }));
    return [current, ...extras];
  }, [currentProduct, fbtProducts]);

  const totalPrice = useMemo(() => {
    let sum = 0;
    allItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        sum += item.price;
      }
    });
    return sum;
  }, [allItems, selectedIds]);

  const selectedCount = useMemo(
    () => allItems.filter((item) => selectedIds.has(item.id)).length,
    [allItems, selectedIds],
  );

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddAllToCart = useCallback(async () => {
    setIsAddingAll(true);
    try {
      const idsToAdd = allItems
        .filter((item) => selectedIds.has(item.id))
        .map((item) => item.id);

      for (const id of idsToAdd) {
        await addToCart(id);
        setAddedIds((prev) => new Set(prev).add(id));
      }
      openCart();
    } catch {
      // Error handled silently
    } finally {
      setIsAddingAll(false);
    }
  }, [allItems, selectedIds, addToCart, openCart]);

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------
  if (isLoading) {
    return <FBTSkeleton />;
  }

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------
  if (fbtProducts.length === 0) {
    return null;
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <section
      className={`py-10 ${className}`}
      aria-label="Frequently bought together"
    >
      {/* Header */}
      <motion.h2
        className="text-2xl font-bold text-neutral-900 dark:text-white mb-6"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        Frequently Bought Together
      </motion.h2>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6 md:p-8">
        {/* Product Cards Row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 md:gap-2 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {allItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="contents"
            >
              {/* Plus sign between cards */}
              {index > 0 && (
                <motion.div
                  variants={plusVariants}
                  className="flex items-center justify-center h-10 w-10 shrink-0"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <Plus
                      className="h-4 w-4 text-neutral-400"
                      aria-hidden="true"
                    />
                  </div>
                </motion.div>
              )}

              {/* Product Card */}
              <button
                onClick={() => toggleProduct(item.id)}
                className={`relative flex flex-col items-center w-[160px] sm:w-[180px] md:w-[200px] p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedIds.has(item.id)
                    ? "border-[#1E4DB7] bg-blue-50/50 dark:bg-blue-950/20 shadow-md shadow-blue-500/10"
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-60"
                }`}
                aria-label={`${selectedIds.has(item.id) ? "Deselect" : "Select"} ${item.title}`}
                aria-pressed={selectedIds.has(item.id)}
              >
                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 right-2 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ${
                    selectedIds.has(item.id)
                      ? "border-[#1E4DB7] bg-[#1E4DB7]"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                  aria-hidden="true"
                >
                  <AnimatePresence>
                    {selectedIds.has(item.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Current product label */}
                {item.isCurrent && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#1E4DB7] text-white text-[8px] font-bold uppercase tracking-wider rounded">
                    This item
                  </span>
                )}

                {/* Image */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 mb-3">
                  {item.featuredImage ? (
                    <Image
                      src={item.featuredImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package
                        className="h-8 w-8 text-neutral-300 dark:text-neutral-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white text-center line-clamp-2 mb-2 leading-tight">
                  <Link
                    href={`/store/${item.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
                  >
                    {item.title}
                  </Link>
                </h4>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {formatPrice(convertPrice(item.price), currency)}
                  </span>
                  {"compareAtPrice" in item &&
                    item.compareAtPrice != null &&
                    item.compareAtPrice > item.price && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        {formatPrice(
                          convertPrice(item.compareAtPrice),
                          currency,
                        )}
                      </span>
                    )}
                </div>

                {/* Added indicator */}
                <AnimatePresence>
                  {addedIds.has(item.id) && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span className="text-[10px] font-semibold">Added</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Total + Add to Cart */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-center sm:text-left">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Total for {selectedCount}{" "}
              {selectedCount === 1 ? "item" : "items"}
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(convertPrice(totalPrice), currency)}
            </p>
          </div>

          <motion.button
            onClick={handleAddAllToCart}
            disabled={isAddingAll || selectedCount === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1E4DB7] to-[#2B5FC7] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Add ${selectedCount} items to cart for ${formatPrice(convertPrice(totalPrice), currency)}`}
          >
            {isAddingAll ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            )}
            Add {selectedCount > 1 ? "All" : ""} to Cart
          </motion.button>
        </div>

        {/* AI suggestion hint */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          <span>Based on what other customers purchased together</span>
        </div>
      </div>
    </section>
  );
}

export default FrequentlyBoughtTogether;
