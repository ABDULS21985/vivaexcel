"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  Star,
  Shield,
  Zap,
  Lock,
  ChevronDown,
  Loader2,
  Snowflake,
  TrendingUp,
  Award,
  ShoppingCart,
  MessageSquare,
  Users,
  Compass,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGamificationProfile,
  useAchievements,
  useGamificationActivity,
  useStreakFreeze,
} from "@/hooks/use-gamification";
import {
  AchievementCategory,
  AchievementTier,
  TIER_COLORS,
  CATEGORY_LABELS,
  type Achievement,
  type XPTransaction,
} from "@/types/gamification";

// =============================================================================
// Constants
// =============================================================================

const TIER_ORDER: AchievementTier[] = [
  AchievementTier.BRONZE,
  AchievementTier.SILVER,
  AchievementTier.GOLD,
  AchievementTier.PLATINUM,
  AchievementTier.DIAMOND,
];

const CATEGORY_ICONS: Record<AchievementCategory, React.ElementType> = {
  [AchievementCategory.BUYER]: ShoppingCart,
  [AchievementCategory.SELLER]: TrendingUp,
  [AchievementCategory.REVIEWER]: MessageSquare,
  [AchievementCategory.COMMUNITY]: Users,
  [AchievementCategory.EXPLORER]: Compass,
  [AchievementCategory.COLLECTOR]: Package,
};

const XP_SOURCE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  review: "Review",
  referral: "Referral",
  daily_login: "Daily Login",
  achievement: "Achievement",
  streak_bonus: "Streak Bonus",
  sale: "Sale",
  product_upload: "Product Upload",
  showcase_created: "Showcase",
  thread_created: "Discussion",
  reply_created: "Reply",
  answer_accepted: "Answer Accepted",
  question_asked: "Question",
};

// =============================================================================
// Sub-components
// =============================================================================

function LevelProgressBar({
  currentXP,
  nextLevelXP,
  level,
}: {
  currentXP: number;
  nextLevelXP: number;
  level: number;
}) {
  const pct = nextLevelXP > 0 ? Math.min(100, (currentXP / nextLevelXP) * 100) : 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          Level {level}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>
      <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
        {Math.round(nextLevelXP - currentXP).toLocaleString()} XP to next level
      </p>
    </div>
  );
}

