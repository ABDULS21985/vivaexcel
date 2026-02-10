"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Flame,
  TrendingUp,
  Calendar,
  Loader2,
  ArrowRight,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertTriangle,
} from "lucide-react";
import {
  useReadingHistory,
  useReadingStats,
  useRemoveHistoryEntry,
  useClearReadingHistory,
  extractHistory,
  extractHistoryTotal,
  extractHistoryPages,
  extractStats,
} from "@/hooks/use-reading-history";
import { toast } from "sonner";

// =============================================================================
// Reading History Dashboard Page
// =============================================================================

function ReadingHistoryContent() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const pageSize = 15;

  const { data: historyData, isLoading: historyLoading } = useReadingHistory(
    page,
    pageSize
  );
  const { data: statsData, isLoading: statsLoading } = useReadingStats();
  const removeEntry = useRemoveHistoryEntry();
  const clearHistory = useClearReadingHistory();

  const history = extractHistory(historyData);
  const total = extractHistoryTotal(historyData);
  const totalPages = extractHistoryPages(historyData);
  const stats = extractStats(statsData);

  // Filter by search
  const filteredHistory = searchQuery
    ? history.filter(
        (entry) =>
          entry.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.post.category?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : history;

  function handleRemoveEntry(entryId: string, title: string) {
    removeEntry.mutate(entryId, {
      onSuccess: () => {
        toast.success(`Removed "${title}" from history`);
      },
      onError: () => {
        toast.error("Failed to remove entry. Please try again.");
      },
    });
  }

  function handleClearAll() {
    clearHistory.mutate(undefined, {
      onSuccess: () => {
        toast.success("Reading history cleared");
        setShowClearConfirm(false);
        setPage(1);
      },
      onError: () => {
        toast.error("Failed to clear history. Please try again.");
        setShowClearConfirm(false);
      },
    });
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatReadingTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              Reading History
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Track your reading journey
            </p>
          </div>
        </div>

        {total > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {statsLoading ? (
              <span className="inline-block w-8 h-7 bg-[var(--surface-2)] rounded animate-pulse" />
            ) : (
              stats.totalArticlesRead
            )}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Articles Read
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {statsLoading ? (
              <span className="inline-block w-12 h-7 bg-[var(--surface-2)] rounded animate-pulse" />
            ) : (
              formatReadingTime(stats.totalReadingTime)
            )}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Total Reading Time
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {statsLoading ? (
              <span className="inline-block w-8 h-7 bg-[var(--surface-2)] rounded animate-pulse" />
            ) : (
              stats.streakDays
            )}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Day Streak
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {statsLoading ? (
              <span className="inline-block w-8 h-7 bg-[var(--surface-2)] rounded animate-pulse" />
            ) : (
              stats.thisWeek
            )}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            This Week
          </p>
        </div>
      </div>

      {/* Search & Mobile Clear */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search history..."
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

        {total > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="sm:hidden p-2.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors border border-[var(--border)]"
            aria-label="Clear all history"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* History List */}
      {historyLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-16 text-center">
          <Clock className="h-16 w-16 mx-auto text-[var(--muted-foreground)] mb-4 opacity-40" />
          {searchQuery ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                No results found
              </h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                No history entries match &ldquo;{searchQuery}&rdquo;
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
                No reading history yet
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Your reading activity will appear here as you explore articles.
              </p>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start Reading
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center gap-4 p-4 hover:bg-[var(--surface-1)] transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center shrink-0">
                  {entry.post.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.post.featuredImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-5 w-5 text-[var(--primary)]/25" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">
                    <Link
                      href={`/blogs/${entry.post.slug}`}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {entry.post.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {entry.post.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        {entry.post.category.name}
                      </span>
                    )}
                    {entry.post.readingTime && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {entry.post.readingTime} min read
                      </span>
                    )}
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatTimeAgo(entry.readAt)}
                    </span>
                  </div>
                </div>

                {/* Progress + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Progress bar */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-[var(--surface-3)]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          entry.progress >= 100
                            ? "bg-green-500"
                            : entry.progress >= 50
                              ? "bg-[var(--primary)]"
                              : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.min(entry.progress, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] w-8 text-right font-medium">
                      {entry.progress}%
                    </span>
                  </div>

                  {/* Continue / Read link */}
                  <Link
                    href={`/blogs/${entry.post.slug}`}
                    className="hidden md:inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline font-medium"
                  >
                    {entry.progress < 100 ? "Continue" : "Re-read"}
                  </Link>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveEntry(entry.id, entry.post.title)
                    }
                    disabled={removeEntry.isPending}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    aria-label={`Remove ${entry.post.title} from history`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing {(page - 1) * pageSize + 1}&ndash;
            {Math.min(page * pageSize, total)} of {total}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-1)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-1)]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-1)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  Clear Reading History
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  This cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Are you sure you want to clear all {total} reading history{" "}
              {total === 1 ? "entry" : "entries"}? Your reading stats will be
              reset.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-1)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearHistory.isPending}
                className="flex-1 py-2.5 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {clearHistory.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Clear All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReadingHistoryPage() {
  return <ReadingHistoryContent />;
}
