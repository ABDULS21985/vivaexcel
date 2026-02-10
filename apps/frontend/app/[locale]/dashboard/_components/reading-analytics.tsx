"use client";

import { useMemo } from "react";
import { useReadingHistory, useReadingStats, extractStats, extractHistory } from "@/hooks/use-reading-history";
import { Skeleton } from "@ktblog/ui/components";
import { BarChart3, Clock, CheckCircle, Tag } from "lucide-react";
import { motion } from "framer-motion";

export function ReadingAnalytics() {
  const { data: statsRaw, isLoading: statsLoading } = useReadingStats();
  const { data: historyRaw, isLoading: historyLoading } = useReadingHistory(1, 100);

  const stats = extractStats(statsRaw);
  const history = extractHistory(historyRaw);

  // Weekly reading chart (articles per day, Mon-Sun)
  const weeklyData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = Array(7).fill(0);

    for (const entry of history) {
      const readDate = new Date(entry.readAt);
      if (readDate >= startOfWeek) {
        const entryDay = readDate.getDay();
        const idx = entryDay === 0 ? 6 : entryDay - 1;
        counts[idx]++;
      }
    }

    const maxCount = Math.max(...counts, 1);
    return days.map((label, i) => ({
      label,
      count: counts[i],
      height: Math.max((counts[i] / maxCount) * 100, 4),
    }));
  }, [history]);

  // Completion rate
  const completionStats = useMemo(() => {
    if (history.length === 0) return { completed: 0, total: 0, rate: 0 };
    const completed = history.filter((e) => e.progress >= 100).length;
    return {
      completed,
      total: history.length,
      rate: Math.round((completed / history.length) * 100),
    };
  }, [history]);

  // Top categories
  const topCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const entry of history) {
      const name = entry.post.category?.name;
      if (name) {
        catMap.set(name, (catMap.get(name) || 0) + 1);
      }
    }
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [history]);

  // Total reading time
  const totalReadingTime = useMemo(() => {
    return history.reduce((sum, entry) => {
      return sum + (entry.post.readingTime ?? 0);
    }, 0);
  }, [history]);

  const isLoading = statsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-22 rounded-xl" />
          <Skeleton className="h-22 rounded-xl" />
          <Skeleton className="h-22 rounded-xl col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
      aria-label="Reading analytics"
    >
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-5 w-5 text-[var(--muted-foreground)]" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Reading Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Chart */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            This Week
          </h3>
          <div className="flex items-end justify-between gap-2 h-28">
            {weeklyData.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.height}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-[32px] bg-[var(--primary)] rounded-t-md relative group cursor-default"
                  title={`${day.count} articles`}
                >
                  {day.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--foreground)] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.count}
                    </span>
                  )}
                </motion.div>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Reading Time */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <Clock className="h-4 w-4 text-blue-500 mb-2" />
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {totalReadingTime}
              <span className="text-sm font-normal text-[var(--muted-foreground)]"> min</span>
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Total reading time
            </p>
          </div>

          {/* Completion Rate */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <CheckCircle className="h-4 w-4 text-green-500 mb-2" />
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {completionStats.rate}%
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {completionStats.completed}/{completionStats.total} completed
            </p>
          </div>

          {/* Top Categories */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-medium text-[var(--foreground)]">
                Top Categories
              </p>
            </div>
            {topCategories.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                No category data yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {topCategories.map(([name, count]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                  >
                    {name}
                    <span className="font-semibold text-[var(--foreground)] tabular-nums">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
