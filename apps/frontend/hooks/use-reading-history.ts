import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Reading History Types
// =============================================================================

export interface ReadingHistoryEntry {
  id: string;
  postId: string;
  userId: string;
  progress: number;
  readAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    readingTime?: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

interface ReadingHistoryResponse {
  history: ReadingHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ReadingStatsResponse {
  totalArticlesRead: number;
  totalReadingTime: number;
  streakDays: number;
  thisWeek: number;
}

// =============================================================================
// Query Keys
// =============================================================================

export const readingHistoryKeys = {
  all: ["readingHistory"] as const,
  lists: () => [...readingHistoryKeys.all, "list"] as const,
  list: (page?: number) =>
    [...readingHistoryKeys.lists(), { page }] as const,
  stats: () => [...readingHistoryKeys.all, "stats"] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch the current user's reading history with pagination.
 */
export function useReadingHistory(page = 1, pageSize = 20) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: readingHistoryKeys.list(page),
    queryFn: () =>
      apiGet<ReadingHistoryResponse>("/reading-history", { page, pageSize }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch reading stats for the current user.
 */
export function useReadingStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: readingHistoryKeys.stats(),
    queryFn: () => apiGet<ReadingStatsResponse>("/reading-history/stats"),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Track a post as read with a given progress percentage.
 * Called when user scrolls past a reading threshold (e.g., 80%).
 */
export function useTrackRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      progress = 100,
    }: {
      postId: string;
      progress?: number;
    }) => {
      return apiPost<{ entry: ReadingHistoryEntry }>(
        `/reading-history/${postId}`,
        { progress }
      );
    },
    onSuccess: () => {
      // Invalidate reading history and stats
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.stats(),
      });
    },
  });
}