function AchievementBadge({
  achievement,
  onClick,
}: {
  achievement: Achievement;
  onClick?: () => void;
}) {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.userProgress ?? 0;
  const tierColor = TIER_COLORS[achievement.tier] || "#CD7F32";
  const CatIcon = CATEGORY_ICONS[achievement.category] || Trophy;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group w-full text-left rounded-xl border p-4 transition-all ${
        isUnlocked
          ? "bg-[var(--card)] border-[var(--border)] hover:shadow-md hover:-translate-y-0.5"
          : "bg-[var(--surface-1)] border-[var(--border)] opacity-80 hover:opacity-100"
      }`}
    >
      {/* Tier indicator strip */}
      <div
        className="absolute top-0 left-0 w-full h-0.5 rounded-t-xl"
        style={{ backgroundColor: tierColor }}
      />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`relative w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
            isUnlocked ? "" : "grayscale"
          }`}
          style={{
            backgroundColor: isUnlocked
              ? `${tierColor}20`
              : "var(--surface-2)",
          }}
        >
          {achievement.isSecret && !isUnlocked ? (
            <Lock className="h-5 w-5 text-[var(--muted-foreground)]" />
          ) : (
            <CatIcon
              className="h-5 w-5"
              style={{ color: isUnlocked ? tierColor : "var(--muted-foreground)" }}
            />
          )}
          {isUnlocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className={`text-sm font-semibold truncate ${
                isUnlocked
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {achievement.name}
            </h3>
            <span
              className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
              style={{
                backgroundColor: `${tierColor}20`,
                color: tierColor,
              }}
            >
              {achievement.tier}
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-2">
            {achievement.description}
          </p>

          {/* Progress bar */}
          {!isUnlocked && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: tierColor,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-[var(--muted-foreground)] shrink-0">
                {Math.round(progress)}%
              </span>
            </div>
          )}

          {/* XP reward */}
          <div className="flex items-center gap-1 mt-1.5">
            <Zap className="h-3 w-3 text-[var(--secondary-yellow)]" />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
              {achievement.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function AchievementDetailModal({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.userProgress ?? 0;
  const tierColor = TIER_COLORS[achievement.tier] || "#CD7F32";
  const CatIcon = CATEGORY_ICONS[achievement.category] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in-scale">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isUnlocked ? "" : "grayscale opacity-50"
            }`}
            style={{
              backgroundColor: `${tierColor}20`,
              boxShadow: isUnlocked ? `0 0 30px ${tierColor}30` : "none",
            }}
          >
            {achievement.isSecret && !isUnlocked ? (
              <Lock className="h-9 w-9 text-[var(--muted-foreground)]" />
            ) : (
              <CatIcon className="h-9 w-9" style={{ color: tierColor }} />
            )}
          </div>

          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
            {achievement.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold uppercase"
              style={{
                backgroundColor: `${tierColor}20`,
                color: tierColor,
              }}
            >
              {achievement.tier}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--muted-foreground)]">
              {CATEGORY_LABELS[achievement.category]}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {achievement.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-[var(--foreground)]">
              {isUnlocked ? "Completed" : "Progress"}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: isUnlocked
                  ? "linear-gradient(90deg, #10B981, #059669)"
                  : `linear-gradient(90deg, ${tierColor}, ${tierColor}CC)`,
              }}
            />
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--secondary-yellow)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              XP Reward
            </span>
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">
            +{achievement.xpReward}
          </span>
        </div>

        {isUnlocked && achievement.unlockedAt && (
          <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
            Unlocked on{" "}
            {new Date(achievement.unlockedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ transaction }: { transaction: XPTransaction }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">
            {transaction.description}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {XP_SOURCE_LABELS[transaction.source] || transaction.source}
            {" · "}
            {new Date(transaction.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0 ml-3">
        +{transaction.amount}
      </span>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

function AchievementsContent() {
  const { data: profile, isLoading: profileLoading } = useGamificationProfile();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: activity } = useGamificationActivity();
  const streakFreeze = useStreakFreeze();

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [selectedTier, setSelectedTier] = useState<AchievementTier | "all">("all");
  const [detailAchievement, setDetailAchievement] = useState<Achievement | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    if (!achievements) return [];
    return achievements.filter((a) => {
      if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
      if (selectedTier !== "all" && a.tier !== selectedTier) return false;
      return true;
    });
  }, [achievements, selectedCategory, selectedTier]);

  // Stats
  const unlockedCount = profile?.stats.unlockedCount ?? 0;
  const totalCount = profile?.stats.totalAchievements ?? 0;
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Category counts
  const categoryCounts = useMemo(() => {
    if (!achievements) return {};
    const counts: Record<string, { total: number; unlocked: number }> = {};
    for (const a of achievements) {
      if (!counts[a.category]) counts[a.category] = { total: 0, unlocked: 0 };
      counts[a.category].total++;
      if (a.unlockedAt) counts[a.category].unlocked++;
    }
    return counts;
  }, [achievements]);

  async function handleStreakFreeze() {
    try {
      await streakFreeze.mutateAsync();
      toast.success("Streak freeze activated! Your streak is protected.");
    } catch {
      toast.error("No streak freeze available.");
    }
  }

  const isLoading = profileLoading || achievementsLoading;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-8">
        Achievements
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : (
        <>
          {/* ── Stats Overview ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Level & XP */}
            <div className="col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">
                    {profile?.xp.title ?? "Newcomer"}
                  </p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    Level {profile?.xp.level ?? 1}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Total XP</p>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {(profile?.xp.totalXP ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <LevelProgressBar
                currentXP={profile?.xp.currentLevelXP ?? 0}
                nextLevelXP={profile?.xp.nextLevelXP ?? 100}
                level={profile?.xp.level ?? 1}
              />
            </div>

            {/* Streak */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  Streak
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {profile?.xp.streak ?? 0}
                <span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">
                  days
                </span>
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Best: {profile?.xp.longestStreak ?? 0} days
              </p>
              {(profile?.xp.streakFreezeAvailable ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={handleStreakFreeze}
                  disabled={streakFreeze.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                >
                  <Snowflake className="h-3.5 w-3.5" />
                  {streakFreeze.isPending ? "Activating..." : `Freeze (${profile?.xp.streakFreezeAvailable})`}
                </button>
              )}
            </div>

            {/* Achievements Completion */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-[var(--secondary-yellow)]" />
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  Unlocked
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {unlockedCount}
                <span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">
                  / {totalCount}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${completionPct}%`,
                      background: "var(--gradient-accent)",
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                  {completionPct}%
                </span>
              </div>
            </div>
          </div>

          {/* ── Category Progress ── */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                Category Progress
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.values(AchievementCategory).map((cat) => {
                  const count = categoryCounts[cat];
                  if (!count) return null;
                  const CIcon = CATEGORY_ICONS[cat] || Trophy;
                  const pct = count.total > 0 ? Math.round((count.unlocked / count.total) * 100) : 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(selectedCategory === cat ? "all" : cat)
                      }
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                        selectedCategory === cat
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--border)] hover:border-[var(--primary)]/30"
                      }`}
                    >
                      <CIcon
                        className={`h-5 w-5 ${
                          selectedCategory === cat
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      />
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {count.unlocked}/{count.total}
                      </span>
                      <div className="w-full h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Filters & Achievements Grid ── */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Achievements Grid */}
            <div className="flex-1">
              {/* Tier filter */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setSelectedTier("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedTier === "all"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  All Tiers
                </button>
                {TIER_ORDER.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() =>
                      setSelectedTier(selectedTier === tier ? "all" : tier)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                      selectedTier === tier
                        ? "text-white"
                        : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
                    }`}
                    style={
                      selectedTier === tier
                        ? { backgroundColor: TIER_COLORS[tier] }
                        : undefined
                    }
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {/* Grid */}
              {filteredAchievements.length === 0 ? (
                <div className="text-center py-16">
                  <Trophy className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No achievements found for this filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      onClick={() => setDetailAchievement(achievement)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed Sidebar */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 lg:sticky lg:top-[calc(72px+2rem)]">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4 text-[var(--primary)]" />
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Recent Activity
                  </h3>
                </div>

                {!activity?.items || activity.items.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)] text-center py-6">
                    No activity yet. Start exploring to earn XP!
                  </p>
                ) : (
                  <>
                    <div className="divide-y divide-[var(--border)]">
                      {(showAllActivity
                        ? activity.items
                        : activity.items.slice(0, 6)
                      ).map((tx) => (
                        <ActivityItem key={tx.id} transaction={tx} />
                      ))}
                    </div>
                    {activity.items.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllActivity(!showAllActivity)}
                        className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-xs font-medium text-[var(--primary)] hover:underline"
                      >
                        {showAllActivity ? "Show less" : "Show more"}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            showAllActivity ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Achievement Detail Modal */}
      {detailAchievement && (
        <AchievementDetailModal
          achievement={detailAchievement}
          onClose={() => setDetailAchievement(null)}
        />
      )}
    </div>
  );
}

export default function AchievementsPage() {
  return <AchievementsContent />;
}
