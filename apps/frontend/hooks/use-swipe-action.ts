// =============================================================================
// Swipe Action Hook
// =============================================================================
// Detects horizontal swipe gestures for list item actions such as
// swipe-to-delete or swipe-to-archive. Supports elastic resistance,
// directional detection, and vertical scroll prevention.

"use client";

import { useState, useRef, useCallback, type TouchEventHandler } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseSwipeActionOptions {
  /** Callback invoked when the user swipes left past the threshold */
  onSwipeLeft?: () => void;
  /** Callback invoked when the user swipes right past the threshold */
  onSwipeRight?: () => void;
  /** Minimum swipe distance (in pixels) to trigger the action. Default: 80 */
  threshold?: number;
  /** Prevent vertical scrolling while a horizontal swipe is detected. Default: true */
  preventScroll?: boolean;
}

export interface UseSwipeActionReturn {
  /** Current horizontal offset in pixels (negative = left, positive = right) */
  swipeX: number;
  /** Whether the user is actively swiping */
  isSwiping: boolean;
  /** Current swipe direction, or null if not swiping */
  direction: "left" | "right" | null;
  /** Touch event handlers to bind to the swipeable element */
  bindEvents: {
    onTouchStart: TouchEventHandler;
    onTouchMove: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
  };
  /** Programmatically reset the swipe state (e.g., after an action completes) */
  reset: () => void;
}

/** Angle threshold in degrees — swipe must be more horizontal than this */
const ANGLE_THRESHOLD_DEG = 30;
const ANGLE_THRESHOLD_RAD = (ANGLE_THRESHOLD_DEG * Math.PI) / 180;

/** Elastic resistance factor applied past the threshold for a rubber-band feel */
const ELASTIC_FACTOR = 0.4;

/**
 * Horizontal swipe action hook for list items and cards.
 *
 * Detects horizontal swipe gestures and exposes the current offset for
 * animating action panels (e.g., delete, archive). Prevents vertical
 * scrolling when a horizontal swipe is detected, and applies elastic
 * resistance past the threshold.
 *
 * @param options - Configuration for the swipe action behavior
 * @returns State and event handlers for the swipe gesture
 *
 * @example
 * ```tsx
 * function CartItem({ item, onDelete }: { item: Item; onDelete: () => void }) {
 *   const { swipeX, isSwiping, bindEvents, reset } = useSwipeAction({
 *     onSwipeLeft: onDelete,
 *     threshold: 80,
 *   });
 *
 *   return (
 *     <div
 *       {...bindEvents}
 *       style={{
 *         transform: `translateX(${swipeX}px)`,
 *         transition: isSwiping ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
 *       }}
 *     >
 *       <ItemContent item={item} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSwipeAction(
  options: UseSwipeActionOptions
): UseSwipeActionReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 80,
    preventScroll = true,
  } = options;

  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);
  const isHorizontalRef = useRef<boolean | null>(null);

  const reset = useCallback(() => {
    setSwipeX(0);
    setIsSwiping(false);
    setDirection(null);
    isTrackingRef.current = false;
    isHorizontalRef.current = null;
  }, []);

  const onTouchStart: TouchEventHandler = useCallback((event) => {
    const touch = event.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    isTrackingRef.current = true;
    isHorizontalRef.current = null;
  }, []);

  const onTouchMove: TouchEventHandler = useCallback(
    (event) => {
      if (!isTrackingRef.current) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;

      // Determine swipe direction on first significant movement
      if (isHorizontalRef.current === null) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Wait for enough movement to determine intent
        if (absDeltaX < 5 && absDeltaY < 5) return;

        const angle = Math.atan2(absDeltaY, absDeltaX);
        isHorizontalRef.current = angle < ANGLE_THRESHOLD_RAD;

        if (!isHorizontalRef.current) {
          // Vertical movement — stop tracking
          isTrackingRef.current = false;
          return;
        }

        setIsSwiping(true);
      }

      if (!isHorizontalRef.current) return;

      // Prevent vertical scroll while swiping horizontally
      if (preventScroll) {
        event.preventDefault();
      }

      // Apply elastic resistance past threshold
      const absDelta = Math.abs(deltaX);
      let adjustedX: number;

      if (absDelta > threshold) {
        const overflow = absDelta - threshold;
        const elasticOverflow = overflow * ELASTIC_FACTOR;
        adjustedX =
          (deltaX > 0 ? 1 : -1) * (threshold + elasticOverflow);
      } else {
        adjustedX = deltaX;
      }

      setSwipeX(adjustedX);
      setDirection(adjustedX < 0 ? "left" : adjustedX > 0 ? "right" : null);
    },
    [preventScroll, threshold]
  );

  const onTouchEnd: TouchEventHandler = useCallback(() => {
    if (!isTrackingRef.current && !isSwiping) return;

    const absSwipe = Math.abs(swipeX);

    if (absSwipe >= threshold) {
      // Threshold exceeded — trigger action
      if (swipeX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipeX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Snap back with spring animation (handled via CSS transition on the element)
    reset();
  }, [isSwiping, swipeX, threshold, onSwipeLeft, onSwipeRight, reset]);

  return {
    swipeX,
    isSwiping,
    direction,
    bindEvents: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    reset,
  };
}

export default useSwipeAction;
