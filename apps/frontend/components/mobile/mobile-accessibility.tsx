"use client";

// =============================================================================
// Mobile Accessibility Utilities
// =============================================================================
// A collection of accessibility-focused components optimized for mobile:
//   - FocusIndicator:        Visible focus ring for keyboard/touch navigation
//   - ReduceMotionWrapper:   Adapts animations based on prefers-reduced-motion
//   - DynamicTextSize:       Respects system text size preferences
//   - HighContrastMode:      Enhances contrast for prefers-contrast: more
//   - ScreenReaderOnly:      Visually hidden content for screen readers

import { useState, useEffect, useMemo, type ReactNode, type ElementType } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// FocusIndicator
// =============================================================================

export interface FocusIndicatorProps {
  /** Content to wrap with a focus indicator */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type to render. Default: 'div' */
  as?: ElementType;
}

/**
 * Focus Indicator
 *
 * Wraps an interactive element with a visible focus ring for keyboard and
 * touch navigation. Uses the primary brand color (#1E4DB7) with a 3px ring
 * for enhanced visibility on mobile devices.
 *
 * @example
 * ```tsx
 * <FocusIndicator as="button" onClick={handleClick}>
 *   <span>Action</span>
 * </FocusIndicator>
 * ```
 */
export function FocusIndicator({
  children,
  className,
  as: Component = "div",
}: FocusIndicatorProps) {
  return (
    <Component
      className={cn(
        "outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-2",
        "dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900",
        "rounded-md",
        className,
      )}
    >
      {children}
    </Component>
  );
}

// =============================================================================
// ReduceMotionWrapper
// =============================================================================

export interface ReduceMotionWrapperProps {
  /** Content to animate */
  children: ReactNode;
  /** Full animation props for framer-motion */
  animation: MotionProps;
  /** Simplified animation props when reduced motion is preferred */
  reducedAnimation?: MotionProps;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reduce Motion Wrapper
 *
 * Detects the user's `prefers-reduced-motion` setting and applies either full
 * animations or simplified alternatives. When reduced motion is preferred and
 * no reducedAnimation is provided, animations are replaced with instant
 * opacity transitions.
 *
 * @example
 * ```tsx
 * <ReduceMotionWrapper
 *   animation={{
 *     initial: { opacity: 0, y: 20 },
 *     animate: { opacity: 1, y: 0 },
 *     transition: { duration: 0.5 },
 *   }}
 *   reducedAnimation={{
 *     initial: { opacity: 0 },
 *     animate: { opacity: 1 },
 *     transition: { duration: 0.1 },
 *   }}
 * >
 *   <Card />
 * </ReduceMotionWrapper>
 * ```
 */
export function ReduceMotionWrapper({
  children,
  animation,
  reducedAnimation,
  className,
}: ReduceMotionWrapperProps) {
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

  // Default reduced animation: simple opacity fade
  const defaultReduced: MotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  };

  const activeAnimation = prefersReducedMotion
    ? reducedAnimation ?? defaultReduced
    : animation;

  return (
    <motion.div className={className} {...activeAnimation}>
      {children}
    </motion.div>
  );
}

// =============================================================================
// DynamicTextSize
// =============================================================================

export interface DynamicTextSizeProps {
  /** Text content to render */
  children: ReactNode;
  /** Base Tailwind text size class (e.g., "text-base"). */
  baseSize: string;
  /** Minimum scale factor relative to base size. Default: 0.85 */
  minScale?: number;
  /** Maximum scale factor relative to base size. Default: 1.3 */
  maxScale?: number;
  /** Additional CSS classes */
  className?: string;
}

/** Maps common Tailwind text classes to their rem values */
const TEXT_SIZE_MAP: Record<string, string> = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
  "text-3xl": "1.875rem",
  "text-4xl": "2.25rem",
};

/**
 * Dynamic Text Size
 *
 * Renders text that respects system text size preferences by using CSS
 * `clamp()` to scale between minimum and maximum bounds. Supports dynamic
 * type on iOS via `-webkit-text-size-adjust`.
 *
 * @example
 * ```tsx
 * <DynamicTextSize baseSize="text-base" minScale={0.85} maxScale={1.3}>
 *   <p>This text respects system font size preferences.</p>
 * </DynamicTextSize>
 * ```
 */
export function DynamicTextSize({
  children,
  baseSize,
  minScale = 0.85,
  maxScale = 1.3,
  className,
}: DynamicTextSizeProps) {
  const remValue = TEXT_SIZE_MAP[baseSize] ?? "1rem";
  const numericRem = parseFloat(remValue);

  const style = useMemo(
    () => ({
      fontSize: `clamp(${numericRem * minScale}rem, ${remValue}, ${numericRem * maxScale}rem)`,
      WebkitTextSizeAdjust: "100%" as const,
    }),
    [numericRem, minScale, maxScale, remValue],
  );

  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}

// =============================================================================
// HighContrastMode
// =============================================================================

export interface HighContrastModeProps {
  /** Content to render with enhanced contrast when active */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * High Contrast Mode
 *
 * Detects `prefers-contrast: more` media query and provides CSS custom
 * properties for enhanced contrast. When active, increases border widths,
 * text weights, and color contrast ratios via a wrapping container with
 * data attributes that can be targeted in CSS.
 *
 * @example
 * ```tsx
 * <HighContrastMode>
 *   <Card className="data-[high-contrast]:border-2 data-[high-contrast]:font-semibold">
 *     <p>Content with enhanced contrast</p>
 *   </Card>
 * </HighContrastMode>
 * ```
 */
export function HighContrastMode({
  children,
  className,
}: HighContrastModeProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-contrast: more)");
    setIsHighContrast(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const style = useMemo(
    () =>
      isHighContrast
        ? ({
            "--hc-border-width": "2px",
            "--hc-font-weight": "600",
            "--hc-text-color": "#000000",
            "--hc-text-color-dark": "#ffffff",
            "--hc-border-color": "#000000",
            "--hc-border-color-dark": "#ffffff",
            "--hc-focus-ring-width": "4px",
          } as React.CSSProperties)
        : ({
            "--hc-border-width": "1px",
            "--hc-font-weight": "400",
            "--hc-text-color": "inherit",
            "--hc-text-color-dark": "inherit",
            "--hc-border-color": "inherit",
            "--hc-border-color-dark": "inherit",
            "--hc-focus-ring-width": "3px",
          } as React.CSSProperties),
    [isHighContrast],
  );

  return (
    <div
      className={cn(
        isHighContrast && [
          "font-semibold",
          "[&_*]:border-current",
          "text-black dark:text-white",
        ],
        className,
      )}
      style={style}
      data-high-contrast={isHighContrast ? "" : undefined}
    >
      {children}
    </div>
  );
}

// =============================================================================
// ScreenReaderOnly
// =============================================================================

/**
 * Screen Reader Only
 *
 * Renders content that is visually hidden but remains accessible to screen
 * readers and assistive technologies. Uses the same technique as Tailwind's
 * `sr-only` utility but as a composable React component.
 *
 * @example
 * ```tsx
 * <button>
 *   <ShoppingCart size={20} />
 *   <ScreenReaderOnly>Add to cart</ScreenReaderOnly>
 * </button>
 * ```
 */
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden",
        "whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
      )}
    >
      {children}
    </span>
  );
}
