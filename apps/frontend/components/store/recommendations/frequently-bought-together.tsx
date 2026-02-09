"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import type { ProductRecommendation } from "@/types/analytics";

// =============================================================================
// Types
// =============================================================================

interface FrequentlyBoughtTogetherProps {
  productId: string;
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
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

export function FrequentlyBoughtTogether({
  productId,
  products,
  className = "",
}: FrequentlyBoughtTogetherProps) {
  const { addToCart, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>([productId]);
    products.slice(0, 3).forEach((p) => initial.add(p.id));
    return initial;
  });

  const displayProducts = useMemo(
    () => products.slice(0, 3),
    [products],
  );

  const totalPrice = useMemo(() => {
    let sum = 0;
    displayProducts.forEach((p) => {
      if (selectedIds.has(p.id)) {
        sum += p.price;
      }
    });
    return sum;
  }, [displayProducts, selectedIds]);

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
      const idsToAdd = displayProducts
        .filter((p) => selectedIds.has(p.id))
        .map((p) => p.id);

      for (const id of idsToAdd) {
        await addToCart(id);
      }
      openCart();
    } catch {
      // Error handled silently
    } finally {
      setIsAddingAll(false);
    }
  }, [displayProducts, selectedIds, addToCart, openCart]);

  if (displayProducts.length === 0) return null;

  return (
    <section className={`py-10 ${className}`}>
      {/* Header */}
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Frequently Bought Together
      </h2>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8">
        {/* Product Cards Row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 md:gap-2 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="contents"
            >
              {/* Plus Sign (between cards) */}
              {index > 0 && (
                <div className="flex items-center justify-center h-10 w-10 shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <Plus className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              )}

              {/* Product Card */}
              <button
                onClick={() => toggleProduct(product.id)}
                className={`relative flex flex-col items-center w-[180px] md:w-[200px] p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedIds.has(product.id)
                    ? "border-[#1E4DB7] bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-60"
                }`}
              >
                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 right-2 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    selectedIds.has(product.id)
                      ? "border-[#1E4DB7] bg-[#1E4DB7]"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  {selectedIds.has(product.id) && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Image */}
                <div className="relative h-28 w-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 mb-3">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-500" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white text-center line-clamp-2 mb-2 leading-tight">
                  {product.title}
                </h4>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {formatPrice(convertPrice(product.price), currency)}
                  </span>
                  {product.compareAtPrice != null &&
                    product.compareAtPrice > product.price && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        {formatPrice(convertPrice(product.compareAtPrice), currency)}
                      </span>
                    )}
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Total + Add to Cart */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-center sm:text-left">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Total for{" "}
              {displayProducts.filter((p) => selectedIds.has(p.id)).length}{" "}
              {displayProducts.filter((p) => selectedIds.has(p.id)).length === 1
                ? "item"
                : "items"}
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(convertPrice(totalPrice), currency)}
            </p>
          </div>

          <motion.button
            onClick={handleAddAllToCart}
            disabled={
              isAddingAll ||
              displayProducts.filter((p) => selectedIds.has(p.id)).length === 0
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1E4DB7] to-[#2B5FC7] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingAll ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
            Add All to Cart
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export default FrequentlyBoughtTogether;
