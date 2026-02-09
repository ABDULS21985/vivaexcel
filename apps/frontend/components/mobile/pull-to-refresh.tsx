"use client";

// =============================================================================
// Pull-to-Refresh Indicator Component
// =============================================================================
// Visual indicator component that pairs with the usePullToRefresh hook to
// provide a native-feeling pull-to-refresh experience. Displays a circular
// indicator with rotating arrow, spinning loader, and check mark states.

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Loader2, Check } from "lucide-react";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface PullToRefreshProps {
  /** Scrollable content to wrap */
  children: React.ReactNode;
  /** Async callback invoked when pull-to-refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Whether pull-to-refresh is disabled. Default: false */
  disabled?: boolean;
  /** Minimum pull distance to trigger refresh. Default: 80 */
  threshold?: number;
}

/** Visual states of the pull-to-refresh indicator */
type RefreshState = "idle" | "pulling" | "ready" | "refreshing" | "done";

// =============================================================================
// Constants
// =============================================================================

/** Resistance factor applied to raw pull distance for a natural feel */
const RESISTANCE = 0.4;

/** Maximum visual pull distance in pixels */
const MAX_PULL = 140;

/** Indicator circle diameter in pixels */
const INDICATOR_SIZE = 40;

/** Duration (ms) to show the check mark before collapsing */
const DONE_DURATION = 600;

/** Spring config for snap-back animation */
const SNAP_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// =============================================================================
// Haptic helper
// =============================================================================

function triggerHaptic(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Best-effort
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * Pull-to-Refresh
 *
 * Wraps scrollable content and provides a native-feeling pull-to-refresh
 * experience with four visual states: pulling (rotating arrow), ready
 * (release indicator), refreshing (spinning loader), and done (check mark).
 *
 * @example
 * ```tsx
 * <PullToRefresh onRefresh={async () => await refetchData()}>
 *   <ProductList products={products} />
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const hasPassedThresholdRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute pull progress (0 to 1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  // Arrow rotation: 0 to 180 degrees based on progress
  const arrowRotation = pullProgress * 180;

  // ---------------------------------------------------------------------------
  // Touch event handlers
  // ---------------------------------------------------------------------------

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || refreshState === "refreshing") return;

      // Only activate when scrolled to the very top
      const scrollTop = containerRef.current?.scrollTop ?? 0;
      if (scrollTop > 0) return;

      startYRef.current = event.touches[0].clientY;
      isPullingRef.current = false;
      hasPassedThresholdRef.current = false;
    },
    [disabled, refreshState],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || refreshState === "refreshing") return;

      const scrollTop = containerRef.current?.scrollTop ?? 0;
      if (scrollTop > 0) {
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setPullDistance(0);
          setRefreshState("idle");
        }
        return;
      }

      const currentY = event.touches[0].clientY;
      const rawDistance = currentY - startYRef.current;

      // Only activate for downward pulls
      if (rawDistance <= 0) {
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setPullDistance(0);
          setRefreshState("idle");
        }
        return;
      }

      // Prevent browser default pull-to-refresh
      event.preventDefault();

      // Apply resistance curve
      const resistedDistance = Math.min(rawDistance * RESISTANCE, MAX_PULL);

      if (!isPullingRef.current) {
        isPullingRef.current = true;
        setRefreshState("pulling");
      }

      // Haptic feedback at threshold crossing
      if (resistedDistance >= threshold && !hasPassedThresholdRef.current) {
        hasPassedThresholdRef.current = true;
        triggerHaptic(15);
        setRefreshState("ready");
      } else if (resistedDistance < threshold && hasPassedThresholdRef.current) {
        hasPassedThresholdRef.current = false;
        setRefreshState("pulling");
      }

      setPullDistance(resistedDistance);
    },
    [disabled, refreshState, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isPullingRef.current) return;

    isPullingRef.current = false;

    if (pullDistance >= threshold && refreshState !== "refreshing") {
      setRefreshState("refreshing");
      setPullDistance(threshold * 0.6); // Hold at partial position while refreshing

      try {
        await onRefresh();
      } finally {
        setRefreshState("done");
        // Brief check mark, then collapse
        setTimeout(() => {
          setPullDistance(0);
          setRefreshState("idle");
        }, DONE_DURATION);
      }
    } else {
      // Snap back — threshold not reached
      setPullDistance(0);
      setRefreshState("idle");
    }
  }, [disabled, pullDistance, threshold, refreshState, onRefresh]);

  // ---------------------------------------------------------------------------
  // Prevent native pull-to-refresh via touch-action on body when pulling
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (refreshState === "pulling" || refreshState === "ready") {
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overscrollBehavior = "";
    }

    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, [refreshState]);

  // ---------------------------------------------------------------------------
  // Render indicator icon
  // ---------------------------------------------------------------------------

  const renderIndicator = () => {
    switch (refreshState) {
      case "pulling":
        return (
          <motion.div
            style={{ rotate: arrowRotation }}
            className="text-gray-500 dark:text-gray-400"
          >
            <ArrowDown size={20} />
          </motion.div>
        );

      case "ready":
        return (
          <motion.div
            initial={{ rotate: 180 }}
            animate={{ rotate: 180, scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
            className="text-[#1E4DB7] dark:text-blue-400"
          >
            <ArrowDown size={20} />
          </motion.div>
        );

      case "refreshing":
        return (
          <Loader2
            size={20}
            className="animate-spin text-[#1E4DB7] dark:text-blue-400"
          />
        );

      case "done":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="text-green-500"
          >
            <Check size={20} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {refreshState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -INDICATOR_SIZE }}
            animate={{
              opacity: 1,
              y: pullDistance - INDICATOR_SIZE,
            }}
            exit={{ opacity: 0, y: -INDICATOR_SIZE }}
            transition={
              isPullingRef.current
                ? { duration: 0 }
                : SNAP_SPRING
            }
            className="pointer-events-none absolute left-0 right-0 z-10 flex justify-center"
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full",
                "bg-white dark:bg-gray-800",
                "shadow-lg border border-gray-200 dark:border-gray-700",
              )}
              style={{
                width: INDICATOR_SIZE,
                height: INDICATOR_SIZE,
              }}
            >
              {renderIndicator()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area — shifts down during pull */}
      <motion.div
        animate={{
          y: refreshState !== "idle" ? pullDistance : 0,
        }}
        transition={
          isPullingRef.current
            ? { duration: 0 }
            : SNAP_SPRING
        }
        className={cn(
          refreshState !== "idle" && pullDistance > 0 && "bg-gray-50 dark:bg-gray-900/50",
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default PullToRefresh;
