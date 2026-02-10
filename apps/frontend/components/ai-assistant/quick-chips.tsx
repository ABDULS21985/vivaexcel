"use client";

// =============================================================================
// Quick Suggestion Chips
// =============================================================================
// A horizontally scrollable row of pill-shaped suggestion buttons that allow
// users to quickly send predefined messages. Chips animate in with a stagger.

import { motion } from "framer-motion";

// =============================================================================
// Types
// =============================================================================

interface QuickChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
};

// =============================================================================
// Component
// =============================================================================

export function QuickChips({ suggestions, onSelect, disabled }: QuickChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-none"
      role="list"
      aria-label="Suggested questions"
    >
      {suggestions.map((suggestion) => (
        <motion.button
          key={suggestion}
          type="button"
          variants={chipVariants}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          role="listitem"
          className={[
            "flex-shrink-0",
            "px-3 py-1.5",
            "text-xs font-medium",
            "rounded-full",
            "bg-white/60 dark:bg-slate-800/60",
            "backdrop-blur-sm",
            "border border-neutral-200/80 dark:border-slate-700/50",
            "text-neutral-700 dark:text-neutral-300",
            "hover:bg-[#1E4DB7]/10 dark:hover:bg-blue-500/20",
            "hover:border-[#1E4DB7]/30 dark:hover:border-blue-500/30",
            "hover:text-[#1E4DB7] dark:hover:text-blue-300",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/60 dark:disabled:hover:bg-slate-800/60",
            "whitespace-nowrap",
          ].join(" ")}
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
}
