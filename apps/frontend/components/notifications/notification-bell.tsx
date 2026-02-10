"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { cn } from "@ktblog/ui/components";
import { useUnreadCount } from "@/hooks/use-notifications";
import { NotificationPanel } from "./notification-panel";

// =============================================================================
// Notification Bell Component
// =============================================================================
// Header notification bell icon with animated unread count badge.
// Opens a dropdown notification panel on click.

export interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [shouldBounce, setShouldBounce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useUnreadCount();
  const unreadCount = data?.count ?? 0;

  // Detect count changes for bounce animation
  useEffect(() => {
    if (unreadCount > prevCount && prevCount !== 0) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={togglePanel}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
          "text-neutral-600 dark:text-neutral-400",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-2",
          isOpen && "bg-neutral-100 dark:bg-neutral-800"
        )}
      >
        <motion.div
          animate={
            shouldBounce
              ? {
                  rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                  transition: { duration: 0.5 },
                }
              : {}
          }
        >
          <Bell className="w-5 h-5" />
        </motion.div>

        {/* Unread Badge */}
        <AnimatePresence mode="wait">
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1 rounded-full",
                "bg-red-500 text-white text-[10px] font-bold leading-none",
                "ring-2 ring-white dark:ring-neutral-900"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 top-full mt-2",
              "right-0 md:right-0",
              // On small screens, center the panel
              "max-sm:-right-16"
            )}
          >
            <NotificationPanel onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
