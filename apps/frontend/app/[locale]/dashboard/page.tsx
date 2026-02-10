"use client";

import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  Crown,
  Clock,
  ArrowRight,
  X,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useBookmarks, useRemoveBookmark } from "@/hooks/use-bookmarks";
import { useReadingHistory, useReadingStats } from "@/hooks/use-reading-history";
import { toast } from "sonner";

// =============================================================================
// Member Dashboard
// =============================================================================
// User dashboard with welcome header, stats, reading history, bookmarks,
// and subscription info. Data fetched from real backend APIs.

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  free: { name: "Free", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  basic: { name: "Basic", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  pro: { name: "Pro", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  premium: { name: "Premium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

function DashboardContent() {
  const { user } = useAuth();
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks();
  const { data: historyData, isLoading: historyLoading } = useReadingHistory();
  const { data: statsData } = useReadingStats();
  const removeBookmark = useRemoveBookmark();

  const planInfo = PLAN_LABELS[user?.plan || "free"];
  const bookmarks = bookmarksData?.bookmarks ?? [];
  const readingHistory = historyData?.history ?? [];
  const totalArticlesRead = statsData?.totalArticlesRead ?? readingHistory.length;

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
    return date.toLocaleDateString();
  }

  return (
    <div>
        {/* Welcome Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
            Welcome back, {user?.firstName || "Reader"}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Here&apos;s what&apos;s happening with your reading
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {totalArticlesRead}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Articles Read
              </p>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Bookmark className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {bookmarksData?.total ?? bookmarks.length}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Bookmarks
              </p>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${planInfo.color}`}
              >
                {planInfo.name}
              </span>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Current Plan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Reading History */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">
                    Reading History
                  </h2>
                </div>
                <Link
                  href="/dashboard/history"
                  className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
                </div>
              ) : readingHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
                  <p className="text-[var(--muted-foreground)]">
                    No reading history yet. Start exploring articles!
                  </p>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--primary)] hover:underline"
                  >
                    Browse Articles
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {readingHistory.slice(0, 5).map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/blogs/${entry.post.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-[var(--surface-1)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[var(--foreground)] truncate">
                          {entry.post.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.post.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                              {entry.post.category.name}
                            </span>
                          )}
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatTimeAgo(entry.readAt)}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-[var(--surface-3)]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              entry.progress >= 100
                                ? "bg-green-500"
                                : "bg-[var(--primary)]"
                            }`}
                            style={{ width: `${Math.min(entry.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)] w-8 text-right">
                          {entry.progress}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Subscription */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-[var(--muted-foreground)]" />
                <h2 className="font-semibold text-[var(--foreground)]">
                  Subscription
                </h2>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${planInfo.color}`}
                >
                  {planInfo.name} Plan
                </span>
              </div>

              {user?.plan === "free" || !user?.plan ? (
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Upgrade to access members-only content, ad-free reading,
                  and more.
                </p>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Your subscription renews automatically. Manage your
                  billing from your settings.
                </p>
              )}

              <div className="space-y-2">
                {(user?.plan === "free" || !user?.plan) && (
                  <Link
                    href="/membership"
                    className="block w-full text-center py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity btn-press"
                  >
                    Upgrade Plan
                  </Link>
                )}
                <Link
                  href="/dashboard/billing"
                  className="block w-full text-center py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
                >
                  {user?.plan === "free" || !user?.plan
                    ? "View Plans"
                    : "Manage Billing"}
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">
                Quick Links
              </h3>
              <nav className="space-y-1">
                {[
                  { label: "Profile Settings", href: "/dashboard/profile" },
                  { label: "Billing & Invoices", href: "/dashboard/billing" },
                  { label: "Browse Articles", href: "/blogs" },
                  { label: "Membership Plans", href: "/membership" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)] transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="mt-8 md:mt-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-[var(--muted-foreground)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Bookmarks
              </h2>
            </div>
          </div>

          {bookmarksLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
              <p className="text-[var(--muted-foreground)]">
                No bookmarks yet. Start saving articles you love.
              </p>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--primary)] hover:underline"
              >
                Browse Articles
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="group relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-md transition-all"
                >
                  {/* Placeholder cover */}
                  <div className="h-32 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center">
                    {bookmark.post.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bookmark.post.featuredImage}
                        alt={bookmark.post.title}
                        className="w-full h-full object-cover"
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

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(bookmark.postId, bookmark.post.title)}
                    disabled={removeBookmark.isPending}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-sm text-[var(--muted-foreground)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    aria-label={`Remove ${bookmark.post.title} from bookmarks`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
