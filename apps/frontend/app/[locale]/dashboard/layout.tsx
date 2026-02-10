"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  BarChart3,
  User,
  CreditCard,
  Bookmark,
  Clock,
  Trophy,
  Settings,
  ChevronRight,
} from "lucide-react";

// =============================================================================
// Dashboard Layout
// =============================================================================
// Shared layout for all /dashboard/* pages. Provides a sidebar navigation on
// desktop and a horizontal scrollable nav on mobile for quick page switching.

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
  { label: "Reading History", href: "/dashboard/history", icon: Clock },
  { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Strip locale prefix for matching (e.g., /en/dashboard → /dashboard)
  const normalizedPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");

  function isActive(href: string, exact?: boolean) {
    if (exact) return normalizedPath === href;
    return normalizedPath.startsWith(href);
  }

  const initials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || "U";

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-72px)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-6 lg:py-8">
        {/* Mobile: Horizontal scrollable nav */}
        <nav
          className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide"
          aria-label="Dashboard navigation"
        >
          {sidebarLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
                  active
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-8">
          {/* Desktop: Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-[calc(72px+2rem)]">
              {/* User Card */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-4">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--border)]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[var(--primary)]/20">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2"
                aria-label="Dashboard navigation"
              >
                <ul className="space-y-0.5">
                  {sidebarLinks.map((link) => {
                    const active = isActive(link.href, link.exact);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                            active
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/15"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <link.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              active
                                ? "text-[var(--primary)]"
                                : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                            )}
                          />
                          <span className="flex-1">{link.label}</span>
                          {active && (
                            <ChevronRight className="h-4 w-4 text-[var(--primary)] opacity-60" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
