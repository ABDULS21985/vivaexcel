"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Globe,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api-client";

// =============================================================================
// Types
// =============================================================================

interface CommentFormProps {
  postId: string;
  parentId?: string;
  replyingTo?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
  compact?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  content?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_CONTENT_LENGTH = 2000;
const MIN_CONTENT_LENGTH = 3;

// =============================================================================
// CommentForm
// =============================================================================

export function CommentForm({
  postId,
  parentId,
  replyingTo,
  onCancel,
  onSubmitted,
  compact = false,
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [content, setContent] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!isAuthenticated) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!content.trim()) {
      newErrors.content = "Comment cannot be empty";
    } else if (content.trim().length < MIN_CONTENT_LENGTH) {
      newErrors.content = `Comment must be at least ${MIN_CONTENT_LENGTH} characters`;
    } else if (content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Comment must be under ${MAX_CONTENT_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [isAuthenticated, name, email, content]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await apiClient("/blog/comments", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId: parentId || null,
          ...(!isAuthenticated && {
            name: name.trim(),
            email: email.trim(),
            website: website.trim() || undefined,
          }),
        }),
      });

      setSubmitStatus("success");
      setSubmitMessage(
        "Your comment has been submitted and is pending moderation. It will appear once approved."
      );

      // Reset form
      setContent("");
      if (!isAuthenticated) {
        // Keep name/email for convenience but clear content
      }

      onSubmitted?.();

      // Reset success message after a delay
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage("Failed to submit comment. Please try again.");

      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentLength = content.length;
  const isOverLimit = contentLength > MAX_CONTENT_LENGTH;
  const charCountColor = isOverLimit
    ? "text-red-500"
    : contentLength > MAX_CONTENT_LENGTH * 0.9
      ? "text-amber-500"
      : "text-neutral-400 dark:text-neutral-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Replying to indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-[#1E4DB7]/5 dark:bg-blue-400/10 rounded-xl px-4 py-2.5">
          <span className="text-sm text-[#1E4DB7] dark:text-blue-400">
            Replying to <strong>{replyingTo}</strong>
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-colors"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Guest fields (unauthenticated) */}
      {!isAuthenticated && (
        <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
          {/* Name */}
          <div>
            <label
              htmlFor={`comment-name-${parentId || "root"}`}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id={`comment-name-${parentId || "root"}`}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your name"
              className={cn(
                "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all text-sm",
                errors.name
                  ? "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400"
                  : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]"
              )}
              maxLength={100}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `name-error-${parentId || "root"}` : undefined}
            />
            {errors.name && (
              <p
                id={`name-error-${parentId || "root"}`}
                className="mt-1 text-xs text-red-500 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor={`comment-email-${parentId || "root"}`}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id={`comment-email-${parentId || "root"}`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="your@email.com"
              className={cn(
                "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all text-sm",
                errors.email
                  ? "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400"
                  : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]"
              )}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `email-error-${parentId || "root"}` : undefined}
            />
            {errors.email && (
              <p
                id={`email-error-${parentId || "root"}`}
                className="mt-1 text-xs text-red-500 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Website (optional) */}
          {!compact && (
            <div className="sm:col-span-2">
              <label
                htmlFor={`comment-website-${parentId || "root"}`}
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Website <span className="text-neutral-400">(optional)</span>
                </span>
              </label>
              <input
                id={`comment-website-${parentId || "root"}`}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Authenticated user indicator */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-xs font-bold">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <span>
            Commenting as{" "}
            <strong className="text-neutral-900 dark:text-white">
              {user.firstName} {user.lastName}
            </strong>
          </span>
        </div>
      )}

      {/* Textarea */}
      <div>
        <label
          htmlFor={`comment-content-${parentId || "root"}`}
          className="sr-only"
        >
          Comment
        </label>
        <textarea
          ref={textareaRef}
          id={`comment-content-${parentId || "root"}`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
          }}
          placeholder={replyingTo ? `Write your reply...` : "Share your thoughts..."}
          rows={compact ? 3 : 4}
          className={cn(
            "w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all resize-none text-sm leading-relaxed",
            errors.content
              ? "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400"
              : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]"
          )}
          aria-invalid={!!errors.content}
          aria-describedby={
            errors.content
              ? `content-error-${parentId || "root"}`
              : `content-help-${parentId || "root"}`
          }
        />

        <div className="flex items-center justify-between mt-1.5">
          {errors.content ? (
            <p
              id={`content-error-${parentId || "root"}`}
              className="text-xs text-red-500 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.content}
            </p>
          ) : (
            <p
              id={`content-help-${parentId || "root"}`}
              className="text-xs text-neutral-400 dark:text-neutral-500"
            >
              Supports **bold**, *italic*, and `code` formatting
            </p>
          )}

          {/* Character count */}
          <span className={cn("text-xs tabular-nums", charCountColor)}>
            {contentLength}/{MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
          Comments are moderated before publishing.
        </p>

        <div className="flex items-center gap-2 ml-auto">
          {/* Cancel button (for replies) */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              Cancel
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || isOverLimit}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 text-sm",
              isSubmitting || isOverLimit
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                : "bg-[#1E4DB7] hover:bg-[#143A8F] text-white hover:shadow-lg hover:shadow-[#1E4DB7]/25"
            )}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {replyingTo ? "Post Reply" : "Post Comment"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status messages */}
      <AnimatePresence>
        {submitStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-start gap-2 p-3 rounded-xl text-sm",
              submitStatus === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            )}
            role="alert"
          >
            {submitStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <p>{submitMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
