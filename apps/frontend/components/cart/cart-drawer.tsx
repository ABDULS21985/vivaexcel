"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Tag,
  Sparkles,
  Plus,
  Check,
  AlertCircle,
  Gift,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Input } from "@ktblog/ui/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import type { CartItem } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useAnnouncer, LiveRegion } from "@/components/ui/accessibility";

// =============================================================================
// Premium Cart Drawer
// =============================================================================
// Full-featured slide-out cart with glassmorphism, spring animations,
// animated pricing, coupon support, cross-sell cards, and progress incentive.

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PREMIUM_THRESHOLD = 99;

const SPRING_CONFIG = { stiffness: 400, damping: 30, mass: 0.8 };
const SPRING_BOUNCE = { type: "spring" as const, stiffness: 500, damping: 25, mass: 0.6 };
const EASE_OUT = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

// Mock data for cross-sell and recently viewed (UI only)
const CROSS_SELL_PRODUCTS = [
  {
    id: "cs-1",
    title: "Premium Dashboard Kit",
    price: 29,
    currency: "USD",
    image: null,
    type: "web_template",
  },
  {
    id: "cs-2",
    title: "Startup Pitch Deck Pro",
    price: 19,
    currency: "USD",
    image: null,
    type: "powerpoint",
  },
];

const RECENTLY_VIEWED_PRODUCTS = [
  {
    id: "rv-1",
    title: "Financial Model Suite",
    price: 49,
    currency: "USD",
    image: null,
    type: "document",
  },
  {
    id: "rv-2",
    title: "Brand Identity System",
    price: 39,
    currency: "USD",
    image: null,
    type: "design_system",
  },
  {
    id: "rv-3",
    title: "SaaS Landing Template",
    price: 24,
    currency: "USD",
    image: null,
    type: "web_template",
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const TYPE_BADGE_COLORS: Record<string, string> = {
  powerpoint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  web_template:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  startup_kit:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  solution_template:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  design_system:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  code_template:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  other:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-700/30 dark:text-neutral-400",
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
// Animated Number Display
// -----------------------------------------------------------------------------

function AnimatedPrice({
  value,
  currency: currencyProp,
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const { currency: activeCurrency, convertPrice } = useCurrency();
  const { formatPrice: fmtPrice } = useFormat();
  const displayCurrency = currencyProp || activeCurrency;
  const convertedValue = convertPrice(value);

  const springValue = useSpring(convertedValue, { stiffness: 100, damping: 20 });
  const display = useTransform(springValue, (latest) =>
    fmtPrice(Math.max(0, latest), displayCurrency),
  );
  const [rendered, setRendered] = useState(fmtPrice(convertedValue, displayCurrency));

  useEffect(() => {
    springValue.set(convertedValue);
  }, [convertedValue, springValue]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setRendered(v));
    return unsubscribe;
  }, [display]);

  return <span className={className}>{rendered}</span>;
}

// -----------------------------------------------------------------------------
// Animated Count Badge
// -----------------------------------------------------------------------------

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence mode="wait">
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={SPRING_BOUNCE}
          className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] text-white text-xs font-bold rounded-full shadow-md shadow-[#1E4DB7]/30"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Progress Incentive Bar
// -----------------------------------------------------------------------------

function ProgressIncentive({ total }: { total: number }) {
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const progress = Math.min((total / PREMIUM_THRESHOLD) * 100, 100);
  const remaining = Math.max(PREMIUM_THRESHOLD - total, 0);
  const isComplete = total >= PREMIUM_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={EASE_OUT}
      className="mx-5 mt-4 mb-1 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/40 p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-[#1E4DB7] dark:text-blue-400" />
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {isComplete ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              Premium Support unlocked!
            </span>
          ) : (
            <>
              Unlock Premium Support at{" "}
              <span className="text-[#1E4DB7] dark:text-blue-400">
                {formatPrice(convertPrice(PREMIUM_THRESHOLD), currency)}
              </span>
              !
            </>
          )}
        </p>
      </div>
      <div className="relative h-2 w-full rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-[#1E4DB7] to-[#6366F1]",
          )}
        />
      </div>
      {!isComplete && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
          Add <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatPrice(convertPrice(remaining), currency)}</span> more to qualify
        </p>
      )}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Cart Item Row (Premium)
