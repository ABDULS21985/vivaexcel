"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/lib/utils";
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Crown,
  UserCircle,
  MoreHorizontal,
  Feather,
} from "lucide-react";

// =============================================================================
// Collab Nav Sidebar (Left Sidebar - X/Twitter style)
// =============================================================================

interface CollabNavSidebarProps {
  activeTab: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  proBadge?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/collab" },
  { id: "explore", label: "Explore", icon: Search, href: "/collab/explore" },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/collab/notifications",
    badge: "20+",
  },
  { id: "messages", label: "Messages", icon: Mail, href: "/collab/messages" },
  {
    id: "bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    href: "/collab/bookmarks",
  },
  {
    id: "premium",
    label: "Premium",
    icon: Crown,
    href: "/collab/premium",
    proBadge: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    href: "/collab/profile",
  },
  { id: "more", label: "More", icon: MoreHorizontal, href: "#" },
];

export function CollabNavSidebar({ activeTab }: CollabNavSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col",
        "sticky top-0 h-screen",
        "items-end lg:items-start",
        "pr-2 lg:pr-6",
        "pt-2"
      )}
    >
      <nav className="flex flex-1 flex-col items-center lg:items-stretch gap-1 w-full max-w-[260px]">
        {/* Logo / Brand */}
        <Link
          href="/collab"
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-1)]"
          aria-label="VivaExcel Collab Home"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-[var(--primary)]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.5 2h15A2.5 2.5 0 0 1 22 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2Zm3 6L12 16l4.5-8h-2.3L12 12.2 9.8 8H7.5Z" />
          </svg>
        </Link>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-4",
                "rounded-full px-3 py-3 lg:pr-6",
                "transition-colors duration-200",
                "hover:bg-[var(--surface-1)]",
                isActive
                  ? "font-bold text-[var(--foreground)]"
                  : "text-[var(--foreground)]"
              )}
            >
              {/* Icon wrapper with optional badge */}
              <span className="relative flex-shrink-0">
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isActive
                      ? "stroke-[2.5px]"
                      : "stroke-[1.5px] group-hover:stroke-[2px]"
                  )}
                />
                {/* Notification count badge */}
                {item.badge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                )}
              </span>

              {/* Label - only visible on lg+ */}
              <span
                className={cn(
                  "hidden lg:inline text-xl",
                  isActive ? "font-bold" : "font-normal"
                )}
              >
                {item.label}
              </span>

              {/* Pro badge for Premium */}
              {item.proBadge && (
                <span className="hidden lg:inline-flex items-center rounded-full bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                  Pro
                </span>
              )}
            </Link>
          );
        })}

        {/* Post Button */}
        <button
          className={cn(
            "mt-4 flex items-center justify-center",
            "rounded-full bg-[var(--primary)]",
            "text-white font-bold",
            "transition-all duration-200",
            "hover:opacity-90 active:scale-[0.98]",
            "shadow-lg shadow-[var(--primary)]/25",
            // Icon-only on md, full width on lg+
            "h-12 w-12 lg:h-auto lg:w-full lg:py-3 lg:px-6"
          )}
          aria-label="Create post"
        >
          {/* Icon for md screens */}
          <Feather className="h-5 w-5 lg:hidden" />
          {/* Full label for lg+ screens */}
          <span className="hidden lg:inline text-base">Post</span>
        </button>
      </nav>
    </aside>
  );
}
