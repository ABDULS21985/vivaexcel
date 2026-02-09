"use client";

import { motion } from "framer-motion";
import {
  Industry,
  INDUSTRY_LABELS,
  INDUSTRY_ICONS,
  INDUSTRY_COLORS,
} from "@/types/presentation";

// =============================================================================
// Types
// =============================================================================

interface IndustryFilterProps {
  counts: Partial<Record<Industry, number>>;
  selected?: Industry;
  onSelect: (industry?: Industry) => void;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const ALL_INDUSTRIES = Object.values(Industry);

// =============================================================================
// Component
// =============================================================================

export function IndustryFilter({
  counts,
  selected,
  onSelect,
  className = "",
}: IndustryFilterProps) {
  const totalCount = Object.values(counts).reduce(
    (sum, c) => sum + (c ?? 0),
    0,
  );

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
        Industry
      </h3>
      <div className="space-y-1">
        {/* All Industries option */}
        <button
          onClick={() => onSelect(undefined)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            !selected
              ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🌐</span>
            <span>All Industries</span>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              !selected
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Individual industries */}
        {ALL_INDUSTRIES.map((industry) => {
          const count = counts[industry] ?? 0;
          const isSelected = selected === industry;
          const icon = INDUSTRY_ICONS[industry];
          const label = INDUSTRY_LABELS[industry];
          const color = INDUSTRY_COLORS[industry];

          return (
            <motion.button
              key={industry}
              onClick={() => onSelect(isSelected ? undefined : industry)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isSelected
                  ? "font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: `${color}15`,
                      color: color,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/50 dark:bg-black/20"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default IndustryFilter;
