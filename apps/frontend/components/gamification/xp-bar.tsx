"use client";

import { motion } from "framer-motion";
import { useGamificationProfile } from "@/hooks/use-gamification";
import { cn } from "@ktblog/ui/components";

export function XPBar({ compact = false }: { compact?: boolean }) {
  const { data: profile, isLoading } = useGamificationProfile();

  if (isLoading || !profile) return null;

  const { level, currentLevelXP, nextLevelXP, title } = profile.xp;
  const progressPercent =
    nextLevelXP > 0
      ? Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100))
      : 100;

  return (
    <div className={cn("space-y-1", compact ? "px-3 py-2" : "p-4")}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
            {level}
          </div>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {title}
          </span>
        </div>
        <span className="text-neutral-500 dark:text-neutral-400">
          {currentLevelXP.toLocaleString()}/{nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
        />
      </div>
    </div>
  );
}
