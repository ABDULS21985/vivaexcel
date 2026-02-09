"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Eye } from "lucide-react";
import { apiGet } from "@/lib/api-client";

// =============================================================================
// Types
// =============================================================================

interface SocialProofBannerProps {
  productId: string;
  className?: string;
}

interface SocialProofData {
  recentPurchases: number;
}

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Constants
// =============================================================================

const POLL_INTERVAL_MS = 30_000;
const VIEWER_MIN = 5;
const VIEWER_MAX = 25;
const VIEWER_VARIANCE = 3;

// =============================================================================
// Helpers
// =============================================================================

/** Generate a random "current viewer count" within bounds, with slight
 *  variance from the previous value to feel organic. */
function generateViewerCount(previous: number | null): number {
  if (previous === null) {
    return Math.floor(Math.random() * (VIEWER_MAX - VIEWER_MIN + 1)) + VIEWER_MIN;
  }
  const delta =
    Math.floor(Math.random() * (VIEWER_VARIANCE * 2 + 1)) - VIEWER_VARIANCE;
  return Math.min(VIEWER_MAX, Math.max(VIEWER_MIN, previous + delta));
}

// =============================================================================
// Animated Number
// =============================================================================

function AnimatedNumber({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="inline-block font-bold tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// =============================================================================
// Skeleton
// =============================================================================

function BannerSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10 animate-pulse">
      <div className="h-4 w-48 rounded bg-amber-200/60 dark:bg-amber-800/40" />
      <div className="h-4 w-40 rounded bg-amber-200/60 dark:bg-amber-800/40" />
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function SocialProofBanner({
  productId,
  className = "",
}: SocialProofBannerProps) {
  const [recentPurchases, setRecentPurchases] = useState<number | null>(null);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const viewerRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiGet<ApiResponseWrapper<SocialProofData>>(
        `/reviews/product/${productId}/social-proof`,
        undefined,
        { skipAuth: true },
      );

      const purchases = response?.data?.recentPurchases ?? 0;
      setRecentPurchases(purchases);

      const nextViewers = generateViewerCount(viewerRef.current);
      viewerRef.current = nextViewers;
      setViewerCount(nextViewers);

      setHasError(false);
    } catch {
      // On error: keep the last known values but stop showing the banner
      // if we never got data in the first place.
      if (recentPurchases === null) {
        setHasError(true);
      }
      // Still update viewer count to keep it feeling alive
      const nextViewers = generateViewerCount(viewerRef.current);
      viewerRef.current = nextViewers;
      setViewerCount(nextViewers);
    } finally {
      setIsLoading(false);
    }
  }, [productId, recentPurchases]);

  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // First load — show skeleton
  if (isLoading) {
    return <BannerSkeleton />;
  }

  // Error on initial load or no meaningful data
  if (hasError) {
    return null;
  }

  const showPurchases = recentPurchases !== null && recentPurchases > 0;
  const showViewers = viewerCount !== null && viewerCount > 0;

  // Nothing to display
  if (!showPurchases && !showViewers) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10 ${className}`}
    >
      {/* Recent Purchases */}
      {showPurchases && (
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Flame className="h-4 w-4 flex-shrink-0 text-amber-500" />
          <span>
            <AnimatedNumber value={recentPurchases!} />{" "}
            {recentPurchases === 1 ? "customer" : "customers"} bought this in
            the last 24 hours
          </span>
        </div>
      )}

      {/* Separator (only when both are visible) */}
      {showPurchases && showViewers && (
        <span className="hidden sm:block h-4 w-px bg-amber-300/50 dark:bg-amber-700/50" />
      )}

      {/* Current Viewers */}
      {showViewers && (
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Eye className="h-4 w-4 flex-shrink-0 text-amber-500" />
          <span>
            <AnimatedNumber value={viewerCount!} />{" "}
            {viewerCount === 1 ? "person is" : "people are"} viewing this right
            now
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default SocialProofBanner;
