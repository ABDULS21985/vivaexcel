import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  DigitalProduct,
  DigitalProductCategory,
  DigitalProductTag,
  DigitalProductFilters,
  DigitalProductsResponse,
  ApiResponseWrapper,
  PaginatedResponse,
  CursorMeta,
} from "@/types/digital-product";

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

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
 * Transform a single backend product into the frontend DigitalProduct shape.
 */
function transformProduct(product: any): DigitalProduct {
  if (!product) return product;
  return {
    ...product,
    downloadCount: product.downloadCount ?? product.downloads ?? 0,
    viewCount: product.viewCount ?? product.views ?? 0,
    averageRating: product.averageRating ?? product.rating ?? 0,
    totalReviews: product.totalReviews ?? product.reviewCount ?? 0,
    galleryImages: product.galleryImages ?? [],
    tags: product.tags ?? [],
    variants: product.variants ?? [],
    previews: product.previews ?? [],
    creator: transformCreator(product.creator),
  };
}

/**
 * Transform a paginated products response from the API wrapper format.
 */
function transformProductsResponse(
  res: ApiResponseWrapper<PaginatedResponse<any>>,
): DigitalProductsResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformProduct),
    meta: (res.meta || res.data?.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as CursorMeta,
  };
}

/**
 * Unwrap a single-product API response and transform it.
 */
function transformProductResponse(
  res: ApiResponseWrapper<any>,
): DigitalProduct {
  return transformProduct(res.data);
}

// =============================================================================
// Query Keys
// =============================================================================

export const digitalProductKeys = {
  all: ["digital-products"] as const,
  lists: () => [...digitalProductKeys.all, "list"] as const,
  list: (filters: DigitalProductFilters) =>
    [...digitalProductKeys.lists(), filters] as const,
  details: () => [...digitalProductKeys.all, "detail"] as const,
  detail: (slug: string) => [...digitalProductKeys.details(), slug] as const,
  categories: () => [...digitalProductKeys.all, "categories"] as const,
  tags: () => [...digitalProductKeys.all, "tags"] as const,
  related: (slug: string) =>
    [...digitalProductKeys.all, "related", slug] as const,
};

// =============================================================================
// Products Hooks
// =============================================================================

/**
 * Fetch all digital products with optional cursor-based filters.
 * The apiGet call returns the full ApiResponseWrapper, so we unwrap and
 * transform the data before returning.
 */
export function useDigitalProducts(
  filters?: DigitalProductFilters | null,
) {
  return useQuery({
    queryKey: digitalProductKeys.list(filters || {}),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/digital-products",
        {
          cursor: filters?.cursor,
          limit: filters?.limit,
          search: filters?.search,
          type: filters?.type,
          status: filters?.status,
          categorySlug: filters?.categorySlug,
          tagSlug: filters?.tagSlug,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          minRating: filters?.minRating,
          isFeatured: filters?.isFeatured,
          isBestseller: filters?.isBestseller,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
      ).then(transformProductsResponse),
    enabled: filters !== null,
  });
}

/**
 * Fetch a single digital product by slug.
 */
export function useDigitalProduct(slug: string) {
  return useQuery({
    queryKey: digitalProductKeys.detail(slug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/digital-products/slug/${slug}`,
      ).then(transformProductResponse),
    enabled: !!slug,
  });
}

/**
 * Fetch all digital product categories.
 */
export function useDigitalProductCategories() {
  return useQuery({
    queryKey: digitalProductKeys.categories(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<DigitalProductCategory[]>>(
        "/digital-products/categories",
      ).then((res) => res.data ?? []),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all digital product tags.
 */
export function useDigitalProductTags() {
  return useQuery({
    queryKey: digitalProductKeys.tags(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<DigitalProductTag[]>>(
        "/digital-products/tags",
      ).then((res) => res.data ?? []),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch related products for a given product slug.
 */
export function useRelatedDigitalProducts(slug: string, limit = 4) {
  return useQuery({
    queryKey: digitalProductKeys.related(slug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        `/digital-products/${slug}/related`,
        { limit },
      ).then((res) => {
        const items = res.data?.items ?? (res.data as any) ?? [];
        return Array.isArray(items)
          ? items.map(transformProduct)
          : [];
      }),
    enabled: !!slug,
  });
}
