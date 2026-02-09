"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// =============================================================================
// Types
// =============================================================================

interface RecentPurchaseToastProps {
  /** Enable or disable the toast. Defaults to `true`. */
  enabled?: boolean;
  /** Base interval in ms. A random value between intervalMs and intervalMs*2
   *  is chosen each cycle. Defaults to 30000. */
  intervalMs?: number;
  /** Optional list of product names to pick from. Falls back to curated defaults. */
  productNames?: string[];
}

// =============================================================================
// Constants
// =============================================================================

const DISMISS_KEY = "recent-purchase-toast-dismissals";
const MAX_DISMISSALS = 3;
const AUTO_DISMISS_MS = 4_000;
const DEFAULT_INTERVAL_MS = 30_000;

const CITIES = [
  "New York",
  "London",
  "Toronto",
  "Sydney",
  "Berlin",
  "Paris",
  "Tokyo",
  "Dubai",
  "Singapore",
  "Amsterdam",
  "Stockholm",
  "Cape Town",
  "Mumbai",
  "S\u00E3o Paulo",
  "Seoul",
  "Chicago",
  "Melbourne",
  "Barcelona",
  "Zurich",
  "Austin",
];

const FIRST_NAMES = [
  "Sarah",
  "James",
  "Emma",
  "Michael",
  "Olivia",
  "Daniel",
  "Sophie",
  "Alex",
  "Maria",
  "David",
  "Chen",
  "Amir",
  "Yuki",
  "Priya",
  "Lucas",
];

// TIME_LABELS are built inside the component using translations

const DEFAULT_PRODUCT_NAMES = [
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

// =============================================================================
// Gradient colors for avatar
// =============================================================================

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
];

// =============================================================================
// Helpers
// =============================================================================

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
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

// =============================================================================
// Toast content component (rendered by sonner's toast.custom)
// =============================================================================

function PurchaseToastContent({
  nameFromCity,
  product,
  timeLabel,
  gradient,
  onDismiss,
  purchasedLabel,
  initial,
}: {
  nameFromCity: string;
  product: string;
  timeLabel: string;
  gradient: string;
  onDismiss: () => void;
  purchasedLabel: string;
  initial: string;
}) {
  return (
    <div
      className="flex items-start gap-3 w-full max-w-sm p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg cursor-pointer"
      onClick={onDismiss}
    >
      {/* Gradient avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <span className="text-sm font-semibold text-white leading-none">
          {initial}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
          <span className="font-semibold">{nameFromCity}</span>{" "}
          <span className="text-neutral-600 dark:text-neutral-400">
            {purchasedLabel} {product}
          </span>
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          {timeLabel}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function RecentPurchaseToast({
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  productNames,
}: RecentPurchaseToastProps) {
  const t = useTranslations("store");
  const pathname = usePathname();
  const [permanentlyHidden, setPermanentlyHidden] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check localStorage dismissal count on mount
  useEffect(() => {
    if (getDismissCount() >= MAX_DISMISSALS) {
      setPermanentlyHidden(true);
    }
  }, []);

  // Determine if path is excluded
  const isExcludedPath =
    pathname.includes("/checkout") || pathname.includes("/cart");

  const products = productNames && productNames.length > 0
    ? productNames
    : DEFAULT_PRODUCT_NAMES;

  const timeLabels = [
    t("socialProof.timeLabels.justNow"),
    t("socialProof.timeLabels.oneMinuteAgo"),
    t("socialProof.timeLabels.twoMinutesAgo"),
    t("socialProof.timeLabels.threeMinutesAgo"),
    t("socialProof.timeLabels.fiveMinutesAgo"),
  ];

  const showToast = useCallback(() => {
    const name = randomFrom(FIRST_NAMES);
    const city = randomFrom(CITIES);
    const product = randomFrom(products);
    const timeLabel = randomFrom(timeLabels);
    const gradient = randomFrom(AVATAR_GRADIENTS);
    const nameFromCity = t("socialProof.fromCity", { name, city });
    const purchasedLabel = t("socialProof.purchased");

    toast.custom(
      (toastId) => (
        <PurchaseToastContent
          nameFromCity={nameFromCity}
          product={product}
          timeLabel={timeLabel}
          gradient={gradient}
          purchasedLabel={purchasedLabel}
          initial={name.charAt(0).toUpperCase()}
          onDismiss={() => {
            toast.dismiss(toastId);
            const count = incrementDismissCount();
            if (count >= MAX_DISMISSALS) {
              setPermanentlyHidden(true);
            }
          }}
        />
      ),
      {
        duration: AUTO_DISMISS_MS,
        position: "bottom-left",
      },
    );
  }, [products, timeLabels, t]);

  // Schedule recurring toasts
  useEffect(() => {
    if (!enabled || permanentlyHidden || isExcludedPath) return;

    function scheduleNext() {
      const delay = randomBetween(intervalMs, intervalMs * 2);
      timeoutRef.current = setTimeout(() => {
        showToast();
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, permanentlyHidden, isExcludedPath, intervalMs, showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}

export default RecentPurchaseToast;
