"use client";

// =============================================================================
// Mini Product Card (Inline Chat)
// =============================================================================
// A compact, horizontal product card designed for display within chat message
// bubbles. Shows thumbnail, title, price, rating, and an "Add to Cart" action.

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import type { ChatProduct } from "./types";

// =============================================================================
// Types
// =============================================================================

interface ProductCardProps {
  product: ChatProduct;
  onAddToCart?: (productId: string) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function renderMiniStars(rating: number): React.ReactNode[] {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
          aria-hidden="true"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star
            className="h-2.5 w-2.5 text-neutral-300 dark:text-neutral-600"
            aria-hidden="true"
          />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star
              className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-2.5 w-2.5 text-neutral-300 dark:text-neutral-600"
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

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex-shrink-0 w-[240px] h-20 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex h-full">
        {/* Thumbnail */}
        <Link
          href={`/store/${product.slug}`}
          className="relative h-full w-20 flex-shrink-0 block overflow-hidden bg-neutral-100 dark:bg-slate-700"
          aria-label={`View ${product.title}`}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E4DB7]/10 to-[#143A8F]/10">
              <span className="text-lg font-bold text-[#1E4DB7]/40">
                {product.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-1 left-1 px-1 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded">
              -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 p-2 flex flex-col justify-between">
          <div className="min-w-0">
            <Link
              href={`/store/${product.slug}`}
              className="block text-xs font-semibold text-neutral-900 dark:text-white truncate hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
              title={product.title}
            >
              {product.title}
            </Link>

            {/* Rating row */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex items-center gap-px">
                  {renderMiniStars(product.averageRating)}
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  ({product.totalReviews})
                </span>
              </div>
            )}
          </div>

          {/* Price row + add to cart */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {product.price === 0 ? "Free" : formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {onAddToCart && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product.id);
                }}
                aria-label={`Add ${product.title} to cart`}
                className="flex items-center justify-center h-6 w-6 rounded-md bg-[#1E4DB7] hover:bg-[#143A8F] text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-1"
              >
                <ShoppingCart className="h-3 w-3" aria-hidden="true" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
