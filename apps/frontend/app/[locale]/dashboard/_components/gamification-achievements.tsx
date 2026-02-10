"use client";

import { useState } from "react";
import { useAchievements, useAchievementDetail } from "@/hooks/use-gamification";
import { Skeleton } from "@ktblog/ui/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ktblog/ui/components";
import {
  Trophy,
  Lock,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AchievementCategory,
  AchievementTier,
  TIER_COLORS,
  CATEGORY_LABELS,
  type Achievement,
} from "@/types/gamification";

const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

const CATEGORY_LIST = Object.values(AchievementCategory);

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "unlocked", label: "Unlocked" },
  { value: "in_progress", label: "In Progress" },
  { value: "locked", label: "Locked" },
];

function getTierBgClass(tier: string): string {
  switch (tier) {
    case "bronze": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "silver": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "platinum": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "diamond": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

export function GamificationAchievements() {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: achievements, isLoading, error, refetch } = useAchievements(
    categoryFilter ? { category: categoryFilter } : undefined
  );
  const { data: detailData, isLoading: detailLoading } = useAchievementDetail(
    selectedSlug || ""
  );

  // Filter by status
  const filtered = (achievements ?? []).filter((a: Achievement) => {
    if (statusFilter === "unlocked") return !!a.unlockedAt;
    if (statusFilter === "in_progress") return !a.unlockedAt && (a.userProgress ?? 0) > 0;
    if (statusFilter === "locked") return !a.unlockedAt && (a.userProgress ?? 0) === 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <Trophy className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Failed to load achievements
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !categoryFilter
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
          }`}
        >
          All Categories
        </button>
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === cat ? undefined : cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        <Filter className="h-4 w-4 text-[var(--muted-foreground)] mt-1" />
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.value}
            type="button"
            onClick={() => setStatusFilter(sf.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === sf.value
                ? "bg-[var(--surface-3)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center">
          <Trophy className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">
            No achievements match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((achievement: Achievement, i: number) => {
            const isUnlocked = !!achievement.unlockedAt;
            const progress = achievement.userProgress ?? 0;
            const tierColor = TIER_COLORS[achievement.tier as AchievementTier] || "#999";

            return (
              <motion.button
                key={achievement.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => setSelectedSlug(achievement.slug)}
                className={`relative text-left bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  !isUnlocked ? "opacity-70" : ""
                }`}
              >
                {/* Lock overlay */}
                {!isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg"
                  style={{
                    backgroundColor: isUnlocked ? `${tierColor}20` : undefined,
                  }}
                >
                  {achievement.iconUrl ? (
                    <img src={achievement.iconUrl} alt="" className="w-6 h-6" />
                  ) : (
                    <Trophy
                      className="h-5 w-5"
                      style={{ color: isUnlocked ? tierColor : "var(--muted-foreground)" }}
                    />
                  )}
                </div>

                {/* Name & Description */}
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                  {achievement.name}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
                  {achievement.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getTierBgClass(achievement.tier)}`}>
                    {TIER_LABELS[achievement.tier] || achievement.tier}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                    {CATEGORY_LABELS[achievement.category] || achievement.category}
                  </span>
                </div>

                {/* Progress bar */}
                {!isUnlocked && (
                  <div
                    className="w-full h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                )}
                {isUnlocked && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Unlocked
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedSlug} onOpenChange={(open) => !open && setSelectedSlug(null)}>
        <DialogContent className="bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle>
              {detailLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                detailData?.achievement?.name ?? "Achievement"
              )}
            </DialogTitle>
            <DialogDescription>
              {detailLoading ? (
                <Skeleton className="h-4 w-64 mt-1" />
              ) : (
                detailData?.achievement?.description ?? ""
              )}
            </DialogDescription>
          </DialogHeader>

          {!detailLoading && detailData?.achievement && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTierBgClass(detailData.achievement.tier)}`}>
                  {TIER_LABELS[detailData.achievement.tier]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                  {CATEGORY_LABELS[detailData.achievement.category]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  +{detailData.achievement.xpReward} XP
                </span>
              </div>

              {detailData.userProgress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted-foreground)]">Progress</span>
                    <span className="text-[var(--foreground)] font-medium tabular-nums">
                      {detailData.userProgress.progress}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2 bg-[var(--surface-3)] rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={detailData.userProgress.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{ width: `${detailData.userProgress.progress}%` }}
                    />
                  </div>
                  {detailData.userProgress.unlockedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Unlocked on{" "}
                      {new Date(detailData.userProgress.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
