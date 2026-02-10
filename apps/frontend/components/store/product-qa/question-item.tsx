"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Store,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import {
  useUpvoteQuestion,
  useUpvoteAnswer,
  useAcceptAnswer,
  useProductQuestion,
} from "@/hooks/use-product-qa";
import type { ProductQuestion, ProductAnswer } from "@/types/product-qa";
import type { User } from "@/providers/auth-provider";
import { formatRelativeTime } from "@/lib/format";
import { AnswerForm } from "./answer-form";

// =============================================================================
// Types
// =============================================================================

interface QuestionItemProps {
  question: ProductQuestion;
  productId: string;
}

// =============================================================================
// Helpers
// =============================================================================

function getUserInitials(user?: User): string {
  if (!user) return "?";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getUserDisplayName(user?: User): string {
  if (!user) return "Anonymous";
  return `${user.firstName} ${user.lastName}`.trim() || "Anonymous";
}

// =============================================================================
// Animation Variants
// =============================================================================

const expandVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" as const },
      opacity: { duration: 0.2 },
    },
  },
  visible: {
    height: "auto" as const,
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" as const },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
} as const;

const answerItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
    },
  }),
};

const voteVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
};

// =============================================================================
// Sub-components
// =============================================================================

function UserAvatar({
  user,
  size = "sm",
}: {
  user?: User;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  if (user?.avatar) {
    return (
      <div
        className={`relative ${dim} rounded-full overflow-hidden ring-2 ring-neutral-100 dark:ring-neutral-800 shrink-0`}
      >
        <Image
          src={user.avatar}
          alt={getUserDisplayName(user)}
          width={size === "sm" ? 32 : 40}
          height={size === "sm" ? 32 : 40}
          className="rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center ring-2 ring-neutral-100 dark:ring-neutral-800 shrink-0`}
      style={{
        background: "linear-gradient(135deg, #1E4DB7 0%, #F59A23 100%)",
      }}
    >
      <span className={`${textSize} font-bold text-white leading-none`}>
        {getUserInitials(user)}
      </span>
    </div>
  );
}

function AnswerItem({
  answer,
  index,
  canAccept,
  onAccept,
  onUpvote,
  isAccepting,
  t,
}: {
  answer: ProductAnswer;
  index: number;
  canAccept: boolean;
  onAccept: (id: string) => void;
  onUpvote: (id: string) => void;
  isAccepting: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [votePulse, setVotePulse] = useState(false);

  const handleUpvote = useCallback(() => {
    onUpvote(answer.id);
    setVotePulse(true);
    setTimeout(() => setVotePulse(false), 350);
  }, [answer.id, onUpvote]);

  const borderClass = answer.isAccepted
    ? "border-s-4 border-s-green-500 dark:border-s-green-400"
    : answer.isSellerAnswer
      ? "border-s-4 border-s-amber-500 dark:border-s-amber-400"
      : "border-s-4 border-s-transparent";

  return (
    <motion.div
      custom={index}
      variants={answerItemVariants}
      initial="hidden"
      animate="visible"
      className={`
        relative p-4 rounded-lg
        bg-neutral-50/80 dark:bg-neutral-800/40
        ${borderClass}
      `}
    >
      {/* Badge row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {answer.isSellerAnswer && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-semibold rounded-full">
            <Store className="h-3 w-3" />
            {t("sellerBadge")}
          </span>
        )}
        {answer.isAccepted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full">
            <CheckCircle className="h-3 w-3" />
            {t("acceptedBadge")}
          </span>
        )}
      </div>

      {/* User info + content */}
      <div className="flex items-start gap-3">
        <UserAvatar user={answer.user} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">
              {getUserDisplayName(answer.user)}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatRelativeTime(answer.createdAt)}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5 whitespace-pre-wrap">
            {answer.content}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3 ps-11">
        {/* Upvote */}
        <motion.button
          type="button"
          onClick={handleUpvote}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
          aria-label={t("upvoteAnswer")}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <AnimatePresence mode="wait">
            <motion.span
              key={answer.upvoteCount}
              variants={voteVariants}
              initial="initial"
              animate={votePulse ? "pulse" : "initial"}
              className="tabular-nums"
            >
              {answer.upvoteCount}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Accept answer */}
        {canAccept && !answer.isAccepted && (
          <button
            type="button"
            onClick={() => onAccept(answer.id)}
            disabled={isAccepting}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
          >
            {isAccepting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            {t("acceptAnswer")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function QuestionItem({ question, productId }: QuestionItemProps) {
  const t = useTranslations("productQA");
  const { user } = useAuth();
  const upvoteQuestion = useUpvoteQuestion();
  const upvoteAnswer = useUpvoteAnswer();
  const acceptAnswer = useAcceptAnswer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [votePulse, setVotePulse] = useState(false);

  // Fetch answers when expanded
  const {
    data: detailData,
    isLoading: isLoadingDetail,
  } = useProductQuestion(isExpanded ? question.id : "");

  const answers: ProductAnswer[] = useMemo(
    () => detailData?.answers ?? [],
    [detailData],
  );

  const isQuestionAuthor = user?.id === question.userId;
  const hasAcceptedAnswer = answers.some((a) => a.isAccepted);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleUpvoteQuestion = useCallback(() => {
    upvoteQuestion.mutate(question.id);
    setVotePulse(true);
    setTimeout(() => setVotePulse(false), 350);
  }, [question.id, upvoteQuestion]);

  const handleUpvoteAnswer = useCallback(
    (answerId: string) => {
      upvoteAnswer.mutate(answerId);
    },
    [upvoteAnswer],
  );

  const handleAcceptAnswer = useCallback(
    (answerId: string) => {
      acceptAnswer.mutate(answerId);
    },
    [acceptAnswer],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Question Header */}
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-3">
          {/* Upvote column */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
            <motion.button
              type="button"
              onClick={handleUpvoteQuestion}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-[#1E4DB7] dark:hover:text-blue-400 hover:bg-[#1E4DB7]/5 dark:hover:bg-blue-400/10 transition-colors"
              aria-label={t("upvoteQuestion")}
            >
              <ChevronUp className="h-5 w-5" />
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.span
                key={question.upvoteCount}
                variants={voteVariants}
                initial="initial"
                animate={votePulse ? "pulse" : "initial"}
                className="text-sm font-bold text-neutral-700 dark:text-neutral-300 tabular-nums"
              >
                {question.upvoteCount}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Question content */}
          <div className="flex-1 min-w-0">
            {/* User info */}
            <div className="flex items-center gap-2.5 mb-2">
              <UserAvatar user={question.user} size="sm" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                  {getUserDisplayName(question.user)}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formatRelativeTime(question.createdAt)}
                </span>
              </div>
            </div>

            {/* Question text */}
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {question.content}
            </p>

            {/* Action bar */}
            <div className="flex items-center gap-4 mt-3">
              <button
                type="button"
                onClick={handleToggleExpand}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
                aria-expanded={isExpanded}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {question.answerCount}{" "}
                {question.answerCount === 1 ? t("answer") : t("answers")}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Answers Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="answers"
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="pt-4 space-y-3">
                {/* Loading skeleton */}
                {isLoadingDetail && (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 animate-pulse"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                            <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answers list */}
                {!isLoadingDetail && answers.length > 0 && (
                  <div className="space-y-3">
                    {answers.map((answer, i) => (
                      <AnswerItem
                        key={answer.id}
                        answer={answer}
                        index={i}
                        canAccept={isQuestionAuthor && !hasAcceptedAnswer}
                        onAccept={handleAcceptAnswer}
                        onUpvote={handleUpvoteAnswer}
                        isAccepting={acceptAnswer.isPending}
                        t={t}
                      />
                    ))}
                  </div>
                )}

                {/* No answers yet */}
                {!isLoadingDetail && answers.length === 0 && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">
                    {t("noAnswersYet")}
                  </p>
                )}

                {/* Answer form */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <AnswerForm questionId={question.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionItem;
