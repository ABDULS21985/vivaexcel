"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { formatSlideCount, getSlideCountCategory } from "@/lib/presentation-utils";

// =============================================================================
// Types
// =============================================================================

interface SlideCountBadgeProps {
  count: number;
  className?: string;
}

// =============================================================================
// Styling Maps
// =============================================================================

const CATEGORY_STYLES = {
  compact: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Compact",
  },
  standard: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Standard",
  },
  comprehensive: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    label: "Comprehensive",
  },
};

// =============================================================================
// Component
// =============================================================================

export function SlideCountBadge({ count, className = "" }: SlideCountBadgeProps) {
  const category = getSlideCountCategory(count);
  const style = CATEGORY_STYLES[category];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${style.bg} ${className}`}
    >
      <Layers className={`h-3.5 w-3.5 ${style.text}`} />
      <span className={`text-xs font-bold ${style.text}`}>
        {formatSlideCount(count)}
      </span>
      <span
        className={`text-[10px] font-medium uppercase tracking-wider ${style.text} opacity-70`}
      >
        {style.label}
      </span>
    </motion.div>
  );
}

export default SlideCountBadge;
