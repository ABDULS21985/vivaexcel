"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  CheckCircle,
  Clock,
  CornerDownRight,
} from "lucide-react";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { useToggleReplyLike, useMarkAsAnswer } from "@/hooks/use-discussions";
import { ReplyForm } from "./reply-form";
import type { DiscussionReply } from "@/types/discussion";

// =============================================================================
// Constants
// =============================================================================

const MAX_NESTING_DEPTH = 3;

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

function getUserInitials(user?: { firstName: string; lastName: string }): string {
  if (!user) return "?";
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

// =============================================================================
// Props
// =============================================================================

interface ReplyItemProps {
  reply: DiscussionReply;
  threadUserId: string;
  onReply?: (parentId: string) => void;
  depth?: number;
}

// =============================================================================
// Component
// =============================================================================

export function ReplyItem({
  reply,
  threadUserId,
  onReply,
  depth = 0,
}: ReplyItemProps) {
  const t = useTranslations("discussion");
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(reply.likesCount);

  const toggleLikeMutation = useToggleReplyLike();
  const markAsAnswerMutation = useMarkAsAnswer();

  const relativeTime = useMemo(
    () => getRelativeTime(reply.createdAt),
    [reply.createdAt],
  );

  const isThreadOwner = user?.id === threadUserId;
  const canMarkAsAnswer = isThreadOwner && !reply.isAnswer && isAuthenticated;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleLike = useCallback(() => {
    if (!isAuthenticated) return;

    // Optimistic update
    setLocalLiked((prev) => !prev);
    setLocalLikesCount((prev) => (localLiked ? prev - 1 : prev + 1));

    toggleLikeMutation.mutate(reply.id, {
      onError: () => {
        // Revert on error
        setLocalLiked((prev) => !prev);
        setLocalLikesCount(reply.likesCount);
      },
    });
  }, [isAuthenticated, localLiked, reply.id, reply.likesCount, toggleLikeMutation]);

  const handleMarkAsAnswer = useCallback(() => {
    if (!canMarkAsAnswer) return;
    markAsAnswerMutation.mutate(reply.id);
  }, [canMarkAsAnswer, reply.id, markAsAnswerMutation]);

  const handleReplyClick = useCallback(() => {
    if (onReply) {
      onReply(reply.id);
    }
    setShowReplyForm((prev) => !prev);
  }, [onReply, reply.id]);

  const handleReplySuccess = useCallback(() => {
    setShowReplyForm(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative",
        depth > 0 && "ms-8",
      )}
    >
      <div
        className={cn(
          "rounded-lg border border-neutral-200 dark:border-neutral-800",
          "bg-white dark:bg-neutral-900 p-4",
          reply.isAnswer &&
            "border-s-4 border-s-green-500 bg-green-50/50 dark:bg-green-950/10",
        )}
      >
        {/* Accepted Answer badge */}
        {reply.isAnswer && (
          <div className="flex items-center gap-1.5 mb-3">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0">
              <CheckCircle className="h-3 w-3 me-1" />
              {t("acceptedAnswer")}
            </Badge>
          </div>
        )}

        {/* User info + time */}
        <div className="flex items-center gap-2 mb-3">
          {reply.user?.avatar ? (
            <img
              src={reply.user.avatar}
              alt={`${reply.user.firstName} ${reply.user.lastName}`}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
              {getUserInitials(reply.user)}
            </div>
          )}
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {reply.user
              ? `${reply.user.firstName} ${reply.user.lastName}`
              : t("anonymousUser")}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">
            &middot;
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
            <Clock className="h-3 w-3" />
            {relativeTime}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed mb-4">
          {reply.content}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || toggleLikeMutation.isPending}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              "rounded-md px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800",
              localLiked
                ? "text-red-500"
                : "text-neutral-500 dark:text-neutral-400",
              !isAuthenticated && "opacity-50 cursor-not-allowed",
            )}
            aria-label={t("likeReply")}
          >
            <Heart
              className={cn("h-3.5 w-3.5", localLiked && "fill-current")}
            />
            {localLikesCount > 0 && <span>{localLikesCount}</span>}
          </button>

          {/* Reply button (only if under max depth) */}
          {depth < MAX_NESTING_DEPTH && isAuthenticated && (
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t("replyToComment")}
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              {t("reply")}
            </button>
          )}

          {/* Mark as Answer button */}
          {canMarkAsAnswer && (
            <button
              onClick={handleMarkAsAnswer}
              disabled={markAsAnswerMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 rounded-md px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t("markAsAnswer")}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {t("markAsAnswer")}
            </button>
          )}
        </div>

        {/* Inline reply form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <ReplyForm
                threadId={reply.threadId}
                parentId={reply.id}
                onCancel={() => setShowReplyForm(false)}
                onSuccess={handleReplySuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      {reply.children && reply.children.length > 0 && depth < MAX_NESTING_DEPTH && (
        <div className="mt-3 space-y-3">
          {reply.children.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              threadUserId={threadUserId}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ReplyItem;
