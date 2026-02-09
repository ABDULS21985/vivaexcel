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
  FileText,
  Monitor,
  Layers,
  Package,
  Tag,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import type { DigitalProduct, DigitalProductVariant } from "@/types/digital-product";
import {
  DIGITAL_PRODUCT_TYPE_LABELS,
  DIGITAL_PRODUCT_TYPE_COLORS,
} from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface ProductInfoProps {
  product: DigitalProduct;
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

function formatCount(count: number): string {
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
// Metadata Display
// =============================================================================

interface MetadataItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function getMetadataItems(product: DigitalProduct): MetadataItem[] {
  const items: MetadataItem[] = [];
  const meta = product.metadata || {};

  if (meta.slideCount) {
    items.push({
      icon: <Layers className="h-4 w-4" />,
      label: "Slides",
      value: String(meta.slideCount),
    });
  }

  if (meta.pageCount) {
    items.push({
      icon: <FileText className="h-4 w-4" />,
      label: "Pages",
      value: String(meta.pageCount),
    });
  }

  if (meta.format) {
    items.push({
      icon: <Package className="h-4 w-4" />,
      label: "Format",
      value: String(meta.format),
    });
  }

  if (meta.compatibility) {
    const compat = Array.isArray(meta.compatibility)
      ? (meta.compatibility as string[]).join(", ")
      : String(meta.compatibility);
    items.push({
      icon: <Monitor className="h-4 w-4" />,
      label: "Compatible With",
      value: compat,
    });
  }

  if (meta.fileSize) {
    items.push({
      icon: <Download className="h-4 w-4" />,
      label: "File Size",
      value: String(meta.fileSize),
    });
  }

  return items;
}

// =============================================================================
// Component
// =============================================================================

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] =
    useState<DigitalProductVariant | null>(
      product.variants?.length ? product.variants[0] : null,
    );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant?.id);
      setShowAddedFeedback(true);
      openCart();
      setTimeout(() => setShowAddedFeedback(false), 2000);
    } catch {
      // Error is handled silently; the cart provider logs it
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, product.id, selectedVariant?.id, openCart]);

  const handleBuyNow = useCallback(async () => {
    setIsBuyingNow(true);
    try {
      await addToCart(product.id, selectedVariant?.id);
      router.push("/checkout");
    } catch {
      // Error is handled silently
    } finally {
      setIsBuyingNow(false);
    }
  }, [addToCart, product.id, selectedVariant?.id, router]);

  const typeLabel = DIGITAL_PRODUCT_TYPE_LABELS[product.type] || "Product";
  const typeColor = DIGITAL_PRODUCT_TYPE_COLORS[product.type] || "#1E4DB7";

  const activePrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const discount = product.compareAtPrice
    ? getDiscountPercentage(activePrice, product.compareAtPrice)
    : 0;

  const metadataItems = getMetadataItems(product);

  return (
    <div className="space-y-6">
      {/* Type Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg"
          style={{
            backgroundColor: typeColor,
          }}
        >
          <Tag className="h-3 w-3" />
          {typeLabel}
        </span>

        {product.isFeatured && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] text-white text-xs font-bold uppercase tracking-wider rounded-lg">
            Featured
          </span>
        )}

        {product.isBestseller && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg">
            Bestseller
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
        {product.title}
      </h1>

      {/* Rating, Downloads, Views */}
      <div className="flex items-center gap-4 flex-wrap">
        {product.averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {product.averageRating.toFixed(1)}
            </span>
            {product.totalReviews > 0 && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                ({product.totalReviews} {product.totalReviews === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        )}

        {product.downloadCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Download className="h-4 w-4" />
            <span>{formatCount(product.downloadCount)} downloads</span>
          </div>
        )}

        {product.viewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Eye className="h-4 w-4" />
            <span>{formatCount(product.viewCount)} views</span>
          </div>
        )}
      </div>

      {/* Creator */}
      {product.creator && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            By
          </span>
          <div className="flex items-center gap-2">
            {product.creator.avatar ? (
              <img
                src={product.creator.avatar}
                alt={product.creator.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-[10px] font-bold">
                {product.creator.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {product.creator.name}
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            {formatPrice(activePrice, product.currency)}
          </span>
          {product.compareAtPrice &&
            product.compareAtPrice > activePrice && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg">
              Save {discount}%
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      {product.variants && product.variants.length > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Choose a plan
          </label>
          <div className="grid gap-2">
            {[...product.variants]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <motion.button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-[#1E4DB7] bg-[#1E4DB7]"
                              : "border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`font-semibold ${
                            isSelected
                              ? "text-[#1E4DB7] dark:text-blue-400"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {variant.name}
                        </span>
                      </div>
                      {variant.features && variant.features.length > 0 && (
                        <ul className="mt-2 ml-7 space-y-1">
                          {variant.features.map((feature, i) => (
                            <li
                              key={i}
                              className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5"
                            >
                              <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white ml-4">
                      {formatPrice(variant.price, product.currency)}
                    </span>
                  </motion.button>
                );
              })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          whileHover={{ scale: isAddingToCart ? 1 : 1.02 }}
          whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
          className="relative flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
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

      {/* Metadata */}
      {metadataItems.length > 0 && (
        <div className="space-y-3">
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {metadataItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl"
                >
                  <div className="text-[#1E4DB7] dark:text-blue-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {product.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/store?tag=${tag.slug}`}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-full transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
