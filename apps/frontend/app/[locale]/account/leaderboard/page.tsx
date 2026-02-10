"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Medal,
  ChevronRight,
  Trophy,
  Crown,
  User,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { useLeaderboard } from "@/hooks/use-gamification";
import { useTranslations } from "next-intl";

// ─── Constants ─────────────────────────────────────────────────────────

const PERIODS = [
  { value: "weekly", labelKey: "periodWeekly" },
  { value: "monthly", labelKey: "periodMonthly" },
  { value: "all_time", labelKey: "periodAllTime" },
] as const;

const CATEGORIES = [
  { value: "buyer_xp", labelKey: "categoryBuyerXP" },
  { value: "seller_revenue", labelKey: "categorySellerRevenue" },
  { value: "reviewer", labelKey: "categoryReviewerRank" },
] as const;

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string }> = {
  1: { icon: Crown, color: "#FFD700" },
  2: { icon: Medal, color: "#C0C0C0" },
  3: { icon: Medal, color: "#CD7F32" },
};

// ─── Loading Skeleton ──────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl"
        />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const t = useTranslations("gamification");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState("weekly");
  const [category, setCategory] = useState("buyer_xp");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/leaderboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: leaderboard, isLoading } = useLeaderboard(
    period,
    category,
    50
  );

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
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
              <BreadcrumbPage>{t("leaderboard")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("leaderboard")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("leaderboardDescription")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Period Tabs */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  period === p.value
                    ? "bg-amber-600 text-white"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  category === c.value
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
              >
                {t(c.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : leaderboard?.items && leaderboard.items.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.items.map((entry, i) => {
              const rankStyle = RANK_STYLES[entry.rank];
              const RankIcon = rankStyle?.icon;

              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                    entry.rank <= 3
                      ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                      : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800"
                  )}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    {RankIcon ? (
                      <RankIcon
                        className="h-6 w-6"
                        style={{ color: rankStyle.color }}
                      />
                    ) : (
                      <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {entry.userAvatar ? (
                      <img
                        src={entry.userAvatar}
                        alt={entry.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                      {entry.userName}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-end shrink-0">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {category === "seller_revenue" ? "revenue" : "points"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              No rankings yet
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Rankings will be calculated soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
