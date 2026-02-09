"use client";

import { motion } from "framer-motion";
import { Package, Check, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductPricingDisplay } from "./product-pricing-display";

// =============================================================================
// Types
// =============================================================================

export interface BundleDeal {
  id: string;
  name: string;
  description?: string;
  discountPercent: number;
  originalTotal: number;
  bundlePrice: number;
  currency?: string;
  products: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
  }>;
  badgeText?: string;
}

interface BundleDealCardProps {
  bundle: BundleDeal;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BundleDealCard({ bundle, className = "" }: BundleDealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-shadow group ${className}`}
    >
      {/* Badge */}
      {bundle.badgeText && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-purple-600/30">
            <Package className="h-3 w-3" />
            {bundle.badgeText}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Bundle Deal
          </span>
        </div>

        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 line-clamp-2">
          {bundle.name}
        </h3>

        {bundle.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
            {bundle.description}
          </p>
        )}
      </div>

      {/* Products list */}
      <div className="px-5 py-3">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          Includes {bundle.products.length} items
        </p>
        <ul className="space-y-1.5">
          {bundle.products.slice(0, 4).map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{product.name}</span>
            </li>
          ))}
          {bundle.products.length > 4 && (
            <li className="text-xs text-neutral-400 dark:text-neutral-500 pl-5">
              +{bundle.products.length - 4} more items
            </li>
          )}
        </ul>
      </div>

      {/* Pricing */}
      <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800">
        <ProductPricingDisplay
          pricing={{
            originalPrice: bundle.originalTotal,
            salePrice: bundle.bundlePrice,
            discountPercent: bundle.discountPercent,
            currency: bundle.currency,
            promotionType: "bundle",
          }}
          size="md"
        />
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href={`/store/deals?bundle=${bundle.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-xl transition-all group-hover:shadow-md"
        >
          View Bundle
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export default BundleDealCard;
