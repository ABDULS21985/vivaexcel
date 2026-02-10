"use client";

import { cn } from "@ktblog/ui/lib/utils";
import type { FeedTab } from "@/types/collab";

// =============================================================================
// Types
// =============================================================================

export interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  className?: string;
}

// =============================================================================
// Tab Configuration
// =============================================================================

const TABS: { id: FeedTab; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
  { id: "excel", label: "Excel" },
  { id: "ai", label: "AI" },
  { id: "data", label: "Data" },
];

// =============================================================================
// FeedTabs Component
// =============================================================================

export function FeedTabs({ activeTab, onTabChange, className }: FeedTabsProps) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md",
        className
      )}
      role="tablist"
      aria-label="Feed tabs"
    >
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 px-4 py-4 text-sm font-medium transition-colors",
                "hover:bg-[var(--surface-1)]",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <span className="relative inline-block">
                {tab.label}

                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute -bottom-4 left-0 right-0 mx-auto h-[3px] w-full rounded-full bg-[var(--primary)]" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
