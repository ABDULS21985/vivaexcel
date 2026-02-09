"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import type {
  License,
  LicenseType,
  LicenseStatus,
} from "@/types/delivery";
import {
  licenseTypeLabels,
  licenseTypeColors,
  licenseStatusColors,
  licenseStatusLabels,
} from "@/types/delivery";

// =============================================================================
// Props
// =============================================================================

interface LicenseKeyDisplayProps {
  license: License;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function maskLicenseKey(key: string): string {
  // Mask everything after the first segment: XXXX-XXXX-****-****
  const parts = key.split("-");
  if (parts.length <= 2) {
    return parts[0] + "-" + "****".repeat(parts.length - 1);
  }
  return (
    parts.slice(0, 2).join("-") +
    "-" +
    parts
      .slice(2)
      .map(() => "****")
      .join("-")
  );
}

// =============================================================================
// Component
// =============================================================================

export default function LicenseKeyDisplay({
  license,
  className = "",
}: LicenseKeyDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(license.licenseKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = license.licenseKey;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [license.licenseKey]);

  const displayKey = isRevealed
    ? license.licenseKey
    : maskLicenseKey(license.licenseKey);

  return (
    <div
      className={`rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 ${className}`}
    >
      {/* Header row: badges */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-[#1E4DB7]" />
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${licenseTypeColors[license.licenseType as LicenseType]}`}
        >
          {licenseTypeLabels[license.licenseType as LicenseType] ??
            license.licenseType}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${licenseStatusColors[license.status as LicenseStatus]}`}
        >
          {licenseStatusLabels[license.status as LicenseStatus] ??
            license.status}
        </span>
      </div>

      {/* License key row */}
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 font-mono text-sm text-neutral-800 dark:text-neutral-200 tracking-wider select-all overflow-hidden text-ellipsis whitespace-nowrap">
          <AnimatePresence mode="wait">
            <motion.span
              key={isRevealed ? "revealed" : "masked"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {displayKey}
            </motion.span>
          </AnimatePresence>
        </code>

        {/* Reveal toggle */}
        <button
          onClick={toggleReveal}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isRevealed ? "Hide license key" : "Reveal license key"}
          aria-label={isRevealed ? "Hide license key" : "Reveal license key"}
        >
          {isRevealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Copy license key"
          aria-label="Copy license key"
        >
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check className="h-4 w-4 text-green-600" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Activation count */}
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Activations: {license.activationCount}/{license.maxActivations}
        </span>
        {license.expiresAt && (
          <span>
            Expires:{" "}
            {new Date(license.expiresAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
