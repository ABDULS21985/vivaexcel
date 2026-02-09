import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  Presentation,
  PresentationsResponse,
  PresentationQueryParams,
  PresentationLandingData,
  PresentationStatsData,
  PresentationCursorMeta,
  SlidePreview,
  Industry,
  PresentationType,
} from "@/types/presentation";

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

interface PaginatedResponse<T> {
  items: T[];
  meta: PresentationCursorMeta;
}

/**
 * Transform a backend creator into the frontend shape.
 */
function transformCreator(creator: any) {
  if (!creator) return undefined;
  return {
    id: creator.id,
    name:
      creator.name ||
      [creator.firstName, creator.lastName].filter(Boolean).join(" ") ||
      "Unknown",
    avatar: creator.avatar,
  };
}

/**
 * Transform a single backend presentation into the frontend Presentation shape.
 */
function transformPresentation(data: any): Presentation {
  if (!data) return data;
  return {
    ...data,
    slideCount: data.slideCount ?? 0,
    downloadCount: data.downloadCount ?? data.downloads ?? 0,
    viewCount: data.viewCount ?? data.views ?? 0,
    averageRating: data.averageRating ?? data.rating ?? 0,
    totalReviews: data.totalReviews ?? data.reviewCount ?? 0,
    galleryImages: data.galleryImages ?? [],
    slides: data.slides ?? [],
    tags: data.tags ?? [],
    fileFormats: data.fileFormats ?? [],
    compatibility: data.compatibility ?? [],
    colorSchemes: data.colorSchemes ?? [],
    fontFamilies: data.fontFamilies ?? [],
    hasAnimations: data.hasAnimations ?? false,
    hasTransitions: data.hasTransitions ?? false,
    hasSpeakerNotes: data.hasSpeakerNotes ?? false,
    hasCharts: data.hasCharts ?? false,
    hasImages: data.hasImages ?? false,
    isFullyEditable: data.isFullyEditable ?? true,
    includesDocumentation: data.includesDocumentation ?? false,
    creator: transformCreator(data.creator),
  };
}

/**
 * Transform a paginated presentations response from the API wrapper format.
 */
function transformPresentationsResponse(
  res: ApiResponseWrapper<PaginatedResponse<any>>,
): PresentationsResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformPresentation),
    meta: (res.meta || res.data?.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as PresentationCursorMeta,
  };
}

/**
 * Unwrap a single-presentation API response and transform it.
 */
function transformPresentationResponse(
  res: ApiResponseWrapper<any>,
): Presentation {
  return transformPresentation(res.data);
}

// =============================================================================
// Query Keys
// =============================================================================

export const presentationKeys = {
  all: ["presentations"] as const,
  lists: () => [...presentationKeys.all, "list"] as const,
  list: (filters: PresentationQueryParams) =>
    [...presentationKeys.lists(), filters] as const,
  details: () => [...presentationKeys.all, "detail"] as const,
  detail: (id: string) => [...presentationKeys.details(), id] as const,
  featured: (limit?: number) =>
    [...presentationKeys.all, "featured", limit] as const,
  landing: () => [...presentationKeys.all, "landing"] as const,
  industry: (name: string, limit?: number) =>
    [...presentationKeys.all, "industry", name, limit] as const,
  type: (name: string, limit?: number) =>
    [...presentationKeys.all, "type", name, limit] as const,
  stats: () => [...presentationKeys.all, "stats"] as const,
  slides: (presentationId: string) =>
    [...presentationKeys.all, "slides", presentationId] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch a paginated list of presentations with optional filters.
 */
export function usePresentations(params?: PresentationQueryParams | null) {
  return useQuery({
    queryKey: presentationKeys.list(params || {}),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/presentations",
        {
          cursor: params?.cursor,
          limit: params?.limit,
          search: params?.search,
          industry: params?.industry,
          presentationType: params?.presentationType,
          aspectRatio: params?.aspectRatio,
          minSlides: params?.minSlides,
          maxSlides: params?.maxSlides,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          minRating: params?.minRating,
          fileFormat: params?.fileFormat,
          hasAnimations: params?.hasAnimations,
          hasTransitions: params?.hasTransitions,
          hasSpeakerNotes: params?.hasSpeakerNotes,
          hasCharts: params?.hasCharts,
          isFeatured: params?.isFeatured,
          isBestseller: params?.isBestseller,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      ).then(transformPresentationsResponse),
    enabled: params !== null,
  });
}

/**
 * Fetch a single presentation by ID or slug.
 */
export function usePresentation(id: string) {
  return useQuery({
    queryKey: presentationKeys.detail(id),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/presentations/${id}`,
      ).then(transformPresentationResponse),
    enabled: !!id,
  });
}

/**
 * Fetch featured presentations.
 */
export function useFeaturedPresentations(limit: number = 8) {
  return useQuery({
    queryKey: presentationKeys.featured(limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/presentations",
        {
          isFeatured: true,
          limit,
          sortBy: "publishedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformPresentation);
      }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch curated landing page data.
 */
export function usePresentationLanding() {
  return useQuery({
    queryKey: presentationKeys.landing(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PresentationLandingData>>(
        "/presentations/landing",
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch presentations filtered by industry.
 */
export function usePresentationsByIndustry(
  industry: Industry,
  limit: number = 12,
) {
  return useQuery({
    queryKey: presentationKeys.industry(industry, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/presentations",
        {
          industry,
          limit,
          sortBy: "publishedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformPresentation);
      }),
    enabled: !!industry,
  });
}

/**
 * Fetch presentations filtered by presentation type.
 */
export function usePresentationsByType(
  type: PresentationType,
  limit: number = 12,
) {
  return useQuery({
    queryKey: presentationKeys.type(type, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/presentations",
        {
          presentationType: type,
          limit,
          sortBy: "publishedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformPresentation);
      }),
    enabled: !!type,
  });
}

/**
 * Fetch aggregate statistics for presentations.
 */
export function usePresentationStats() {
  return useQuery({
    queryKey: presentationKeys.stats(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PresentationStatsData>>(
        "/presentations/stats",
      ).then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch slide previews for a given presentation.
 */
export function usePresentationSlides(presentationId: string) {
  return useQuery({
    queryKey: presentationKeys.slides(presentationId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<SlidePreview[]>>(
        `/presentations/${presentationId}/slides`,
      ).then((res) => res.data ?? []),
    enabled: !!presentationId,
  });
}
