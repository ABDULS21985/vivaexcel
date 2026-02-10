"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Reply, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Textarea } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { Link } from "@/i18n/routing";
import {
  useShowcaseComments,
  useAddShowcaseComment,
} from "@/hooks/use-showcases";
import type { ShowcaseComment } from "@/types/showcase";

// =============================================================================
// ShowcaseComments
// =============================================================================
// Comments section for the showcase detail page. Includes a comment form
// (auth-gated), comment list with nested replies, and load-more pagination.

interface ShowcaseCommentsProps {
  showcaseId: string;
}

// -----------------------------------------------------------------------------
// Relative time helper
// -----------------------------------------------------------------------------

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// -----------------------------------------------------------------------------
// Single Comment Component
// -----------------------------------------------------------------------------

interface CommentItemProps {
  comment: ShowcaseComment;
  showcaseId: string;
  depth?: number;
}

function CommentItem({ comment, showcaseId, depth = 0 }: CommentItemProps) {
  const t = useTranslations("showcase");
  const { isAuthenticated } = useAuth();
  const addComment = useAddShowcaseComment();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const userName = comment.user
    ? `${comment.user.firstName} ${comment.user.lastName}`
    : t("anonymousUser");

  const handleSubmitReply = useCallback(async () => {
    if (!replyContent.trim()) return;
    try {
      await addComment.mutateAsync({
        showcaseId,
        content: replyContent.trim(),
        parentId: comment.id,
      });
      setReplyContent("");
      setShowReplyForm(false);
    } catch {
      // Error is handled by the mutation's onError or will show in UI
    }
  }, [replyContent, addComment, showcaseId, comment.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={depth > 0 ? "ms-8 border-s-2 border-neutral-200 ps-4 dark:border-neutral-700" : ""}
    >
      <div className="py-4">
        {/* Comment header: avatar + name + time */}
        <div className="mb-2 flex items-center gap-3">
          {comment.user?.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={userName}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {comment.user?.firstName?.[0] ?? "?"}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {userName}
            </span>
            <span className="text-xs text-neutral-400">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Comment content */}
        <p className="mb-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {comment.content}
        </p>

        {/* Reply button */}
        {isAuthenticated && depth < 3 && (
          <button
            onClick={() => setShowReplyForm((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-primary"
          >
            <Reply className="h-3.5 w-3.5" />
            {t("reply")}
          </button>
        )}

        {/* Inline reply form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={t("replyPlaceholder")}
                  rows={2}
                  className="flex-1 resize-none text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || addComment.isPending}
                >
                  {addComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              showcaseId={showcaseId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Main Comments Component
// -----------------------------------------------------------------------------

export function ShowcaseComments({ showcaseId }: ShowcaseCommentsProps) {
  const t = useTranslations("showcase");
  const { isAuthenticated } = useAuth();
  const addComment = useAddShowcaseComment();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useShowcaseComments(showcaseId, page);
  const [newComment, setNewComment] = useState("");
  const [allComments, setAllComments] = useState<ShowcaseComment[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Accumulate comments when data changes
  const comments: ShowcaseComment[] = page === 1
    ? (data?.items ?? [])
    : [...allComments, ...(data?.items ?? [])];

  const hasNextPage = data?.meta
    ? data.meta.page < data.meta.totalPages
    : false;

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;
    try {
      await addComment.mutateAsync({
        showcaseId,
        content: newComment.trim(),
      });
      setNewComment("");
    } catch {
      // Error handled by mutation
    }
  }, [newComment, addComment, showcaseId]);

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {t("comments")}
        </h2>
      </div>

      {/* Comment form (auth-gated) */}
      {isAuthenticated ? (
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("commentPlaceholder")}
            rows={3}
            className="mb-3 resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || addComment.isPending}
            >
              {addComment.isPending ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="me-2 h-4 w-4" />
              )}
              {t("submitComment")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
          <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
            {t("signInToComment")}
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm">
              {t("signIn")}
            </Button>
          </Link>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
              <div className="ms-11 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!isLoading && comments.length === 0 && (
        <div className="py-10 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("noComments")}
          </p>
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              showcaseId={showcaseId}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoadingMore(true);
              setAllComments(comments);
              setPage((prev) => prev + 1);
              setIsLoadingMore(false);
            }}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("loadMoreComments")}
          </Button>
        </div>
      )}
    </section>
  );
}

export default ShowcaseComments;
