"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, LogIn, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { useCreateAnswer } from "@/hooks/use-product-qa";
import { Link } from "@/i18n/routing";

// =============================================================================
// Types
// =============================================================================

interface AnswerFormProps {
  questionId: string;
  onSuccess?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_CHARS = 5000;

// =============================================================================
// Component
// =============================================================================

export function AnswerForm({ questionId, onSuccess }: AnswerFormProps) {
  const t = useTranslations("productQA");
  const { isAuthenticated } = useAuth();
  const createAnswer = useCreateAnswer();

  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedLength = content.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= MAX_CHARS;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || createAnswer.isPending) return;

      try {
        await createAnswer.mutateAsync({
          questionId,
          content: content.trim(),
        });
        setContent("");
        onSuccess?.();
      } catch {
        // Error is handled by the mutation state
      }
    },
    [canSubmit, content, createAnswer, questionId, onSuccess],
  );

  // -------------------------------------------------------------------------
  // Auth Gate
  // -------------------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
        <LogIn className="h-5 w-5 text-neutral-400 dark:text-neutral-500 shrink-0" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          <Link
            href="/login"
            className="font-semibold text-[#1E4DB7] dark:text-blue-400 hover:underline"
          >
            {t("signInToAnswer")}
          </Link>{" "}
          {t("toPostAnswer")}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t("answerPlaceholder")}
          rows={isFocused || content ? 4 : 2}
          maxLength={MAX_CHARS}
          className={`
            w-full px-4 py-3 text-sm rounded-lg resize-y
            bg-neutral-50 dark:bg-neutral-800/50
            border transition-all duration-200
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20
            ${
              isFocused
                ? "border-[#1E4DB7] dark:border-blue-400"
                : "border-neutral-200 dark:border-neutral-700"
            }
          `}
          aria-label={t("answerPlaceholder")}
        />

        {/* Character counter */}
        <div className="flex items-center justify-between mt-1.5">
          {createAnswer.isError && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {(createAnswer.error as Error)?.message || t("answerError")}
            </p>
          )}
          <span className="ms-auto" />
          <span
            className={`text-[10px] tabular-nums ${
              content.length > MAX_CHARS * 0.9
                ? "text-amber-500"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {content.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={!canSubmit || createAnswer.isPending}
          whileHover={canSubmit ? { scale: 1.02 } : undefined}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
            ${
              canSubmit && !createAnswer.isPending
                ? "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            }
          `}
        >
          {createAnswer.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("posting")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t("postAnswer")}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}

export default AnswerForm;
