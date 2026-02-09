"use client";

// =============================================================================
// Mobile Cart Experience
// =============================================================================
// Full-screen mobile cart overlay with swipe-to-delete, animated quantity
// controls, coupon support, and sticky checkout bar with glass morphism.
// Designed for touch-first interactions with generous tap targets (48px+).

import {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  type PanInfo,
} from "framer-motion";
import {
  X,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Minus,
  Plus,
  Tag,
  Check,
  AlertCircle,
  Lock,
  Shield,
  Package,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import type { CartItem } from "@/providers/cart-provider";

// =============================================================================
// Constants
// =============================================================================

/** Swipe distance threshold for triggering delete */
const SWIPE_DELETE_THRESHOLD = -80;

/** Spring configurations */
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_BOUNCE = { type: "spring" as const, stiffness: 500, damping: 25 };
const EASE_OUT = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

/** Stagger children configuration for list entrance */
const LIST_STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const LIST_ITEM = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING_SNAPPY },
};

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

// =============================================================================
// Animated Price Display
// =============================================================================

function AnimatedPrice({
  value,
  currency = "USD",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const springValue = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(springValue, (latest) =>
    formatPrice(Math.max(0, latest), currency),
  );
  const [rendered, setRendered] = useState(formatPrice(value, currency));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setRendered(v));
    return unsubscribe;
  }, [display]);

  return <span className={className}>{rendered}</span>;
}

// =============================================================================
// Animated Quantity Number
// =============================================================================

