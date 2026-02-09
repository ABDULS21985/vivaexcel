// =============================================================================
// Long Press Hook
// =============================================================================
// Detects long press gestures for triggering context menus and actions.
// Supports both touch and mouse events, with movement cancellation to
// prevent false triggers during scrolling.

"use client";

import {
  useState,
  useRef,
  useCallback,
  type TouchEventHandler,
  type MouseEventHandler,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseLongPressOptions {
  /** Callback invoked when the long press duration has elapsed */
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  /** Optional callback invoked on a short press (released before duration) */
  onPress?: () => void;
  /** Duration in milliseconds before the long press fires. Default: 500 */
  duration?: number;
  /** Whether the long press gesture is disabled. Default: false */
  disabled?: boolean;
}

export interface UseLongPressReturn {
  /** Whether the element is currently pressed (touch/mouse down) */
  isPressed: boolean;
  /** Whether we are waiting for the long press duration to elapse */
  isPending: boolean;
  /** Event handlers to bind to the target element */
  bindEvents: {
    onTouchStart: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
    onTouchCancel: TouchEventHandler;
    onMouseDown: MouseEventHandler;
    onMouseUp: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
  };
}

/** Maximum movement (in pixels) before the long press is cancelled */
const MOVE_TOLERANCE = 10;

/**
 * Trigger haptic feedback if the device supports it.
 * Silently fails on unsupported devices.
 */
function triggerHaptic(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Haptic feedback is best-effort; ignore errors
  }
}

/**
 * Long press detection hook for context menus and advanced interactions.
 *
 * Starts a timer on press and fires `onLongPress` after the configured
 * duration. The gesture is cancelled if the pointer moves more than 10px
 * (to avoid false triggers during scroll), or if the press is released
 * early. Optionally fires `onPress` for short presses.
 *
 * @param options - Configuration for the long press behavior
 * @returns State and event handlers for the long press gesture
 *
 * @example
 * ```tsx
 * function ProductCard({ product }: { product: Product }) {
 *   const { isPressed, isPending, bindEvents } = useLongPress({
 *     onLongPress: () => openContextMenu(product),
 *     onPress: () => navigateToProduct(product.id),
 *     duration: 500,
 *   });
 *
 *   return (
 *     <div
 *       {...bindEvents}
 *       style={{ opacity: isPressed ? 0.8 : 1 }}
 *     >
 *       <ProductContent product={product} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useLongPress(options: UseLongPressOptions): UseLongPressReturn {
  const { onLongPress, onPress, duration = 500, disabled = false } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);
  const eventRef = useRef<React.TouchEvent | React.MouseEvent | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPress = useCallback(
    (event: React.TouchEvent | React.MouseEvent, x: number, y: number) => {
      if (disabled) return;

      eventRef.current = event;
      startPosRef.current = { x, y };
      longPressTriggeredRef.current = false;

      setIsPressed(true);
      setIsPending(true);

      clearTimer();

      timerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setIsPending(false);
        triggerHaptic(15);
        onLongPress(eventRef.current!);
      }, duration);
    },
    [disabled, duration, onLongPress, clearTimer]
  );

  const endPress = useCallback(() => {
    clearTimer();
    setIsPressed(false);
    setIsPending(false);

    // If the long press did not trigger and onPress is provided, fire it
    if (!longPressTriggeredRef.current && onPress && startPosRef.current) {
      onPress();
    }

    startPosRef.current = null;
    eventRef.current = null;
  }, [clearTimer, onPress]);

  const cancelPress = useCallback(() => {
    clearTimer();
    setIsPressed(false);
    setIsPending(false);
    startPosRef.current = null;
    eventRef.current = null;
  }, [clearTimer]);

  // --- Touch Handlers ---

  const onTouchStart: TouchEventHandler = useCallback(
    (event) => {
      const touch = event.touches[0];
      startPress(event, touch.clientX, touch.clientY);
    },
    [startPress]
  );

  const onTouchEnd: TouchEventHandler = useCallback(() => {
    endPress();
  }, [endPress]);

  const onTouchCancel: TouchEventHandler = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  // --- Mouse Handlers ---

  const onMouseDown: MouseEventHandler = useCallback(
    (event) => {
      // Only handle primary mouse button
      if (event.button !== 0) return;
      startPress(event, event.clientX, event.clientY);
    },
    [startPress]
  );

  const onMouseUp: MouseEventHandler = useCallback(() => {
    endPress();
  }, [endPress]);

  const onMouseLeave: MouseEventHandler = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  // --- Touch move cancellation (prevent false triggers during scroll) ---
  // We attach a passive touchmove listener via the touch start handler is not
  // possible with React's synthetic events, so we handle it in onTouchStart by
  // checking movement in a global listener. Instead, we use a simpler approach:
  // track movement via onTouchMove on the same element and cancel if needed.
  // However, the spec says only onTouchStart/End/Cancel — so we add a global
  // touchmove effect via the timer mechanism.

  // Actually, a cleaner approach: add touchmove to bindEvents as well, but
  // since the spec only requires the listed events, we listen globally in the
  // startPress via a one-time event listener.

  const startPressWithMoveDetection = useCallback(
    (event: React.TouchEvent | React.MouseEvent, x: number, y: number) => {
      if (disabled) return;

      startPress(event, x, y);

      // Attach a temporary move listener for touch events
      const handleMove = (moveEvent: TouchEvent) => {
        if (!startPosRef.current) return;

        const touch = moveEvent.touches[0];
        const dx = touch.clientX - startPosRef.current.x;
        const dy = touch.clientY - startPosRef.current.y;

        if (Math.sqrt(dx * dx + dy * dy) > MOVE_TOLERANCE) {
          cancelPress();
          document.removeEventListener("touchmove", handleMove);
        }
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!startPosRef.current) return;

        const dx = moveEvent.clientX - startPosRef.current.x;
        const dy = moveEvent.clientY - startPosRef.current.y;

        if (Math.sqrt(dx * dx + dy * dy) > MOVE_TOLERANCE) {
          cancelPress();
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      if ("touches" in event.nativeEvent) {
        document.addEventListener("touchmove", handleMove, { passive: true });
        // Cleanup listeners when press ends
        const cleanup = () => {
          document.removeEventListener("touchmove", handleMove);
          document.removeEventListener("touchend", cleanup);
          document.removeEventListener("touchcancel", cleanup);
        };
        document.addEventListener("touchend", cleanup, { once: true });
        document.addEventListener("touchcancel", cleanup, { once: true });
      } else {
        document.addEventListener("mousemove", handleMouseMove);
        const cleanup = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", cleanup);
        };
        document.addEventListener("mouseup", cleanup, { once: true });
      }
    },
    [disabled, startPress, cancelPress]
  );

  // --- Overridden touch/mouse handlers with move detection ---

  const onTouchStartWithMove: TouchEventHandler = useCallback(
    (event) => {
      const touch = event.touches[0];
      startPressWithMoveDetection(event, touch.clientX, touch.clientY);
    },
    [startPressWithMoveDetection]
  );

  const onMouseDownWithMove: MouseEventHandler = useCallback(
    (event) => {
      if (event.button !== 0) return;
      startPressWithMoveDetection(event, event.clientX, event.clientY);
    },
    [startPressWithMoveDetection]
  );

  return {
    isPressed,
    isPending,
    bindEvents: {
      onTouchStart: onTouchStartWithMove,
      onTouchEnd,
      onTouchCancel,
      onMouseDown: onMouseDownWithMove,
      onMouseUp,
      onMouseLeave,
    },
  };
}

export default useLongPress;
