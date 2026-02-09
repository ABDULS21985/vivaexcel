"use client";

import { useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";
import { Button } from "@ktblog/ui/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import type { CartItem } from "@/providers/cart-provider";

// =============================================================================
// Cart Drawer
// =============================================================================
// Slide-out cart panel using Sheet from @ktblog/ui.
// Shows cart items, subtotal, and checkout CTA.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// Type badge colors to visually distinguish product types
const TYPE_BADGE_COLORS: Record<string, string> = {
  powerpoint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  web_template: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  startup_kit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  solution_template: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  design_system: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  code_template: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  other: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700/30 dark:text-neutral-400",
};

function getTypeBadgeClass(type: string): string {
  return TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.other;
}

function formatTypeLabel(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// -----------------------------------------------------------------------------
// Cart Item Row
// -----------------------------------------------------------------------------

interface CartItemRowProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  isRemoving: boolean;
}

function CartItemRow({ item, onRemove, isRemoving }: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex items-start gap-3 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
    >
      {/* Product image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
        {item.product.featuredImage ? (
          <Image
            src={item.product.featuredImage}
            alt={item.product.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/store/${item.product.slug}`}
          className="text-sm font-medium text-neutral-900 dark:text-white hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors line-clamp-2"
        >
          {item.product.title}
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded",
              getTypeBadgeClass(item.product.type),
            )}
          >
            {formatTypeLabel(item.product.type)}
          </span>
          {item.variant && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {item.variant.name}
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
          {formatPrice(item.unitPrice, item.product.currency)}
        </p>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isRemoving}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0",
          isRemoving && "opacity-50 pointer-events-none",
        )}
        aria-label={`Remove ${item.product.title} from cart`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function CartEmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-[250px]">
        Discover premium digital products crafted to elevate your business.
      </p>
      <Button asChild variant="default" className="gap-2" onClick={onClose}>
        <Link href="/store">
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Cart Drawer Component
// -----------------------------------------------------------------------------

export function CartDrawer() {
  const { items, summary, isLoading, isOpen, closeCart, removeFromCart } = useCart();

  const handleRemove = useCallback(
    async (itemId: string) => {
      try {
        await removeFromCart(itemId);
      } catch {
        // Silently handle -- the item will remain in the list
      }
    },
    [removeFromCart],
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-0 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-lg font-bold text-neutral-900 dark:text-white">
                Shopping Cart
              </SheetTitle>
              {summary.itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#1E4DB7] text-white text-xs font-bold rounded-full">
                  {summary.itemCount}
                </span>
              )}
            </div>
          </div>
          <SheetDescription className="sr-only">
            Your shopping cart items and checkout
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading cart...
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <CartEmptyState onClose={closeCart} />
        ) : (
          <>
            {/* Scrollable item list */}
            <div className="flex-1 overflow-y-auto px-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    isRemoving={false}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-5 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                  {formatPrice(summary.subtotal, summary.currency)}
                </span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Discount
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    -{formatPrice(summary.discountAmount, summary.currency)}
                  </span>
                </div>
              )}

              {/* Checkout button */}
              <Button
                asChild
                className="w-full gap-2 h-12 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 transition-all"
                onClick={closeCart}
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              {/* Continue shopping */}
              <div className="text-center">
                <button
                  onClick={closeCart}
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors underline underline-offset-4"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
