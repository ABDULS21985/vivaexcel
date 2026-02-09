"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Clock } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface RecentPurchaseToastProps {
  /** Enable or disable the toast. Defaults to `true`. */
  enabled?: boolean;
  /** Override the interval range in ms. A random value between
   *  `intervalMs` and `intervalMs * 2` is chosen each cycle. Defaults to 30000. */
  intervalMs?: number;
}

interface PurchaseNotification {
  id: string;
  city: string;
  productName: string;
  thumbnail?: string;
  timeLabel: string;
}

// =============================================================================
// Constants
// =============================================================================

const DISMISS_KEY = "ktblog_purchase_toast_dismissed";
const MAX_DISMISSALS = 3;
const AUTO_DISMISS_MS = 5_000;
const DEFAULT_MIN_INTERVAL = 30_000;
const DEFAULT_MAX_INTERVAL = 60_000;

/** Curated list of real cities for social proof messages. */
const CITIES = [
  "New York",
  "London",
  "Toronto",
  "Sydney",
  "Berlin",
  "Tokyo",
  "Paris",
  "Amsterdam",
  "Singapore",
  "Dubai",
  "San Francisco",
  "Chicago",
  "Melbourne",
  "Stockholm",
  "Bangalore",
  "Seoul",
  "Cape Town",
  "Sao Paulo",
  "Austin",
  "Vancouver",
];

/** Static product names used as a fallback when the API is not available. */
const PRODUCT_NAMES = [
  "Cloud Architecture Guide",
  "DevOps Pipeline Template",
  "API Design Blueprint",
  "Security Compliance Pack",
  "Infrastructure Playbook",
  "Microservices Starter Kit",
  "Data Migration Toolkit",
  "CI/CD Best Practices",
  "Kubernetes Deployment Guide",
  "System Design Document",
];

/** Relative time labels to vary the displayed recency. */
const TIME_LABELS = [
  "just now",
  "1 minute ago",
  "2 minutes ago",
  "3 minutes ago",
  "5 minutes ago",
];

// =============================================================================
// Helpers
// =============================================================================

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDismissCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(DISMISS_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

function incrementDismissCount(): number {
  const next = getDismissCount() + 1;
  localStorage.setItem(DISMISS_KEY, String(next));
  return next;
}

function generateNotification(): PurchaseNotification {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    city: randomFrom(CITIES),
    productName: randomFrom(PRODUCT_NAMES),
    timeLabel: randomFrom(TIME_LABELS),
  };
}

// =============================================================================
// Component
// =============================================================================

export function RecentPurchaseToast({
  enabled = true,
  intervalMs,
}: RecentPurchaseToastProps) {
  const [notification, setNotification] =
    useState<PurchaseNotification | null>(null);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Check localStorage on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (getDismissCount() >= MAX_DISMISSALS) {
      setIsPermanentlyDismissed(true);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Schedule next notification
  // ---------------------------------------------------------------------------
  const scheduleNext = useCallback(() => {
    const minMs = intervalMs ?? DEFAULT_MIN_INTERVAL;
    const maxMs = intervalMs ? intervalMs * 2 : DEFAULT_MAX_INTERVAL;
    const delay = randomBetween(minMs, maxMs);

    timeoutRef.current = setTimeout(() => {
      setNotification(generateNotification());
    }, delay);
  }, [intervalMs]);

  // ---------------------------------------------------------------------------
  // Auto-dismiss currently visible notification
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!notification) return;

    autoDismissRef.current = setTimeout(() => {
      setNotification(null);
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
      }
    };
  }, [notification]);

  // ---------------------------------------------------------------------------
  // When a notification disappears (auto or manual), schedule the next one
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (notification === null && enabled && !isPermanentlyDismissed) {
      scheduleNext();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification, enabled, isPermanentlyDismissed, scheduleNext]);

  // ---------------------------------------------------------------------------
  // Manual dismiss
  // ---------------------------------------------------------------------------
  const handleDismiss = useCallback(() => {
    setNotification(null);
    const count = incrementDismissCount();
    if (count >= MAX_DISMISSALS) {
      setIsPermanentlyDismissed(true);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Render nothing when disabled or permanently dismissed
  // ---------------------------------------------------------------------------
  if (!enabled || isPermanentlyDismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-50 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 40, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
            }}
            className="pointer-events-auto max-w-sm w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg shadow-neutral-900/10 dark:shadow-black/30 overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4">
              {/* Product thumbnail placeholder */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white leading-snug">
                  Someone from{" "}
                  <span className="font-semibold">{notification.city}</span>{" "}
                  just purchased
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate mt-0.5">
                  {notification.productName}
                </p>
                <p className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                  <Clock className="h-3 w-3" />
                  {notification.timeLabel}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 -m-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Auto-dismiss progress bar */}
            <motion.div
              className="h-0.5 bg-blue-500/50 dark:bg-blue-400/30 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecentPurchaseToast;
