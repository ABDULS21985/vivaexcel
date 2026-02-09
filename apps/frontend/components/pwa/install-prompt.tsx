"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "vivaexcel-a2hs-dismissed";
const PAGE_COUNT_KEY = "vivaexcel-page-count";
const PAGES_BEFORE_PROMPT = 3;
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * InstallPrompt
 *
 * Shows a custom Add-to-Home-Screen banner after the user has visited 3+ pages.
 * On Chrome/Edge: intercepts `beforeinstallprompt` and triggers the native install flow.
 * On iOS Safari: shows instructions to use Share > Add to Home Screen.
 */
export function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Detect iOS
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
  }, []);

  // Track page visits in sessionStorage
  useEffect(() => {
    const current = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || "0", 10);
    const next = current + 1;
    sessionStorage.setItem(PAGE_COUNT_KEY, next.toString());
  }, []);

  // Check if the user has dismissed the banner recently
  const isDismissed = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      const dismissedAt = parseInt(raw, 10);
      if (isNaN(dismissedAt)) return false;
      return Date.now() - dismissedAt < DISMISS_DURATION_MS;
    } catch {
      return false;
    }
  }, []);

  // Check if enough pages have been visited
  const hasEnoughPageViews = useCallback((): boolean => {
    const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || "0", 10);
    return count >= PAGES_BEFORE_PROMPT;
  }, []);

  // Check if the app is already installed (standalone mode)
  const isStandalone = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
    );
  }, []);

  // Listen for the native beforeinstallprompt event (Chrome, Edge, etc.)
  useEffect(() => {
    if (isStandalone()) return;
    if (isDismissed()) return;

    function handleBeforeInstall(e: Event) {
      // Prevent the default mini-infobar
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      // Show our custom banner only if enough pages visited
      if (hasEnoughPageViews()) {
        setShowBanner(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [isDismissed, hasEnoughPageViews, isStandalone]);

  // For iOS, show after enough pages visited (no beforeinstallprompt event)
  useEffect(() => {
    if (!isIOS) return;
    if (isStandalone()) return;
    if (isDismissed()) return;

    // Check periodically since page count updates on mount
    const timer = setTimeout(() => {
      if (hasEnoughPageViews()) {
        setShowBanner(true);
      }
    }, 2000); // slight delay for better UX

    return () => clearTimeout(timer);
  }, [isIOS, isDismissed, hasEnoughPageViews, isStandalone]);

  // Handle the install button click
  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSSheet(true);
      setShowBanner(false);
      return;
    }

    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowBanner(false);
      deferredPromptRef.current = null;
    }
  }, [isIOS]);

  // Dismiss the banner for 7 days
  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSSheet(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // localStorage may be full or unavailable
    }
  }, []);

  return (
    <>
      {/* ── Main Install Banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-0 right-0 z-40 mx-4"
          >
            <div
              className="relative rounded-2xl border border-white/10 p-4 shadow-2xl backdrop-blur-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(30, 77, 183, 0.15) 0%, rgba(20, 58, 143, 0.25) 100%)",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* App icon */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="VivaExcel"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    Add VivaExcel to Home Screen
                  </p>
                  <p className="text-xs text-white/60">
                    Quick access to templates and orders
                  </p>
                </div>

                {/* Install button */}
                <button
                  onClick={handleInstall}
                  className="flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: "#1E4DB7" }}
                >
                  Install
                </button>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                  aria-label="Dismiss install prompt"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Instructions Bottom Sheet ──────────────────────────────── */}
      <AnimatePresence>
        {showIOSSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleDismiss}
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-white/10 p-6 pb-10"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.97)" }}
            >
              {/* Drag indicator */}
              <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/20" />

              <div className="flex flex-col items-center text-center">
                {/* App icon */}
                <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="VivaExcel"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h3 className="mb-2 text-lg font-bold text-white">
                  Add VivaExcel to Home Screen
                </h3>
                <p className="mb-6 text-sm text-white/60">
                  Install VivaExcel for quick access right from your home screen.
                </p>

                {/* Steps */}
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(30, 77, 183, 0.2)" }}
                    >
                      <Share className="h-5 w-5" style={{ color: "#1E4DB7" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        1. Tap the Share button
                      </p>
                      <p className="text-xs text-white/50">
                        In the Safari toolbar at the bottom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(30, 77, 183, 0.2)" }}
                    >
                      <Download className="h-5 w-5" style={{ color: "#1E4DB7" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        2. Tap &ldquo;Add to Home Screen&rdquo;
                      </p>
                      <p className="text-xs text-white/50">
                        Scroll down in the share menu if needed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: "#1E4DB7" }}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
