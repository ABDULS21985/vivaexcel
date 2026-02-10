"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  BadgeCheck,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Bookmark,
  Share,
  Pin,
  Send,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { toast } from "sonner";
import type { CollabPost } from "@/types/collab";

// =============================================================================
// Types
// =============================================================================

export interface PostCardProps {
  post: CollabPost;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Formats a number into a compact string (e.g. 1200 -> "1.2K", 2500000 -> "2.5M").
 */
function formatCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
  }
  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`;
  }
  return count > 0 ? String(count) : "";
}

/**
 * Returns a relative time string (e.g. "2h", "1d", "3w") from an ISO timestamp.
 */
function timeAgo(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - past) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 52) return `${diffWeeks}w`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y`;
}

/**
 * Parses post content and wraps #hashtags in styled spans.
 */
function renderContentWithHashtags(content: string): React.ReactNode[] {
  const parts = content.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span
          key={index}
          className="text-[var(--primary)] hover:underline cursor-pointer font-medium"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// =============================================================================
// Animation Variants
// =============================================================================

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// =============================================================================
// Sub-Components
// =============================================================================

function MediaGrid({ media }: { media: CollabPost["media"] }) {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="mt-3 overflow-hidden rounded-xl">
        <Image
          src={item.url}
          alt={item.alt || "Post media"}
          width={item.width || 600}
          height={item.height || 400}
          className="w-full h-auto max-h-[512px] object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 grid gap-0.5 overflow-hidden rounded-xl",
        media.length === 2 && "grid-cols-2",
        media.length === 3 && "grid-cols-2",
        media.length >= 4 && "grid-cols-2"
      )}
    >
      {media.slice(0, 4).map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "relative overflow-hidden",
            media.length === 3 && index === 0 && "row-span-2",
            "aspect-square"
          )}
        >
          <Image
            src={item.url}
            alt={item.alt || `Post media ${index + 1}`}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 300px"
          />
          {index === 3 && media.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-xl font-bold text-white">
                +{media.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PollDisplay({
  poll,
  votedIndex,
  onVote,
}: {
  poll: CollabPost["poll"];
  votedIndex: number | null;
  onVote: (index: number) => void;
}) {
  if (!poll) return null;

  const hasVoted = votedIndex !== null;
  const totalVotes = poll.totalVotes + (hasVoted ? 1 : 0);

  return (
    <div className="mt-3 space-y-2">
      {poll.options.map((option, index) => {
        const adjustedVotes =
          option.votes + (votedIndex === index ? 1 : 0);
        const percentage =
          totalVotes > 0
            ? Math.round((adjustedVotes / totalVotes) * 100)
            : 0;
        const isSelected = votedIndex === index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => !hasVoted && onVote(index)}
            disabled={hasVoted}
            className={cn(
              "relative w-full overflow-hidden rounded-lg border p-3 text-left transition-colors",
              hasVoted
                ? "cursor-default"
                : "hover:border-[var(--primary)] cursor-pointer",
              isSelected
                ? "border-[var(--primary)]"
                : "border-[var(--border)]"
            )}
          >
            {/* Progress bar background */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-all duration-500",
                isSelected
                  ? "bg-[var(--primary)]/20"
                  : "bg-[var(--primary)]/10"
              )}
              style={{ width: hasVoted ? `${percentage}%` : "0%" }}
            />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]">
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                )}
                {option.label}
              </span>
              {hasVoted && (
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {percentage}%
                </span>
              )}
            </div>
          </button>
        );
      })}
      <p className="text-xs text-[var(--muted-foreground)]">
        {totalVotes.toLocaleString()} votes
      </p>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  count?: number;
  label: string;
  hoverColor: string;
  isActive?: boolean;
  activeColor?: string;
  onClick?: () => void;
}

function ActionButton({
  icon,
  count,
  label,
  hoverColor,
  isActive,
  activeColor,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/action flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[var(--muted-foreground)] transition-colors",
        hoverColor,
        isActive && activeColor
      )}
    >
      {icon}
      {count !== undefined && count > 0 && (
        <span className="text-xs">{formatCount(count)}</span>
      )}
    </button>
  );
}

// =============================================================================
// PostCard Component
// =============================================================================

