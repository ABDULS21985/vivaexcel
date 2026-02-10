"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Sun,
  Moon,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

// =============================================================================
// Types
// =============================================================================

export interface TemplatePage {
  name: string;
  path: string;
  screenshotUrl?: string;
}

interface TemplatePreviewerProps {
  demoUrl: string;
  title: string;
  pages?: TemplatePage[];
  screenshotUrls?: { desktop?: string; tablet?: string; mobile?: string };
  className?: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<DeviceType, { width: number; icon: typeof Monitor; label: string }> = {
  desktop: { width: 1440, icon: Monitor, label: "Desktop" },
  tablet: { width: 768, icon: Tablet, label: "Tablet" },
  mobile: { width: 375, icon: Smartphone, label: "Mobile" },
};

// =============================================================================
// TemplatePreviewer Component
// =============================================================================

export function TemplatePreviewer({
  demoUrl,
  title,
  pages,
  screenshotUrls,
  className,
}: TemplatePreviewerProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTabletUp = useMediaQuery("(min-width: 768px)");

  // Build current iframe URL
  const baseUrl = demoUrl.replace(/\/$/, "");
  const currentPage = pages?.[currentPageIdx];
  const iframeUrl = currentPage
    ? `${baseUrl}${currentPage.path}`
    : baseUrl;

  // Available devices based on screen size
  const availableDevices: DeviceType[] = isDesktop
    ? ["desktop", "tablet", "mobile"]
    : isTabletUp
      ? ["tablet", "mobile"]
      : ["mobile"];

  useEffect(() => {
    if (!availableDevices.includes(device)) {
      setDevice(availableDevices[0]);
    }
  }, [availableDevices, device]);

  // Reset loading state on URL change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [iframeUrl]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      iframeRef.current.src = iframeUrl;
    }
  }, [iframeUrl]);

  const toggleTheme = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);
    // Try postMessage first
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "toggle-theme", dark: newDark },
        "*",
      );
    } catch {
      // Ignore cross-origin errors
    }
  }, [isDark]);

  const openInNewTab = useCallback(() => {
    window.open(iframeUrl, "_blank", "noopener,noreferrer");
  }, [iframeUrl]);

  // Truncated URL for display
  const displayUrl = (() => {
    try {
      const url = new URL(iframeUrl);
      const path = url.pathname === "/" ? "" : url.pathname;
      const display = `${url.hostname}${path}`;
      return display.length > 50 ? display.slice(0, 47) + "..." : display;
    } catch {
      return iframeUrl.slice(0, 50);
    }
  })();

  const deviceWidth = DEVICE_CONFIG[device].width;
  const containerMaxWidth = isDesktop ? "100%" : "100%";

  return (
    <div className={cn("flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden", className)}>
      {/* Browser chrome header */}
      <div className="bg-neutral-200 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700">
        {/* Traffic lights + URL bar */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Traffic lights */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          </div>

          {/* Navigation buttons */}
          {pages && pages.length > 1 && (
            <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setCurrentPageIdx(Math.max(0, currentPageIdx - 1))}
                disabled={currentPageIdx === 0}
                className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPageIdx(Math.min((pages?.length ?? 1) - 1, currentPageIdx + 1))}
                disabled={currentPageIdx >= (pages?.length ?? 1) - 1}
                className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* URL bar */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="bg-white dark:bg-neutral-700 rounded-full px-4 py-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-md w-full text-center">
              {displayUrl}
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors flex-shrink-0"
            aria-label="Refresh"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Device selector */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-neutral-300/50 dark:border-neutral-700/50">
          <div className="flex items-center gap-1">
            {availableDevices.map((d) => {
              const config = DEVICE_CONFIG[d];
              const Icon = config.icon;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    device === d
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50",
                  )}
                  aria-label={`Switch to ${config.label} view`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Open in new tab */}
            <button
              onClick={openInNewTab}
              className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iframe container */}
      <div className="flex-1 flex items-start justify-center bg-neutral-200/50 dark:bg-neutral-900 p-4 overflow-auto" style={{ minHeight: "500px" }}>
        <motion.div
          animate={{ width: isDesktop ? Math.min(deviceWidth, 1440) : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={cn(
            "relative bg-white dark:bg-neutral-800 overflow-hidden mx-auto",
            device === "desktop" && "rounded-lg shadow-xl border border-neutral-300 dark:border-neutral-700",
            device === "tablet" && "rounded-2xl shadow-xl border-[6px] border-neutral-400 dark:border-neutral-600",
            device === "mobile" && "rounded-[2rem] shadow-xl border-[8px] border-neutral-800 dark:border-neutral-600",
          )}
        >
          {/* Mobile notch */}
          {device === "mobile" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-800 dark:bg-neutral-600 rounded-b-xl z-10" />
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white dark:bg-neutral-800 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Loading preview...</span>
              </div>
            </div>
          )}

          {/* Error fallback */}
          {hasError && (
            <div className="absolute inset-0 bg-white dark:bg-neutral-800 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <AlertCircle className="h-10 w-10 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Preview unavailable
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  This site cannot be displayed in an iframe.
                </p>
                <button
                  onClick={openInNewTab}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          )}

          {/* iframe */}
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title={`Preview of ${title}`}
            className="w-full border-0"
            style={{
              height: device === "mobile" ? "700px" : device === "tablet" ? "800px" : "600px",
              pointerEvents: isLoading ? "none" : "auto",
            }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </motion.div>
      </div>

      {/* Page navigator */}
      {pages && pages.length > 1 && (
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPageIdx(idx)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  idx === currentPageIdx
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                )}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatePreviewer;
