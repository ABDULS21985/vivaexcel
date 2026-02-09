"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import {
  Star,
  Download,
  Eye,
  ShoppingCart,
  Zap,
  Check,
  Layers,
  Monitor,
  FileText,
  HardDrive,
  Tag,
} from "lucide-react";
import type { Presentation } from "@/types/presentation";
import {
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_TYPE_COLORS,
  INDUSTRY_LABELS,
  INDUSTRY_COLORS,
  ASPECT_RATIO_LABELS,
} from "@/types/presentation";
import {
  formatPrice,
  formatDownloads,
  getDiscountPercentage,
  formatFileSize,
  formatSlideCount,
} from "@/lib/presentation-utils";
import { CompatibilityBadges } from "./compatibility-badges";
import { SlideCountBadge } from "./slide-count-badge";
import { PresentationFeatures } from "./presentation-features";

// =============================================================================
// Types
// =============================================================================

interface PresentationInfoProps {
  presentation: Presentation;
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
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 text-neutral-300 dark:text-neutral-600"
        />,
      );
    }
  }

  return stars;
}

// =============================================================================
// Component
// =============================================================================

export function PresentationInfo({ presentation }: PresentationInfoProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(presentation.id);
      setShowAddedFeedback(true);
      openCart();
      setTimeout(() => setShowAddedFeedback(false), 2000);
    } catch {
      // Error handled silently
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, presentation.id, openCart]);

  const handleBuyNow = useCallback(async () => {
    setIsBuyingNow(true);
    try {
      await addToCart(presentation.id);
      router.push("/checkout");
    } catch {
      // Error handled silently
    } finally {
      setIsBuyingNow(false);
    }
  }, [addToCart, presentation.id, router]);

  const typeLabel =
    PRESENTATION_TYPE_LABELS[presentation.presentationType] || "Presentation";
  const typeColor =
    PRESENTATION_TYPE_COLORS[presentation.presentationType] || "#1E4DB7";
  const industryLabel = INDUSTRY_LABELS[presentation.industry] || "General";
  const industryColor = INDUSTRY_COLORS[presentation.industry] || "#6B7280";
  const discount = presentation.compareAtPrice
    ? getDiscountPercentage(presentation.price, presentation.compareAtPrice)
    : 0;

  return (
    <div className="space-y-6">
      {/* Type + Industry Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg"
          style={{ backgroundColor: typeColor }}
        >
          <Tag className="h-3 w-3" />
          {typeLabel}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg"
          style={{
            backgroundColor: `${industryColor}15`,
            color: industryColor,
          }}
        >
          {industryLabel}
        </span>

        {presentation.isFeatured && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] text-white text-xs font-bold uppercase tracking-wider rounded-lg">
            Featured
          </span>
        )}

        {presentation.isBestseller && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg">
            Bestseller
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
        {presentation.title}
      </h1>

      {/* Rating, Downloads, Views */}
      <div className="flex items-center gap-4 flex-wrap">
        {presentation.averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(presentation.averageRating)}
            </div>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {presentation.averageRating.toFixed(1)}
            </span>
            {presentation.totalReviews > 0 && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                ({presentation.totalReviews}{" "}
                {presentation.totalReviews === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        )}

        {presentation.downloadCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Download className="h-4 w-4" />
            <span>{formatDownloads(presentation.downloadCount)} downloads</span>
          </div>
        )}

        {presentation.viewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Eye className="h-4 w-4" />
            <span>{formatDownloads(presentation.viewCount)} views</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            {formatPrice(presentation.price, presentation.currency)}
          </span>
          {presentation.compareAtPrice &&
            presentation.compareAtPrice > presentation.price && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(
                  presentation.compareAtPrice,
                  presentation.currency,
                )}
              </span>
            )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg">
              Save {discount}%
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          whileHover={{ scale: isAddingToCart ? 1 : 1.02 }}
          whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
          className="relative flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#D24726] to-[#B73D20] hover:from-[#B73D20] hover:to-[#D24726] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#D24726]/25 hover:shadow-xl hover:shadow-[#D24726]/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isAddingToCart ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </motion.span>
            ) : showAddedFeedback ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          whileHover={{ scale: isBuyingNow ? 1 : 1.02 }}
          whileTap={{ scale: isBuyingNow ? 1 : 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#F59A23]/25 hover:shadow-xl hover:shadow-[#F59A23]/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isBuyingNow ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Buy Now
            </>
          )}
        </motion.button>
      </div>

      {/* Slide Count Badge */}
      <SlideCountBadge count={presentation.slideCount} />

      {/* Compatibility Badges */}
      {presentation.compatibility.length > 0 && (
        <div className="space-y-3">
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              Compatible With
            </h3>
            <CompatibilityBadges compatibility={presentation.compatibility} />
          </div>
        </div>
      )}

      {/* Product Details Grid */}
      <div className="space-y-3">
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Template Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="text-[#D24726] dark:text-orange-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Slides
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {presentation.slideCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="text-[#D24726] dark:text-orange-400">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Aspect Ratio
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {ASPECT_RATIO_LABELS[presentation.aspectRatio] ||
                    presentation.aspectRatio}
                </p>
              </div>
            </div>

            {presentation.fileFormats.length > 0 && (
              <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="text-[#D24726] dark:text-orange-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Formats
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {presentation.fileFormats
                      .map((f) => f.toUpperCase())
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}

            {presentation.fileSize && presentation.fileSize > 0 && (
              <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="text-[#D24726] dark:text-orange-400">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    File Size
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {formatFileSize(presentation.fileSize)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Checklist */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <PresentationFeatures presentation={presentation} />
      </div>

      {/* Tags */}
      {presentation.tags && presentation.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {presentation.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PresentationInfo;
