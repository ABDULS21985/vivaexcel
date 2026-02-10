"use client";

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { gamificationKeys } from "@/hooks/use-gamification";
import { showAchievementToast } from "./achievement-unlock-toast";
import { LevelUpAnimation } from "./level-up-animation";

interface LevelUpData {
  level: number;
  title: string;
}

export function GamificationListener() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);

  const handleNotification = useCallback(
    (notification: {
      type?: string;
      data?: Record<string, unknown>;
    }) => {
      const eventType = notification.data?.type as string | undefined;

      if (eventType === "gamification.achievement_unlocked") {
        const achievement = notification.data?.achievement as {
          name: string;
          description: string;
          tier: string;
          badgeColor?: string;
          xpReward: number;
        };
        if (achievement) {
          showAchievementToast(achievement);
          queryClient.invalidateQueries({
            queryKey: gamificationKeys.profile(),
          });
        }
      }

      if (eventType === "gamification.level_up") {
        const level = notification.data?.level as number;
        const title = notification.data?.title as string;
        if (level && title) {
          setLevelUp({ level, title });
          queryClient.invalidateQueries({
            queryKey: gamificationKeys.profile(),
          });
        }
      }

      if (eventType === "xp_earned") {
        queryClient.invalidateQueries({
          queryKey: gamificationKeys.profile(),
        });
      }
    },
    [queryClient]
  );

  // Listen for WebSocket notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    // The notifications are delivered via the existing socket.io connection
    // through the NotificationsGateway. We listen on the window for
    // custom events dispatched by the socket handler.
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleNotification(detail);
    };

    window.addEventListener("gamification-event", handler);
    return () => window.removeEventListener("gamification-event", handler);
  }, [isAuthenticated, handleNotification]);

  return (
    <>
      {levelUp && (
        <LevelUpAnimation
          level={levelUp.level}
          title={levelUp.title}
          onClose={() => setLevelUp(null)}
        />
      )}
    </>
  );
}
