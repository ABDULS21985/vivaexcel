"use client";

import { motion } from "framer-motion";
import {
  Domain,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_HEX_COLORS,
} from "@/types/solution-document";

// =============================================================================
// Types
// =============================================================================

interface DomainFilterProps {
  counts?: Partial<Record<Domain, number>>;
  selected: Domain[];
  onToggle: (domain: Domain) => void;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const ALL_DOMAINS = Object.values(Domain);

// =============================================================================
// Component
// =============================================================================

export function DomainFilter({
  counts,
  selected,
  onToggle,
  className = "",
}: DomainFilterProps) {
  const totalCount = counts
    ? Object.values(counts).reduce((sum, c) => sum + (c ?? 0), 0)
    : undefined;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
        Domain
      </h3>
      <div className="space-y-1">
        {ALL_DOMAINS.map((domain) => {
          const count = counts?.[domain];
          const isSelected = selected.includes(domain);
          const icon = DOMAIN_ICONS[domain];
          const label = DOMAIN_LABELS[domain];
          const color = DOMAIN_HEX_COLORS[domain];

          return (
            <motion.button
              key={domain}
              onClick={() => onToggle(domain)}
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
              {count !== undefined && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/50 dark:bg-black/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default DomainFilter;
