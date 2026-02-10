"use client";

import { Link } from "@/i18n/routing";
import { useReadingHistory, extractHistory, extractHistoryTotal } from "@/hooks/use-reading-history";
import { Skeleton } from "@ktblog/ui/components";
import {
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

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

export function ReadingHistoryList() {
  const { data: historyRaw, isLoading, error, refetch } = useReadingHistory(1, 5);
  const history = extractHistory(historyRaw);
  const total = extractHistoryTotal(historyRaw);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8"
      aria-label="Recent reading history"
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h2 className="font-semibold text-[var(--foreground)]">
              Recent Reading
            </h2>
            {total > 0 && (
              <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
                ({total})
              </span>
            )}
          </div>
          <Link
            href="/dashboard/history"
            className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-16 h-12 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1.5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              Failed to load reading history
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3" />
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              No reading history yet. Start exploring articles!
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
            >
              Browse Articles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {history.map((entry) => {
              const isCompleted = entry.progress >= 100;
              return (
                <Link
                  key={entry.id}
                  href={`/blogs/${entry.post.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--surface-1)] transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg bg-[var(--surface-2)] overflow-hidden shrink-0">
                    {entry.post.featuredImage ? (
                      <Image
                        src={entry.post.featuredImage}
                        alt=""
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-[var(--muted-foreground)]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
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
                      {entry.post.readingTime && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {entry.post.readingTime} min
                        </span>
                      )}
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTimeAgo(entry.readAt)}
                      </span>
                    </div>
                  </div>

                  {/* Progress / Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <>
                        <div className="w-16 h-1.5 rounded-full bg-[var(--surface-3)]">
                          <div
                            className="h-full rounded-full bg-[var(--primary)] transition-all"
                            style={{ width: `${Math.min(entry.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)] tabular-nums w-7 text-right">
                          {entry.progress}%
                        </span>
                      </>
                    )}
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
