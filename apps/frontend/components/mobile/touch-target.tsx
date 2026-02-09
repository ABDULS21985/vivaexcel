"use client";

// =============================================================================
// Touch Target Wrapper
// =============================================================================
// Ensures minimum touch target sizes per WCAG 2.5.5 (Enhanced) guidelines.
// Wraps any interactive element and guarantees at least 44-56px touch areas
// depending on the configured size. An invisible pseudo-element expands the
// hit area without affecting visual layout.

import { forwardRef, type ElementType, type ComponentPropsWithRef } from "react";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

/** Minimum touch target size presets */
const SIZE_MAP = {
  /** 44px — WCAG 2.5.5 minimum */
  sm: "min-w-[44px] min-h-[44px]",
  /** 48px — Recommended comfortable target */
  md: "min-w-[48px] min-h-[48px]",
  /** 56px — Generous, comfortable target for primary actions */
  lg: "min-w-[56px] min-h-[56px]",
} as const;

export interface TouchTargetProps {
  /** Content to wrap with the touch target area */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type to render. Default: 'div' */
  as?: ElementType;
  /** Touch target size preset. Default: 'md' */
  size?: keyof typeof SIZE_MAP;
  /** Whether to center content within the touch area. Default: false */
  centered?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Touch Target Wrapper
 *
 * Ensures that interactive elements meet WCAG 2.5.5 minimum touch target size
 * requirements. Adds an invisible pseudo-element to expand the touch area
 * without affecting visual layout.
 *
 * @example
 * ```tsx
 * <TouchTarget as="button" size="md" centered onClick={handleClick}>
 *   <ShoppingCart size={20} />
 * </TouchTarget>
 * ```
 */
export const TouchTarget = forwardRef<HTMLElement, TouchTargetProps>(
  function TouchTarget(
    { children, className, as: Component = "div", size = "md", centered = false },
    ref,
  ) {
    return (
      <Component
        ref={ref}
        className={cn(
          // Minimum touch target dimensions
          SIZE_MAP[size],
          // Invisible expanded hit area via pseudo-element
          "relative",
          "before:absolute before:inset-[-8px] before:content-['']",
          // Center content within the touch area when requested
          centered && "flex items-center justify-center",
          className,
        )}
      >
        {children}
      </Component>
    );
  },
);

TouchTarget.displayName = "TouchTarget";

export default TouchTarget;
