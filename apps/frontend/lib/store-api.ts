// =============================================================================
// Server-Side Store API
// =============================================================================
// Utility for fetching digital product data from the backend in Next.js server
// components. Uses plain fetch() with ISR caching -- NOT the client-side
// apiClient which relies on localStorage for JWT tokens.

import type {
  DigitalProduct,
  DigitalProductCategory,
  DigitalProductFilters,
  DigitalProductsResponse,
  ApiResponseWrapper,
  PaginatedResponse,
  CursorMeta,
} from "@/types/digital-product";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Internal Helpers -- Fetch
// =============================================================================

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, message, data, meta }` and returns just the `data` portion.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<{ data: T | undefined; meta?: CursorMeta }> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[store-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return { data: undefined };
    }

    const json: ApiResponseWrapper<T> = await response.json();

    return {
      data: json.data,
      meta: json.meta as CursorMeta | undefined,
    };
  } catch (error) {
    console.error(`[store-api] GET ${endpoint} error:`, error);
    return { data: undefined };
  }
}

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

/**
 * Transform a single backend product into the frontend DigitalProduct shape.
 * Normalizes fields that may arrive under different names from the backend.
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
    creator: product.creator
      ? {
          id: product.creator.id,
          name:
            product.creator.name ||
            [product.creator.firstName, product.creator.lastName]
              .filter(Boolean)
              .join(" ") ||
            "Unknown",
          avatar: product.creator.avatar,
        }
      : undefined,
  };
}

/**
 * Transform an array of backend products.
 */
function transformProducts(products: any[]): DigitalProduct[] {
  if (!Array.isArray(products)) return [];
  return products.map(transformProduct);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch a paginated list of digital products with optional cursor-based filters.
 */
export async function fetchProducts(
  filters?: DigitalProductFilters,
): Promise<DigitalProductsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    const mappings: Record<string, string | number | boolean | undefined> = {
      cursor: filters.cursor,
      limit: filters.limit,
      search: filters.search,
      type: filters.type,
      status: filters.status,
      categorySlug: filters.categorySlug,
      tagSlug: filters.tagSlug,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
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
  const endpoint = `/digital-products${qs ? `?${qs}` : ""}`;

  const { data, meta } = await fetchApi<PaginatedResponse<any>>(endpoint, 60);

  if (!data) {
    return { items: [], meta: { hasNextPage: false, hasPreviousPage: false } };
  }

  return {
    items: transformProducts(data.items),
    meta: (meta || data.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as CursorMeta,
  };
}

/**
 * Fetch a single digital product by its URL slug.
 * Returns null if the product is not found or an error occurs.
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<DigitalProduct | null> {
  const { data } = await fetchApi<any>(
    `/digital-products/slug/${slug}`,
    60,
  );

  if (!data) return null;

  return transformProduct(data);
}

/**
 * Fetch all digital product categories.
 * Uses a longer revalidation window (300s) since categories change infrequently.
 */
export async function fetchProductCategories(): Promise<
  DigitalProductCategory[]
> {
  const { data } = await fetchApi<DigitalProductCategory[]>(
    "/digital-products/categories",
    300,
  );

  return data || [];
}

/**
 * Fetch a single category by slug, from the full list.
 */
export async function fetchProductCategoryBySlug(
  slug: string,
): Promise<DigitalProductCategory | null> {
  const categories = await fetchProductCategories();
  return categories.find((c) => c.slug === slug) || null;
}

/**
 * Fetch featured digital products with an optional limit.
 */
export async function fetchFeaturedProducts(
  limit: number = 5,
): Promise<DigitalProduct[]> {
  const result = await fetchProducts({
    isFeatured: true,
    limit,
    status: "published" as any,
  });
  return result.items;
}

/**
 * Fetch bestseller digital products with an optional limit.
 */
export async function fetchBestsellerProducts(
  limit: number = 5,
): Promise<DigitalProduct[]> {
  const result = await fetchProducts({
    isBestseller: true,
    limit,
    status: "published" as any,
  });
  return result.items;
}

/**
 * Fetch related products for a given product (by category, excluding current).
 */
export async function fetchRelatedProducts(
  product: DigitalProduct,
  limit: number = 4,
): Promise<DigitalProduct[]> {
  if (!product.category?.slug) return [];

  const result = await fetchProducts({
    categorySlug: product.category.slug,
    limit: limit + 1,
    status: "published" as any,
  });

  return result.items.filter((p) => p.slug !== product.slug).slice(0, limit);
}
