"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  SlidersHorizontal,
  Loader2,
  ImageOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button, Badge } from "@ktblog/ui/components";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShowcaseCard } from "@/components/community/showcase-card";
import { useShowcases } from "@/hooks/use-showcases";
import { useAuth } from "@/providers/auth-provider";
import type { ShowcaseQueryParams, ShowcaseSortBy } from "@/types/showcase";

// =============================================================================
// ShowcasesClient
// =============================================================================
// Main gallery page for user showcases. Displays a masonry grid of showcase
// cards with filtering, sorting, and infinite-scroll pagination.

const SORT_OPTIONS: { value: ShowcaseSortBy; labelKey: string }[] = [
  { value: "newest", labelKey: "sortNewest" },
  { value: "popular", labelKey: "sortPopular" },
  { value: "featured", labelKey: "sortFeatured" },
];

// Popular tags for quick filtering (can be expanded or fetched from API)
const POPULAR_TAGS = [
  "dashboard",
  "landing-page",
  "e-commerce",
  "portfolio",
  "saas",
  "mobile",
  "presentation",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function ShowcasesClient() {
  const t = useTranslations("showcase");
  const { isAuthenticated } = useAuth();

  // Filter state
  const [sortBy, setSortBy] = useState<ShowcaseSortBy>("newest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const queryParams = useMemo<ShowcaseQueryParams>(() => {
    const params: ShowcaseQueryParams = {
      sortBy,
      limit: 12,
      status: "approved",
    };
    return params;
  }, [sortBy]);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useShowcases(queryParams);

  // Flatten paginated results
  const allShowcases = useMemo(
    () => data?.pages?.flatMap((page) => page.items) ?? [],
    [data],
  );

  // Client-side tag filter (if API does not support tag filtering)
  const filteredShowcases = useMemo(() => {
    if (!selectedTag) return allShowcases;
    return allShowcases.filter((s) =>
      s.tags?.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()),
    );
  }, [allShowcases, selectedTag]);

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: t("community"), href: "/community" },
    { label: t("showcases") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("galleryTitle")}
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {t("gallerySubtitle")}
            </p>
          </div>

          {isAuthenticated && (
            <Link href="/community/showcases/submit">
              <Button>
                <Plus className="me-2 h-4 w-4" />
                {t("shareYourWork")}
              </Button>
            </Link>
          )}
        </div>

        {/* Filter bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
          {/* Sort select */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ShowcaseSortBy)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedTag(null)}
            >
              {t("allTags")}
            </Badge>
            {POPULAR_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag ? null : tag))
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 animate-pulse break-inside-avoid overflow-hidden rounded-xl"
              >
                <div
                  className="w-full bg-neutral-200 dark:bg-neutral-800"
                  style={{ height: `${200 + (i % 3) * 80}px` }}
                />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-14 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Masonry grid */}
        {!isLoading && filteredShowcases.length > 0 && (
          <motion.div
            className="columns-1 gap-4 sm:columns-2 lg:columns-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredShowcases.map((showcase) => (
              <motion.div key={showcase.id} variants={itemVariants}>
                <ShowcaseCard showcase={showcase} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && filteredShowcases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageOff className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-600" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              {t("emptyTitle")}
            </h3>
            <p className="mb-6 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              {t("emptyDescription")}
            </p>
            {isAuthenticated && (
              <Link href="/community/showcases/submit">
                <Button>
                  <Plus className="me-2 h-4 w-4" />
                  {t("beTheFirst")}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Load more */}
        {hasNextPage && !isLoading && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("loadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
