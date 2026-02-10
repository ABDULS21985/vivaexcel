"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import {
  useReadingHistory,
  extractHistory,
} from "@/hooks/use-reading-history";
import { useGamificationActivity } from "@/hooks/use-gamification";
import { useBookmarks, extractBookmarks } from "@/hooks/use-bookmarks";
import { Skeleton } from "@ktblog/ui/components";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Bookmark,
  Award,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActivityItem {
  id: string;
  type: "read" | "xp" | "bookmark";
  description: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const iconMap = {
  read: BookOpen,
  xp: Zap,
  bookmark: Bookmark,
} as const;

const dotColorMap = {
  read: "bg-blue-500",
  xp: "bg-amber-500",
  bookmark: "bg-purple-500",
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityFeed() {
  const { data: historyRaw, isLoading: historyLoading } = useReadingHistory(1, 10);
  const { data: activityRaw, isLoading: activityLoading } = useGamificationActivity(undefined, 10);
  const { data: bookmarksRaw, isLoading: bookmarksLoading } = useBookmarks(1, 10);

  const isLoading = historyLoading || activityLoading || bookmarksLoading;

  const items = useMemo<ActivityItem[]>(() => {
    const result: ActivityItem[] = [];

    // Reading history entries
    const history = extractHistory(historyRaw);
    for (const entry of history) {
      result.push({
        id: `read-${entry.id}`,
        type: "read",
        description: `You read '${entry.post.title}'`,
        timestamp: entry.readAt,
      });
    }

    // XP activity
    const xpItems = activityRaw?.items ?? [];
    for (const activity of xpItems) {
      result.push({
        id: `xp-${activity.id}`,
        type: "xp",
        description: `${activity.description} (+${activity.amount} XP)`,
        timestamp: activity.createdAt,
      });
    }

    // Bookmarks
    const bookmarks = extractBookmarks(bookmarksRaw);
    for (const bookmark of bookmarks) {
      result.push({
        id: `bookmark-${bookmark.id}`,
        type: "bookmark",
        description: `You bookmarked '${bookmark.post.title}'`,
        timestamp: bookmark.createdAt,
      });
    }

    // Sort by most recent first, take last 10
    result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return result.slice(0, 10);
  }, [historyRaw, activityRaw, bookmarksRaw]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="mb-8"
      aria-label="Recent activity"
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h2 className="font-semibold text-[var(--foreground)]">
              Recent Activity
            </h2>
          </div>
          <Link
            href="/dashboard/history"
            className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            View all activity
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3" />
            <p className="text-sm text-[var(--muted-foreground)]">
              No recent activity yet. Start reading, earning XP, or bookmarking articles!
            </p>
          </div>
        ) : (
          <div className="p-5">
            <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-5">
              {items.map((item) => {
                const Icon = iconMap[item.type];
                const dotColor = dotColorMap[item.type];

                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Dot on the timeline */}
                    <span
                      className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${dotColor}`}
                    />

                    {/* Icon + text */}
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[var(--foreground)] leading-snug">
                          {item.description}
                        </p>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
