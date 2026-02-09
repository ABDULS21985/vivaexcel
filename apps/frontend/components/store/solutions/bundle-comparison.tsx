"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight, ShoppingCart, Check, Zap } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import type { DocumentBundle } from "@/types/solution-document";
import { formatPrice } from "@/lib/solution-document-utils";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from "@/types/solution-document";

// =============================================================================
// Types
// =============================================================================

interface BundleComparisonProps {
  bundle: DocumentBundle;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BundleComparison({
  bundle,
  className = "",
}: BundleComparisonProps) {
  const { addToCart, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const individualTotal = bundle.documents.reduce(
    (sum, doc) => sum + doc.price,
    0,
  );
  const savings = individualTotal - bundle.bundlePrice;
  const savingsPercent =
    individualTotal > 0
      ? Math.round((savings / individualTotal) * 100)
      : bundle.savingsPercentage;

  const handleAddBundle = useCallback(async () => {
    setIsAdding(true);
    try {
      await addToCart(bundle.id);
      openCart();
    } catch {
      // Error handled silently
    } finally {
      setIsAdding(false);
    }
  }, [addToCart, bundle.id, openCart]);

  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1E4DB7]/10 dark:bg-blue-400/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-[#1E4DB7] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Bundle Comparison
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Save {savingsPercent}% with this bundle
            </p>
          </div>
        </div>
      </div>

      {/* Individual Documents */}
      <div className="p-6 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          Individual Documents
        </h4>
        {bundle.documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0">
                {DOCUMENT_TYPE_ICONS[doc.documentType] || "📋"}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/store/solutions/${doc.slug || doc.id}`}
                  className="text-sm font-medium text-neutral-900 dark:text-white hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors truncate block"
                >
                  {doc.title}
                </Link>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {DOCUMENT_TYPE_LABELS[doc.documentType] || "Document"}
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex-shrink-0 ml-3">
              {formatPrice(doc.price)}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Individual total
            </span>
            <span className="font-medium text-neutral-600 dark:text-neutral-300 line-through">
              {formatPrice(individualTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Bundle price
            </span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {formatPrice(bundle.bundlePrice)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              You save
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatPrice(savings)}
              </span>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">
                Save {savingsPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 border-t border-neutral-100 dark:border-neutral-800">
        <motion.button
          onClick={handleAddBundle}
          disabled={isAdding}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 disabled:opacity-70"
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Get Bundle - {formatPrice(bundle.bundlePrice)}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default BundleComparison;