function AnimatedQuantity({
  quantity,
  direction,
}: {
  quantity: number;
  direction: "up" | "down";
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={quantity}
        initial={{ y: direction === "up" ? 12 : -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: direction === "up" ? -12 : 12, opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-block w-8 text-center text-base font-semibold text-gray-900 dark:text-white tabular-nums"
      >
        {quantity}
      </motion.span>
    </AnimatePresence>
  );
}

// =============================================================================
// Swipeable Cart Item
// =============================================================================

interface SwipeableCartItemProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  isRemoving: boolean;
}

function SwipeableCartItem({
  item,
  onRemove,
  onQuantityChange,
  isRemoving,
}: SwipeableCartItemProps) {
  const dragX = useMotionValue(0);
  const deleteOpacity = useTransform(dragX, [-100, -40, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(dragX, [-100, -40, 0], [1, 0.8, 0.6]);
  const [quantityDirection, setQuantityDirection] = useState<"up" | "down">("up");

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < SWIPE_DELETE_THRESHOLD) {
        onRemove(item.id);
      }
    },
    [item.id, onRemove],
  );

  const handleIncrement = useCallback(() => {
    setQuantityDirection("up");
    onQuantityChange(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onQuantityChange]);

  const handleDecrement = useCallback(() => {
    if (item.quantity <= 1) {
      onRemove(item.id);
      return;
    }
    setQuantityDirection("down");
    onQuantityChange(item.id, item.quantity - 1);
  }, [item.id, item.quantity, onQuantityChange, onRemove]);

  return (
    <motion.div
      variants={LIST_ITEM}
      layout="position"
      exit={{
        x: -300,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
      className="relative overflow-hidden rounded-2xl mb-3"
    >
      {/* Delete action behind the card */}
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="absolute inset-0 flex items-center justify-end pr-6 bg-red-500 rounded-2xl"
      >
        <div className="flex flex-col items-center gap-1">
          <Trash2 className="w-6 h-6 text-white" />
          <span className="text-xs font-medium text-white/90">Delete</span>
        </div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className={cn(
          "relative flex items-start gap-3 p-3",
          "bg-white dark:bg-gray-900",
          "border border-gray-100 dark:border-gray-800",
          "rounded-2xl",
          "touch-pan-y",
          isRemoving && "opacity-50 pointer-events-none",
        )}
      >
        {/* Product thumbnail */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {item.product.featuredImage ? (
            <Image
              src={item.product.featuredImage}
              alt={item.product.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E4DB7]/10 to-[#143A8F]/10 dark:from-[#1E4DB7]/20 dark:to-[#143A8F]/20">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>

        {/* Info + controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
          {/* Top: title, variant, price */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {item.product.title}
            </h3>
            {item.variant && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {item.variant.name}
              </p>
            )}
          </div>

          {/* Bottom: price and quantity controls */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(item.unitPrice, item.product.currency)}
            </span>

            {/* Quantity controls */}
            <div className="flex items-center gap-1">
              {/* Decrement / Delete button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                disabled={isRemoving}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl",
                  "bg-gray-100 dark:bg-gray-800",
                  "active:bg-gray-200 dark:active:bg-gray-700",
                  "transition-colors",
                  "min-w-[48px] min-h-[48px]",
                  "-m-1 p-1",
                )}
                aria-label={
                  item.quantity <= 1
                    ? `Remove ${item.product.title}`
                    : `Decrease quantity of ${item.product.title}`
                }
              >
                {item.quantity <= 1 ? (
                  <Trash2 className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </motion.button>

              {/* Quantity display */}
              <div className="overflow-hidden h-6 flex items-center justify-center">
                <AnimatedQuantity
                  quantity={item.quantity}
                  direction={quantityDirection}
                />
              </div>

              {/* Increment button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                disabled={isRemoving}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl",
                  "bg-gray-100 dark:bg-gray-800",
                  "active:bg-gray-200 dark:active:bg-gray-700",
                  "transition-colors",
                  "min-w-[48px] min-h-[48px]",
                  "-m-1 p-1",
                )}
                aria-label={`Increase quantity of ${item.product.title}`}
              >
                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Empty Cart State
// =============================================================================

function MobileCartEmpty({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_BOUNCE, delay: 0.1 }}
      className="flex-1 flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING_BOUNCE, delay: 0.2 }}
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, ...EASE_OUT }}
        className="text-xl font-bold text-gray-900 dark:text-white mb-2"
      >
        Your cart is empty
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...EASE_OUT }}
        className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[260px] leading-relaxed"
      >
        Discover amazing digital products
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ...EASE_OUT }}
      >
        <Link
          href="/store"
          onClick={onClose}
          className={cn(
            "inline-flex items-center gap-2",
            "h-12 px-8 rounded-2xl",
            "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]",
            "text-white font-semibold text-base",
            "shadow-lg shadow-[#1E4DB7]/25",
            "active:scale-[0.98] transition-transform",
          )}
        >
          Browse Store
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Coupon Section
// =============================================================================

function MobileCouponSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [discountDisplay, setDiscountDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApply = useCallback(() => {
    if (!code.trim()) return;
    setStatus("loading");
    // Simulated coupon validation (UI-only)
    setTimeout(() => {
      if (code.toLowerCase() === "save10") {
        setStatus("success");
        setDiscountDisplay("10%");
      } else {
        setStatus("error");
      }
    }, 1200);
  }, [code]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isExpanded]);

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 active:text-[#1E4DB7] dark:active:text-blue-400 transition-colors"
        aria-expanded={isExpanded}
      >
        <Tag className="w-4 h-4" />
        <span className="font-medium">
          {isExpanded ? "Hide coupon" : "Have a coupon?"}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (status !== "idle" && status !== "loading") {
                      setStatus("idle");
                    }
                  }}
                  placeholder="Enter coupon code"
                  className={cn(
                    "w-full h-12 px-4 pr-10 rounded-xl text-sm",
                    "bg-gray-50 dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700",
                    "text-gray-900 dark:text-white",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]",
                    "dark:focus:ring-blue-400/30 dark:focus:border-blue-400",
                    "transition-all",
                    status === "success" &&
                      "border-emerald-500 focus:ring-emerald-500/30",
                    status === "error" &&
                      "border-red-500 focus:ring-red-500/30",
                  )}
                  disabled={status === "loading" || status === "success"}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  aria-label="Coupon code"
                />
                {status === "success" && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
                {status === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={
                  !code.trim() ||
                  status === "loading" ||
                  status === "success"
                }
                className={cn(
                  "h-12 px-5 rounded-xl text-sm font-semibold",
                  "bg-gray-900 dark:bg-white",
                  "text-white dark:text-gray-900",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "active:bg-gray-800 dark:active:bg-gray-100",
                  "transition-colors",
                )}
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Apply"
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Coupon applied! You save {discountDisplay}
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium"
                >
                  Invalid or expired coupon code. Please try again.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Order Summary
// =============================================================================

function OrderSummary({
  subtotal,
  discountAmount,
  total,
  currency,
}: {
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
}) {
  return (
    <div className="px-4 py-3 space-y-2.5">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Subtotal
        </span>
        <AnimatedPrice
          value={subtotal}
          currency={currency}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Discount */}
      <AnimatePresence>
        {discountAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={EASE_OUT}
            className="flex items-center justify-between overflow-hidden"
          >
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Discount
            </span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              -{formatPrice(discountAmount, currency)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Total
        </span>
        <AnimatedPrice
          value={total}
          currency={currency}
          className="text-lg font-bold text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Sticky Checkout Bar
// =============================================================================

function StickyCheckoutBar({
  total,
  currency,
  itemCount,
  onClose,
}: {
  total: number;
  currency: string;
  itemCount: number;
  onClose: () => void;
}) {
  const [hasPulsed, setHasPulsed] = useState(false);

  // Trigger pulse animation when items change
  useEffect(() => {
    if (itemCount > 0) {
      setHasPulsed(true);
      const timer = setTimeout(() => setHasPulsed(false), 600);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0",
        "bg-white/80 dark:bg-gray-950/80",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]",
        "border-t border-gray-100 dark:border-gray-800",
        "pb-[env(safe-area-inset-bottom,0px)]",
        "px-4 pt-4 pb-4",
      )}
    >
      {/* Total display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <AnimatedPrice
          value={total}
          currency={currency}
          className="text-xl font-bold text-gray-900 dark:text-white"
        />
      </div>

      {/* Checkout button */}
      <motion.div
        animate={hasPulsed ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/checkout"
          onClick={onClose}
          className={cn(
            "flex items-center justify-center gap-2",
            "w-full h-14 rounded-2xl",
            "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]",
            "text-white font-semibold text-lg",
            "shadow-lg shadow-[#1E4DB7]/25",
            "active:scale-[0.98] transition-transform",
          )}
        >
          <motion.span
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </motion.span>
        </Link>
      </motion.div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure Checkout</span>
        </div>
        <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Shield className="w-3.5 h-3.5" />
          <span>Money Back</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Loading State
// =============================================================================

function MobileCartLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-10 h-10 border-[2.5px] border-gray-200 dark:border-gray-700 border-t-[#1E4DB7] rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading your cart...
        </p>
      </motion.div>
    </div>
  );
}

// =============================================================================
// Main Component: MobileCart
// =============================================================================

export function MobileCart() {
  const {
    items,
    summary,
    isLoading,
    isOpen,
    closeCart,
    removeFromCart,
    clearCart,
    addToCart,
  } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoized item count for badge
  const itemCount = useMemo(() => summary.itemCount, [summary.itemCount]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Handle item removal
  const handleRemove = useCallback(
    async (itemId: string) => {
      try {
        setRemovingId(itemId);
        await removeFromCart(itemId);
      } catch {
        // Item stays in list on failure
      } finally {
        setRemovingId(null);
      }
    },
    [removeFromCart],
  );

  // Handle quantity change (re-add to adjust; this is UI-side since
  // the cart API only supports add/remove, not quantity updates directly.
  // For now, this updates optimistically via addToCart for increment
  // and removeFromCart for decrement.)
  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      if (newQuantity <= 0) {
        handleRemove(itemId);
        return;
      }

      if (newQuantity > item.quantity) {
        // Increment: add one more
        try {
          await addToCart(item.digitalProductId, item.variantId);
        } catch {
          // Silently fail
        }
      } else {
        // Decrement: remove and re-add is not ideal, so we remove one
        handleRemove(itemId);
      }
    },
    [items, addToCart, handleRemove],
  );

  // Handle clear all
  const handleClearAll = useCallback(async () => {
    try {
      setIsClearing(true);
      await clearCart();
    } catch {
      // Silently fail
    } finally {
      setIsClearing(false);
    }
  }, [clearCart]);

  // Do not render if cart is not open
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed inset-0 z-50",
        "bg-white dark:bg-gray-950",
        "flex flex-col",
        "h-[100dvh]",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* ================================================================== */}
      {/* Header */}
      {/* ================================================================== */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={EASE_OUT}
        className={cn(
          "sticky top-0 z-10",
          "flex items-center justify-between",
          "h-14 px-4",
          "bg-white dark:bg-gray-950",
          "border-b border-gray-100 dark:border-gray-800",
        )}
      >
        {/* Left: close button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={closeCart}
          className={cn(
            "flex items-center justify-center",
            "w-10 h-10 -ml-1 rounded-xl",
            "text-gray-600 dark:text-gray-300",
            "active:bg-gray-100 dark:active:bg-gray-800",
            "transition-colors",
            "min-w-[48px] min-h-[48px]",
          )}
          aria-label="Close cart"
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Center: title + badge */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Cart
          </h1>
          <AnimatePresence mode="wait">
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={SPRING_BOUNCE}
                className={cn(
                  "inline-flex items-center justify-center",
                  "min-w-[24px] h-6 px-2",
                  "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]",
                  "text-white text-xs font-bold rounded-full",
                  "shadow-sm shadow-[#1E4DB7]/30",
                )}
              >
                {itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Right: clear all */}
        {items.length > 0 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            disabled={isClearing}
            className={cn(
              "text-sm font-medium",
              "text-red-500 dark:text-red-400",
              "active:text-red-600 dark:active:text-red-300",
              "disabled:opacity-50",
              "transition-colors",
              "min-w-[48px] min-h-[48px]",
              "flex items-center justify-center",
            )}
            aria-label="Clear all items from cart"
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Clear All"
            )}
          </motion.button>
        ) : (
          <div className="w-10" aria-hidden="true" />
        )}
      </motion.header>

      {/* ================================================================== */}
      {/* Body */}
      {/* ================================================================== */}
      {isLoading ? (
        <MobileCartLoading />
      ) : items.length === 0 ? (
        <MobileCartEmpty onClose={closeCart} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            {/* Cart items */}
            <motion.div
              variants={LIST_STAGGER}
              initial="hidden"
              animate="visible"
              className="px-4 pt-4"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <SwipeableCartItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onQuantityChange={handleQuantityChange}
                    isRemoving={removingId === item.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Coupon section */}
            <MobileCouponSection />

            {/* Order summary */}
            <OrderSummary
              subtotal={summary.subtotal}
              discountAmount={summary.discountAmount}
              total={summary.total}
              currency={summary.currency}
            />

            {/* Bottom spacer to prevent content from hiding behind checkout bar */}
            <div className="h-48" aria-hidden="true" />
          </div>

          {/* Sticky checkout bar */}
          <StickyCheckoutBar
            total={summary.total}
            currency={summary.currency}
            itemCount={summary.itemCount}
            onClose={closeCart}
          />
        </div>
      )}
    </motion.div>
  );
}

export default MobileCart;
