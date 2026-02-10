import { useQuery } from "@tanstack/react-query";
import type { VideoFilters } from "@/types/video";
import { mockVideos, mockShorts, videoCategories } from "@/data/videos";

// =============================================================================
// Query Keys
// =============================================================================

export const videoKeys = {
  all: ["videos"] as const,
  lists: () => [...videoKeys.all, "list"] as const,
  list: (filters: VideoFilters) => [...videoKeys.lists(), filters] as const,
  detail: (slug: string) => [...videoKeys.all, "detail", slug] as const,
  shorts: () => [...videoKeys.all, "shorts"] as const,
  categories: () => [...videoKeys.all, "categories"] as const,
};

// =============================================================================
// Mock Fetch (replace with apiGet when API is ready)
// =============================================================================

function fetchVideos(filters: VideoFilters) {
  return new Promise<{ videos: typeof mockVideos; total: number }>((resolve) => {
    setTimeout(() => {
      let filtered = [...mockVideos];

      if (filters.categorySlug && filters.categorySlug !== "all") {
        filtered = filtered.filter((v) => v.category.slug === filters.categorySlug);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.description.toLowerCase().includes(q) ||
            v.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      if (filters.sortBy === "popular") {
        filtered.sort((a, b) => b.viewCount - a.viewCount);
      } else if (filters.sortBy === "trending") {
        filtered.sort((a, b) => b.likeCount - a.likeCount);
      } else {
        filtered.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
      }

      resolve({ videos: filtered, total: filtered.length });
    }, 400);
  });
}

// =============================================================================
// Hooks
// =============================================================================

export function useVideos(filters: VideoFilters = {}) {
  return useQuery({
    queryKey: videoKeys.list(filters),
    queryFn: () => fetchVideos(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVideoShorts() {
  return useQuery({
    queryKey: videoKeys.shorts(),
    queryFn: () =>
      new Promise<{ shorts: typeof mockShorts; total: number }>((resolve) => {
        setTimeout(() => {
          resolve({ shorts: mockShorts, total: mockShorts.length });
        }, 300);
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVideoCategories() {
  return useQuery({
    queryKey: videoKeys.categories(),
    queryFn: () => Promise.resolve(videoCategories),
    staleTime: 30 * 60 * 1000,
  });
}
