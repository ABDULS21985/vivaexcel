"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Download,
  TrendingUp,
  Award,
  Layers,
  ShoppingCart,
  Eye,
  Monitor,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import type { Presentation } from "@/types/presentation";
import {
  INDUSTRY_LABELS,
  INDUSTRY_COLORS,
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_TYPE_COLORS,
  ASPECT_RATIO_LABELS,
} from "@/types/presentation";
import {
  formatPrice,
  formatDownloads,
  getDiscountPercentage,
  getSoftwareIconLetter,
  getSoftwareInfo,
} from "@/lib/presentation-utils";

// =============================================================================
// Types
// =============================================================================

interface PresentationCardProps {
  presentation: Presentation;
  index?: number;
  className?: string;
}

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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function PresentationCard({
  presentation,
  index = 0,
  className = "",
}: PresentationCardProps) {
  const { addToCart, openCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const typeLabel =
    PRESENTATION_TYPE_LABELS[presentation.presentationType] || "Presentation";
  const typeColor =
    PRESENTATION_TYPE_COLORS[presentation.presentationType] || "#1E4DB7";
  const industryLabel = INDUSTRY_LABELS[presentation.industry] || "General";
  const industryColor = INDUSTRY_COLORS[presentation.industry] || "#6B7280";
  const discount = presentation.compareAtPrice
    ? getDiscountPercentage(presentation.price, presentation.compareAtPrice)
    : 0;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAddingToCart(true);
      try {
        await addToCart(presentation.id);
        openCart();
      } catch {
        // Error handled silently
      } finally {
        setIsAddingToCart(false);
      }
    },
    [addToCart, presentation.id, openCart],
  );

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`group ${className}`}
    >
      <Link
        href={`/presentations/${presentation.slug || presentation.id}`}
        className="block h-full"
      >
        <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500">
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{ backgroundColor: `${typeColor}20` }}
          />

          {/* Image Section */}
          <div className="relative h-48 md:h-52 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {presentation.featuredImage ? (
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={presentation.featuredImage}
                  alt={presentation.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <span className="text-neutral-300 dark:text-neutral-600 text-6xl font-bold">
                  {presentation.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Hover overlay with Quick Preview & Add to Cart */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                  <Eye className="h-3.5 w-3.5" />
                  Quick Preview
                </span>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-70"
                >
                  {isAddingToCart ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  )}
                  Add to Cart
                </motion.button>
              </div>
            </div>

            {/* Slide Count Badge (top-left) */}
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                <Layers className="h-3 w-3" />
                {presentation.slideCount} Slides
              </span>
            </div>

            {/* Badges (top-right) */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
              {presentation.isFeatured && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                  Featured
                </span>
              )}
              {presentation.isBestseller && (
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

            {/* Aspect Ratio indicator (bottom-right) */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg">
                {presentation.aspectRatio}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-5 md:p-6">
            {/* Type + Industry Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded-md"
                style={{
                  backgroundColor: typeColor,
                }}
              >
                {typeLabel}
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md"
                style={{
                  backgroundColor: `${industryColor}15`,
                  color: industryColor,
                }}
              >
                {industryLabel}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {presentation.title}
            </h3>

            {/* Short Description */}
            {presentation.shortDescription && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                {presentation.shortDescription}
              </p>
            )}

            {/* Software Compatibility Icons */}
            {presentation.compatibility.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                {presentation.compatibility.slice(0, 4).map((sw) => {
                  const info = getSoftwareInfo(sw);
                  const letter = getSoftwareIconLetter(sw);
                  return (
                    <div
                      key={sw}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: info.color }}
                      title={info.name}
                    >
                      {letter}
                    </div>
                  );
                })}
                {presentation.compatibility.length > 4 && (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                    +{presentation.compatibility.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Rating */}
            {presentation.averageRating > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center gap-0.5">
                  {renderStars(presentation.averageRating)}
                </div>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {presentation.averageRating.toFixed(1)}
                </span>
                {presentation.totalReviews > 0 && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    ({presentation.totalReviews})
                  </span>
                )}
              </div>
            )}

            {/* Footer: Price + Downloads */}
            <div className="flex items-end justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                  {formatPrice(presentation.price, presentation.currency)}
                </span>
                {presentation.compareAtPrice &&
                  presentation.compareAtPrice > presentation.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(
                        presentation.compareAtPrice,
                        presentation.currency,
                      )}
                    </span>
                  )}
              </div>

              {/* Downloads */}
              {presentation.downloadCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Download className="h-3.5 w-3.5" />
                  <span>{formatDownloads(presentation.downloadCount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            style={{
              background: `linear-gradient(90deg, ${typeColor} 0%, #F59A23 100%)`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default PresentationCard;
