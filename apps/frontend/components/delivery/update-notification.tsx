"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpCircle,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import type { ProductUpdateInfo } from "@/types/delivery";

// =============================================================================
// Props
// =============================================================================

interface UpdateNotificationProps {
  update: ProductUpdateInfo;
  productTitle?: string;
  onViewDetails?: () => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function UpdateNotification({
  update,
  productTitle,
  onViewDetails,
  className = "",
}: UpdateNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const isBreaking = update.isBreaking;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          rounded-xl border p-4
          ${
            isBreaking
              ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
              : "border-[#1E4DB7]/20 bg-[#1E4DB7]/5 dark:border-[#1E4DB7]/30 dark:bg-[#1E4DB7]/10"
          }
          ${className}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 mt-0.5 ${
              isBreaking ? "text-amber-600" : "text-[#1E4DB7]"
            }`}
          >
            {isBreaking ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ArrowUpCircle className="h-5 w-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold ${
                  isBreaking
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-[#1E4DB7] dark:text-blue-400"
                }`}
              >
                Version {update.version} available
              </span>
              {isBreaking && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  Breaking Change
                </span>
              )}
            </div>

            {productTitle && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                {productTitle}
              </p>
            )}

            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className={`mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                  isBreaking
                    ? "text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                    : "text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300"
                }`}
              >
                View Details
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Dismiss"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
