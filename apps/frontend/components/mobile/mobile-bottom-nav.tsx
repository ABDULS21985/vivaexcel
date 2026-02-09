"use client";

// =============================================================================
// Mobile Bottom Navigation
// =============================================================================
// Fixed bottom tab bar visible only on mobile (<lg breakpoint).
// Features: glass morphism, scroll-hide behavior, cart badge, haptic feedback,
// RTL support, safe-area insets, and spring-based animations.

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Store,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { isRtlLocale, type Locale } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

interface TabItem {
  /** Unique key for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Lucide icon component for inactive state */
  icon: LucideIcon;
  /** Route path to match against pathname */
  href: string;
  /** If true, this tab triggers an action instead of navigating */
  isAction?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const TABS: TabItem[] = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "store", label: "Store", icon: Store, href: "/store" },
  { key: "cart", label: "Cart", icon: ShoppingCart, href: "/cart", isAction: true },
  { key: "orders", label: "Orders", icon: Package, href: "/account/orders" },
  { key: "profile", label: "Profile", icon: User, href: "/account" },
];

/** Primary brand color for active tab */
const PRIMARY_COLOR = "#1E4DB7";

/** Spring config for the nav bar show/hide animation */
const NAV_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/** Spring config for the cart badge scale animation */
const BADGE_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 15,
};

/** Spring config for the active dot indicator */
const DOT_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// =============================================================================
// Helper: Determine if a tab is active
// =============================================================================

function isTabActive(tabHref: string, pathname: string): boolean {
  // Home tab: exact match only
  if (tabHref === "/") {
    return pathname === "/";
  }
  // Profile tab: match /account but not /account/orders
  if (tabHref === "/account") {
    return pathname === "/account" || pathname === "/account/profile";
  }
  // Other tabs: startsWith match
  return pathname.startsWith(tabHref);
}

// =============================================================================
// Sub-components
// =============================================================================

/** Animated badge showing the cart item count */
function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : String(count);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={BADGE_SPRING}
        className={cn(
          "absolute -top-1.5 -right-2.5",
          "flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1",
          "rounded-full bg-red-500 text-white",
          "text-[10px] font-bold leading-none",
          "shadow-sm shadow-red-500/30",
          "pointer-events-none select-none",
        )}
        aria-hidden="true"
      >
        {displayCount}
      </motion.span>
    </AnimatePresence>
  );
}

/** Active indicator dot below the tab label */
function ActiveDot() {
  return (
    <motion.span
      layoutId="active-tab-dot"
      className="mt-0.5 block h-1 w-1 rounded-full"
      style={{ backgroundColor: PRIMARY_COLOR }}
      transition={DOT_SPRING}
      aria-hidden="true"
    />
  );
}

/** Individual tab button / link */
function TabButton({
  tab,
  isActive,
  cartCount,
  onCartPress,
  isRtl,
}: {
  tab: TabItem;
  isActive: boolean;
  cartCount: number;
  onCartPress: () => void;
  isRtl: boolean;
}) {
  const Icon = tab.icon;

  const content = (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center",
        "w-full h-full",
        "min-w-[48px] min-h-[48px]",
        "cursor-pointer select-none",
        "transition-colors duration-200",
      )}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      role="tab"
      aria-selected={isActive}
      aria-label={tab.label}
      tabIndex={0}
    >
      {/* Icon wrapper with badge support */}
      <span className="relative inline-flex items-center justify-center">
        <Icon
          size={24}
          strokeWidth={isActive ? 2.5 : 1.75}
          className={cn(
            "transition-colors duration-200",
            isActive ? "text-[#1E4DB7] dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
          )}
          fill={isActive ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {tab.key === "cart" && <CartBadge count={cartCount} />}
      </span>

      {/* Label */}
      <span
        className={cn(
          "mt-0.5 text-[10px] leading-tight font-medium transition-colors duration-200",
          isActive ? "text-[#1E4DB7] dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
          isRtl && "font-[var(--font-noto-arabic)]",
        )}
      >
        {tab.label}
      </span>

      {/* Active indicator dot */}
      {isActive && <ActiveDot />}
    </motion.div>
  );

  // Cart tab triggers the cart drawer instead of navigating
  if (tab.isAction) {
    return (
      <button
        type="button"
        className="flex-1 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-md"
        onClick={onCartPress}
        aria-label={`${tab.label}${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={tab.href}
      className="flex-1 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-md"
      aria-label={tab.label}
    >
      {content}
    </Link>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const isRtl = isRtlLocale(locale);
  const { summary, openCart } = useCart();
  const { isHidden } = useScrollDirection({
    threshold: 10,
    hideThreshold: 100,
    scrolledThreshold: 50,
  });

  // Memoize the item count to avoid unnecessary re-renders
  const cartCount = useMemo(() => summary.itemCount, [summary.itemCount]);

  // Handle cart tab press
  const handleCartPress = useCallback(() => {
    openCart();
  }, [openCart]);

  // Determine which tab is active
  const activeTabKey = useMemo(() => {
    for (const tab of TABS) {
      if (isTabActive(tab.href, pathname)) {
        return tab.key;
      }
    }
    return "home";
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isHidden ? "100%" : 0 }}
      transition={NAV_SPRING}
      className={cn(
        // Positioning and layout
        "fixed bottom-0 left-0 right-0 z-50",
        // Only visible below lg breakpoint
        "flex lg:hidden",
        // Glass morphism background
        "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
        // Top border
        "border-t border-gray-200/50 dark:border-gray-700/50",
        // Safe area padding for notched devices
        "pb-[env(safe-area-inset-bottom,0px)]",
      )}
      dir={isRtl ? "rtl" : "ltr"}
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Tab items container */}
      <div className="flex w-full items-stretch">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTabKey === tab.key}
            cartCount={cartCount}
            onCartPress={handleCartPress}
            isRtl={isRtl}
          />
        ))}
      </div>
    </motion.nav>
  );
}

export default MobileBottomNav;
