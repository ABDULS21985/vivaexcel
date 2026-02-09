// =============================================================================
// Server-Side Presentation API
// =============================================================================
// Utility for fetching presentation data from the backend in Next.js server
// components. Uses plain fetch() with ISR caching -- NOT the client-side
// apiClient which relies on localStorage for JWT tokens.

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Internal Helpers -- Fetch
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, message, data, meta }` and returns just the `data` portion.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<{ data: T | undefined; meta?: PresentationCursorMeta }> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[presentation-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return { data: undefined };
    }

    const json: ApiResponseWrapper<T> = await response.json();

    return {
      data: json.data,
      meta: json.meta as PresentationCursorMeta | undefined,
    };
  } catch (error) {
    console.error(`[presentation-api] GET ${endpoint} error:`, error);
    return { data: undefined };
  }
}

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

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
    creator: data.creator
      ? {
          id: data.creator.id,
          name:
            data.creator.name ||
            [data.creator.firstName, data.creator.lastName]
              .filter(Boolean)
              .join(" ") ||
            "Unknown",
          avatar: data.creator.avatar,
        }
      : undefined,
  };
}

/**
 * Transform an array of backend presentations.
 */
function transformPresentations(items: any[]): Presentation[] {
  if (!Array.isArray(items)) return [];
  return items.map(transformPresentation);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch a paginated list of presentations with optional cursor-based filters.
 */
export async function fetchPresentations(
  filters?: PresentationQueryParams,
): Promise<PresentationsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    const mappings: Record<string, string | number | boolean | undefined> = {
      cursor: filters.cursor,
      limit: filters.limit,
      search: filters.search,
      industry: filters.industry,
      presentationType: filters.presentationType,
      aspectRatio: filters.aspectRatio,
      minSlides: filters.minSlides,
      maxSlides: filters.maxSlides,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      fileFormat: filters.fileFormat,
      hasAnimations: filters.hasAnimations,
      hasTransitions: filters.hasTransitions,
      hasSpeakerNotes: filters.hasSpeakerNotes,
      hasCharts: filters.hasCharts,
      isFeatured: filters.isFeatured,
      isBestseller: filters.isBestseller,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    Object.entries(mappings).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const qs = params.toString();
  const endpoint = `/presentations${qs ? `?${qs}` : ""}`;

  const { data, meta } = await fetchApi<{
    items: any[];
    meta: PresentationCursorMeta;
  }>(endpoint, 60);

  if (!data) {
    return { items: [], meta: { hasNextPage: false, hasPreviousPage: false } };
  }

  return {
    items: transformPresentations(data.items),
    meta: (meta || data.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as PresentationCursorMeta,
  };
}

/**
 * Fetch a single presentation by ID or slug.
 * Returns null if the presentation is not found.
 */
export async function fetchPresentationBySlug(
  slug: string,
): Promise<Presentation | null> {
  const { data } = await fetchApi<any>(`/presentations/${slug}`, 60);

  if (!data) return null;

  return transformPresentation(data);
}

/**
 * Fetch featured presentations.
 */
export async function fetchFeaturedPresentations(
  limit: number = 8,
): Promise<Presentation[]> {
  const result = await fetchPresentations({
    isFeatured: true,
    limit,
    sortBy: "publishedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch presentations by industry.
 */
export async function fetchPresentationsByIndustry(
  industry: Industry,
  limit: number = 12,
): Promise<Presentation[]> {
  const result = await fetchPresentations({
    industry,
    limit,
    sortBy: "publishedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch presentations by type.
 */
export async function fetchPresentationsByType(
  type: PresentationType,
  limit: number = 12,
): Promise<Presentation[]> {
  const result = await fetchPresentations({
    presentationType: type,
    limit,
    sortBy: "publishedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch related presentations for a given presentation.
 */
export async function fetchRelatedPresentations(
  presentation: Presentation,
  limit: number = 4,
): Promise<Presentation[]> {
  const result = await fetchPresentations({
    industry: presentation.industry,
    limit: limit + 1,
    sortBy: "downloadCount",
    sortOrder: "DESC",
  });

  return result.items
    .filter((p) => p.id !== presentation.id)
    .slice(0, limit);
}

/**
 * Fetch presentation landing page data.
 */
export async function fetchPresentationLanding(): Promise<PresentationLandingData | null> {
  const { data } = await fetchApi<PresentationLandingData>(
    "/presentations/landing",
    300,
  );
  return data || null;
}

/**
 * Fetch aggregate stats.
 */
export async function fetchPresentationStats(): Promise<PresentationStatsData | null> {
  const { data } = await fetchApi<PresentationStatsData>(
    "/presentations/stats",
    300,
  );
  return data || null;
}

/**
 * Fetch slide previews for a presentation.
 */
export async function fetchPresentationSlides(
  presentationId: string,
): Promise<SlidePreview[]> {
  const { data } = await fetchApi<SlidePreview[]>(
    `/presentations/${presentationId}/slides`,
    120,
  );
  return data || [];
}
