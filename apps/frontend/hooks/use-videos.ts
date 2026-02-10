import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  Video,
  VideoShort,
  VideoCategory,
  VideoChannel,
  VideoFilters,
  VideosResponse,
  VideoShortsResponse,
} from "@/types/video";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const videoKeys = {
  all: ["videos"] as const,
  lists: () => [...videoKeys.all, "list"] as const,
  list: (filters: VideoFilters) => [...videoKeys.lists(), filters] as const,
  detail: (slug: string) => [...videoKeys.all, "detail", slug] as const,
  shorts: () => [...videoKeys.all, "shorts"] as const,
  categories: () => [...videoKeys.all, "categories"] as const,
  channels: () => [...videoKeys.all, "channels"] as const,
  trending: () => [...videoKeys.all, "trending"] as const,
  bookmarks: () => [...videoKeys.all, "bookmarks"] as const,
  comments: (slug: string) => [...videoKeys.all, "comments", slug] as const,
};

export function useVideos(filters: VideoFilters = {}) {
  const params = new URLSearchParams();
  if (filters.categorySlug && filters.categorySlug !== "all")
    params.set("categorySlug", filters.categorySlug);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();

  return useQuery({
    queryKey: videoKeys.list(filters),
    queryFn: () =>
      apiGet<ApiResponse<VideosResponse>>(`/videos${qs ? `?${qs}` : ""}`).then(
        (r) => r.data,
      ),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVideoShorts() {
  return useQuery({
    queryKey: videoKeys.shorts(),
    queryFn: () =>
      apiGet<ApiResponse<VideoShortsResponse>>("/videos/shorts").then(
        (r) => r.data,
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVideoCategories() {
  return useQuery({
    queryKey: videoKeys.categories(),
    queryFn: () =>
      apiGet<ApiResponse<VideoCategory[]>>("/videos/categories").then(
        (r) => r.data,
      ),
    staleTime: 30 * 60 * 1000,
  });
}

export function useVideoDetail(slug: string) {
  return useQuery({
    queryKey: videoKeys.detail(slug),
    queryFn: () =>
      apiGet<ApiResponse<Video>>(`/videos/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useVideoComments(slug: string) {
  return useQuery({
    queryKey: videoKeys.comments(slug),
    queryFn: () =>
      apiGet<ApiResponse<any[]>>(`/videos/${slug}/comments`).then(
        (r) => r.data,
      ),
    enabled: !!slug,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) =>
      apiPost<ApiResponse<{ bookmarked: boolean }>>(`/videos/${videoId}/bookmark`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.bookmarks() }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) =>
      apiPost<ApiResponse<{ liked: boolean; likeCount: number }>>(`/videos/${videoId}/like`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  });
}

export function useAddVideoComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      apiPost<ApiResponse<any>>(`/videos/${slug}/comments`, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: videoKeys.comments(slug) }),
  });
}

export function useMyBookmarks() {
  return useQuery({
    queryKey: videoKeys.bookmarks(),
    queryFn: () =>
      apiGet<ApiResponse<Video[]>>("/videos/me/bookmarks").then((r) => r.data),
  });
}

export function useTrendingVideos() {
  return useQuery({
    queryKey: videoKeys.trending(),
    queryFn: () =>
      apiGet<ApiResponse<Video[]>>("/videos/trending").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
