"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUp, ShoppingCart } from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";

// =============================================================================
// Types
// =============================================================================

interface FloatingElementsProps {
  product: {
    title: string;
    price: number;
    currency: string;
    featuredImage?: string | null;
    id: string;
  };
  selectedVariantId?: string;
}

// =============================================================================
// Helpers
// =============================================================================

// =============================================================================
// Component
// =============================================================================

export function FloatingElements({
  product,
  selectedVariantId,
}: FloatingElementsProps) {
  const { addToCart, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // -------------------------------------------------------------------------
  // Scroll tracking
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      setScrollY(currentY);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(currentY / docHeight, 1));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariantId);
      openCart();
    } catch {
      // Silently handled
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, product.id, selectedVariantId, openCart]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showCartBar = scrollY > 600;
  const showBackToTop = scrollY > 300;
  const showProgress = scrollY > 0;

  return (
    <>
      {/* Reading Progress Bar */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] h-[3px]"
          >
            <div
              className="h-full bg-gradient-to-r from-[#1E4DB7] via-[#F59A23] to-[#E86A1D] transition-[width] duration-150 ease-out"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Bar - Mobile */}
      <AnimatePresence>
        {showCartBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90] lg:hidden"
          >
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-700 px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                {product.featuredImage && (
                  <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}

                {/* Name & Price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-xs font-bold text-[#1E4DB7] dark:text-blue-400">
                    {formatPrice(convertPrice(product.price), currency)}
                  </p>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Bar - Desktop */}
      <AnimatePresence>
        {showCartBar && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[90] hidden lg:block"
          >
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                {product.featuredImage && (
                  <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}

                {/* Name & Price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-xs font-bold text-[#1E4DB7] dark:text-blue-400">
                    {formatPrice(convertPrice(product.price), currency)}
                  </p>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 z-[80] lg:bottom-24 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-xl text-neutral-700 dark:text-neutral-300 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default FloatingElements;
