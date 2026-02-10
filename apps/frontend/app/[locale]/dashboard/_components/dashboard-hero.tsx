"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/providers/auth-provider";
import { useGamificationProfile } from "@/hooks/use-gamification";
import { Skeleton } from "@ktblog/ui/components";
import {
  BookOpen,
  Bookmark,
  User,
  Flame,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function DashboardHero() {
  const { user } = useAuth();
  const { data: gamProfile, isLoading: gamLoading } = useGamificationProfile();

  const greeting = useMemo(() => getGreeting(), []);
  const initials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || "U";
  const memberSince = user?.createdAt
    ? formatMemberSince(user.createdAt)
    : null;
  const streak = gamProfile?.xp?.streak ?? 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border border-[var(--border)] p-6 md:p-8 mb-8"
      aria-label="Dashboard welcome"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--primary)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500 blur-[60px]" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <Link
          href="/dashboard/profile"
          className="shrink-0 group"
          aria-label="Go to profile settings"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-[var(--primary)]/20 group-hover:ring-[var(--primary)]/40 transition-all"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl md:text-2xl font-bold ring-2 ring-[var(--primary)]/20 group-hover:ring-[var(--primary)]/40 transition-all">
              {initials}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            {greeting}, {user?.firstName || "Reader"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {memberSince && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                <Sparkles className="h-3 w-3" />
                Member since {memberSince}
              </span>
            )}
            {/* Streak badge */}
            {gamLoading ? (
              <Skeleton className="h-6 w-32 rounded-full" />
            ) : streak > 0 ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
              >
                <Flame className="h-3 w-3" />
                {streak}-day streak!
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                <Flame className="h-3 w-3" />
                Start your reading streak today!
              </span>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse Articles
            </Link>
            <Link
              href="/dashboard/bookmarks"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              View Bookmarks
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Manage Profile
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
