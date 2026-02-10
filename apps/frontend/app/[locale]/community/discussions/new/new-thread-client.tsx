"use client";

import { useState, useMemo, useCallback, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  LogIn,
  X,
  Tag,
  Eye,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { cn, Button, Input, Textarea, Badge } from "@ktblog/ui/components";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/providers/auth-provider";
import { useDiscussionCategories, useCreateThread } from "@/hooks/use-discussions";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// =============================================================================
// Constants
// =============================================================================

const MAX_TITLE_LENGTH = 300;
const MAX_CONTENT_LENGTH = 10000;
const MAX_TAGS = 5;

// =============================================================================
// Component
// =============================================================================

export default function NewThreadClient() {
  const t = useTranslations("discussion");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const categoriesQuery = useDiscussionCategories();
  const createThreadMutation = useCreateThread();

  const categories = categoriesQuery.data ?? [];

  // ---------------------------------------------------------------------------
  // Tag helpers
  // ---------------------------------------------------------------------------

  const addTag = useCallback(
    (value: string) => {
      const tag = value.trim().toLowerCase();
      if (!tag) return;
      if (tags.includes(tag)) return;
      if (tags.length >= MAX_TAGS) return;
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    },
    [tags],
  );

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(tagInput);
      }
      if (e.key === "Backspace" && !tagInput && tags.length > 0) {
        setTags((prev) => prev.slice(0, -1));
      }
    },
    [addTag, tagInput, tags.length],
  );

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t("titleRequired");
    } else if (title.trim().length < 5) {
      newErrors.title = t("titleTooShort");
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = t("titleTooLong");
    }

    if (!content.trim()) {
      newErrors.content = t("contentRequired");
    } else if (content.trim().length < 10) {
      newErrors.content = t("contentTooShort");
    }

    if (!categoryId) {
      newErrors.category = t("categoryRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content, categoryId, t]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        const result = await createThreadMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags: tags.length > 0 ? tags : undefined,
        });

        // Navigate to the newly created thread
        if (result?.slug) {
          router.push(`/community/discussions/${result.slug}`);
        } else {
          router.push("/community/discussions");
        }
      } catch {
        setErrors({ submit: t("createThreadError") });
      }
    },
    [validate, title, content, categoryId, tags, createThreadMutation, router, t],
  );

  // ---------------------------------------------------------------------------
  // Auth gate
  // ---------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center py-20">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              {t("signInRequired")}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              {t("signInToCreateThread")}
            </p>
            <Link href="/login">
              <Button className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white">
                <LogIn className="h-4 w-4 me-2" />
                {t("signIn")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: t("community"), href: "/community" },
              { label: t("discussions"), href: "/community/discussions" },
              { label: t("newThread") },
            ]}
            className="mb-6"
          />

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              {t("createNewThread")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("createNewThreadSubtitle")}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Category selector */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t("category")} <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.category) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.category;
                      return next;
                    });
                  }
                }}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border text-sm",
                  "bg-white dark:bg-neutral-900",
                  "text-neutral-900 dark:text-white",
                  "focus:outline-none focus:ring-2 transition-all",
                  errors.category
                    ? "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400"
                    : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]",
                )}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t("threadTitle")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }
                }}
                placeholder={t("threadTitlePlaceholder")}
                maxLength={MAX_TITLE_LENGTH}
                className={cn(
                  "bg-white dark:bg-neutral-900",
                  errors.title &&
                    "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400",
                )}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.title ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    title.length > MAX_TITLE_LENGTH * 0.9
                      ? "text-amber-500"
                      : "text-neutral-400 dark:text-neutral-500",
                  )}
                >
                  {title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>

            {/* Content with Preview toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {t("content")} <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <Edit3 className="h-3.5 w-3.5" />
                      {t("edit")}
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      {t("preview")}
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "min-h-[200px] rounded-lg border border-neutral-200 dark:border-neutral-700",
                      "bg-neutral-50 dark:bg-neutral-900 p-4",
                    )}
                  >
                    {content.trim() ? (
                      <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {content}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                        {t("nothingToPreview")}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (errors.content) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.content;
                            return next;
                          });
                        }
                      }}
                      placeholder={t("contentPlaceholder")}
                      rows={10}
                      className={cn(
                        "w-full resize-none bg-white dark:bg-neutral-900",
                        errors.content &&
                          "border-red-300 dark:border-red-700 focus:ring-red-300/30 focus:border-red-400",
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-1">
                {errors.content ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.content}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {t("markdownSupported")}
                  </p>
                )}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    content.length > MAX_CONTENT_LENGTH * 0.9
                      ? "text-amber-500"
                      : "text-neutral-400 dark:text-neutral-500",
                  )}
                >
                  {content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {t("tags")}
                  <span className="text-neutral-400 font-normal">
                    ({t("optional")})
                  </span>
                </span>
              </label>

              {/* Tag chips + input */}
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-lg border",
                  "bg-white dark:bg-neutral-900",
                  "border-neutral-200 dark:border-neutral-700",
                  "focus-within:ring-2 focus-within:ring-[#1E4DB7]/30 focus-within:border-[#1E4DB7]",
                  "transition-all",
                )}
              >
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {tags.length < MAX_TAGS && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) addTag(tagInput);
                    }}
                    placeholder={
                      tags.length === 0
                        ? t("tagsPlaceholder")
                        : t("addMoreTags")
                    }
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400"
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                {t("tagsHelp", { max: MAX_TAGS })}
              </p>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errors.submit}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/community/discussions">
                <Button type="button" variant="ghost">
                  {t("cancel")}
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={createThreadMutation.isPending}
                className="min-w-[140px] bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
              >
                {createThreadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t("posting")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 me-2" />
                    {t("postThread")}
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
