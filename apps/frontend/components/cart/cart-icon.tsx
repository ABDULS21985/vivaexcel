"use client";

import { useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useCart } from "@/providers/cart-provider";

// =============================================================================
// Cart Icon
// =============================================================================
// Navbar cart button with animated item count badge.
// Matches the styling of existing navbar action buttons.

export function CartIcon() {
  const { summary, toggleCart } = useCart();
  const controls = useAnimation();
  const prevCountRef = useRef(summary.itemCount);

  // Animate badge when item count changes
  useEffect(() => {
    if (summary.itemCount !== prevCountRef.current && summary.itemCount > 0) {
      controls.start({
        scale: [1, 1.4, 1],
        transition: { type: "spring", stiffness: 500, damping: 15, duration: 0.4 },
      });
    }
    prevCountRef.current = summary.itemCount;
  }, [summary.itemCount, controls]);

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label={`Shopping cart${summary.itemCount > 0 ? `, ${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"}` : ""}`}
    >
      <ShoppingCart className="w-[18px] h-[18px]" />

      <AnimatePresence>
        {summary.itemCount > 0 && (
          <motion.span
            key="cart-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none"
          >
            <motion.span animate={controls}>
              {summary.itemCount > 99 ? "99+" : summary.itemCount}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default CartIcon;
