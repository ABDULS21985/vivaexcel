"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Library,
  ShoppingCart,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useTranslations } from "next-intl";
import { TeamProvider, useTeamContext } from "@/providers/team-provider";

// ─── Navigation Data ────────────────────────────────────────────────────────

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { labelKey: "dashboard", href: "/team", icon: LayoutDashboard },
    ],
  },
  {
    title: "TEAM",
    items: [
      { labelKey: "members", href: "/team/members", icon: Users },
      { labelKey: "library", href: "/team/library", icon: Library },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { labelKey: "purchases", href: "/team/purchases", icon: ShoppingCart },
      { labelKey: "billing", href: "/team/billing", icon: CreditCard },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { labelKey: "settings", href: "/team/settings", icon: Settings },
    ],
  },
];

const mobileTabItems: NavItem[] = [
  { labelKey: "dashboard", href: "/team", icon: LayoutDashboard },
  { labelKey: "members", href: "/team/members", icon: Users },
  { labelKey: "library", href: "/team/library", icon: Library },
  { labelKey: "purchases", href: "/team/purchases", icon: ShoppingCart },
  { labelKey: "settings", href: "/team/settings", icon: Settings },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === "/team") return pathname === "/team" || pathname.endsWith("/team");
  return pathname.includes(href);
}

function TeamSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("team.nav");
  const { activeTeam, teams, setActiveTeamId } = useTeamContext();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Team Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {activeTeam?.name || "Select Team"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {activeTeam?.plan?.replace("team_", "").replace("_", " ") || "No plan"}
            </p>
          </div>
        )}
      </div>

      {/* Team Selector (when multiple teams) */}
      {!collapsed && teams.length > 1 && (
        <div className="border-b border-border/50 px-3 py-2">
          <select
            className="w-full rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs"
            value={activeTeam?.id || ""}
            onChange={(e) => setActiveTeamId(e.target.value)}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="team-nav-active"
                        className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Nav ──────────────────────────────────────────────────────

function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("team.nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border/50 bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      {mobileTabItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] transition-colors",
              active
                ? "font-medium text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

function TeamLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("team_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("team_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <TeamSidebar collapsed={collapsed} onToggle={handleToggle} />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 pb-20 lg:pb-0",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamProvider>
      <TeamLayoutInner>{children}</TeamLayoutInner>
    </TeamProvider>
  );
}
