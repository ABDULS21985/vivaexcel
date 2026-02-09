"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Download, TrendingUp, Award, Eye } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { DigitalProduct } from "@/types/digital-product";
import {
  DIGITAL_PRODUCT_TYPE_LABELS,
  DIGITAL_PRODUCT_TYPE_COLORS,
} from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface ProductCardProps {
  product: DigitalProduct;
  index?: number;
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function getDiscountPercentage(
  price: number,
  compareAtPrice: number,
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function renderStars(rating: number): React.ReactNode[] {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600"
        />,
      );
    }
  }

  return stars;
}

// =============================================================================
// Animation Variants
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// Skeleton Card (exported for loading states)
// =============================================================================

export function ProductCardSkeleton() {
  return (
    <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-48 md:h-56 bg-neutral-100 dark:bg-neutral-800 skeleton-shimmer" />
      {/* Content skeleton */}
      <div className="p-5 md:p-6 space-y-3">
        <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded skeleton-shimmer" />
        <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded skeleton-shimmer" />
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded skeleton-shimmer" />
        <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded skeleton-shimmer" />
        <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded skeleton-shimmer" />
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded skeleton-shimmer" />
          <div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Product Card Component
// =============================================================================

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const typeLabel = DIGITAL_PRODUCT_TYPE_LABELS[product.type] || "Product";
  const typeColor = DIGITAL_PRODUCT_TYPE_COLORS[product.type] || "#1E4DB7";
  const discount = product.compareAtPrice
    ? getDiscountPercentage(product.price, product.compareAtPrice)
    : 0;

  // -------------------------------------------------------------------------
  // Gallery Image Cycling on Hover
  // -------------------------------------------------------------------------
  const allImages = [
    product.featuredImage,
    ...(product.galleryImages || []),
  ].filter(Boolean) as string[];
  const hasMultipleImages = allImages.length > 1;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycling = useCallback(() => {
    if (!hasMultipleImages) {
      setIsHovered(true);
      return;
    }
    setIsHovered(true);
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 1500);
  }, [hasMultipleImages, allImages.length]);

  const stopCycling = useCallback(() => {
    setIsHovered(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group"
    >
      <Link href={`/store/${product.slug}`} className="block h-full">
        <div
          className="card-interactive relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
          style={{ borderTopColor: typeColor, borderTopWidth: "3px" }}
          onMouseEnter={startCycling}
          onMouseLeave={stopCycling}
        >
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{ backgroundColor: `${typeColor}20` }}
          />

          {/* ---------------------------------------------------------------
              Image Section with Gallery Cycling
          --------------------------------------------------------------- */}
          <div className="relative h-48 md:h-56 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {allImages.length > 0 ? (
              <>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      idx === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title}${idx > 0 ? ` - ${idx + 1}` : ""}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))}

                {/* Image dots indicator */}
                {hasMultipleImages && isHovered && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                    {allImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex
                            ? "bg-white w-4"
                            : "bg-white/50 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <span className="text-neutral-300 dark:text-neutral-600 text-6xl font-bold">
                  {product.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick view icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Type Badge (top-left) */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-lg shadow-lg"
                style={{
                  backgroundColor: typeColor,
                  boxShadow: `0 4px 14px ${typeColor}40`,
                }}
              >
                {typeLabel}
              </span>
            </div>

            {/* Featured / Bestseller Badges (top-right) */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
              {product.isFeatured && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                  Featured
                </span>
              )}
              {product.isBestseller && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                  <Award className="h-3 w-3" />
                  Bestseller
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                  -{discount}%
                </span>
              </div>
            )}

            {/* Glassmorphism Price Tag (bottom-right, hover reveal) */}
            <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="glass rounded-lg px-3 py-1.5">
                <span className="text-sm font-bold text-white">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------
              Content Section
          --------------------------------------------------------------- */}
          <div className="relative p-5 md:p-6">
            {/* Category */}
            {product.category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1E4DB7] dark:text-blue-400 mb-2 block">
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {product.title}
            </h3>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center gap-0.5">
                  {renderStars(product.averageRating)}
                </div>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {product.averageRating.toFixed(1)}
                </span>
                {product.totalReviews > 0 && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    ({product.totalReviews})
                  </span>
                )}
              </div>
            )}

            {/* Footer: Price + Downloads */}
            <div className="flex items-end justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-baseline gap-2">
                {product.price === 0 ? (
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#6366F1]">
                    Free
                  </span>
                ) : (
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(product.compareAtPrice, product.currency)}
                    </span>
                  )}
              </div>

              {product.downloadCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Download className="h-3.5 w-3.5" />
                  <span>{formatDownloads(product.downloadCount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent line on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            style={{
              background: `linear-gradient(90deg, ${typeColor} 0%, #F59A23 100%)`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;
