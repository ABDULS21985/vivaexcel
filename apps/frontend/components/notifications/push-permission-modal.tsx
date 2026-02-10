"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ShoppingBag,
  Zap,
  Tag,
  X,
  Smartphone,
} from "lucide-react";
import { cn, Button } from "@ktblog/ui/components";
import { usePushSubscribe } from "@/hooks/use-notifications";

// =============================================================================
// Push Notification Permission Modal
// =============================================================================
// Smart prompt: doesn't ask immediately on first visit.
// Shows after engagement threshold (2nd purchase or 5th page view).
// Custom modal explains VALUE before triggering the browser prompt.

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const STORAGE_KEY = "push_permission_state";
const PAGE_VIEW_KEY = "push_prompt_page_views";
const ENGAGEMENT_THRESHOLD = 5; // page views before showing prompt

interface PushPermissionState {
  dismissed: boolean;
  dismissedAt?: number;
  granted: boolean;
}

// -----------------------------------------------------------------------------
// Feature List
// -----------------------------------------------------------------------------

const FEATURES = [
  {
    icon: ShoppingBag,
    label: "Order Status",
    description: "Know instantly when your order is ready",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Zap,
    label: "Flash Sales",
    description: "Never miss a limited-time deal",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Tag,
    label: "Price Drops",
    description: "Get alerted when wishlist items go on sale",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

// -----------------------------------------------------------------------------
// Hook: Smart Push Permission Prompt
// -----------------------------------------------------------------------------

export function usePushPermissionPrompt() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if push is supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // Already granted or denied
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // Check local state
    const stateStr = localStorage.getItem(STORAGE_KEY);
    if (stateStr) {
      const state: PushPermissionState = JSON.parse(stateStr);
      if (state.granted || state.dismissed) {
        // If dismissed more than 7 days ago, allow re-prompt
        if (state.dismissed && state.dismissedAt) {
          const daysSinceDismiss =
            (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24);
          if (daysSinceDismiss < 7) return;
        } else {
          return;
        }
      }
    }

    // Track page views
    const viewCount = parseInt(
      localStorage.getItem(PAGE_VIEW_KEY) || "0",
      10
    );
    const newCount = viewCount + 1;
    localStorage.setItem(PAGE_VIEW_KEY, String(newCount));

    // Show after engagement threshold
    if (newCount >= ENGAGEMENT_THRESHOLD) {
      // Delay showing to not disrupt initial page experience
      const timer = setTimeout(() => setShouldShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    const state: PushPermissionState = {
      dismissed: true,
      dismissedAt: Date.now(),
      granted: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const markGranted = useCallback(() => {
    setShouldShow(false);
    const state: PushPermissionState = {
      dismissed: false,
      granted: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.removeItem(PAGE_VIEW_KEY);
  }, []);

  return { shouldShow, dismiss, markGranted };
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface PushPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function PushPermissionModal({
  isOpen,
  onClose,
  onGranted,
}: PushPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const pushSubscribe = usePushSubscribe();

  const handleEnable = useCallback(async () => {
    setIsRequesting(true);

    try {
      // Request browser permission
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Register service worker and get push subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        const subscriptionJSON = subscription.toJSON();

        // Send subscription to backend
        if (subscriptionJSON.endpoint && subscriptionJSON.keys) {
          pushSubscribe.mutate({
            endpoint: subscriptionJSON.endpoint,
            keys: {
              p256dh: subscriptionJSON.keys.p256dh || "",
              auth: subscriptionJSON.keys.auth || "",
            },
            userAgent: navigator.userAgent,
            deviceName: getBrowserName(),
          });
        }

        onGranted();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      onClose();
    } finally {
      setIsRequesting(false);
    }
  }, [pushSubscribe, onGranted, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header illustration */}
              <div className="relative bg-gradient-to-br from-[#1E4DB7] to-[#0F2B6B] px-6 pt-8 pb-10">
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                      rotate: [0, -3, 3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                  >
                    <Bell className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-bold text-white text-center mt-5">
                  Stay in the Loop
                </h2>
                <p className="text-sm text-white/70 text-center mt-1.5 max-w-xs mx-auto">
                  Get notified about flash sales, product updates, and order
                  status — all in real time.
                </p>
              </div>

              {/* Features */}
              <div className="px-6 py-5 space-y-3">
                {FEATURES.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                          feature.bg
                        )}
                      >
                        <FeatureIcon
                          className={cn("w-5 h-5", feature.color)}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {feature.label}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 space-y-2.5">
                <Button
                  onClick={handleEnable}
                  disabled={isRequesting}
                  className="w-full bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-2 h-11"
                >
                  {isRequesting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Smartphone className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {isRequesting ? "Enabling..." : "Enable Notifications"}
                </Button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Smart Push Permission Provider
// -----------------------------------------------------------------------------
// Drop this into your layout to auto-show the push permission modal when
// the user has demonstrated engagement.

export function PushPermissionProvider() {
  const { shouldShow, dismiss, markGranted } = usePushPermissionPrompt();

  return (
    <PushPermissionModal
      isOpen={shouldShow}
      onClose={dismiss}
      onGranted={markGranted}
    />
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  return "Browser";
}

export default PushPermissionModal;
