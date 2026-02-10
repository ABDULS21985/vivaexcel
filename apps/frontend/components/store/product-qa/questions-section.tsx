"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Plus,
  LogIn,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import {
  useProductQuestions,
  useCreateQuestion,
} from "@/hooks/use-product-qa";
import { QASortBy } from "@/types/product-qa";
import { Link } from "@/i18n/routing";
import { QuestionItem } from "./question-item";

// =============================================================================
// Types
// =============================================================================

interface QuestionsSectionProps {
  productId: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_QUESTION_CHARS = 2000;

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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

const formVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    marginTop: 0,
    transition: {
      height: { duration: 0.25, ease: "easeInOut" },
      opacity: { duration: 0.15 },
    },
  },
  visible: {
    height: "auto",
    opacity: 1,
    marginTop: 16,
    transition: {
      height: { duration: 0.25, ease: "easeInOut" },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

// =============================================================================
// Skeleton
// =============================================================================

function QuestionSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 md:p-6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
          <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function QuestionsSection({ productId }: QuestionsSectionProps) {
  const t = useTranslations("productQA");
  const { isAuthenticated } = useAuth();
  const createQuestion = useCreateQuestion();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [sortBy, setSortBy] = useState<QASortBy>(QASortBy.NEWEST);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionContent, setQuestionContent] = useState("");

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProductQuestions({ productId, sortBy });

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const allQuestions = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  const trimmedQuestion = questionContent.trim();
  const canSubmitQuestion =
    trimmedQuestion.length > 0 && trimmedQuestion.length <= MAX_QUESTION_CHARS;

  // ---------------------------------------------------------------------------
  // Sort Tabs
  // ---------------------------------------------------------------------------

  const sortTabs: { value: QASortBy; label: string }[] = [
    { value: QASortBy.NEWEST, label: t("sortNewest") },
    { value: QASortBy.POPULAR, label: t("sortPopular") },
    { value: QASortBy.UNANSWERED, label: t("sortUnanswered") },
  ];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmitQuestion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmitQuestion || createQuestion.isPending) return;

      try {
        await createQuestion.mutateAsync({
          productId,
          content: trimmedQuestion,
        });
        setQuestionContent("");
        setShowQuestionForm(false);
      } catch {
        // Error is handled by mutation state
      }
    },
    [canSubmitQuestion, createQuestion, productId, trimmedQuestion],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="w-full" aria-label={t("sectionTitle")}>
      {/* ================================================================= */}
      {/* Section Header                                                    */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="h-6 w-6 text-[#1E4DB7] dark:text-blue-400" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {t("sectionTitle")}
          </h2>
          {!isLoading && (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {totalCount}
            </span>
          )}
        </div>

        {/* Ask a Question button */}
        {isAuthenticated ? (
          <motion.button
            type="button"
            onClick={() => setShowQuestionForm((prev) => !prev)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1E4DB7] hover:bg-[#143A8F] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1"
          >
            <Plus className="h-4 w-4" />
            {t("askQuestion")}
          </motion.button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            {t("signInToAsk")}
          </Link>
        )}
      </div>

      {/* ================================================================= */}
      {/* Inline Question Form                                              */}
      {/* ================================================================= */}
      <AnimatePresence initial={false}>
        {showQuestionForm && (
          <motion.div
            key="question-form"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmitQuestion}
              className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm"
            >
              <label
                htmlFor="qa-question-input"
                className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2"
              >
                {t("yourQuestion")}
              </label>
              <textarea
                id="qa-question-input"
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder={t("questionPlaceholder")}
                rows={4}
                maxLength={MAX_QUESTION_CHARS}
                className="
                  w-full px-4 py-3 text-sm rounded-lg resize-y
                  bg-neutral-50 dark:bg-neutral-800/50
                  border border-neutral-200 dark:border-neutral-700
                  text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20
                  focus:border-[#1E4DB7] dark:focus:border-blue-400
                  transition-colors
                "
              />
              <div className="flex items-center justify-between mt-2">
                <div>
                  {createQuestion.isError && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {(createQuestion.error as Error)?.message ||
                        t("questionError")}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] tabular-nums ${
                    questionContent.length > MAX_QUESTION_CHARS * 0.9
                      ? "text-amber-500"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {questionContent.length.toLocaleString()}/
                  {MAX_QUESTION_CHARS.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setQuestionContent("");
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {t("cancel")}
                </button>
                <motion.button
                  type="submit"
                  disabled={!canSubmitQuestion || createQuestion.isPending}
                  whileHover={canSubmitQuestion ? { scale: 1.02 } : undefined}
                  whileTap={canSubmitQuestion ? { scale: 0.98 } : undefined}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                    transition-colors focus:outline-none focus-visible:ring-2
                    focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
                    ${
                      canSubmitQuestion && !createQuestion.isPending
                        ? "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                    }
                  `}
                >
                  {createQuestion.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("posting")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("submitQuestion")}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* Sort Tabs                                                         */}
      {/* ================================================================= */}
      <div
        className="
          flex items-center gap-2 mb-5 mt-5 pb-1
          overflow-x-auto scrollbar-hide
          snap-x snap-mandatory -mx-1 px-1
        "
      >
        {sortTabs.map((tab) => {
          const isActive = sortBy === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSortBy(tab.value)}
              aria-pressed={isActive}
              className={`
                snap-start shrink-0
                px-4 py-1.5 text-sm font-medium rounded-full
                transition-all duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
                ${
                  isActive
                    ? "bg-[#1E4DB7] text-white shadow-[0_0_12px_rgba(30,77,183,0.35)]"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* Loading State                                                     */}
      {/* ================================================================= */}
      {isLoading && (
        <div className="space-y-4">
          <QuestionSkeleton />
          <QuestionSkeleton />
          <QuestionSkeleton />
        </div>
      )}

      {/* ================================================================= */}
      {/* Error State                                                       */}
      {/* ================================================================= */}
      {isError && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            flex flex-col items-center gap-3 py-10 px-6 rounded-xl
            bg-red-50/60 dark:bg-red-950/20
            border border-red-200 dark:border-red-900/40
          "
        >
          <AlertCircle className="h-10 w-10 text-red-400 dark:text-red-500" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            {t("loadError")}
          </p>
          <p className="text-xs text-red-500/80 dark:text-red-400/60">
            {t("loadErrorDescription")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="
              mt-1 px-4 py-2 text-sm font-medium rounded-lg
              bg-red-600 hover:bg-red-700
              text-white transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2
            "
          >
            {t("tryAgain")}
          </button>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Empty State                                                       */}
      {/* ================================================================= */}
      {!isLoading && !isError && allQuestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            relative flex flex-col items-center justify-center text-center
            py-20 px-6 rounded-2xl overflow-hidden
            bg-gradient-to-b from-neutral-50 to-white
            dark:from-neutral-900 dark:to-neutral-950
            border border-neutral-100 dark:border-neutral-800
          "
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-5 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60">
              <HelpCircle className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              {t("noQuestionsTitle")}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
              {t("noQuestionsDescription")}
            </p>
          </div>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Question List                                                     */}
      {/* ================================================================= */}
      {!isLoading && allQuestions.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {allQuestions.map((question) => (
            <motion.div key={question.id} variants={itemVariants}>
              <QuestionItem question={question} productId={productId} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Load More                                                         */}
      {/* ================================================================= */}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg
              bg-neutral-100 dark:bg-neutral-800
              text-neutral-700 dark:text-neutral-300
              hover:bg-neutral-200 dark:hover:bg-neutral-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus-visible:ring-2
              focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
            "
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading")}
              </>
            ) : (
              t("loadMore")
            )}
          </button>
        </div>
      )}
    </section>
  );
}

export default QuestionsSection;
