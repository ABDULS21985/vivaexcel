"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Eye,
  MessageCircle,
  ExternalLink,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button, Badge } from "@ktblog/ui/components";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShowcaseComments } from "@/components/community/showcase-comments";
import { useShowcase, useToggleShowcaseLike } from "@/hooks/use-showcases";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// ShowcaseDetailClient
// =============================================================================
// Full detail view for a single showcase. Includes an image gallery with
// lightbox, author info, product link, description, tags, like/share actions,
// stats, and comments section.

interface ShowcaseDetailClientProps {
  id: string;
}

export function ShowcaseDetailClient({ id }: ShowcaseDetailClientProps) {
  const t = useTranslations("showcase");
  const { isAuthenticated } = useAuth();

  const { data: showcase, isLoading, error } = useShowcase(id);
  const toggleLike = useToggleShowcaseLike();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Share copied state
  const [copied, setCopied] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleLike = useCallback(() => {
    if (!isAuthenticated) return;
    toggleLike.mutate(id);
  }, [isAuthenticated, toggleLike, id]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const prevImage = useCallback(() => {
    if (!showcase?.images) return;
    setLightboxIndex((prev) =>
      prev === 0 ? showcase.images.length - 1 : prev - 1,
    );
  }, [showcase?.images]);

  const nextImage = useCallback(() => {
    if (!showcase?.images) return;
    setLightboxIndex((prev) =>
      prev === showcase.images.length - 1 ? 0 : prev + 1,
    );
  }, [showcase?.images]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-6 h-4 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Image gallery skeleton */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="col-span-2 aspect-video animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 md:col-span-2" />
            <div className="aspect-square animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4 h-8 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

          {/* Author skeleton */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error || !showcase) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
          <h2 className="mb-2 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            {t("notFoundTitle")}
          </h2>
          <p className="mb-6 text-neutral-500 dark:text-neutral-400">
            {t("notFoundDescription")}
          </p>
          <Link href="/community/showcases">
            <Button variant="outline">
              <ArrowLeft className="me-2 h-4 w-4" />
              {t("backToShowcases")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const userName = showcase.user
    ? `${showcase.user.firstName} ${showcase.user.lastName}`
    : t("anonymousUser");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: t("community"), href: "/community" },
    { label: t("showcases"), href: "/community/showcases" },
    { label: showcase.title },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* ----------------------------------------------------------------- */}
        {/* Image Gallery                                                      */}
        {/* ----------------------------------------------------------------- */}
        {showcase.images && showcase.images.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {showcase.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  className={`group relative overflow-hidden rounded-xl ${
                    idx === 0 && showcase.images.length > 1
                      ? "col-span-2 md:row-span-2"
                      : ""
                  }`}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => openLightbox(idx)}
                >
                  <Image
                    src={img}
                    alt={`${showcase.title} - ${idx + 1}`}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox overlay */}
        <AnimatePresence>
          {lightboxOpen && showcase.images && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation: previous */}
              {showcase.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-h-[85vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={showcase.images[lightboxIndex]}
                  alt={`${showcase.title} - ${lightboxIndex + 1}`}
                  width={1400}
                  height={900}
                  className="max-h-[85vh] w-auto rounded-lg object-contain"
                  priority
                />
              </motion.div>

              {/* Navigation: next */}
              {showcase.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                {lightboxIndex + 1} / {showcase.images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------------------- */}
        {/* Content area                                                       */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content (2/3) */}
          <div className="lg:col-span-2">
            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {showcase.title}
            </h1>

            {/* User info */}
            <div className="mb-6 flex items-center gap-3">
              {showcase.user?.avatar ? (
                <Image
                  src={showcase.user.avatar}
                  alt={userName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {showcase.user?.firstName?.[0] ?? "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {userName}
                </p>
                {showcase.user?.username && (
                  <Link
                    href={`/author/${showcase.user.username}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {t("viewProfile")}
                  </Link>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-neutral mb-8 max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{showcase.description}</p>
            </div>

            {/* Tags */}
            {showcase.tags && showcase.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {showcase.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Project URL */}
            {showcase.projectUrl && (
              <div className="mb-8">
                <a
                  href={showcase.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("visitProject")}
                </a>
              </div>
            )}

            {/* Action bar: like, share */}
            <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-neutral-200 py-4 dark:border-neutral-800">
              {/* Like button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={toggleLike.isPending || !isAuthenticated}
                className="gap-2"
              >
                {toggleLike.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${
                      showcase.likesCount > 0
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                )}
                {showcase.likesCount}
              </Button>

              {/* Stats */}
              <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Eye className="h-4 w-4" />
                {showcase.viewCount}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                <MessageCircle className="h-4 w-4" />
                {showcase.commentsCount}
              </span>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ms-auto gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                {copied ? t("copied") : t("share")}
              </Button>
            </div>

            {/* Comments */}
            <ShowcaseComments showcaseId={id} />
          </div>

          {/* Sidebar (1/3) */}
          <aside className="lg:col-span-1">
            {/* Product used card */}
            {showcase.product && (
              <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {t("madeWith")}
                </h3>
                <Link
                  href={`/store/${showcase.product.slug}`}
                  className="group flex items-center gap-3"
                >
                  {showcase.product.thumbnailUrl ? (
                    <Image
                      src={showcase.product.thumbnailUrl}
                      alt={showcase.product.title}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <span className="text-lg">📦</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100">
                      {showcase.product.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t("viewProduct")}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Quick stats card */}
            <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t("stats")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Heart className="h-4 w-4" />
                    {t("likes")}
                  </span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {showcase.likesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Eye className="h-4 w-4" />
                    {t("views")}
                  </span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {showcase.viewCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <MessageCircle className="h-4 w-4" />
                    {t("commentsLabel")}
                  </span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {showcase.commentsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Created date */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("published")}{" "}
                {new Date(showcase.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
