"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Info } from "lucide-react";
import { COMPLIANCE_LABELS } from "@/types/solution-document";

// =============================================================================
// Types
// =============================================================================

interface ComplianceBadgesProps {
  frameworks: string[];
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ComplianceBadges({
  frameworks,
  className = "",
}: ComplianceBadgesProps) {
  const [hoveredFramework, setHoveredFramework] = useState<string | null>(null);

  if (!frameworks || frameworks.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Compliance Frameworks
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {frameworks.map((framework) => {
          const key = framework.toLowerCase().replace(/[\s_]/g, "");
          const info = COMPLIANCE_LABELS[key];
          const label = info?.label || framework.toUpperCase();
          const colorClass =
            info?.color ||
            "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

          return (
            <div
              key={framework}
              className="relative"
              onMouseEnter={() => setHoveredFramework(framework)}
              onMouseLeave={() => setHoveredFramework(null)}
            >
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${colorClass} transition-all duration-200 cursor-default`}
              >
                <Shield className="h-3 w-3" />
                {label}
              </span>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredFramework === framework && info?.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56"
                  >
                    <div className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs leading-relaxed p-3 rounded-xl shadow-xl border border-neutral-800 dark:border-neutral-600">
                      <div className="flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
                        <p>{info.description}</p>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-neutral-900 dark:bg-neutral-700 rotate-45 border-b border-r border-neutral-800 dark:border-neutral-600" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ComplianceBadges;
