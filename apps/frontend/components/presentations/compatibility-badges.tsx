"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSoftwareInfo, getSoftwareIconLetter } from "@/lib/presentation-utils";

// =============================================================================
// Types
// =============================================================================

interface CompatibilityBadgesProps {
  compatibility: string[];
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function CompatibilityBadges({
  compatibility,
  className = "",
}: CompatibilityBadgesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!compatibility.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {compatibility.map((software, idx) => {
        const info = getSoftwareInfo(software);
        const letter = getSoftwareIconLetter(software);

        return (
          <div
            key={software}
            className="relative"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-default"
            >
              {/* Icon circle */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: info.color }}
              >
                {letter}
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {info.shortName}
              </span>
            </motion.div>

            {/* Tooltip on hover */}
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                >
                  <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    {info.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="w-2 h-2 bg-neutral-900 dark:bg-neutral-100 rotate-45" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default CompatibilityBadges;
