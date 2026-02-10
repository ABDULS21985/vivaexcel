"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Pin,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MessageSquare,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { useDiscussionThread } from "@/hooks/use-discussions";
import { ReplyItem } from "@/components/community/reply-item";
import { ReplyForm } from "@/components/community/reply-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { DiscussionReply } from "@/types/discussion";

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getUserInitials(user?: { firstName: string; lastName: string }): string {
  if (!user) return "?";
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Build a nested reply tree from a flat list.
 * Top-level replies (parentId === undefined) become root nodes.
 * Child replies are nested under their parent.
 */
function buildReplyTree(replies: DiscussionReply[]): DiscussionReply[] {
  const map = new Map<string, DiscussionReply>();
  const roots: DiscussionReply[] = [];

  // First pass: clone all replies into a map
  for (const reply of replies) {
    map.set(reply.id, { ...reply, replies: [] });
  }

  // Second pass: attach children to parents
  for (const reply of replies) {
    const node = map.get(reply.id)!;
    if (reply.parentId && map.has(reply.parentId)) {
      map.get(reply.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// Category color mapping
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

// =============================================================================
// Component
// =============================================================================

interface ThreadDetailClientProps {
  slug: string;
}

export default function ThreadDetailClient({ slug }: ThreadDetailClientProps) {
  const t = useTranslations("discussion");
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useDiscussionThread(slug);

  const thread = data?.thread;
  const replies = data?.replies ?? [];

  // Build nested reply tree
  const nestedReplies = useMemo(() => buildReplyTree(replies), [replies]);

  const categoryColors = useMemo(() => {
    const color = thread?.category?.color || "";
    return CATEGORY_COLOR_MAP[color] || DEFAULT_CATEGORY_COLOR;
  }, [thread?.category?.color]);

  // Check if thread has an accepted answer
  const hasAcceptedAnswer = useMemo(
    () => replies.some((r) => r.isAnswer),
    [replies],
  );

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb skeleton */}
            <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-6 animate-pulse" />

            {/* Title skeleton */}
            <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 animate-pulse" />

            {/* Meta skeleton */}
            <div className="flex gap-4 mb-6">
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-3 mb-8">
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>

            {/* Reply skeletons */}
            <div className="h-px bg-neutral-200 dark:bg-neutral-800 mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-3 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (isError || !thread) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center py-20">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              {t("threadNotFound")}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              {t("threadNotFoundDescription")}
            </p>
            <Link href="/community/discussions">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("backToDiscussions")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: t("community"), href: "/community" },
              { label: t("discussions"), href: "/community/discussions" },
              { label: thread.title },
            ]}
            className="mb-6"
          />

          {/* ============================================================= */}
          {/* THREAD HEADER                                                  */}
          {/* ============================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              {thread.title}
            </h1>

            {/* Category badge + user info + date + views */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {thread.category && (
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    categoryColors.bg,
                    categoryColors.text,
                  )}
                >
                  {thread.category.name}
                </span>
              )}

              <div className="flex items-center gap-2">
                {thread.user?.avatar ? (
                  <img
                    src={thread.user.avatar}
                    alt={`${thread.user.firstName} ${thread.user.lastName}`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                    {getUserInitials(thread.user)}
                  </div>
                )}
                <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                  {thread.user
                    ? `${thread.user.firstName} ${thread.user.lastName}`
                    : t("anonymousUser")}
                </span>
              </div>

              <span className="text-neutral-300 dark:text-neutral-700">
                &middot;
              </span>
              <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(thread.createdAt)}
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">
                &middot;
              </span>
              <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                <Eye className="h-3.5 w-3.5" />
                {thread.viewCount} {t("views")}
              </span>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {thread.isPinned && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">
                  <Pin className="h-3 w-3 me-1" />
                  {t("pinned")}
                </Badge>
              )}
              {thread.isLocked && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0">
                  <Lock className="h-3 w-3 me-1" />
                  {t("locked")}
                </Badge>
              )}
              {thread.isClosed && (
                <Badge className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-0">
                  <XCircle className="h-3 w-3 me-1" />
                  {t("closed")}
                </Badge>
              )}
              {hasAcceptedAnswer && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0">
                  <CheckCircle className="h-3 w-3 me-1" />
                  {t("answered")}
                </Badge>
              )}
            </div>

            {/* Thread body */}
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
              <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {thread.content}
              </div>
            </div>

            {/* Tags */}
            {thread.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {thread.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* ============================================================= */}
          {/* DIVIDER                                                        */}
          {/* ============================================================= */}
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-8" />

          {/* ============================================================= */}
          {/* REPLIES SECTION                                                */}
          {/* ============================================================= */}
          <div>
            {/* Replies header */}
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {thread.replyCount} {thread.replyCount === 1 ? t("replySingular") : t("replies")}
              </h2>
            </div>

            {/* Reply list */}
            {nestedReplies.length > 0 ? (
              <div className="space-y-4 mb-8">
                {nestedReplies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    threadUserId={thread.userId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 mb-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                <p>{t("noRepliesYet")}</p>
              </div>
            )}

            {/* Reply form */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                {thread.isLocked ? t("threadIsLocked") : t("leaveReply")}
              </h3>
              <ReplyForm
                threadId={thread.id}
                isLocked={thread.isLocked}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