interface LocalComment {
  id: string;
  author: string;
  content: string;
  time: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isReposted, setIsReposted] = useState(post.isReposted ?? false);
  const [repostCount, setRepostCount] = useState(post.repostCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<LocalComment[]>([]);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [votedPollIndex, setVotedPollIndex] = useState<number | null>(null);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (!isLiked) {
      toast.success("Liked!");
    }
  }, [isLiked]);

  const handleRepost = useCallback(() => {
    setIsReposted((prev) => !prev);
    setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1));
    if (!isReposted) {
      toast.success("Reposted!");
    }
  }, [isReposted]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  }, [isBookmarked]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        text: post.content,
        url: `${window.location.origin}/collab/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/collab/post/${post.id}`
      );
      toast.success("Link copied to clipboard");
    }
  }, [post.content, post.id]);

  const handleToggleComments = useCallback(() => {
    setShowComments((prev) => !prev);
  }, []);

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim()) return;
    const newComment: LocalComment = {
      id: `local-${Date.now()}`,
      author: "You",
      content: commentText.trim(),
      time: "Just now",
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setCommentCount((prev) => prev + 1);
    setCommentText("");
    toast.success("Comment added!");
  }, [commentText]);

  const handlePollVote = useCallback((index: number) => {
    setVotedPollIndex(index);
    toast.success("Vote recorded!");
  }, []);

  const renderedContent = useMemo(
    () => renderContentWithHashtags(post.content),
    [post.content]
  );

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-1)]",
        className
      )}
    >
      {/* Pin indicator */}
      {post.isPinned && (
        <div className="mb-1 ml-10 flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
          <Pin className="h-3 w-3" />
          <span>Pinned</span>
        </div>
      )}

      {/* Reply indicator */}
      {post.replyTo && (
        <div className="mb-1 ml-10 text-xs text-[var(--muted-foreground)]">
          Replying to{" "}
          <span className="text-[var(--primary)]">
            @{post.replyTo.author.username}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>

        {/* Content area */}
        <div className="min-w-0 flex-1">
          {/* Author row */}
          <div className="flex items-center gap-1 text-sm">
            <span className="truncate font-bold text-[var(--foreground)]">
              {post.author.name}
            </span>
            {post.author.isVerified && (
              <BadgeCheck className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
            )}
            <span className="truncate text-[var(--muted-foreground)]">
              @{post.author.username}
            </span>
            <span className="flex-shrink-0 text-[var(--muted-foreground)]">
              &middot;
            </span>
            <time
              dateTime={post.publishedAt}
              className="flex-shrink-0 text-[var(--muted-foreground)] hover:underline"
            >
              {timeAgo(post.publishedAt)}
            </time>
          </div>

          {/* Post content */}
          <div className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[var(--foreground)]">
            {renderedContent}
          </div>

          {/* Media */}
          <MediaGrid media={post.media} />

          {/* Poll */}
          <PollDisplay
            poll={post.poll}
            votedIndex={votedPollIndex}
            onVote={handlePollVote}
          />

          {/* Engagement bar */}
          <div className="-ml-2 mt-2 flex max-w-md items-center justify-between">
            <ActionButton
              icon={
                <MessageCircle className={cn(
                  "h-[18px] w-[18px] transition-colors group-hover/action:text-[var(--primary)]",
                  showComments && "text-[var(--primary)]"
                )} />
              }
              count={commentCount}
              label="Reply"
              hoverColor="hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
              isActive={showComments}
              activeColor="text-[var(--primary)]"
              onClick={handleToggleComments}
            />

            <ActionButton
              icon={
                <Repeat2
                  className={cn(
                    "h-[18px] w-[18px] transition-colors group-hover/action:text-green-500",
                    isReposted && "text-green-500"
                  )}
                />
              }
              count={repostCount}
              label="Repost"
              hoverColor="hover:bg-green-500/10 hover:text-green-500"
              isActive={isReposted}
              activeColor="text-green-500"
              onClick={handleRepost}
            />

            <ActionButton
              icon={
                <Heart
                  className={cn(
                    "h-[18px] w-[18px] transition-colors group-hover/action:text-red-500",
                    isLiked && "fill-red-500 text-red-500"
                  )}
                />
              }
              count={likeCount}
              label="Like"
              hoverColor="hover:bg-red-500/10 hover:text-red-500"
              isActive={isLiked}
              activeColor="text-red-500"
              onClick={handleLike}
            />

            <ActionButton
              icon={
                <BarChart3 className="h-[18px] w-[18px] transition-colors group-hover/action:text-[var(--primary)]" />
              }
              count={post.viewCount}
              label="Views"
              hoverColor="hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
            />

            <div className="flex items-center gap-1">
              <ActionButton
                icon={
                  <Bookmark
                    className={cn(
                      "h-[18px] w-[18px] transition-colors group-hover/action:text-[var(--primary)]",
                      isBookmarked && "fill-[var(--primary)] text-[var(--primary)]"
                    )}
                  />
                }
                label="Bookmark"
                hoverColor="hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                isActive={isBookmarked}
                activeColor="text-[var(--primary)]"
                onClick={handleBookmark}
              />

              <ActionButton
                icon={
                  <Share className="h-[18px] w-[18px] transition-colors group-hover/action:text-[var(--primary)]" />
                }
                label="Share"
                hoverColor="hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                onClick={handleShare}
              />
            </div>
          </div>

          {/* Comment Thread */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  {/* Comment input */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                      Y
                    </div>
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmitComment();
                          }
                        }}
                        placeholder="Post your reply"
                        className="flex-1 rounded-full bg-[var(--surface-1)] px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none border border-transparent focus:border-[var(--primary)]"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                        className={cn(
                          "flex items-center justify-center rounded-full bg-[var(--primary)] p-1.5 text-white transition-opacity",
                          commentText.trim()
                            ? "opacity-100 hover:opacity-90"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Local comments */}
                  {localComments.length > 0 && (
                    <div className="space-y-2.5">
                      {localComments.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20 text-[10px] font-bold text-[var(--primary)]">
                            {c.author[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-[var(--foreground)]">
                                {c.author}
                              </span>
                              <span className="text-[var(--muted-foreground)]">
                                {c.time}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-[var(--foreground)]">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Placeholder for existing comments */}
                  {localComments.length === 0 && (
                    <p className="text-xs text-center text-[var(--muted-foreground)] py-2">
                      Be the first to reply
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
