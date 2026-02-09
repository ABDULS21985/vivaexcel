// =============================================================================
// Touch Feedback Hook
// =============================================================================
// Provides visual press feedback (scale transform) for touch interactions.
// Respects the user's prefers-reduced-motion preference automatically.

"use client";

import { useState, useMemo, useCallback, type TouchEventHandler } from "react";
import { useReducedMotion } from "./use-reduced-motion";

// ============================================================================
// Types
// ============================================================================

export interface UseTouchFeedbackOptions {
  /** Scale factor applied during press. Default: 0.97 */
  scale?: number;
  /** Transition duration in milliseconds. Default: 100 */
  duration?: number;
  /** Whether the touch feedback is disabled. Default: false */
  disabled?: boolean;
}

export interface UseTouchFeedbackReturn {
  /** Whether the element is currently pressed */
  isPressed: boolean;
  /** CSS styles to apply to the element for the press feedback effect */
  style: React.CSSProperties;
  /** Touch event handlers to bind to the target element */
  bindEvents: {
    onTouchStart: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
    onTouchCancel: TouchEventHandler;
  };
}

/**
 * Visual press feedback hook for touch interactions.
 *
 * Returns a `style` object with a scale transform that activates on press,
 * along with touch event handlers to bind to the target element. Automatically
 * disables the scale effect when the user prefers reduced motion.
 *
 * @param options - Configuration for the touch feedback behavior
 * @returns State, styles, and event handlers for the touch feedback
 *
 * @example
 * ```tsx
 * function ActionButton({ children, onClick }: ButtonProps) {
 *   const { style, bindEvents } = useTouchFeedback({ scale: 0.95 });
 *
 *   return (
 *     <button onClick={onClick} style={style} {...bindEvents}>
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTouchFeedback(
  options: UseTouchFeedbackOptions = {}
): UseTouchFeedbackReturn {
  const { scale = 0.97, duration = 100, disabled = false } = options;

  const reducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);

  const onTouchStart: TouchEventHandler = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const onTouchEnd: TouchEventHandler = useCallback(() => {
    setIsPressed(false);
  }, []);

  const onTouchCancel: TouchEventHandler = useCallback(() => {
    setIsPressed(false);
  }, []);

  const style: React.CSSProperties = useMemo(() => {
    // Skip transform entirely when reduced motion is preferred or disabled
    if (reducedMotion || disabled) {
      return {};
    }

    return {
      transform: isPressed ? `scale(${scale})` : "scale(1)",
      transition: `transform ${duration}ms ease`,
      willChange: "transform",
    };
  }, [isPressed, scale, duration, reducedMotion, disabled]);

  const bindEvents = useMemo(
    () => ({
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    }),
    [onTouchStart, onTouchEnd, onTouchCancel]
  );

  return {
    isPressed,
    style,
    bindEvents,
  };
}

export default useTouchFeedback;
