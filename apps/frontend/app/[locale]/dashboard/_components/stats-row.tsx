"use client";

import { Link } from "@/i18n/routing";
import { useReadingStats, extractStats } from "@/hooks/use-reading-history";
import { useBookmarks, extractBookmarks } from "@/hooks/use-bookmarks";
import { useGamificationProfile } from "@/hooks/use-gamification";
import { useLeaderboard } from "@/hooks/use-gamification";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@ktblog/ui/components";
import {
  BookOpen,
  Flame,
  Zap,
  Bookmark,
  Trophy,
  Medal,
} from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  href: string;
  colorClass: string;
  delay?: number;
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  href,
  colorClass,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={href}
        className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
              {value}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {label}
            </p>
          </div>
        </div>
        {subtitle && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  );
}

export function StatsRow() {
  const { user } = useAuth();
  const { data: statsRaw, isLoading: statsLoading } = useReadingStats();
  const { data: bookmarksRaw, isLoading: bookmarksLoading } = useBookmarks();
  const { data: gamProfile, isLoading: gamLoading } =
    useGamificationProfile();
  const { data: leaderboardData, isLoading: lbLoading } = useLeaderboard(
    "all_time",
    undefined,
    100
  );

  const stats = extractStats(statsRaw);
  const bookmarks = extractBookmarks(bookmarksRaw);

  const xp = gamProfile?.xp;
  const streak = xp?.streak ?? 0;
  const longestStreak = xp?.longestStreak ?? 0;
  const level = xp?.level ?? 1;
  const levelTitle = xp?.title ?? "Beginner";
  const totalXP = xp?.totalXP ?? 0;
  const currentLevelXP = xp?.currentLevelXP ?? 0;
  const nextLevelXP = xp?.nextLevelXP ?? 100;
  const xpProgress = nextLevelXP > 0 ? Math.round((currentLevelXP / nextLevelXP) * 100) : 0;

  const unlockedCount = gamProfile?.stats?.unlockedCount ?? 0;
  const totalAchievements = gamProfile?.stats?.totalAchievements ?? 0;

  // Find user rank
  const userRank = leaderboardData?.items?.find(
    (entry) => entry.userId === user?.id
  );
  const rankDisplay = userRank?.rank ?? "—";

  const isLoading = statsLoading || bookmarksLoading || gamLoading;

  if (isLoading) {
    return (
      <section
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8"
        aria-label="Stats loading"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8"
      aria-label="Dashboard statistics"
    >
      <StatCard
        icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        label="Articles Read"
        value={stats.totalArticlesRead}
        subtitle={`+${stats.thisWeek} this week`}
        href="/dashboard/history"
        colorClass="bg-blue-100 dark:bg-blue-900/30"
        delay={0}
      />
      <StatCard
        icon={<Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
        label="Reading Streak"
        value={streak}
        subtitle={`Longest: ${longestStreak} days`}
        href="/dashboard/achievements"
        colorClass="bg-orange-100 dark:bg-orange-900/30"
        delay={0.05}
      />
      <StatCard
        icon={<Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        label={`Level ${level} — ${levelTitle}`}
        value={`${totalXP} XP`}
        subtitle={`${xpProgress}% to next level`}
        href="/dashboard/achievements"
        colorClass="bg-purple-100 dark:bg-purple-900/30"
        delay={0.1}
      />
      <StatCard
        icon={
          <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        }
        label="Bookmarks"
        value={bookmarksRaw?.total ?? bookmarks.length}
        subtitle="Saved articles"
        href="/dashboard/bookmarks"
        colorClass="bg-amber-100 dark:bg-amber-900/30"
        delay={0.15}
      />
      <StatCard
        icon={
          <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        }
        label="Achievements"
        value={`${unlockedCount}/${totalAchievements}`}
        subtitle={
          unlockedCount > 0
            ? `${Math.round((unlockedCount / totalAchievements) * 100)}% unlocked`
            : "Start earning!"
        }
        href="/dashboard/achievements"
        colorClass="bg-emerald-100 dark:bg-emerald-900/30"
        delay={0.2}
      />
      <StatCard
        icon={<Medal className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        label="Leaderboard Rank"
        value={rankDisplay}
        subtitle={
          lbLoading
            ? "Loading..."
            : userRank
              ? `${totalXP} XP`
              : "Not ranked yet"
        }
        href="/dashboard/achievements"
        colorClass="bg-rose-100 dark:bg-rose-900/30"
        delay={0.25}
      />
    </section>
  );
}
