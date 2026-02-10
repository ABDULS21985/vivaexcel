import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type {
  GamificationProfile,
  Achievement,
  LeaderboardResponse,
  XPTransaction,
} from "@/types/gamification";

// ─── Query Key Factory ────────────────────────────────────────────────

export const gamificationKeys = {
  all: ["gamification"] as const,
  profile: () => [...gamificationKeys.all, "profile"] as const,
  achievements: (filters?: Record<string, unknown>) =>
    [...gamificationKeys.all, "achievements", filters] as const,
  achievementDetail: (slug: string) =>
    [...gamificationKeys.all, "achievement", slug] as const,
  leaderboard: (period?: string, category?: string) =>
    [...gamificationKeys.all, "leaderboard", period, category] as const,
  activity: (cursor?: string) =>
    [...gamificationKeys.all, "activity", cursor] as const,
};

// ─── Response Types ───────────────────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ─── Hooks ────────────────────────────────────────────────────────────

export function useGamificationProfile() {
  return useQuery({
    queryKey: gamificationKeys.profile(),
    queryFn: () =>
      apiGet<ApiResponse<GamificationProfile>>("/gamification/profile").then(
        (res) => res.data
      ),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAchievements(filters?: {
  category?: string;
  tier?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: gamificationKeys.achievements(filters),
    queryFn: () =>
      apiGet<ApiResponse<Achievement[]>>(
        "/gamification/achievements",
        filters as Record<string, string | undefined>
      ).then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAchievementDetail(slug: string) {
  return useQuery({
    queryKey: gamificationKeys.achievementDetail(slug),
    queryFn: () =>
      apiGet<
        ApiResponse<{
          achievement: Achievement;
          userProgress?: {
            id: string;
            progress: number;
            unlockedAt: string | null;
          };
        }>
      >(`/gamification/achievements/${slug}`).then((res) => res.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaderboard(
  period?: string,
  category?: string,
  limit?: number
) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(period, category),
    queryFn: () =>
      apiGet<ApiResponse<LeaderboardResponse>>("/gamification/leaderboard", {
        period,
        category,
        limit,
      }).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGamificationActivity(cursor?: string, limit?: number) {
  return useQuery({
    queryKey: gamificationKeys.activity(cursor),
    queryFn: () =>
      apiGet<
        ApiResponse<{ items: XPTransaction[]; nextCursor: string | null }>
      >("/gamification/activity", { cursor, limit }).then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useStreakFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPost<ApiResponse<{ streakFreezeAvailable: number; streak: number }>>(
        "/gamification/streak/freeze"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gamificationKeys.profile(),
      });
    },
  });
}
