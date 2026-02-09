"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
} from "lucide-react";
import type { ProductUpdateInfo } from "@/types/delivery";

// =============================================================================
// Props
// =============================================================================

interface VersionTimelineProps {
  updates: ProductUpdateInfo[];
  currentVersion?: string;
  className?: string;
}

// =============================================================================
// Timeline Node
// =============================================================================

function TimelineNode({
  update,
  isCurrent,
  isFirst,
  isLast,
}: {
  update: ProductUpdateInfo;
  isCurrent: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  const formattedDate = new Date(update.publishedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex gap-4"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={`
            relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2
            ${
              isCurrent
                ? "border-[#1E4DB7] bg-[#1E4DB7] text-white shadow-md shadow-[#1E4DB7]/25"
                : update.isBreaking
                  ? "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                  : "border-neutral-300 bg-white text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-500"
            }
          `}
        >
          {update.isBreaking ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : isCurrent ? (
            <Tag className="h-3.5 w-3.5" />
          ) : (
            <GitBranch className="h-3.5 w-3.5" />
          )}
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 min-h-[24px]" />
        )}
      </div>

      {/* Content card */}
      <div className="flex-1 pb-6">
        <div
          className={`
            rounded-xl border p-4 transition-colors
            ${
              isCurrent
                ? "border-[#1E4DB7]/30 bg-[#1E4DB7]/5 dark:border-[#1E4DB7]/40 dark:bg-[#1E4DB7]/10"
                : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            }
          `}
        >
          {/* Version header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-bold ${
                  isCurrent
                    ? "text-[#1E4DB7] dark:text-blue-400"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                v{update.version}
              </span>

              {isCurrent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-blue-400">
                  Current
                </span>
              )}

              {update.isBreaking && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  Breaking
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Date on small screens */}
          <span className="sm:hidden flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>

          {/* Expandable release notes */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {update.releaseNotes}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function VersionTimeline({
  updates,
  currentVersion,
  className = "",
}: VersionTimelineProps) {
  // Sort updates by publishedAt descending (newest first)
  const sorted = [...updates].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div
        className={`text-center py-8 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
      >
        No version history available.
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {sorted.map((update, index) => (
          <TimelineNode
            key={update.id}
            update={update}
            isCurrent={currentVersion === update.version}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
          />
        ))}
      </motion.div>
    </div>
  );
}
