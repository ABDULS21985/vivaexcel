"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ktblog/ui/components";
import { GamificationOverview } from "./gamification-overview";
import { GamificationAchievements } from "./gamification-achievements";
import { GamificationLeaderboard } from "./gamification-leaderboard";
import { Trophy, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

export function GamificationHub() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
      aria-label="Gamification hub"
    >
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Gamification
        </h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[var(--surface-1)] mb-4 w-full sm:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GamificationOverview />
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationAchievements />
        </TabsContent>

        <TabsContent value="leaderboard">
          <GamificationLeaderboard />
        </TabsContent>
      </Tabs>
    </motion.section>
  );
}
