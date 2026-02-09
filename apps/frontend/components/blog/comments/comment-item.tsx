"use client";

import { useState, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ThumbsUp,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { CommentForm } from "./comment-form";

// =============================================================================
// Types
// =============================================================================

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  authorAvatar?: string;
  parentId: string | null;
  isApproved: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  postId: string;
  onReplySubmitted?: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a gravatar URL from an email hash.
 * Uses a simple djb2 hash to produce a deterministic number for the placeholder.
 */
function getAvatarUrl(email: string, name: string): string {
  // Simple hash for consistent avatar generation
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const gravatarHash = Math.abs(hash).toString(16).padStart(32, "0").slice(0, 32);
  return `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=80`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Relative time formatting (e.g., "2 hours ago") */
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}

/** Parse basic inline markdown: **bold**, *italic*, `code` */
function parseInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on bold, italic, and inline code patterns
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={match.index} className="font-semibold text-neutral-900 dark:text-neutral-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={match.index}
          className="bg-neutral-100 dark:bg-neutral-800 text-[#1E4DB7] dark:text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={match.index} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// =============================================================================
// Avatar Component
// =============================================================================

function CommentAvatar({ name, email, avatar }: { name: string; email: string; avatar?: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);

  const gradients = [
    "from-blue-500 via-blue-600 to-indigo-600",
    "from-orange-400 via-orange-500 to-red-500",
    "from-emerald-400 via-emerald-500 to-teal-600",
    "from-purple-500 via-purple-600 to-pink-500",
    "from-amber-400 via-orange-500 to-red-500",
    "from-cyan-400 via-cyan-500 to-blue-500",
    "from-rose-400 via-pink-500 to-fuchsia-500",
  ];
  const gradient = gradients[name.length % gradients.length];

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={`${name}'s avatar`}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800 shadow-sm"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
        "bg-gradient-to-br shadow-sm ring-2 ring-white dark:ring-neutral-800 relative overflow-hidden",
        gradient
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      <span className="relative drop-shadow-sm">{initials}</span>
    </div>
  );
}

// =============================================================================
// CommentItem
// =============================================================================

export function CommentItem({
  comment,
  depth = 0,
  maxDepth = 3,
  postId,
  onReplySubmitted,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [showReplies, setShowReplies] = useState(true);

  const relativeTime = useMemo(() => getRelativeTime(comment.createdAt), [comment.createdAt]);
  const contentNodes = useMemo(() => parseInlineMarkdown(comment.content), [comment.content]);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;

  const handleLike = () => {
    if (liked) {
      setLikesCount((c) => c - 1);
    } else {
      setLikesCount((c) => c + 1);
    }
    setLiked(!liked);
  };

  const handleReplySubmitted = () => {
    setIsReplying(false);
    onReplySubmitted?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        depth > 0 && "ml-6 md:ml-10 pl-4 md:pl-6 border-l-2 border-neutral-100 dark:border-neutral-800"
      )}
    >
      <div className="group">
        <div className="flex gap-3 md:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 pt-1">
            <CommentAvatar
              name={comment.authorName}
              email={comment.authorEmail}
              avatar={comment.authorAvatar}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                {comment.authorWebsite ? (
                  <a
                    href={comment.authorWebsite}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
                  >
                    {comment.authorName}
                  </a>
                ) : (
                  comment.authorName
                )}
              </span>

              <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                <Clock className="h-3 w-3" />
                <time dateTime={comment.createdAt}>{relativeTime}</time>
              </span>

              {/* Pending moderation badge */}
              {!comment.isApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
                  <Shield className="h-3 w-3" />
                  Pending moderation
                </span>
              )}
            </div>

            {/* Comment body */}
            <div className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
              {contentNodes}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Like button */}
              <button
                onClick={handleLike}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  liked
                    ? "text-[#1E4DB7] dark:text-blue-400 bg-[#1E4DB7]/10 dark:bg-blue-400/10"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
                aria-label={liked ? "Unlike this comment" : "Like this comment"}
                aria-pressed={liked}
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>

              {/* Reply button */}
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    isReplying
                      ? "text-[#1E4DB7] dark:text-blue-400 bg-[#1E4DB7]/10 dark:bg-blue-400/10"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                  aria-label={`Reply to ${comment.authorName}`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}
            </div>

            {/* Reply form */}
            <AnimatePresence>
              {isReplying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    replyingTo={comment.authorName}
                    onCancel={() => setIsReplying(false)}
                    onSubmitted={handleReplySubmitted}
                    compact
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && (
        <div className="mt-4">
          {/* Toggle replies */}
          {comment.replies!.length > 1 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="inline-flex items-center gap-1.5 mb-4 ml-14 text-xs font-medium text-[#1E4DB7] dark:text-blue-400 hover:text-[#143A8F] dark:hover:text-blue-300 transition-colors"
              aria-expanded={showReplies}
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide {comment.replies!.length} replies
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {comment.replies!.length} replies
                </>
              )}
            </button>
          )}

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    postId={postId}
                    onReplySubmitted={onReplySubmitted}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
