"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Search,
  X,
  Grid3X3,
  List,
  Loader2,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useInfiniteBookmarks,
  extractBookmarks,
  extractHasNextPage,
} from "@/hooks/use-bookmarks";
import { useRemoveBookmark } from "@/hooks/use-bookmarks";
import { toast } from "sonner";

// =============================================================================
// Bookmarks Dashboard Page
// =============================================================================

type ViewMode = "grid" | "list";

function BookmarksContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBookmarks(12);

  const removeBookmark = useRemoveBookmark();

  // Flatten all pages into a single bookmarks array
  const allBookmarks =
    infiniteData?.pages.flatMap((page) => extractBookmarks(page)) ?? [];

  // Filter by search query
  const filteredBookmarks = searchQuery
    ? allBookmarks.filter(
        (b) =>
          b.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.post.category?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          b.post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBookmarks;

  function handleRemoveBookmark(postId: string, title: string) {
    removeBookmark.mutate(postId, {
      onSuccess: () => {
        toast.success(`Removed "${title}" from bookmarks`);
      },
      onError: () => {
        toast.error("Failed to remove bookmark. Please try again.");
      },
    });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              My Bookmarks
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {allBookmarks.length} saved article
              {allBookmarks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[var(--surface-1)] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-16 text-center">
          <Bookmark className="h-16 w-16 mx-auto text-[var(--muted-foreground)] mb-4 opacity-40" />
          {searchQuery ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                No bookmarks found
              </h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                No bookmarks match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                No bookmarks yet
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Start saving articles you love by clicking the bookmark icon on
                any article.
              </p>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center overflow-hidden">
                {bookmark.post.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bookmark.post.featuredImage}
                    alt={bookmark.post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-[var(--primary)]/25" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {bookmark.post.category && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] mb-2">
                    {bookmark.post.category.name}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 mb-2">
                  <Link
                    href={`/blogs/${bookmark.post.slug}`}
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    {bookmark.post.title}
                  </Link>
                </h3>
                {bookmark.post.excerpt && (
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
                    {bookmark.post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-3">
                    {bookmark.post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {bookmark.post.readingTime} min
                      </span>
                    )}
                    {bookmark.post.author && (
                      <span>
                        {bookmark.post.author.firstName}{" "}
                        {bookmark.post.author.lastName}
                      </span>
                    )}
                  </div>
                  <span>{formatDate(bookmark.createdAt)}</span>
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() =>
                  handleRemoveBookmark(bookmark.postId, bookmark.post.title)
                }
                disabled={removeBookmark.isPending}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-sm text-[var(--muted-foreground)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                aria-label={`Remove ${bookmark.post.title} from bookmarks`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group flex items-center gap-4 p-4 hover:bg-[var(--surface-1)] transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center shrink-0">
                {bookmark.post.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bookmark.post.featuredImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-5 w-5 text-[var(--primary)]/25" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">
                  <Link
                    href={`/blogs/${bookmark.post.slug}`}
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    {bookmark.post.title}
                  </Link>
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {bookmark.post.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                      {bookmark.post.category.name}
                    </span>
                  )}
                  {bookmark.post.readingTime && (
                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bookmark.post.readingTime} min
                    </span>
                  )}
                  {bookmark.post.author && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      by {bookmark.post.author.firstName}{" "}
                      {bookmark.post.author.lastName}
                    </span>
                  )}
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Saved {formatDate(bookmark.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/blogs/${bookmark.post.slug}`}
                  className="text-xs text-[var(--primary)] hover:underline hidden sm:block"
                >
                  Read
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveBookmark(bookmark.postId, bookmark.post.title)
                  }
                  disabled={removeBookmark.isPending}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                  aria-label={`Remove ${bookmark.post.title}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && !searchQuery && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-1)] transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage() {
  return <BookmarksContent />;
}
