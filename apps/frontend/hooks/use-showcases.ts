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
  list: (query: ShowcaseQueryParams) => [...showcaseKeys.lists(), query] as const,
  details: () => [...showcaseKeys.all, "detail"] as const,
  detail: (id: string) => [...showcaseKeys.details(), id] as const,
  comments: (id: string) => [...showcaseKeys.all, "comments", id] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch paginated showcases with infinite scrolling support.
 */
export function useShowcases(query?: ShowcaseQueryParams) {
  return useInfiniteQuery({
    queryKey: showcaseKeys.list(query ?? {}),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<ShowcasesResponse>>("/showcases", {
        ...query,
        page: pageParam ?? query?.page ?? 1,
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

/**
 * Fetch a single showcase by ID.
 */
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

/**
 * Create a new showcase.
 */
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

/**
 * Update an existing showcase.
 */
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

/**
 * Delete a showcase.
 */
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

/**
 * Toggle like on a showcase with optimistic update.
 */
export function useToggleShowcaseLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showcaseId: string) =>
      apiPost<ApiResponse<{ liked: boolean }>>(
        `/showcases/${showcaseId}/like`,
      ).then((res) => res.data),
    onMutate: async (showcaseId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: showcaseKeys.detail(showcaseId),
      });

      // Snapshot the previous value
      const previousShowcase = queryClient.getQueryData<Showcase>(
        showcaseKeys.detail(showcaseId),
      );

      // Optimistically update the likes count
      if (previousShowcase) {
        queryClient.setQueryData<Showcase>(
          showcaseKeys.detail(showcaseId),
          {
            ...previousShowcase,
            likesCount: previousShowcase.likesCount + 1,
          },
        );
      }

      return { previousShowcase };
    },
    onError: (_err, showcaseId, context) => {
      // Roll back to the previous value on error
      if (context?.previousShowcase) {
        queryClient.setQueryData(
          showcaseKeys.detail(showcaseId),
          context.previousShowcase,
        );
      }
    },
    onSettled: (_data, _error, showcaseId) => {
      queryClient.invalidateQueries({
        queryKey: showcaseKeys.detail(showcaseId),
      });
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

/**
 * Fetch comments for a showcase.
 */
export function useShowcaseComments(showcaseId: string, page?: number) {
  return useQuery({
    queryKey: [...showcaseKeys.comments(showcaseId), page] as const,
    queryFn: () =>
      apiGet<ApiResponseWrapper<ShowcaseCommentsResponse>>(
        `/showcases/${showcaseId}/comments`,
        { page: page ?? 1, limit: 20 },
      ).then((res) => res.data),
    enabled: !!showcaseId,
  });
}

/**
 * Add a comment to a showcase.
 */
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
