"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, X, Loader2, LogIn } from "lucide-react";
import { cn, Button, Textarea } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { Link } from "@/i18n/routing";
import { useCreateReply } from "@/hooks/use-discussions";

// =============================================================================
// Props
// =============================================================================

interface ReplyFormProps {
  threadId: string;
  parentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  isLocked?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function ReplyForm({
  threadId,
  parentId,
  onCancel,
  onSuccess,
  isLocked = false,
}: ReplyFormProps) {
  const t = useTranslations("discussion");
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createReplyMutation = useCreateReply();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        setError(t("replyContentRequired"));
        return;
      }

      try {
        await createReplyMutation.mutateAsync({
          threadId,
          content: trimmedContent,
          parentId,
        });
        setContent("");
        onSuccess?.();
      } catch {
        setError(t("replyError"));
      }
    },
    [content, threadId, parentId, createReplyMutation, onSuccess, t],
  );

  // ---------------------------------------------------------------------------
  // Auth gate
  // ---------------------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-center">
        <LogIn className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          {t("signInToReply")}
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm">
            {t("signIn")}
          </Button>
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Locked thread
  // ---------------------------------------------------------------------------

  if (isLocked) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("threadIsLocked")}
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.form
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onSubmit={handleSubmit}
      className={cn(
        "rounded-lg border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 p-4",
        parentId && "bg-neutral-50 dark:bg-neutral-900/50",
      )}
    >
      {/* Label for inline reply */}
      {parentId && (
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          {t("replyingToComment")}
        </p>
      )}

      {/* Textarea */}
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder={
          parentId ? t("writeReplyPlaceholder") : t("writeCommentPlaceholder")
        }
        rows={parentId ? 3 : 4}
        className={cn(
          "w-full resize-none mb-3",
          "bg-neutral-50 dark:bg-neutral-800/50",
          "border-neutral-200 dark:border-neutral-700",
          "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
        )}
        disabled={createReplyMutation.isPending}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        {/* Cancel button (only for inline replies) */}
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={createReplyMutation.isPending}
          >
            <X className="h-3.5 w-3.5 me-1" />
            {t("cancel")}
          </Button>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="sm"
          disabled={createReplyMutation.isPending || !content.trim()}
          className="min-w-[80px]"
        >
          {createReplyMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />
          ) : (
            <Send className="h-3.5 w-3.5 me-1" />
          )}
          {parentId ? t("reply") : t("postReply")}
        </Button>
      </div>
    </motion.form>
  );
}

export default ReplyForm;
