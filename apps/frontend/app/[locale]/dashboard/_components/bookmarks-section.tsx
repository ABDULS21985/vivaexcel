"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useBookmarks, useRemoveBookmark, extractBookmarks } from "@/hooks/use-bookmarks";
import { Skeleton } from "@ktblog/ui/components";
import {
  Bookmark,
  ArrowRight,
  X,
  Grid3X3,
  List,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

export function BookmarksSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: bookmarksRaw, isLoading, error, refetch } = useBookmarks(1, 8);
  const removeBookmark = useRemoveBookmark();

  const bookmarks = extractBookmarks(bookmarksRaw);
  const total = bookmarksRaw?.total ?? bookmarks.length;

  function handleRemove(postId: string, title: string) {
    removeBookmark.mutate(postId, {
      onSuccess: () => {
        toast.success(`Removed "${title}" from bookmarks`);
      },
      onError: () => {
        toast.error("Failed to remove bookmark. Please try again.");
      },
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8"
      aria-label="Bookmarks"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Bookmarks
          </h2>
          {total > 0 && (
            <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
              ({total})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="/dashboard/bookmarks"
            className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 bg-[var(--card)] border border-t-0 border-[var(--border)] rounded-b-xl">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : error ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Failed to load bookmarks
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 text-center">
          <Bookmark className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3" />
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            No bookmarks yet. Start saving articles you love.
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
          >
            Browse Articles
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="h-32 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center">
                {bookmark.post.featuredImage ? (
                  <Image
                    src={bookmark.post.featuredImage}
                    alt=""
                    width={320}
                    height={128}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-[var(--primary)]/30" />
                )}
              </div>
              <div className="p-4">
                {bookmark.post.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                    {bookmark.post.category.name}
                  </span>
                )}
                <h3 className="text-sm font-medium text-[var(--foreground)] mt-2 line-clamp-2">
                  <Link href={`/blogs/${bookmark.post.slug}`} className="hover:underline">
                    {bookmark.post.title}
                  </Link>
                </h3>
                {bookmark.post.readingTime && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {bookmark.post.readingTime} min read
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(bookmark.postId, bookmark.post.title)}
                disabled={removeBookmark.isPending}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-sm text-[var(--muted-foreground)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                aria-label={`Remove ${bookmark.post.title} from bookmarks`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="flex items-center gap-4 p-4 hover:bg-[var(--surface-1)] transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-[var(--surface-2)] overflow-hidden shrink-0">
                {bookmark.post.featuredImage ? (
                  <Image
                    src={bookmark.post.featuredImage}
                    alt=""
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/blogs/${bookmark.post.slug}`}
                  className="text-sm font-medium text-[var(--foreground)] hover:underline truncate block"
                >
                  {bookmark.post.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  {bookmark.post.category && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {bookmark.post.category.name}
                    </span>
                  )}
                  {bookmark.post.readingTime && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {bookmark.post.readingTime} min
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(bookmark.postId, bookmark.post.title)}
                disabled={removeBookmark.isPending}
                className="p-1.5 rounded-full text-[var(--muted-foreground)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                aria-label={`Remove ${bookmark.post.title} from bookmarks`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
