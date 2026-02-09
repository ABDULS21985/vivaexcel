"use client";

// =============================================================================
// Chat Button (Floating Action Button)
// =============================================================================
// A fixed-position circular button that toggles the AI assistant chat panel.
// Features pulse animation when there are unread messages, spring entrance
// animation, and smooth icon transition between Sparkles and X states.

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread: boolean;
}

// =============================================================================
// Animation Variants
// =============================================================================

const buttonVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.5 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const iconVariants = {
  initial: { rotate: -90, scale: 0 },
  animate: {
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
  exit: {
    rotate: 90,
    scale: 0,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ChatButton({ isOpen, onClick, hasUnread }: ChatButtonProps) {
  return (
    <motion.div
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50"
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Pulse ring for unread indicator */}
      {hasUnread && !isOpen && (
        <span
          className="absolute inset-0 rounded-full bg-[#F59A23] animate-ping opacity-40"
          aria-hidden="true"
        />
      )}

      {/* Unread badge dot */}
      {hasUnread && !isOpen && (
        <span
          className="absolute -top-1 -right-1 z-10 h-4 w-4 rounded-full bg-[#F59A23] border-2 border-white dark:border-slate-900 shadow-sm"
          aria-label="New message from assistant"
        />
      )}

      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        className={[
          "relative flex items-center justify-center",
          "h-14 w-14 rounded-full",
          "bg-[#1E4DB7] hover:bg-[#143A8F]",
          "text-white shadow-xl",
          "transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-2",
          "cursor-pointer",
        ].join(" ")}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-center"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-center"
            >
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
