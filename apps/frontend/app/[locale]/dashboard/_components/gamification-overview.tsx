"use client";

import { useGamificationProfile, useGamificationActivity, useStreakFreeze } from "@/hooks/use-gamification";
import { Skeleton } from "@ktblog/ui/components";
import {
  Flame,
  Zap,
  ShieldCheck,
  BookOpen,
  Star,
  MessageSquare,
  ShoppingBag,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

function getActivityIcon(source: string) {
  switch (source.toLowerCase()) {
    case "reading":
    case "read":
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case "review":
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case "purchase":
    case "buy":
      return <ShoppingBag className="h-4 w-4 text-purple-500" />;
    case "achievement":
      return <Award className="h-4 w-4 text-amber-500" />;
    case "streak":
      return <Flame className="h-4 w-4 text-orange-500" />;
    default:
      return <Star className="h-4 w-4 text-[var(--primary)]" />;
  }
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function GamificationOverview() {
  const { data: profile, isLoading: profileLoading } = useGamificationProfile();
  const { data: activityData, isLoading: activityLoading } = useGamificationActivity(undefined, 5);
  const streakFreeze = useStreakFreeze();

  const xp = profile?.xp;
  const level = xp?.level ?? 1;
  const title = xp?.title ?? "Beginner";
  const currentLevelXP = xp?.currentLevelXP ?? 0;
  const nextLevelXP = xp?.nextLevelXP ?? 100;
  const xpPercent = nextLevelXP > 0 ? Math.min((currentLevelXP / nextLevelXP) * 100, 100) : 0;
  const streak = xp?.streak ?? 0;
  const longestStreak = xp?.longestStreak ?? 0;
  const freezeAvailable = xp?.streakFreezeAvailable ?? 0;
  const lastActiveDate = xp?.lastActiveDate;

  const activities = activityData?.items ?? profile?.recentActivity ?? [];

  function handleStreakFreeze() {
    streakFreeze.mutate(undefined, {
      onSuccess: () => {
        toast.success("Streak freeze activated! Your streak is safe for today.");
      },
      onError: () => {
        toast.error("Failed to activate streak freeze. Please try again.");
      },
    });
  }

  // Generate last 14 days for streak calendar
  function getStreakCalendar() {
    const days: { date: string; dayLabel: string; isActive: boolean }[] = [];
    const today = new Date();
    const lastActive = lastActiveDate ? new Date(lastActiveDate) : null;

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });

      // Simple heuristic: if within streak days from last active, mark as active
      let isActive = false;
      if (lastActive && streak > 0) {
        const daysDiff = Math.floor(
          (lastActive.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        );
        isActive = daysDiff >= 0 && daysDiff < streak;
      }

      days.push({ date: dateStr, dayLabel, isActive });
    }
    return days;
  }

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const streakDays = getStreakCalendar();

  return (
    <div className="space-y-6">
      {/* XP Progress Bar */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Level {level} — {title}
            </h3>
          </div>
          <span className="text-sm text-[var(--muted-foreground)] tabular-nums">
            {currentLevelXP} / {nextLevelXP} XP
          </span>
        </div>
        <div
          className="w-full h-3 bg-[var(--surface-3)] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentLevelXP}
          aria-valuemin={0}
          aria-valuemax={nextLevelXP}
          aria-label={`XP progress: ${currentLevelXP} of ${nextLevelXP}`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-[var(--primary)] rounded-full"
          />
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          {Math.round(xpPercent)}% to Level {level + 1}
        </p>
      </div>

      {/* Streak Widget */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Reading Streak
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {freezeAvailable > 0 && (
              <button
                type="button"
                onClick={handleStreakFreeze}
                disabled={streakFreeze.isPending}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
                title="Use a streak freeze to protect your streak for one day"
              >
                <ShieldCheck className="h-3 w-3" />
                {freezeAvailable} Freeze{freezeAvailable !== 1 ? "s" : ""} Available
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500 tabular-nums">{streak}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Current</p>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)] tabular-nums">{longestStreak}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Longest</p>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="grid grid-cols-14 gap-1.5" aria-label="Streak calendar, last 14 days">
          {streakDays.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {day.dayLabel}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  day.isActive
                    ? "bg-green-500 text-white"
                    : "bg-[var(--surface-2)]"
                }`}
                title={`${day.date}: ${day.isActive ? "Active" : "Inactive"}`}
              >
                {day.isActive && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent XP Activity */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Recent XP Activity
            </h3>
          </div>
        </div>

        {activityLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <Zap className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">
              No XP activity yet. Start reading to earn XP!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--surface-1)] flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.source)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)] truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0 tabular-nums">
                  +{activity.amount} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
