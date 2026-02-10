"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button, Input, Textarea, Badge } from "@ktblog/ui/components";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShowcaseCard } from "@/components/community/showcase-card";
import { useCreateShowcase } from "@/hooks/use-showcases";
import { useAuth } from "@/providers/auth-provider";
import type { Showcase } from "@/types/showcase";

// =============================================================================
// SubmitShowcaseClient
// =============================================================================
// Form to submit a new showcase. Auth-gated. Includes title, description,
// product selection, image URLs, project URL, tags, preview toggle, and
// success/error handling.

const MAX_TITLE_LENGTH = 200;
const MAX_IMAGES = 10;

export function SubmitShowcaseClient() {
  const t = useTranslations("showcase");
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const createShowcase = useCreateShowcase();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [projectUrl, setProjectUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // ---------------------------------------------------------------------------
  // Image URL management
  // ---------------------------------------------------------------------------

  const addImageField = useCallback(() => {
    if (images.length < MAX_IMAGES) {
      setImages((prev) => [...prev, ""]);
    }
  }, [images.length]);

  const removeImageField = useCallback((index: number) => {
    setImages((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateImageUrl = useCallback((index: number, value: string) => {
    setImages((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------

  const parsedTags = useMemo(() => {
    if (!tagsInput.trim()) return [];
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [tagsInput]);

  // ---------------------------------------------------------------------------
  // Preview showcase object (mock)
  // ---------------------------------------------------------------------------

  const previewShowcase = useMemo<Partial<Showcase> & Pick<Showcase, "id" | "title" | "images" | "tags" | "status" | "likesCount" | "commentsCount">>(() => {
    const validImages = images.filter((url) => url.trim().length > 0);
    return {
      id: "preview",
      userId: user?.id ?? "",
      user: user ?? undefined,
      productId,
      product: productId ? { id: productId, title: productId, slug: productId } : undefined,
      title: title || t("previewTitle"),
      description,
      images: validImages,
      projectUrl: projectUrl || undefined,
      tags: parsedTags,
      status: "pending",
      likesCount: 0,
      commentsCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [title, description, productId, images, projectUrl, parsedTags, user, t]);

  // ---------------------------------------------------------------------------
  // Form validation
  // ---------------------------------------------------------------------------

  const validate = useCallback((): string | null => {
    if (!title.trim()) return t("errorTitleRequired");
    if (title.length > MAX_TITLE_LENGTH) return t("errorTitleTooLong");
    if (!description.trim()) return t("errorDescriptionRequired");
    if (!productId.trim()) return t("errorProductRequired");
    return null;
  }, [title, description, productId, t]);

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const validImages = images.filter((url) => url.trim().length > 0);

    try {
      await createShowcase.mutateAsync({
        productId: productId.trim(),
        title: title.trim(),
        description: description.trim(),
        images: validImages.length > 0 ? validImages : undefined,
        projectUrl: projectUrl.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      });
      setSubmitted(true);
      // Redirect after a short delay so user sees success state
      setTimeout(() => {
        router.push("/community/showcases");
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errorGeneric");
      setFormError(message);
    }
  }, [
    validate,
    images,
    productId,
    title,
    description,
    projectUrl,
    parsedTags,
    createShowcase,
    router,
    t,
  ]);

  // ---------------------------------------------------------------------------
  // Breadcrumbs
  // ---------------------------------------------------------------------------

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: t("community"), href: "/community" },
    { label: t("showcases"), href: "/community/showcases" },
    { label: t("submit") },
  ];

  // ---------------------------------------------------------------------------
  // Auth loading
  // ---------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Not authenticated
  // ---------------------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <LogIn className="mb-4 h-12 w-12 text-neutral-400" />
            <h2 className="mb-2 text-xl font-bold text-neutral-800 dark:text-neutral-200">
              {t("signInRequired")}
            </h2>
            <p className="mb-6 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              {t("signInToSubmit")}
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="me-2 h-4 w-4" />
                {t("signIn")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {t("submitSuccessTitle")}
          </h2>
          <p className="mb-6 text-neutral-500 dark:text-neutral-400">
            {t("submitSuccessDescription")}
          </p>
          <Link href="/community/showcases">
            <Button variant="outline">{t("backToShowcases")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t("submitTitle")}
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {t("submitSubtitle")}
          </p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {(formError || createShowcase.isError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {formError || t("errorGeneric")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Product ID */}
          <div>
            <label
              htmlFor="product-id"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("productLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="product-id"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder={t("productPlaceholder")}
              className="w-full"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {t("productHint")}
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("titleLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              maxLength={MAX_TITLE_LENGTH}
              className="w-full"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {title.length}/{MAX_TITLE_LENGTH}
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("descriptionLabel")} <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              className="w-full resize-y"
            />
          </div>

          {/* Images (URL inputs) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t("imagesLabel")}
            </label>
            <div className="space-y-3">
              {images.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      placeholder={t("imageUrlPlaceholder")}
                      className="w-full ps-9"
                    />
                  </div>
                  {/* Preview thumbnail */}
                  {url.trim() && (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImageField(index)}
                    disabled={images.length <= 1 && !url}
                    className="flex-shrink-0 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {images.length < MAX_IMAGES && (
              <Button
                variant="outline"
                size="sm"
                onClick={addImageField}
                className="mt-3"
              >
                <Plus className="me-1.5 h-4 w-4" />
                {t("addImage")}
              </Button>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              {t("imagesHint", { max: MAX_IMAGES })}
            </p>
          </div>

          {/* Project URL */}
          <div>
            <label
              htmlFor="project-url"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("projectUrlLabel")}
            </label>
            <Input
              id="project-url"
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("tagsLabel")}
            </label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("tagsPlaceholder")}
              className="w-full"
            />
            {parsedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {parsedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              {t("tagsHint")}
            </p>
          </div>

          {/* Preview toggle */}
          <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((prev) => !prev)}
              className="mb-4"
            >
              {showPreview ? (
                <EyeOff className="me-2 h-4 w-4" />
              ) : (
                <Eye className="me-2 h-4 w-4" />
              )}
              {showPreview ? t("hidePreview") : t("showPreview")}
            </Button>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                      {t("previewLabel")}
                    </p>
                    <div className="max-w-sm">
                      <ShowcaseCard showcase={previewShowcase as Showcase} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <Link href="/community/showcases">
              <Button variant="ghost">{t("cancel")}</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={createShowcase.isPending}
            >
              {createShowcase.isPending ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("submitShowcase")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
