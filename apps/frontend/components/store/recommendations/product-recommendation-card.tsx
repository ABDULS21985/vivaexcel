"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Sparkles, Package } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import type { RecommendedProduct } from "@/hooks/use-ai-recommendations";

// =============================================================================
// Types
// =============================================================================

interface ProductRecommendationCardProps {
  product: RecommendedProduct;
  index?: number;
}

// =============================================================================
// Animation Variants
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: i * 0.06,
    },
  }),
};

// =============================================================================
// Helpers
// =============================================================================

function renderStars(rating: number): React.ReactNode[] {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 fill-amber-400 text-amber-400"
          aria-hidden="true"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star
            className="h-3 w-3 text-neutral-300 dark:text-neutral-600"
            aria-hidden="true"
          />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star
              className="h-3 w-3 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 text-neutral-300 dark:text-neutral-600"
          aria-hidden="true"
        />,
      );
    }
  }

  return stars;
}

// =============================================================================
// Component
// =============================================================================

export function ProductRecommendationCard({
  product,
  index = 0,
}: ProductRecommendationCardProps) {
  const { addToCart, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isAdding) return;
      setIsAdding(true);
      try {
        await addToCart(product.id);
        openCart();
      } catch {
        // Error handled silently
      } finally {
        setIsAdding(false);
      }
    },
    [isAdding, addToCart, openCart, product.id],
  );

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="group shrink-0 w-[180px] sm:w-[220px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/${product.slug}`}
        className="block h-full"
        aria-label={`${product.title}, $${product.price.toFixed(2)}`}
      >
        <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
            {product.featuredImage ? (
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Image
                  src={product.featuredImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 180px, 220px"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <Package
                  className="h-8 w-8 text-neutral-300 dark:text-neutral-600"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                  -{discount}%
                </span>
              </div>
            )}

            {/* AI Reason Badge */}
            {product.reason && (
              <div className="absolute bottom-2 left-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg">
                  <Sparkles className="h-2.5 w-2.5 text-[#F59A23]" aria-hidden="true" />
                  {product.reason}
                </span>
              </div>
            )}

            {/* Add to Cart button overlay */}
            <motion.div
              className="absolute inset-x-0 bottom-0 flex justify-center pb-3 z-10"
              initial={{ opacity: 0, y: 8 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1E4DB7] to-[#2B5FC7] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Add ${product.title} to cart`}
              >
                {isAdding ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Add to Cart
              </motion.button>
            </motion.div>

            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Content Section */}
          <div className="p-3 sm:p-4">
            {/* Type Badge */}
            {product.type && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#1E4DB7] dark:text-blue-400 mb-1">
                {product.type}
              </span>
            )}

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {product.title}
            </h3>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5" aria-label={`${product.averageRating.toFixed(1)} out of 5 stars`}>
                  {renderStars(product.averageRating)}
                </div>
                {product.totalReviews > 0 && (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    ({product.totalReviews})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                {formatPrice(convertPrice(product.price), currency)}
              </span>
              {product.compareAtPrice != null &&
                product.compareAtPrice > product.price && (
                  <span className="text-[10px] text-neutral-400 line-through">
                    {formatPrice(
                      convertPrice(product.compareAtPrice),
                      currency,
                    )}
                  </span>
                )}
            </div>
          </div>

          {/* Bottom accent line on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductRecommendationCard;
