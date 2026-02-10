"use client";

import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  TIER_COLORS,
  type Achievement,
  type AchievementTier,
} from "@/types/gamification";

export function showAchievementToast(achievement: {
  name: string;
  description: string;
  tier: string;
  badgeColor?: string | null;
  xpReward: number;
}) {
  const color =
    achievement.badgeColor ||
    TIER_COLORS[achievement.tier as AchievementTier] ||
    "#FFD700";

  toast.custom(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 max-w-sm w-full"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Trophy className="h-6 w-6" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Achievement Unlocked!
              </span>
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
              {achievement.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {achievement.description}
            </p>
            <span className="inline-block mt-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
              +{achievement.xpReward} XP
            </span>
          </div>
        </div>
      </motion.div>
    ),
    { duration: 6000 }
  );
}
