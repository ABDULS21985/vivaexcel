"use client";

// =============================================================================
// Mobile Top Bar
// =============================================================================
// Minimal sticky top bar for mobile (<lg) that replaces the complex desktop
// navbar. Features: hamburger/back nav, brand logo, search trigger, notification
// bell, glass morphism with scroll-aware opacity, and RTL support.

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Menu, ArrowLeft, Search, Bell } from "lucide-react";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { isRtlLocale, type Locale } from "@/i18n/routing";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@ktblog/ui/components";
import { MobileSearchOverlay } from "./mobile-search-overlay";

// =============================================================================
// Constants
// =============================================================================

/** Brand color for accents */
const ACCENT_COLOR = "#F59A23";

/** Routes that are considered "root" level (show hamburger instead of back) */
const ROOT_ROUTES = ["/", "/store", "/blog", "/categories", "/about", "/contact"];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Determine if the current route is a root-level page.
 * Non-root pages show a back arrow to navigate up.
 */
function isRootRoute(pathname: string): boolean {
  return ROOT_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route;
  });
}

// =============================================================================
// Sub-components
// =============================================================================

/** Notification bell with an optional indicator dot */
function NotificationBell({ hasNotifications }: { hasNotifications: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "transition-colors duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      )}
      aria-label={hasNotifications ? "Notifications (new)" : "Notifications"}
    >
      <Bell size={20} className="text-gray-700 dark:text-gray-300" aria-hidden="true" />
      {hasNotifications && (
        <span
          className={cn(
            "absolute top-1.5 right-1.5",
            "w-2 h-2 rounded-full",
            "bg-red-500",
            "ring-2 ring-white dark:ring-gray-900",
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const isRtl = isRtlLocale(locale);
  const { isScrolled, scrollY } = useScrollDirection({
    threshold: 5,
    hideThreshold: 400,
    scrolledThreshold: 20,
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Determine navigation mode: hamburger (root) or back arrow (deep)
  const isRoot = useMemo(() => isRootRoute(pathname), [pathname]);

  // Calculate background opacity: 0.9 at rest, 1.0 when scrolled
  const bgOpacity = isScrolled ? 1 : 0.9;

  // Handle left button action
  const handleLeftAction = useCallback(() => {
    if (isRoot) {
      // Hamburger menu: dispatch a custom event that a drawer/sidebar can listen to
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mobile-menu-toggle"));
      }
    } else {
      // Back navigation
      router.back();
    }
  }, [isRoot, router]);

  // Open search overlay
  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // Close search overlay
  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          // Positioning
          "sticky top-0 left-0 right-0 z-40",
          // Only visible below lg breakpoint
          "flex lg:hidden",
          // Layout
          "h-14 items-center justify-between px-4",
          // Glass morphism
          "backdrop-blur-xl",
          // Top border for scrolled state
          "border-b transition-colors duration-200",
          isScrolled
            ? "border-gray-200/60 dark:border-gray-700/60"
            : "border-transparent",
        )}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        }}
        dir={isRtl ? "rtl" : "ltr"}
        role="banner"
        aria-label="Mobile top navigation"
      >
        {/* Dark mode background layer */}
        <div
          className="absolute inset-0 dark:block hidden transition-opacity duration-200 -z-10"
          style={{
            backgroundColor: `rgba(17, 24, 39, ${bgOpacity})`,
          }}
          aria-hidden="true"
        />

        {/* Left: Hamburger or Back arrow */}
        <div className="flex items-center">
          <motion.button
            type="button"
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            )}
            onClick={handleLeftAction}
            whileTap={{ scale: 0.92 }}
            aria-label={isRoot ? "Open menu" : "Go back"}
          >
            {isRoot ? (
              <Menu size={22} className="text-gray-800 dark:text-gray-200" aria-hidden="true" />
            ) : (
              <ArrowLeft
                size={22}
                className={cn(
                  "text-gray-800 dark:text-gray-200",
                  isRtl && "rotate-180",
                )}
                aria-hidden="true"
              />
            )}
          </motion.button>
        </div>

        {/* Center: Brand logo / name */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-1.5",
            "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md",
          )}
          aria-label="VivaExcel home"
        >
          <span
            className={cn(
              "text-lg font-bold tracking-tight",
              "bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]",
              "bg-clip-text text-transparent",
              "dark:from-blue-400 dark:to-blue-300",
              isRtl && "font-[var(--font-noto-arabic)]",
            )}
          >
            VivaExcel
          </span>
        </Link>

        {/* Right: Search + Notification bell */}
        <div className="flex items-center gap-0.5">
          <motion.button
            type="button"
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            )}
            onClick={handleSearchOpen}
            whileTap={{ scale: 0.92 }}
            aria-label="Open search"
          >
            <Search size={20} className="text-gray-700 dark:text-gray-300" aria-hidden="true" />
          </motion.button>

          <NotificationBell hasNotifications />
        </div>
      </motion.header>

      {/* Search Overlay */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={handleSearchClose} />
    </>
  );
}

export default MobileTopBar;
