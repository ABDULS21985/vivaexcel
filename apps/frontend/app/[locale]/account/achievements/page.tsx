"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import {
  useAchievements,
  useGamificationProfile,
} from "@/hooks/use-gamification";
import { AchievementCard } from "@/components/gamification/achievement-card";
import {
  AchievementCategory,
  CATEGORY_LABELS,
} from "@/types/gamification";
import { useTranslations } from "next-intl";

// ─── Category Filter Tabs ──────────────────────────────────────────────

const CATEGORIES = [
  { value: undefined, label: "All" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as AchievementCategory,
    label,
  })),
];

// ─── Loading Skeleton ──────────────────────────────────────────────────

function AchievementsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full h-[120px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[220px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const t = useTranslations("gamification");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | undefined
  >(undefined);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/achievements");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: profile, isLoading: profileLoading } =
    useGamificationProfile();
  const { data: achievements, isLoading: achievementsLoading } =
    useAchievements(
      selectedCategory ? { category: selectedCategory } : undefined
    );

  const isLoading = profileLoading || achievementsLoading;

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  const unlockedCount =
    achievements?.filter((a) => a.unlockedAt).length ?? 0;
  const totalCount = achievements?.length ?? 0;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{t("home") || "Home"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/account/orders">Account</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("achievements")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("achievements")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("achievementsDescription")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <AchievementsSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Stats Banner */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-violet-500" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t("level")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {profile.xp.level}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {profile.xp.title}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t("unlocked")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {unlockedCount}/{totalCount}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t("xpTitle")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {profile.xp.totalXP.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t("streak")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {profile.xp.streak}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Best: {profile.xp.longestStreak}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value ?? "all"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat.value
                      ? "bg-violet-600 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Achievements Grid */}
            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, i) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {t("noAchievements")}
                </h2>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
