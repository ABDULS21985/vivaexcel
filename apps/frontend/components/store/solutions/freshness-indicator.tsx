"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import {
  getFreshnessLabel,
  getFreshnessColor,
  getFreshnessBgColor,
} from "@/lib/solution-document-utils";

// =============================================================================
// Types
// =============================================================================

interface FreshnessIndicatorProps {
  score: number;
  lastUpdated?: string;
  variant?: "bar" | "circular";
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function FreshnessIndicator({
  score,
  lastUpdated,
  variant = "bar",
  className = "",
}: FreshnessIndicatorProps) {
  const label = getFreshnessLabel(score);
  const textColor = getFreshnessColor(score);
  const bgColor = getFreshnessBgColor(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  if (variant === "circular") {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedScore / 100) * circumference;

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 64 64"
          >
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-neutral-200 dark:text-neutral-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={textColor}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${textColor}`}>
              {clampedScore}
            </span>
          </div>
        </div>

        <div>
          <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
          {formattedDate && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              Updated {formattedDate}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Bar variant (default)
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${textColor}`} />
          <span className={`text-xs font-semibold ${textColor}`}>
            {label}
          </span>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {clampedScore}/100
        </span>
      </div>

      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {formattedDate && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last updated {formattedDate}
        </p>
      )}
    </div>
  );
}

export default FreshnessIndicator;
