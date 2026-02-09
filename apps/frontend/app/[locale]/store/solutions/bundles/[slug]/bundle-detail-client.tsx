"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, Zap, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import { useRouter } from "@/i18n/routing";
import type { DocumentBundle } from "@/types/solution-document";
import { formatPrice } from "@/lib/solution-document-utils";
import { DocumentCard } from "@/components/store/solutions/document-card";
import { BundleComparison } from "@/components/store/solutions/bundle-comparison";

// =============================================================================
// Types
// =============================================================================

interface BundleDetailClientProps {
  bundle: DocumentBundle;
}

// =============================================================================
// Component
// =============================================================================

export function BundleDetailClient({ bundle }: BundleDetailClientProps) {
  const { addToCart, openCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const individualTotal = bundle.documents.reduce(
    (sum, doc) => sum + doc.price,
    0,
  );
  const savings = individualTotal - bundle.bundlePrice;
  const savingsPercent =
    individualTotal > 0
      ? Math.round((savings / individualTotal) * 100)
      : bundle.savingsPercentage;

  const handleAddToCart = useCallback(async () => {
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

  const handleBuyNow = useCallback(async () => {
    setIsBuying(true);
    try {
      await addToCart(bundle.id);
      router.push("/checkout");
    } catch {
      // Error handled silently
    } finally {
      setIsBuying(false);
    }
  }, [addToCart, bundle.id, router]);

  return (
    <>
      {/* Bundle Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0D2B6B] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#F59A23]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Package className="h-10 w-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {bundle.name}
            </h1>

            {bundle.description && (
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                {bundle.description}
              </p>
            )}

            {/* Savings Badge */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {bundle.documents.length}
                </p>
                <p className="text-sm text-white/60">Documents</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F59A23]">
                  {savingsPercent}%
                </p>
                <p className="text-sm text-white/60">Savings</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {formatPrice(bundle.bundlePrice)}
                </p>
                <p className="text-sm text-white/60">Bundle Price</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleBuyNow}
                disabled={isBuying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#F59A23]/25 disabled:opacity-70"
              >
                {isBuying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Get Bundle - {formatPrice(bundle.bundlePrice)}
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70"
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Included Documents Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Included Documents
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                This bundle includes {bundle.documents.length} premium
                architecture documents
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {bundle.documents.map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bundle Comparison */}
      <section className="py-12 md:py-16 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <BundleComparison bundle={bundle} />
          </div>
        </div>
      </section>
    </>
  );
}

export default BundleDetailClient;
