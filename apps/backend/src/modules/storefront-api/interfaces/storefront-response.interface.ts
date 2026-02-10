/**
 * Standardized response format for the Storefront API.
 * Consistent across all endpoints.
 */
export interface StorefrontResponse<T> {
  data: T;
  meta?: StorefrontPaginationMeta;
  links?: StorefrontLinks;
}

/**
 * Pagination metadata using cursor-based pagination.
 */
export interface StorefrontPaginationMeta {
  cursor?: string;
  hasMore?: boolean;
  total?: number;
}

/**
 * HATEOAS-style links for navigation.
 */
export interface StorefrontLinks {
  self: string;
  next?: string;
}

/**
 * Standardized error format for the Storefront API.
 */
export interface StorefrontError {
  error: {
    code: string;
    message: string;
    status: number;
  };
}
