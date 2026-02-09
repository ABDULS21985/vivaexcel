"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { DownloadLink, DownloadLinkStatus } from "@/types/delivery";

// =============================================================================
// Props
// =============================================================================

interface DownloadButtonProps {
  downloadLink: DownloadLink;
  onRefreshNeeded?: () => void;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Component
// =============================================================================

export default function DownloadButton({
  downloadLink,
  onRefreshNeeded,
  className = "",
}: DownloadButtonProps) {
  const [state, setState] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  const remaining = downloadLink.maxDownloads - downloadLink.downloadCount;
  const isActive = downloadLink.status === ("active" as DownloadLinkStatus);
  const isExhausted =
    downloadLink.status === ("exhausted" as DownloadLinkStatus) ||
    remaining <= 0;
  const isExpired = downloadLink.status === ("expired" as DownloadLinkStatus);
  const isRevoked = downloadLink.status === ("revoked" as DownloadLinkStatus);
  const isDisabled = !isActive || state === "downloading";

  const handleDownload = useCallback(async () => {
    if (isDisabled) return;

    setState("downloading");

    try {
      // Open the download URL in a new tab using the token
      const downloadUrl = `${API_BASE_URL}/downloads/${downloadLink.token}/file`;
      window.open(downloadUrl, "_blank");

      // Brief delay to simulate progress feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setState("success");

      // Reset after showing success
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [downloadLink.token, isDisabled]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const getButtonContent = () => {
    switch (state) {
      case "downloading":
        return (
          <motion.span
            key="downloading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Downloading...</span>
          </motion.span>
        );
      case "success":
        return (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Download Started</span>
          </motion.span>
        );
      case "error":
        return (
          <motion.span
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            <span>Failed</span>
          </motion.span>
        );
      default:
        return (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </motion.span>
        );
    }
  };

  // Expired / revoked state -- show refresh or disabled message
  if (isExpired) {
    return (
      <button
        onClick={onRefreshNeeded}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors ${className}`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Link Expired - Refresh</span>
      </button>
    );
  }

  if (isRevoked) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-500 cursor-not-allowed ${className}`}
      >
        <XCircle className="h-4 w-4" />
        <span>Revoked</span>
      </span>
    );
  }

  if (isExhausted) {
    return (
      <button
        onClick={onRefreshNeeded}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors ${className}`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Downloads Exhausted - Refresh</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        onClick={handleDownload}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        className={`
          relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg
          transition-all duration-200 overflow-hidden min-w-[160px]
          ${
            state === "success"
              ? "bg-green-600 text-white"
              : state === "error"
                ? "bg-red-600 text-white"
                : "bg-[#1E4DB7] text-white hover:bg-[#143A8F] shadow-sm hover:shadow-md"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <AnimatePresence mode="wait">{getButtonContent()}</AnimatePresence>
      </motion.button>

      {/* Remaining downloads badge */}
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        {remaining}/{downloadLink.maxDownloads} remaining
      </span>
    </div>
  );
}
