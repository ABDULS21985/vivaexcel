"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useGamificationProfile } from "@/hooks/use-gamification";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@ktblog/ui/components";

export function StreakCounter() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useGamificationProfile();

  if (!isAuthenticated || !profile?.xp?.streak) return null;

  const streak = profile.xp.streak;
  const isHot = streak >= 7;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold cursor-default",
        isHot
          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
      )}
      title={`${streak}-day streak`}
    >
      <Flame
        className={cn(
          "h-3.5 w-3.5",
          isHot && "text-orange-500 dark:text-orange-400"
        )}
      />
      <span>{streak}</span>
    </motion.div>
  );
}
