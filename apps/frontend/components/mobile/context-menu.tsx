"use client";

// =============================================================================
// Mobile Context Menu
// =============================================================================
// A long-press-triggered context menu designed for mobile interactions.
// Uses the existing useLongPress hook for gesture detection and framer-motion
// for smooth scale/opacity entry animations from the press point.
// Traps focus inside the menu, supports keyboard navigation, and provides
// haptic feedback on trigger.

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface ContextMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon rendered to the left of the label */
  icon?: ReactNode;
  /** If true, renders with destructive (red) styling */
  destructive?: boolean;
  /** If true, item is visually disabled and non-interactive */
  disabled?: boolean;
  /** Callback invoked when the item is selected */
  onSelect: () => void;
}

export interface MobileContextMenuProps {
  /** Content that triggers the context menu on long press */
  children: ReactNode;
  /** Menu items to display */
  items: ContextMenuItem[];
  /** Whether the context menu is disabled */
  disabled?: boolean;
  /** Duration in milliseconds before the long press fires. Default: 500 */
  longPressDuration?: number;
}

// =============================================================================
// Constants
// =============================================================================

/** Menu entry animation spring config */
const MENU_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

/** Maximum movement before long press is cancelled */
const MOVE_TOLERANCE = 10;

// =============================================================================
// Component
// =============================================================================

/**
 * Mobile Context Menu
 *
 * Wraps children and triggers a context menu on long press. The menu appears
 * at the press position with a scale animation from the origin point.
 *
 * @example
 * ```tsx
 * <MobileContextMenu
 *   items={[
 *     { id: "edit", label: "Edit", icon: <Pencil size={18} />, onSelect: handleEdit },
 *     { id: "delete", label: "Delete", icon: <Trash2 size={18} />, destructive: true, onSelect: handleDelete },
 *   ]}
 * >
 *   <ProductCard product={product} />
 * </MobileContextMenu>
 * ```
 */
export function MobileContextMenu({
  children,
  items,
  disabled = false,
  longPressDuration = 500,
}: MobileContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // ---------------------------------------------------------------------------
  // Focus trapping
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menuElement = menuRef.current;
    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [role="menuitem"]:not([aria-disabled="true"])',
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        const focusable = menuElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="menuitem"]:not([aria-disabled="true"])',
        );
        if (focusable.length === 0) return;

        const currentIndex = Array.from(focusable).indexOf(
          document.activeElement as HTMLElement,
        );

        let nextIndex: number;
        if (event.shiftKey) {
          nextIndex =
            currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        } else {
          nextIndex =
            currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
        }
        focusable[nextIndex].focus();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const focusable = menuElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="menuitem"]:not([aria-disabled="true"])',
        );
        const currentIndex = Array.from(focusable).indexOf(
          document.activeElement as HTMLElement,
        );
        const nextIndex =
          currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
        focusable[nextIndex].focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const focusable = menuElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="menuitem"]:not([aria-disabled="true"])',
        );
        const currentIndex = Array.from(focusable).indexOf(
          document.activeElement as HTMLElement,
        );
        const nextIndex =
          currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        focusable[nextIndex].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Position calculation — keep menu within viewport
  // ---------------------------------------------------------------------------

  const calculatePosition = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      const menuWidth = 220;
      const menuItemHeight = 48;
      const menuHeight = items.length * menuItemHeight + 16; // padding
      const margin = 16;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Horizontal: center on mobile if near edges
      if (viewportWidth < 480) {
        adjustedX = (viewportWidth - menuWidth) / 2;
      } else {
        if (x + menuWidth + margin > viewportWidth) {
          adjustedX = viewportWidth - menuWidth - margin;
        }
        if (x - margin < 0) {
          adjustedX = margin;
        }
      }

      // Vertical: ensure menu fits within viewport
      if (y + menuHeight + margin > viewportHeight) {
        adjustedY = y - menuHeight;
        if (adjustedY < margin) {
          adjustedY = margin;
        }
      }

      return { x: adjustedX, y: adjustedY };
    },
    [items.length],
  );

  // ---------------------------------------------------------------------------
  // Long press handlers (inline to avoid circular hook dependency)
  // ---------------------------------------------------------------------------

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return;

      const touch = event.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };

      clearTimer();

      timerRef.current = setTimeout(() => {
        const pos = calculatePosition(touch.clientX, touch.clientY);
        setPosition(pos);
        setIsOpen(true);

        // Haptic feedback on trigger
        try {
          navigator.vibrate?.(20);
        } catch {
          // Best-effort
        }
      }, longPressDuration);

      // Attach move listener to cancel on scroll
      const handleMove = (moveEvent: TouchEvent) => {
        if (!startPosRef.current) return;
        const moveTouch = moveEvent.touches[0];
        const dx = moveTouch.clientX - startPosRef.current.x;
        const dy = moveTouch.clientY - startPosRef.current.y;

        if (Math.sqrt(dx * dx + dy * dy) > MOVE_TOLERANCE) {
          clearTimer();
          document.removeEventListener("touchmove", handleMove);
        }
      };

      document.addEventListener("touchmove", handleMove, { passive: true });

      const cleanup = () => {
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", cleanup);
        document.removeEventListener("touchcancel", cleanup);
      };
      document.addEventListener("touchend", cleanup, { once: true });
      document.addEventListener("touchcancel", cleanup, { once: true });
    },
    [disabled, longPressDuration, clearTimer, calculatePosition],
  );

  const handleTouchEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleTouchCancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Also support mouse for desktop testing
  const handleContextMenuNative = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      const pos = calculatePosition(event.clientX, event.clientY);
      setPosition(pos);
      setIsOpen(true);
    },
    [disabled, calculatePosition],
  );

  // ---------------------------------------------------------------------------
  // Item selection
  // ---------------------------------------------------------------------------

  const handleSelect = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return;
    setIsOpen(false);
    item.onSelect();
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Trigger wrapper */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={handleContextMenuNative}
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {/* Menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="context-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Menu card */}
            <motion.div
              key="context-menu"
              ref={menuRef}
              role="menu"
              aria-modal="true"
              aria-label="Context menu"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={MENU_SPRING}
              style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                transformOrigin: "top left",
                zIndex: 9999,
              }}
              className={cn(
                "min-w-[200px] max-w-[280px]",
                "rounded-2xl shadow-2xl",
                "bg-white dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "py-2 overflow-hidden",
              )}
            >
              {items.map((item, index) => (
                <div key={item.id}>
                  {/* Divider between items */}
                  {index > 0 && (
                    <div className="mx-3 border-t border-gray-100 dark:border-gray-700" />
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    className={cn(
                      "flex w-full items-center gap-3 px-4",
                      "min-h-[48px] text-left",
                      "transition-colors duration-100",
                      "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      "focus-visible:bg-gray-50 dark:focus-visible:bg-gray-700/50",
                      "focus-visible:outline-none",
                      item.destructive && "text-red-500 dark:text-red-400",
                      !item.destructive &&
                        "text-gray-900 dark:text-gray-100",
                      item.disabled && "opacity-50 pointer-events-none",
                    )}
                    onClick={() => handleSelect(item)}
                    disabled={item.disabled}
                    aria-disabled={item.disabled || undefined}
                  >
                    {item.icon && (
                      <span
                        className={cn(
                          "flex-shrink-0",
                          item.destructive
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileContextMenu;
