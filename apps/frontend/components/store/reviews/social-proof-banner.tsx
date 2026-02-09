"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { apiGet } from "@/lib/api-client";

// =============================================================================
// Types
// =============================================================================

interface SocialProofBannerProps {
  productId: string;
  recentPurchases?: number;
  totalDownloads?: number;
  averageRating?: number;
  totalReviews?: number;
}

interface SocialProofApiResponse {
  recentPurchases: number;
}

// =============================================================================
// Constants
// =============================================================================

const ROTATION_INTERVAL_MS = 5_000;
const POLL_INTERVAL_MS = 30_000;

// =============================================================================
// Helpers
// =============================================================================

function getLocalStorageKey(productId: string): string {
  return `social-proof-dismissed-${productId}`;
}

function isDismissed(productId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getLocalStorageKey(productId)) === "true";
}

function dismissBanner(productId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getLocalStorageKey(productId), "true");
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// =============================================================================
// Build proof items
// =============================================================================

interface ProofItem {
  key: string;
  emoji: string;
  text: string;
}

function buildProofItems(
  recentPurchases: number,
  averageRating: number,
  totalReviews: number,
  totalDownloads: number,
): ProofItem[] {
  const items: ProofItem[] = [];

  if (recentPurchases > 0) {
    items.push({
      key: "purchases",
      emoji: "\uD83D\uDD25",
      text: `${formatNumber(recentPurchases)} people bought this in the last 7 days`,
    });
  }

  if (averageRating > 0 && totalReviews > 0) {
    items.push({
      key: "rating",
      emoji: "\u2B50",
      text: `Rated ${averageRating.toFixed(1)}/5 by ${formatNumber(totalReviews)} customers`,
    });
  }

  if (totalDownloads > 0) {
    items.push({
      key: "downloads",
      emoji: "\uD83D\uDCE5",
      text: `Downloaded ${formatNumber(totalDownloads)}+ times`,
    });
  }

  return items;
}

// =============================================================================
// Component
// =============================================================================

export function SocialProofBanner({
  productId,
  recentPurchases: initialPurchases = 0,
  totalDownloads = 0,
  averageRating = 0,
  totalReviews = 0,
}: SocialProofBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [hiddenByLocalStorage, setHiddenByLocalStorage] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [livePurchases, setLivePurchases] = useState(initialPurchases);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    setHiddenByLocalStorage(isDismissed(productId));
  }, [productId]);

  // Poll API for updated recentPurchases
  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const data = await apiGet<SocialProofApiResponse>(
          `/reviews/product/${productId}/social-proof`,
          undefined,
          { skipAuth: true },
        );
        if (mounted && data?.recentPurchases != null) {
          setLivePurchases(data.recentPurchases);
        }
      } catch {
        // Silently ignore polling errors
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [productId]);

  // Build proof items from current data
  const proofItems = useMemo(
    () => buildProofItems(livePurchases, averageRating, totalReviews, totalDownloads),
    [livePurchases, averageRating, totalReviews, totalDownloads],
  );

  // Auto-advance rotation
  useEffect(() => {
    if (proofItems.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % proofItems.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [proofItems.length]);

  // Reset index if items change
  useEffect(() => {
    setActiveIndex(0);
  }, [proofItems.length]);

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dismissBanner(productId);
  }, [productId]);

  // Nothing to show
  if (proofItems.length === 0 || hiddenByLocalStorage) {
    return null;
  }

  const currentItem = proofItems[activeIndex % proofItems.length];

  return (
    <AnimatePresence mode="wait">
      {!dismissed ? (
        <motion.div
          key="social-proof-banner"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full overflow-hidden"
        >
          <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10">
            {/* Proof text with crossfade */}
            <div className="flex-1 flex items-center justify-center min-h-[1.5rem] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentItem.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 text-center whitespace-nowrap"
                >
                  <span className="mr-1.5">{currentItem.emoji}</span>
                  {currentItem.text}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Dots indicator — desktop only */}
            {proofItems.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                {proofItems.map((item, i) => (
                  <span
                    key={item.key}
                    className={`block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      i === activeIndex % proofItems.length
                        ? "bg-amber-500 dark:bg-amber-400"
                        : "bg-amber-300/50 dark:bg-amber-700/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 -m-0.5 rounded text-amber-400 hover:text-amber-600 dark:text-amber-600 dark:hover:text-amber-400 transition-colors"
              aria-label="Dismiss social proof banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default SocialProofBanner;