// -----------------------------------------------------------------------------

interface CartItemRowProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  isRemoving: boolean;
}

function CartItemRow({ item, onRemove, isRemoving }: CartItemRowProps) {
  const t = useTranslations("cart");
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: -80,
        scale: 0.95,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
      transition={SPRING_CONFIG}
      className="group relative flex items-start gap-3.5 py-4 border-b border-neutral-100/80 dark:border-neutral-800/80 last:border-0"
    >
      {/* Product thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
        {item.product.featuredImage ? (
          <Image
            src={item.product.featuredImage}
            alt={item.product.title}
            fill
            sizes="56px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
            <ShoppingBag className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 pe-8">
        <Link
          href={`/store/${item.product.slug}`}
          className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors line-clamp-1"
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
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {item.variant.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            {formatPrice(convertPrice(item.unitPrice), currency)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item.id)}
        disabled={isRemoving}
        className={cn(
          "absolute top-4 right-0 flex items-center justify-center w-8 h-8 rounded-lg",
          "text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20",
          "transition-colors duration-200 flex-shrink-0",
          "opacity-0 group-hover:opacity-100 sm:opacity-60 sm:group-hover:opacity-100",
          isRemoving && "opacity-50 pointer-events-none",
        )}
        aria-label={t("removeItem", { title: item.product.title })}
      >
        {isRemoving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Empty Cart SVG Illustration
// -----------------------------------------------------------------------------

function EmptyCartIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Bag body */}
      <rect
        x="25"
        y="42"
        width="70"
        height="60"
        rx="8"
        className="fill-neutral-100 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-600"
        strokeWidth="2"
      />
      {/* Bag flap */}
      <path
        d="M25 50C25 45.5817 28.5817 42 33 42H87C91.4183 42 95 45.5817 95 50V56H25V50Z"
        className="fill-neutral-200 dark:fill-neutral-700"
      />
      {/* Handle left */}
      <path
        d="M42 42V30C42 24.4772 46.4772 20 52 20H68C73.5228 20 78 24.4772 78 30V42"
        className="stroke-neutral-300 dark:stroke-neutral-600"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dashed line in middle (empty feel) */}
      <line
        x1="42"
        y1="72"
        x2="78"
        y2="72"
        className="stroke-neutral-300 dark:stroke-neutral-600"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <line
        x1="48"
        y1="82"
        x2="72"
        y2="82"
        className="stroke-neutral-200 dark:stroke-neutral-700"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      {/* Sparkle top-right */}
      <circle cx="92" cy="28" r="3" className="fill-[#1E4DB7] dark:fill-blue-400" opacity="0.5" />
      <circle cx="100" cy="38" r="2" className="fill-[#F59A23]" opacity="0.4" />
      <circle cx="22" cy="36" r="2.5" className="fill-[#6366F1]" opacity="0.3" />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Recently Viewed Card (for empty state)
// -----------------------------------------------------------------------------

