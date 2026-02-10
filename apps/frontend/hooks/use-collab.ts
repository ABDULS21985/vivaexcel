import { useQuery } from "@tanstack/react-query";
import type {
  CollabPost,
  CollabUser,
  TrendingTopic,
  LiveEvent,
  NewsItem,
  FeedTab,
  CollabFilters,
} from "@/types/collab";
import {
  collabUsers,
  mockPosts,
  trendingTopics,
  liveEvents,
  newsItems,
} from "@/data/collab";

// =============================================================================
// Query Key Factory
// =============================================================================

export const collabKeys = {
  all: ["collab"] as const,
  feed: (filters: CollabFilters) => [...collabKeys.all, "feed", filters] as const,
  trending: () => [...collabKeys.all, "trending"] as const,
  live: () => [...collabKeys.all, "live"] as const,
  news: () => [...collabKeys.all, "news"] as const,
};

// =============================================================================
// Helpers
// =============================================================================

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterPostsByTab(posts: CollabPost[], tab: FeedTab): CollabPost[] {
  switch (tab) {
    case "for-you":
      return [...posts].sort((a, b) => {
        const engagementA = a.likeCount + a.repostCount + a.commentCount;
        const engagementB = b.likeCount + b.repostCount + b.commentCount;
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        const scoreA = engagementA * 0.4 + dateA * 0.6;
        const scoreB = engagementB * 0.4 + dateB * 0.6;
        return scoreB - scoreA;
      });

    case "following":
      return [...posts].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    case "excel":
      return posts.filter(
        (post) =>
          post.tags?.some((tag) => tag.toLowerCase().includes("excel")) ||
          post.content.toLowerCase().includes("excel"),
      );

    case "ai":
      return posts.filter(
        (post) =>
          post.tags?.some((tag) => tag.toLowerCase().includes("ai")) ||
          post.content.toLowerCase().includes("ai"),
      );

    case "data":
      return posts.filter(
        (post) =>
          post.tags?.some((tag) => tag.toLowerCase().includes("data")) ||
          post.content.toLowerCase().includes("data"),
      );

    default:
      return posts;
  }
}

// =============================================================================
// Hooks
// =============================================================================

export function useCollabFeed(filters: CollabFilters) {
  return useQuery({
    queryKey: collabKeys.feed(filters),
    queryFn: async (): Promise<{ posts: CollabPost[]; total: number }> => {
      await delay(400);
      const filtered = filterPostsByTab(mockPosts, filters.tab);
      return { posts: filtered, total: filtered.length };
    },
  });
}

export function useTrendingTopics() {
  return useQuery({
    queryKey: collabKeys.trending(),
    queryFn: async (): Promise<TrendingTopic[]> => {
      await delay(400);
      return trendingTopics;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveEvents() {
  return useQuery({
    queryKey: collabKeys.live(),
    queryFn: async (): Promise<LiveEvent[]> => {
      await delay(400);
      return liveEvents;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useNewsItems() {
  return useQuery({
    queryKey: collabKeys.news(),
    queryFn: async (): Promise<NewsItem[]> => {
      await delay(400);
      return newsItems;
    },
    staleTime: 5 * 60 * 1000,
  });
}
