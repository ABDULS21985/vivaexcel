"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Pencil,
  Store,
} from "lucide-react";
import type { Review } from "@/types/review";
import { StarRating } from "./star-rating";

// =============================================================================
// Types
// =============================================================================

interface ReviewCardProps {
  review: Review;
  onVote: (reviewId: string, vote: string) => void;
  onReport: (reviewId: string) => void;
}

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
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 0) return "Just now";
  if (diffYears > 0) return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
  if (diffMonths > 0) return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  if (diffWeeks > 0) return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
  if (diffDays > 0) return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  if (diffHours > 0) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffMinutes > 0) return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  return "Just now";
}

function getUserInitials(user?: Review["user"]): string {
  if (!user) return "?";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getUserDisplayName(user?: Review["user"]): string {
  if (!user) return "Anonymous";
  return `${user.firstName} ${user.lastName}`.trim() || "Anonymous";
}

// =============================================================================
// Animation Variants
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
    },
  },
};

const voteCountVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ReviewCard({ review, onVote, onReport }: ReviewCardProps) {
  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [expandedImages, setExpandedImages] = useState(false);
  const [votePulse, setVotePulse] = useState<string | null>(null);

  const hasAlreadyVoted = review.userVote != null;

  const handleVote = useCallback(
    (vote: string) => {
      if (hasAlreadyVoted) return;
      onVote(review.id, vote);
      setVotePulse(vote);
      setTimeout(() => setVotePulse(null), 350);
    },
    [onVote, review.id, hasAlreadyVoted],
  );

  const handleReport = useCallback(() => {
    setIsReporting(true);
    onReport(review.id);
    setTimeout(() => setIsReporting(false), 2000);
  }, [onReport, review.id]);

  const shouldTruncate = review.body.length > 200;

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/70 dark:border-neutral-800 p-5 md:p-6 shadow-sm"
    >
      {/* ================================================================= */}
      {/* Header: Avatar + Name + Verified + Rating + Date                 */}
      {/* ================================================================= */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="shrink-0">
          {review.user?.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-neutral-100 dark:ring-neutral-800">
              <Image
                src={review.user.avatar}
                alt={getUserDisplayName(review.user)}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-neutral-100 dark:ring-neutral-800"
              style={{
                background: "linear-gradient(135deg, #1E4DB7 0%, #F59A23 100%)",
              }}
            >
              <span className="text-sm font-bold text-white leading-none">
                {getUserInitials(review.user)}
              </span>
            </div>
          )}
        </div>

        {/* Name, badges, rating line */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {getUserDisplayName(review.user)}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full whitespace-nowrap">
                <CheckCircle className="h-3 w-3" />
                Verified Purchase
              </span>
            )}
          </div>

          {/* Star rating + date + edited badge */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StarRating value={review.rating} size="sm" readOnly />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              &middot;
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {getRelativeTime(review.createdAt)}
            </span>
            {review.editedAt && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-medium rounded-full">
                <Pencil className="h-2.5 w-2.5" />
                Edited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Title                                                            */}
      {/* ================================================================= */}
      <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-2">
        {review.title}
      </h3>

      {/* ================================================================= */}
      {/* Body with truncation + expand/collapse animation                 */}
      {/* ================================================================= */}
      <motion.div
        layout
        className="mb-4 overflow-hidden"
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
      >
        <motion.p
          layout="position"
          className={`text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed ${
            !isBodyExpanded && shouldTruncate ? "line-clamp-3" : ""
          }`}
        >
          {review.body}
        </motion.p>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => setIsBodyExpanded(!isBodyExpanded)}
            className="mt-1 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] rounded-sm"
          >
            {isBodyExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* Pros                                                             */}
      {/* ================================================================= */}
      {review.pros.length > 0 && (
        <div className="mb-3">
          <ul className="space-y-1.5">
            {review.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <PlusCircle className="h-4 w-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================================================================= */}
      {/* Cons                                                             */}
      {/* ================================================================= */}
      {review.cons.length > 0 && (
        <div className="mb-3">
          <ul className="space-y-1.5">
            {review.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <MinusCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================================================================= */}
      {/* Review Images                                                    */}
      {/* ================================================================= */}
      {review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {(expandedImages ? review.images : review.images.slice(0, 4)).map(
              (src, i) => (
                <button
                  key={i}
                  type="button"
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:ring-2 hover:ring-[#1E4DB7] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]"
                >
                  <Image
                    src={src}
                    alt={`Review image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ),
            )}
            {!expandedImages && review.images.length > 4 && (
              <button
                type="button"
                onClick={() => setExpandedImages(true)}
                className="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]"
              >
                +{review.images.length - 4} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Seller Response                                                  */}
      {/* ================================================================= */}
      {review.sellerResponse && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4 mb-4 ml-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
            <span className="text-xs font-bold text-[#1E4DB7] dark:text-blue-400 uppercase tracking-wide">
              Seller Response
            </span>
            {review.sellerRespondedAt && (
              <span className="text-[10px] text-blue-500/80 dark:text-blue-400/60">
                &middot; {getRelativeTime(review.sellerRespondedAt)}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
            {review.sellerResponse}
          </p>
        </div>
      )}

      {/* ================================================================= */}
      {/* Actions: Helpful voting + Report                                 */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Was this helpful?</span>

          <motion.button
            type="button"
            onClick={() => handleVote("HELPFUL")}
            disabled={hasAlreadyVoted}
            whileHover={hasAlreadyVoted ? undefined : { scale: 1.08 }}
            whileTap={hasAlreadyVoted ? undefined : { scale: 0.92 }}
            className={`
              inline-flex items-center gap-1 ml-1.5 px-2.5 py-1 rounded-md transition-colors
              ${
                review.userVote === "HELPFUL"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : hasAlreadyVoted
                    ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              }
            `}
            aria-label={`Helpful (${review.helpfulCount})`}
            aria-pressed={review.userVote === "HELPFUL"}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={review.helpfulCount}
                variants={voteCountVariants}
                initial="initial"
                animate={votePulse === "HELPFUL" ? "pulse" : "initial"}
                className="tabular-nums"
              >
                {review.helpfulCount}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleVote("NOT_HELPFUL")}
            disabled={hasAlreadyVoted}
            whileHover={hasAlreadyVoted ? undefined : { scale: 1.08 }}
            whileTap={hasAlreadyVoted ? undefined : { scale: 0.92 }}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors
              ${
                review.userVote === "NOT_HELPFUL"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : hasAlreadyVoted
                    ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              }
            `}
            aria-label={`Not helpful (${review.notHelpfulCount})`}
            aria-pressed={review.userVote === "NOT_HELPFUL"}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={review.notHelpfulCount}
                variants={voteCountVariants}
                initial="initial"
                animate={votePulse === "NOT_HELPFUL" ? "pulse" : "initial"}
                className="tabular-nums"
              >
                {review.notHelpfulCount}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.button
          type="button"
          onClick={handleReport}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          disabled={isReporting}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
          aria-label="Report review"
        >
          <Flag className="h-3.5 w-3.5" />
          {isReporting ? "Reported" : "Report"}
        </motion.button>
      </div>
    </motion.article>
  );
}

export default ReviewCard;