function RecentlyViewedCard({
  product,
}: {
  product: (typeof RECENTLY_VIEWED_PRODUCTS)[0];
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
        <ShoppingBag className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {product.title}
        </p>
        <p className="text-xs font-semibold text-[#1E4DB7] dark:text-blue-400">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State (Premium)
// -----------------------------------------------------------------------------

function CartEmptyState({ onClose }: { onClose: () => void }) {
  const tCart = useTranslations("cart");
  const tStore = useTranslations("store");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={EASE_OUT}
      className="flex-1 flex flex-col px-6 py-8 overflow-y-auto"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING_BOUNCE, delay: 0.1 }}
        >
          <EmptyCartIllustration />
        </motion.div>

        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-6 mb-1.5">
          {tCart("empty")}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-[260px] leading-relaxed">
          {tCart("emptyDescription")}
        </p>

        <Button
          asChild
          className="gap-2 h-11 px-8 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 transition-all"
          onClick={onClose}
        >
          <Link href="/store">
            {tStore("cta.browseStore")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Recently Viewed Section */}
      <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#F59A23]" />
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {tCart("recentlyViewed")}
          </h4>
        </div>
        <div className="space-y-2">
          {RECENTLY_VIEWED_PRODUCTS.map((product) => (
            <RecentlyViewedCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Coupon Input Section
// -----------------------------------------------------------------------------

function CouponSection() {
  const t = useTranslations("cart");
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApply = useCallback(() => {
    if (!code.trim()) return;
    setStatus("loading");
    // Simulate coupon validation (UI only)
    setTimeout(() => {
      setStatus(code.toLowerCase() === "save10" ? "success" : "error");
    }, 1200);
  }, [code]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>{isOpen ? t("coupon.remove") : t("coupon.label")}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-2.5">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (status !== "idle" && status !== "loading") setStatus("idle");
                  }}
                  placeholder={t("coupon.placeholder")}
                  aria-label="Coupon code"
                  className={cn(
                    "h-9 text-sm rounded-lg pr-8",
                    status === "success" && "border-emerald-500 focus-visible:ring-emerald-500",
                    status === "error" && "border-red-500 focus-visible:ring-red-500",
                  )}
                  disabled={status === "loading" || status === "success"}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                />
                {status === "success" && (
                  <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
                {status === "error" && (
                  <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              <Button
                onClick={handleApply}
                disabled={!code.trim() || status === "loading" || status === "success"}
                className="h-9 px-4 text-sm rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("coupon.apply")
                )}
              </Button>
            </div>

            <AnimatePresence>
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium"
                >
                  {t("coupon.applied")}
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium"
                >
                  {t("coupon.invalid")}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Cross-Sell Card
// -----------------------------------------------------------------------------

function CrossSellCard({
  product,
}: {
  product: (typeof CROSS_SELL_PRODUCTS)[0];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={EASE_OUT}
      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
    >
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center flex-shrink-0">
        <ShoppingBag className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {product.title}
        </p>
        <p className="text-xs font-bold text-[#1E4DB7] dark:text-blue-400">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E4DB7]/10 dark:bg-blue-500/10 text-[#1E4DB7] dark:text-blue-400 hover:bg-[#1E4DB7]/20 dark:hover:bg-blue-500/20 transition-colors flex-shrink-0"
        aria-label={`Add ${product.title} to cart`}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Savings Badge
// -----------------------------------------------------------------------------

function SavingsBadge({ amount, currency }: { amount: number; currency: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_BOUNCE}
      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 border border-emerald-200/60 dark:border-emerald-800/40"
    >
      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        You&apos;re saving {formatPrice(amount, currency)}!
      </span>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Shimmer Button
// -----------------------------------------------------------------------------

function ShimmerButton({
  children,
  className,
  isLoading,
  ...props
}: React.ComponentProps<typeof Button> & { isLoading?: boolean }) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        className,
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
      {/* CSS shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s ease-in-out infinite",
        }}
      />
    </Button>
  );
}

// -----------------------------------------------------------------------------
// Cart Drawer Component (Premium)
// -----------------------------------------------------------------------------

export function CartDrawer() {
  const tCart = useTranslations("cart");
  const tStore = useTranslations("store");
  const { formatPrice: fmtPrice } = useFormat();
  const { items, summary, isLoading, isOpen, closeCart, removeFromCart } =
    useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { announcement, announce } = useAnnouncer();

  const handleRemove = useCallback(
    async (itemId: string) => {
      const removedItem = items.find((i) => i.id === itemId);
      try {
        setRemovingId(itemId);
        await removeFromCart(itemId);
        if (removedItem) {
          announce(`${removedItem.product.title} removed from cart`);
        }
      } catch {
        // Item remains in list on failure
      } finally {
        setRemovingId(null);
      }
    },
    [removeFromCart, items, announce],
  );

  const handleCheckoutClick = useCallback(() => {
    setIsCheckingOut(true);
    // Allow navigation to proceed, reset after a beat
    setTimeout(() => setIsCheckingOut(false), 2000);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <LiveRegion>{announcement}</LiveRegion>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col w-full sm:max-w-[420px] p-0 border-l",
          "bg-white/95 dark:bg-neutral-950/95",
          "backdrop-blur-xl backdrop-saturate-150",
          "border-neutral-200/60 dark:border-neutral-800/60",
          "shadow-2xl shadow-black/10 dark:shadow-black/40",
        )}
      >
        {/* --- Shimmer keyframes injected inline --- */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {/* Inner content with spring entrance */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className="flex flex-col h-full"
        >
          {/* ============ HEADER ============ */}
          <SheetHeader className="px-5 py-4 border-b border-neutral-100/80 dark:border-neutral-800/80 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-lg font-bold text-neutral-900 dark:text-white">
                  {tCart("drawerTitle")}
                </SheetTitle>
                <CountBadge count={summary.itemCount} />
              </div>
            </div>
            <SheetDescription className="sr-only">
              Your shopping cart items and checkout
            </SheetDescription>
          </SheetHeader>

          {/* ============ BODY ============ */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 border-[2.5px] border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Loading your cart...
                </p>
              </motion.div>
            </div>
          ) : items.length === 0 ? (
            <CartEmptyState onClose={closeCart} />
          ) : (
            <>
              {/* Progress incentive */}
              <ProgressIncentive total={summary.total} />

              {/* Scrollable item list */}
              <div className="flex-1 overflow-y-auto px-5 mt-2 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      isRemoving={removingId === item.id}
                    />
                  ))}
                </AnimatePresence>

                {/* Cross-sell section */}
                <div className="mt-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#F59A23]" />
                    <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {tCart("youMightAlsoLike")}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {CROSS_SELL_PRODUCTS.map((product) => (
                      <CrossSellCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>

              {/* ============ FOOTER / SUMMARY ============ */}
              <div className="border-t border-neutral-100/80 dark:border-neutral-800/80 px-5 py-4 space-y-3 flex-shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
                {/* Coupon */}
                <CouponSection />

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {tCart("subtotal")}
                  </span>
                  <AnimatedPrice
                    value={summary.subtotal}
                    currency={summary.currency}
                    className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  />
                </div>

                {/* Discount */}
                <AnimatePresence>
                  {summary.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={EASE_OUT}
                      className="flex items-center justify-between overflow-hidden"
                    >
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        {tCart("discount")}
                      </span>
                      <AnimatedPrice
                        value={-summary.discountAmount}
                        currency={summary.currency}
                        className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-neutral-900 dark:text-white">
                    {tCart("total")}
                  </span>
                  <AnimatedPrice
                    value={summary.total}
                    currency={summary.currency}
                    className="text-xl font-bold text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Savings badge */}
                <AnimatePresence>
                  {summary.discountAmount > 0 && (
                    <SavingsBadge
                      amount={summary.discountAmount}
                      currency={summary.currency}
                    />
                  )}
                </AnimatePresence>

                {/* Checkout CTA */}
                <ShimmerButton
                  asChild
                  isLoading={isCheckingOut}
                  className="w-full gap-2 h-12 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 transition-all text-base"
                  onClick={() => {
                    handleCheckoutClick();
                    closeCart();
                  }}
                >
                  <Link href="/checkout">
                    {tCart("proceedToCheckout")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </ShimmerButton>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-1.5 h-10 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  {tStore("cta.continueShopping")}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
