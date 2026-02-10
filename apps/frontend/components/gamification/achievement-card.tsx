"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@ktblog/ui/components";
import {
  TIER_COLORS,
  type Achievement,
  type AchievementTier,
} from "@/types/gamification";

interface AchievementCardProps {
  achievement: Achievement;
  index?: number;
}

export function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.userProgress ?? 0;
  const color =
    achievement.badgeColor ||
    TIER_COLORS[achievement.tier as AchievementTier] ||
    "#9CA3AF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "relative rounded-2xl border p-5 transition-all",
        isUnlocked
          ? "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 opacity-70"
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-3",
          isUnlocked ? "shadow-md" : ""
        )}
        style={{
          backgroundColor: isUnlocked ? `${color}20` : undefined,
        }}
      >
        {achievement.isSecret && !isUnlocked ? (
          <Lock className="h-6 w-6 text-neutral-400" />
        ) : (
          <Trophy
            className="h-6 w-6"
            style={{ color: isUnlocked ? color : "#9CA3AF" }}
          />
        )}
      </div>

      {/* Info */}
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
        {achievement.isSecret && !isUnlocked ? "???" : achievement.name}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        {achievement.isSecret && !isUnlocked
          ? "Hidden achievement"
          : achievement.description}
      </p>

      {/* Tier badge */}
      <span
        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {achievement.tier}
      </span>

      {/* Progress bar */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      {/* XP reward */}
      <div className="mt-2 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
        +{achievement.xpReward} XP
      </div>

      {/* Unlocked date */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="absolute top-3 end-3 text-[10px] text-neutral-500">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
