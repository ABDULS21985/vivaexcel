"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Pin,
  Lock,
  CheckCircle,
  MessageSquare,
  Eye,
  Clock,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Badge } from "@ktblog/ui/components";
import type { DiscussionThread } from "@/types/discussion";

// =============================================================================
// Helpers
// =============================================================================

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

// Category color mapping (shared with category-card)
const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  green: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
  red: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
  teal: { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
};

const DEFAULT_CATEGORY_COLOR = {
  bg: "bg-neutral-100 dark:bg-neutral-800/40",
  text: "text-neutral-700 dark:text-neutral-300",
};

function getUserInitials(user?: { firstName: string; lastName: string }): string {
  if (!user) return "?";
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

// =============================================================================
// Props
// =============================================================================

interface ThreadCardProps {
  thread: DiscussionThread;
}

// =============================================================================
// Component
// =============================================================================

export function ThreadCard({ thread }: ThreadCardProps) {
  const t = useTranslations("discussion");

  const categoryColors = useMemo(() => {
    const color = thread.category?.color || "";
    return CATEGORY_COLOR_MAP[color] || DEFAULT_CATEGORY_COLOR;
  }, [thread.category?.color]);

  const relativeTime = useMemo(
    () => getRelativeTime(thread.createdAt),
    [thread.createdAt],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 p-4 md:p-5",
        "hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-200",
        thread.isPinned && "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-800/30",
        thread.isLocked && "opacity-75",
      )}
    >
      {/* Top row: Status icons + Title + Category */}
      <div className="flex items-start gap-3">
        {/* Status icons column */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
          {thread.isPinned && (
            <Pin className="h-4 w-4 text-amber-500" aria-label={t("pinned")} />
          )}
          {thread.isLocked && (
            <Lock className="h-4 w-4 text-red-400" aria-label={t("locked")} />
          )}
          {!thread.isPinned && !thread.isLocked && (
            <MessageSquare className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title + Category badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Link
              href={`/community/discussions/${thread.slug}`}
              className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
            >
              {thread.title}
            </Link>
            {thread.category && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                  categoryColors.bg,
                  categoryColors.text,
                )}
              >
                {thread.category.name}
              </span>
            )}
            {/* Answered badge (check if any reply has isAnswer set) */}
            {thread.replyCount > 0 && (
              <CheckCircle className="h-3.5 w-3.5 text-green-500 hidden" aria-hidden="true" />
            )}
          </div>

          {/* User info + relative time */}
          <div className="flex items-center gap-2 mb-3">
            {/* Avatar */}
            {thread.user?.avatar ? (
              <img
                src={thread.user.avatar}
                alt={`${thread.user.firstName} ${thread.user.lastName}`}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                {getUserInitials(thread.user)}
              </div>
            )}
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {thread.user
                ? `${thread.user.firstName} ${thread.user.lastName}`
                : t("anonymousUser")}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700 text-xs">
              &middot;
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
              <Clock className="h-3 w-3" />
              {relativeTime}
            </span>
          </div>

          {/* Bottom row: Stats + Tags */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Reply count */}
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="h-3.5 w-3.5" />
              {thread.replyCount}
            </span>

            {/* View count */}
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Eye className="h-3.5 w-3.5" />
              {thread.viewCount}
            </span>

            {/* Tags */}
            {thread.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {thread.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
                {thread.tags.length > 3 && (
                  <span className="text-[10px] text-neutral-400">
                    +{thread.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ThreadCard;
