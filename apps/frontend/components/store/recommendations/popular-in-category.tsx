"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, TrendingUp, Package } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { ProductBadge } from "./product-badge";
import type { ProductRecommendation } from "@/types/analytics";

// =============================================================================
// Types
// =============================================================================

interface PopularInCategoryProps {
  categoryName: string;
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

export function PopularInCategory({
  categoryName,
  products,
  className = "",
}: PopularInCategoryProps) {
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();

  if (products.length === 0) return null;

  return (
    <section className={`py-10 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/10">
          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Popular in{" "}
          <span className="text-[#1E4DB7] dark:text-blue-400">
            {categoryName}
          </span>
        </h2>
      </div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {products.slice(0, 4).map((product, index) => (
          <motion.div
            key={product.id}
            variants={cardVariants}
            className="group"
          >
            <Link
              href={`/store/solutions/${product.slug || product.id}`}
              className="block h-full"
            >
              <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500">
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 bg-[#1E4DB7]/10" />

                {/* Image Section */}
                <div className="relative h-48 md:h-52 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                      <Package className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  )}

                  {/* Badges overlay */}
                  {product.badges.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
                      {product.badges.slice(0, 2).map((badge) => (
                        <ProductBadge key={badge} badge={badge} />
                      ))}
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

                {/* Content Section */}
                <div className="p-5 md:p-6">
                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  {product.averageRating != null &&
                    product.averageRating > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
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
                  <div className="flex items-baseline gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatPrice(convertPrice(product.price), currency)}
                    </span>
                    {product.compareAtPrice != null &&
                      product.compareAtPrice > product.price && (
                        <span className="text-sm text-neutral-400 line-through">
                          {formatPrice(convertPrice(product.compareAtPrice), currency)}
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
    </section>
  );
}

export default PopularInCategory;
