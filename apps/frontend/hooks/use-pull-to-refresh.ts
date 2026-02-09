// =============================================================================
// Pull-to-Refresh Hook
// =============================================================================
// Implements a native-feeling pull-to-refresh gesture for mobile interfaces.
// Tracks touch events, applies a resistance curve, and triggers a callback
// when the user pulls past a configurable threshold.

"use client";

import { useState, useRef, useCallback, type TouchEventHandler } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UsePullToRefreshOptions {
  /** Async callback invoked when the user pulls past the threshold and releases */
  onRefresh: () => Promise<void>;
  /** Minimum pull distance (in pixels) to trigger a refresh. Default: 80 */
  threshold?: number;
  /** Maximum visual pull distance (in pixels). Default: 150 */
  maxPull?: number;
  /** Whether the pull-to-refresh gesture is disabled. Default: false */
  disabled?: boolean;
}

export interface UsePullToRefreshReturn {
  /** Current visual pull distance in pixels (0 when not pulling) */
  pullDistance: number;
  /** Whether a refresh is currently in progress */
  isRefreshing: boolean;
  /** Whether the user is actively pulling */
  isPulling: boolean;
  /** Pull progress as a value from 0 to 1 (1 = threshold reached) */
  pullProgress: number;
  /** Touch event handlers to bind to the scrollable container */
  bindEvents: {
    onTouchStart: TouchEventHandler;
    onTouchMove: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
  };
}

/** Resistance factor applied to raw pull distance for a natural feel */
const RESISTANCE_FACTOR = 0.5;

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
 * Pull-to-refresh gesture hook for mobile interfaces.
 *
 * Provides touch event handlers and state for implementing a pull-to-refresh
 * pattern. Applies a resistance curve to the pull distance for a natural feel,
 * and optionally triggers haptic feedback when the threshold is crossed.
 *
 * @param options - Configuration for the pull-to-refresh behavior
 * @returns State and event handlers for the pull-to-refresh gesture
 *
 * @example
 * ```tsx
 * function FeedPage() {
 *   const { pullDistance, isRefreshing, isPulling, pullProgress, bindEvents } =
 *     usePullToRefresh({
 *       onRefresh: async () => {
 *         await refetchFeed();
 *       },
 *       threshold: 80,
 *     });
 *
 *   return (
 *     <div {...bindEvents}>
 *       <div
 *         style={{
 *           transform: `translateY(${pullDistance}px)`,
 *           transition: isPulling ? "none" : "transform 0.3s ease",
 *         }}
 *       >
 *         {isRefreshing && <Spinner />}
 *         {pullProgress > 0 && !isRefreshing && (
 *           <PullIndicator progress={pullProgress} />
 *         )}
 *         <FeedContent />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePullToRefresh(
  options: UsePullToRefreshOptions
): UsePullToRefreshReturn {
  const { onRefresh, threshold = 80, maxPull = 150, disabled = false } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const hasPassedThresholdRef = useRef(false);

  const onTouchStart: TouchEventHandler = useCallback(
    (event) => {
      if (disabled || isRefreshing) return;

      // Only activate when scrolled to the very top
      if (window.scrollY > 0) return;

      startYRef.current = event.touches[0].clientY;
      isPullingRef.current = false;
      hasPassedThresholdRef.current = false;
    },
    [disabled, isRefreshing]
  );

  const onTouchMove: TouchEventHandler = useCallback(
    (event) => {
      if (disabled || isRefreshing) return;

      // Ensure we only pull when at the top of the page
      if (window.scrollY > 0) {
        if (isPullingRef.current) {
          // User scrolled away while pulling — cancel
          isPullingRef.current = false;
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      const currentY = event.touches[0].clientY;
      const rawDistance = currentY - startYRef.current;

      // Only activate for downward pulls
      if (rawDistance <= 0) {
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      // Apply resistance curve: decelerates as user pulls further
      const resistedDistance = Math.min(rawDistance * RESISTANCE_FACTOR, maxPull);

      if (!isPullingRef.current) {
        isPullingRef.current = true;
        setIsPulling(true);
      }

      // Haptic feedback at threshold crossing
      if (resistedDistance >= threshold && !hasPassedThresholdRef.current) {
        hasPassedThresholdRef.current = true;
        triggerHaptic(15);
      } else if (resistedDistance < threshold && hasPassedThresholdRef.current) {
        hasPassedThresholdRef.current = false;
      }

      setPullDistance(resistedDistance);
    },
    [disabled, isRefreshing, maxPull, threshold]
  );

  const onTouchEnd: TouchEventHandler = useCallback(async () => {
    if (disabled || !isPullingRef.current) return;

    isPullingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Hold at threshold while refreshing

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back — no threshold reached
      setPullDistance(0);
    }
  }, [disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    pullProgress,
    bindEvents: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}

export default usePullToRefresh;
