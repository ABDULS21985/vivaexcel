"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@ktblog/ui/lib/utils";
import { toast } from "sonner";
import {
  Search,
  X,
  BadgeCheck,
  Radio,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { TrendingTopic, LiveEvent, NewsItem } from "@/types/collab";

// =============================================================================
// Trending Sidebar (Right Sidebar - X/Twitter style)
// =============================================================================

interface TrendingSidebarProps {
  trending: TrendingTopic[];
  liveEvents: LiveEvent[];
  news: NewsItem[];
}

/** Format large numbers into compact notation (e.g. 1.2K, 34K) */
function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return count.toLocaleString();
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function SidebarSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && query.trim()) {
        toast.info(`Search for "${query.trim()}" coming soon`);
      }
    },
    [query],
  );

  return (
    <div className="sticky top-0 z-10 bg-[var(--background)] pb-3 pt-1">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className={cn(
            "w-full rounded-full bg-[var(--surface-1)] py-2.5 pl-11 pr-4",
            "text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
            "border border-transparent outline-none",
            "focus:border-[var(--primary)] focus:bg-[var(--background)]",
            "transition-colors duration-200"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] p-0.5 text-white"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function PremiumCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          VivaExcel Premium
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
          <Sparkles className="h-3 w-3" />
          PRO
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        Unlock advanced analytics, priority support, and exclusive Excel
        templates. Supercharge your productivity.
      </p>
      <button
        className={cn(
          "w-full rounded-full bg-[var(--primary)] px-4 py-2",
          "text-sm font-bold text-white",
          "transition-all duration-200",
          "hover:opacity-90 active:scale-[0.98]"
        )}
      >
        Subscribe
      </button>
    </div>
  );
}

function LiveEventsSection({ events }: { events: LiveEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Live Now
        </h3>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href="/collab"
            className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--surface-1)]"
          >
            <img
              src={event.hostAvatar}
              alt={event.host}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {event.host}
                </span>
                {event.isHostVerified && (
                  <BadgeCheck className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                )}
              </div>
              <p className="truncate text-sm text-[var(--muted-foreground)]">
                {event.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                <Radio className="h-3 w-3 text-red-500" />
                <span>{formatCount(event.listenerCount)} listening</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewsSection({ news }: { news: NewsItem[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || news.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Today&apos;s News
        </h3>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--foreground)]"
          aria-label="Dismiss news"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <Link
            key={item.id}
            href="/collab"
            className="group block rounded-lg p-2 transition-colors hover:bg-[var(--surface-1)]"
          >
            <h4 className="text-sm font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
              {item.title}
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <span>{item.timeAgo}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{item.category}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {item.avatars.slice(0, 3).map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt=""
                    className="h-5 w-5 rounded-full border-2 border-[var(--card)] object-cover"
                  />
                ))}
                {item.avatars.length > 3 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--card)] bg-[var(--surface-2)] text-[9px] font-medium text-[var(--muted-foreground)]">
                    +{item.avatars.length - 3}
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatCount(item.postCount)} posts
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TrendingSection({ topics }: { topics: TrendingTopic[] }) {
  if (topics.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-3 text-xl font-extrabold text-[var(--foreground)]">
        What&apos;s happening
      </h3>

      <div className="space-y-1">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href="/collab"
            className="group block rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--surface-1)]"
          >
            <span className="text-xs text-[var(--muted-foreground)]">
              {topic.category}
            </span>
            <h4 className="text-sm font-bold leading-tight text-[var(--foreground)]">
              {topic.title}
            </h4>
            <span className="text-xs text-[var(--muted-foreground)]">
              {formatCount(topic.postCount)} posts
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/collab"
        className="mt-2 flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-[var(--primary)] transition-colors hover:bg-[var(--surface-1)]"
      >
        Show more
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function SidebarFooter() {
  const links = [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-3">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:underline"
        >
          {link.label}
        </Link>
      ))}
      <span className="text-xs text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} VivaExcel
      </span>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function TrendingSidebar({
  trending,
  liveEvents,
  news,
}: TrendingSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden xl:block",
        "sticky top-0 h-screen max-h-screen w-[350px] flex-shrink-0",
        "overflow-y-auto scrollbar-hide",
        "pl-6"
      )}
    >
      <div className="flex flex-col gap-4 pb-4">
        {/* Search */}
        <SidebarSearch />

        {/* Premium CTA */}
        <PremiumCard />

        {/* Live Events */}
        <LiveEventsSection events={liveEvents} />

        {/* Today's News */}
        <NewsSection news={news} />

        {/* Trending Topics */}
        <TrendingSection topics={trending} />

        {/* Footer Links */}
        <SidebarFooter />
      </div>
    </aside>
  );
}
