"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Pencil,
  MessageSquare,
} from "lucide-react";
import type { Review, VoteType } from "@/types/review";
import { StarRating } from "./star-rating";

// =============================================================================
// Types
// =============================================================================

interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string, vote: VoteType) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
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

  if (diffYears > 0) return `${diffYears}y ago`;
  if (diffMonths > 0) return `${diffMonths}mo ago`;
  if (diffWeeks > 0) return `${diffWeeks}w ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ReviewCard({
  review,
  onVote,
  onReport,
  className = "",
}: ReviewCardProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [expandedImages, setExpandedImages] = useState(false);

  const handleVote = useCallback(
    (vote: VoteType) => {
      if (onVote) onVote(review.id, vote);
    },
    [onVote, review.id],
  );

  const handleReport = useCallback(() => {
    if (onReport) {
      setIsReporting(true);
      onReport(review.id);
      // Reset after animation
      setTimeout(() => setIsReporting(false), 2000);
    }
  }, [onReport, review.id]);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 md:p-6 ${className}`}
    >
      {/* Header: Avatar, Name, Rating, Date */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="shrink-0">
          {review.user?.avatar ? (
            <Image
              src={review.user.avatar}
              alt={getUserDisplayName(review.user)}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-[#1E4DB7] dark:text-blue-400">
                {getUserInitials(review.user)}
              </span>
            </div>
          )}
        </div>

        {/* Name, Verified, Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {getUserDisplayName(review.user)}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full">
                <CheckCircle className="h-3 w-3" />
                Verified Purchase
              </span>
            )}
            {review.editedAt && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-medium rounded-full">
                <Pencil className="h-2.5 w-2.5" />
                Edited
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <StarRating value={review.rating} size="sm" readOnly />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {getRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-2">
        {review.title}
      </h4>

      {/* Body */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
        {review.body}
      </p>

      {/* Pros */}
      {review.pros.length > 0 && (
        <div className="mb-3">
          <ul className="space-y-1">
            {review.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <PlusCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-green-700 dark:text-green-400">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {review.cons.length > 0 && (
        <div className="mb-3">
          <ul className="space-y-1">
            {review.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <MinusCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-600 dark:text-red-400">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Images */}
      {review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {(expandedImages ? review.images : review.images.slice(0, 4)).map(
              (src, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                >
                  <Image
                    src={src}
                    alt={`Review image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ),
            )}
            {!expandedImages && review.images.length > 4 && (
              <button
                type="button"
                onClick={() => setExpandedImages(true)}
                className="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                +{review.images.length - 4}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Seller Response
            </span>
            {review.sellerRespondedAt && (
              <span className="text-[10px] text-blue-500 dark:text-blue-500">
                {getRelativeTime(review.sellerRespondedAt)}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            {review.sellerResponse}
          </p>
        </div>
      )}

      {/* Actions: Vote + Report */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Was this helpful?</span>

          <motion.button
            type="button"
            onClick={() => handleVote("HELPFUL")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              inline-flex items-center gap-1 ml-2 px-2.5 py-1 rounded-md transition-colors
              ${
                review.userVote === "HELPFUL"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              }
            `}
            aria-label="Mark as helpful"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="tabular-nums">{review.helpfulCount}</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleVote("NOT_HELPFUL")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors
              ${
                review.userVote === "NOT_HELPFUL"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              }
            `}
            aria-label="Mark as not helpful"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span className="tabular-nums">{review.notHelpfulCount}</span>
          </motion.button>
        </div>

        {onReport && (
          <motion.button
            type="button"
            onClick={handleReport}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={isReporting}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
            aria-label="Report review"
          >
            <Flag className="h-3.5 w-3.5" />
            {isReporting ? "Reported" : "Report"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default ReviewCard;
