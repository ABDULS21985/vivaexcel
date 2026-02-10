import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from "@/lib/api-client";
import type {
  Showcase,
  ShowcaseComment,
  ShowcasesResponse,
  ShowcaseCommentsResponse,
  ShowcaseQueryParams,
  CreateShowcasePayload,
  UpdateShowcasePayload,
  CreateShowcaseCommentPayload,
} from "@/types/showcase";

// =============================================================================
// Internal Helpers
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Query Keys
// =============================================================================

export const showcaseKeys = {
  all: ["showcases"] as const,
  lists: () => [...showcaseKeys.all, "list"] as const,
  list: (params?: ShowcaseQueryParams) =>
    [...showcaseKeys.lists(), params] as const,
  detail: (id: string) => [...showcaseKeys.all, "detail", id] as const,
  comments: (showcaseId: string) =>
    [...showcaseKeys.all, "comments", showcaseId] as const,
};

// =============================================================================
// Hooks
// =============================================================================

export function useShowcases(params?: ShowcaseQueryParams) {
  return useInfiniteQuery({
    queryKey: showcaseKeys.list(params),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<ShowcasesResponse>>("/showcases", {
        ...params,
        page: pageParam ?? params?.page ?? 1,
      }).then((res) => res.data),
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useShowcase(id: string) {
  return useQuery({
    queryKey: showcaseKeys.detail(id),
    queryFn: () =>
      apiGet<ApiResponseWrapper<Showcase>>(`/showcases/${id}`).then(
        (res) => res.data,
      ),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useShowcaseComments(showcaseId: string) {
  return useInfiniteQuery({
    queryKey: showcaseKeys.comments(showcaseId),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<ShowcaseCommentsResponse>>(
        `/showcases/${showcaseId}/comments`,
        { page: pageParam ?? 1, limit: 20 },
      ).then((res) => res.data),
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    enabled: !!showcaseId,
  });
}

export function useCreateShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShowcasePayload) =>
      apiPost<ApiResponse<Showcase>>("/showcases", payload).then(
        (res) => res.data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

export function useUpdateShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ showcaseId, ...payload }: UpdateShowcasePayload) =>
      apiPatch<ApiResponse<Showcase>>(`/showcases/${showcaseId}`, payload).then(
        (res) => res.data,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: showcaseKeys.detail(variables.showcaseId),
      });
    },
  });
}

export function useDeleteShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showcaseId: string) =>
      apiDelete<ApiResponse<void>>(`/showcases/${showcaseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

export function useToggleShowcaseLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showcaseId: string) =>
      apiPost<ApiResponse<{ liked: boolean }>>(
        `/showcases/${showcaseId}/like`,
      ).then((res) => res.data),
    onSuccess: (_data, showcaseId) => {
      queryClient.invalidateQueries({
        queryKey: showcaseKeys.detail(showcaseId),
      });
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

export function useAddShowcaseComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ showcaseId, ...payload }: CreateShowcaseCommentPayload) =>
      apiPost<ApiResponse<ShowcaseComment>>(
        `/showcases/${showcaseId}/comments`,
        payload,
      ).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: showcaseKeys.comments(variables.showcaseId),
      });
      queryClient.invalidateQueries({
        queryKey: showcaseKeys.detail(variables.showcaseId),
      });
    },
  });
}
