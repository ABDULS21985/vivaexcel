"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShoppingCart, Check, AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import { useFormat } from "@/hooks/use-format";

// =============================================================================
// Add to Cart Button
// =============================================================================
// Premium add-to-cart button with morph states (default -> loading -> success/error)
// and an optional fly-to-cart animation that launches a product thumbnail toward
// the cart icon in the top-right corner of the viewport.

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ButtonState = "idle" | "loading" | "success" | "error";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  productTitle: string;
  productImage?: string | null;
  price: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  showFlyAnimation?: boolean;
  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Fly Animation Portal
// -----------------------------------------------------------------------------

interface FlyingThumbnailProps {
  productImage?: string | null;
  startRect: DOMRect;
  onComplete: () => void;
}

function FlyingThumbnail({ productImage, startRect, onComplete }: FlyingThumbnailProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Force a reflow so the browser registers the initial position before
    // we apply the transition class.
    void el.offsetHeight;

    el.classList.add("add-to-cart-fly--active");

    const handleEnd = () => {
      onComplete();
    };

    el.addEventListener("animationend", handleEnd, { once: true });
    // Safety cleanup in case the event never fires
    const timer = setTimeout(handleEnd, 700);

    return () => {
      el.removeEventListener("animationend", handleEnd);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return createPortal(
    <>
      {/* Scoped keyframes injected once */}
      <style>{`
        @keyframes flyToCart {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          70% {
            opacity: 1;
            transform: translate(
              calc(100vw - ${startRect.left + startRect.width / 2}px - 40px),
              calc(-${startRect.top + startRect.height / 2}px + 32px)
            ) scale(0.4);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(100vw - ${startRect.left + startRect.width / 2}px - 40px),
              calc(-${startRect.top + startRect.height / 2}px + 32px)
            ) scale(0.3);
          }
        }
        .add-to-cart-fly--active {
          animation: flyToCart 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div
        ref={elRef}
        className="fixed z-[9999] pointer-events-none rounded-xl shadow-2xl overflow-hidden"
        style={{
          top: startRect.top + startRect.height / 2 - 24,
          left: startRect.left + startRect.width / 2 - 24,
          width: 48,
          height: 48,
        }}
      >
        {productImage ? (
          <Image
            src={productImage}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#1E4DB7] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

// -----------------------------------------------------------------------------
// Size & Variant Maps
// -----------------------------------------------------------------------------

const SIZE_CLASSES: Record<NonNullable<AddToCartButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2.5",
};

const ICON_SIZES: Record<NonNullable<AddToCartButtonProps["size"]>, string> = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
};

function getVariantClasses(
  variant: NonNullable<AddToCartButtonProps["variant"]>,
  state: ButtonState,
): string {
  // Success & error override variant colors
  if (state === "success") {
    return "bg-emerald-500 dark:bg-emerald-600 text-white border-transparent";
  }
  if (state === "error") {
    return "bg-red-500 dark:bg-red-600 text-white border-transparent";
  }

  switch (variant) {
    case "primary":
      return "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] text-white border-transparent shadow-lg shadow-[#1E4DB7]/20 hover:shadow-xl hover:shadow-[#1E4DB7]/30";
    case "secondary":
      return "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent hover:bg-neutral-800 dark:hover:bg-neutral-100";
    case "outline":
      return "bg-transparent border-2 border-[#1E4DB7] text-[#1E4DB7] dark:border-blue-400 dark:text-blue-400 hover:bg-[#1E4DB7]/5 dark:hover:bg-blue-400/10";
    default:
      return "";
  }
}

// -----------------------------------------------------------------------------
// Spring Config
// -----------------------------------------------------------------------------

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

const ICON_VARIANTS = {
  initial: { opacity: 0, scale: 0.5, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.5, y: -6 },
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AddToCartButton({
  productId,
  variantId,
  productTitle,
  productImage,
  price,
  currency = "USD",
  className,
  size = "md",
  variant = "primary",
  showFlyAnimation = true,
  disabled = false,
}: AddToCartButtonProps) {
  const tStore = useTranslations("store");
  const tCart = useTranslations("cart");
  const { formatPrice } = useFormat();
  const { addToCart } = useCart();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fly animation state
  const [flyData, setFlyData] = useState<{
    rect: DOMRect;
    key: number;
  } | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Click handler
  // ---------------------------------------------------------------------------

  const handleClick = useCallback(async () => {
    // Debounce: prevent action during loading or feedback states
    if (buttonState !== "idle" || disabled) return;

    setButtonState("loading");

    try {
      await addToCart(productId, variantId);

      setButtonState("success");

      // Fire toast
      toast.success(tCart("addedToCart"), {
        description: productTitle,
      });

      // Trigger fly animation
      if (showFlyAnimation && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setFlyData({ rect, key: Date.now() });
      }

      // Hold success state for 2 seconds then revert
      timeoutRef.current = setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    } catch {
      setButtonState("error");

      toast.error(tCart("failedToAdd"), {
        description: tCart("tryAgain"),
      });

      // Hold error state for 2 seconds then revert
      timeoutRef.current = setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    }
  }, [buttonState, disabled, addToCart, productId, variantId, productTitle, showFlyAnimation]);

  // ---------------------------------------------------------------------------
  // Fly animation cleanup
  // ---------------------------------------------------------------------------

  const handleFlyComplete = useCallback(() => {
    setFlyData(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const isInteractive = buttonState === "idle" && !disabled;

  const formattedPrice = formatPrice(price, currency);

  const ariaLabel =
    buttonState === "loading"
      ? tStore("cta.adding")
      : buttonState === "success"
        ? tStore("cta.addedToCartAnnouncement", { title: productTitle })
        : buttonState === "error"
          ? tCart("failedToAdd")
          : tStore("cta.addToCartAriaLabel", { title: productTitle });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        disabled={!isInteractive}
        aria-label={ariaLabel}
        aria-busy={buttonState === "loading"}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center font-semibold rounded-xl",
          "transition-colors duration-300 ease-out",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950",
          "disabled:cursor-not-allowed",
          // Shimmer container for primary
          variant === "primary" && buttonState === "idle" && "overflow-hidden",
          // Size
          SIZE_CLASSES[size],
          // Variant + state colors
          getVariantClasses(variant, buttonState),
          // Disabled opacity (only in idle state)
          disabled && buttonState === "idle" && "opacity-50",
          className,
        )}
        whileTap={isInteractive ? { scale: 0.97 } : undefined}
        transition={SPRING_TRANSITION}
      >
        {/* Shimmer overlay for primary variant */}
        {variant === "primary" && buttonState === "idle" && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
        )}

        {/* Content with AnimatePresence for state morphing */}
        <AnimatePresence mode="wait" initial={false}>
          {buttonState === "loading" && (
            <motion.span
              key="loading"
              className="inline-flex items-center gap-2"
              variants={ICON_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING_TRANSITION}
            >
              <Loader2 className={cn(ICON_SIZES[size], "animate-spin")} />
              <span>{tStore("cta.adding")}</span>
            </motion.span>
          )}

          {buttonState === "success" && (
            <motion.span
              key="success"
              className="inline-flex items-center gap-2"
              variants={ICON_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING_TRANSITION}
            >
              <Check className={ICON_SIZES[size]} strokeWidth={2.5} />
              <span>{tStore("cta.addedToCart")}</span>
            </motion.span>
          )}

          {buttonState === "error" && (
            <motion.span
              key="error"
              className="inline-flex items-center gap-2"
              variants={ICON_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING_TRANSITION}
            >
              <AlertCircle className={ICON_SIZES[size]} />
              <span>{tCart("failedToAdd")}</span>
            </motion.span>
          )}

          {buttonState === "idle" && (
            <motion.span
              key="idle"
              className="inline-flex items-center gap-2"
              variants={ICON_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING_TRANSITION}
            >
              <ShoppingCart className={ICON_SIZES[size]} />
              <span>{tStore("cta.addToCart")}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Shimmer keyframe (injected once, harmless if duplicated) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Fly-to-cart portal */}
      {flyData && (
        <FlyingThumbnail
          key={flyData.key}
          productImage={productImage}
          startRect={flyData.rect}
          onComplete={handleFlyComplete}
        />
      )}
    </>
  );
}

export default AddToCartButton;
