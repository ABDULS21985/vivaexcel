// =============================================================================
// Server-Side Delivery API
// =============================================================================
// Utility for fetching digital asset delivery data (changelogs, public update
// info) from the backend in Next.js server components. Uses plain fetch() with
// ISR caching -- NOT the client-side apiClient which relies on localStorage
// for JWT tokens.

import type {
  ProductUpdateInfo,
  DeliveryApiResponse,
} from "@/types/delivery";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, data, meta }` and returns just the `data` portion.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<T | undefined> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[delivery-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return undefined;
    }

    const json: DeliveryApiResponse<T> = await response.json();
    return json.data;
  } catch (error) {
    console.error(`[delivery-api] GET ${endpoint} error:`, error);
    return undefined;
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch the public changelog (list of updates) for a specific product.
 * Revalidated every 300 seconds since changelogs change infrequently.
 */
export async function fetchProductChangelog(
  productId: string,
): Promise<ProductUpdateInfo[]> {
  const data = await fetchApi<ProductUpdateInfo[]>(
    `/digital-products/${productId}/changelog`,
    300,
  );
  return data ?? [];
}

/**
 * Fetch all published updates for a product. This is the same data as the
 * changelog but may include additional metadata useful for display.
 * Revalidated every 300 seconds.
 */
export async function fetchProductUpdates(
  productId: string,
): Promise<ProductUpdateInfo[]> {
  const data = await fetchApi<ProductUpdateInfo[]>(
    `/digital-products/${productId}/updates`,
    300,
  );
  return data ?? [];
}

/**
 * Fetch a single product update by its ID. Used on update detail pages.
 * Revalidated every 60 seconds.
 */
export async function fetchProductUpdateById(
  productId: string,
  updateId: string,
): Promise<ProductUpdateInfo | null> {
  const data = await fetchApi<ProductUpdateInfo>(
    `/digital-products/${productId}/updates/${updateId}`,
    60,
  );
  return data ?? null;
}
