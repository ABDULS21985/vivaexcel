"use client";

// =============================================================================
// Press Feedback Component
// =============================================================================
// Wraps interactive elements with native-feeling press feedback via
// framer-motion spring animations. Supports haptic vibration, respects
// prefers-reduced-motion, and removes default mobile browser highlights.

import { useCallback, useState, useEffect } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface PressFeedbackProps {
  /** Content to wrap with press feedback */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type to render. Default: 'button' */
  as?: "button" | "div" | "a";
  /** Scale factor on press. Default: 0.97 */
  scale?: number;
  /** Opacity on press. Default: 0.9 */
  opacity?: number;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether to trigger haptic vibration on press. Default: false */
  haptic?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/** Spring config for press animation — snappy and responsive */
const PRESS_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// =============================================================================
// Motion component map
// =============================================================================

const MOTION_MAP = {
  button: motion.button,
  div: motion.div,
  a: motion.a,
} as const;

// =============================================================================
// Component
// =============================================================================

/**
 * Press Feedback
 *
 * Wraps interactive elements with spring-based scale and opacity feedback
 * on press. Disables scale animation when the user prefers reduced motion,
 * falling back to opacity-only feedback.
 *
 * @example
 * ```tsx
 * <PressFeedback haptic onClick={() => addToCart(product)}>
 *   <span>Add to Cart</span>
 * </PressFeedback>
 * ```
 */
export function PressFeedback({
  children,
  className,
  as = "button",
  scale = 0.97,
  opacity = 0.9,
  disabled = false,
  onClick,
  haptic = false,
}: PressFeedbackProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const handleTapStart = useCallback(() => {
    if (haptic && !disabled) {
      navigator.vibrate?.(10);
    }
  }, [haptic, disabled]);

  const MotionComponent = MOTION_MAP[as];

  // When reduced motion is preferred, skip scale and only adjust opacity
  const tapAnimation: MotionProps["whileTap"] = prefersReducedMotion
    ? { opacity }
    : { scale, opacity };

  return (
    <MotionComponent
      className={cn(
        "cursor-pointer select-none",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      style={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
      whileTap={disabled ? undefined : tapAnimation}
      transition={PRESS_SPRING}
      onTapStart={handleTapStart}
      onClick={disabled ? undefined : onClick}
      disabled={as === "button" ? disabled : undefined}
      aria-disabled={disabled || undefined}
    >
      {children}
    </MotionComponent>
  );
}

export default PressFeedback;
