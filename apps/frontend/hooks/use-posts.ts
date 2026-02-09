import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type {
  BlogPost,
  BlogPostPreview,
  BlogPostsResponse,
  BlogPostFilters,
  BlogCategoriesResponse,
  BlogTagsResponse,
  BlogAuthor,
  ApiResponseWrapper,
  PaginatedResponse,
  SearchResult,
  SearchResponse,
  SearchSuggestion,
  PopularSearch,
} from "@/types";

// =============================================================================
// Internal Helpers — Data Transform
// =============================================================================

/**
 * Transform a backend user/author object into the frontend BlogAuthor shape.
 * Backend sends { id, firstName, lastName, avatar } but the frontend expects
 * { id, name, avatar } with firstName + lastName concatenated.
 */
function transformAuthor(user: any): BlogAuthor {
  if (!user) return user;
  return {
    id: user.id,
    name:
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      "Unknown",
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    slug: user.slug,
  };
}

/**
 * Transform a single backend post into the frontend BlogPost shape.
 * - Maps `views` (backend) to `viewsCount` (frontend)
 * - Transforms the nested author object
 */
function transformPost(post: any): BlogPost {
  if (!post) return post;
  return {
    ...post,
    viewsCount: post.viewsCount ?? post.views ?? 0,
    author: post.author ? transformAuthor(post.author) : undefined,
  };
}

/**
 * Transform a paginated posts response from the API wrapper format.
 * apiGet returns the full ApiResponseWrapper so we unwrap `.data` and transform
 * each post inside.
 */
function transformPostsResponse(
  res: ApiResponseWrapper<PaginatedResponse<any>>,
): BlogPostsResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformPost),
    meta: res.meta || res.data?.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

/**
 * Unwrap a single-post API response and transform it.
 */
function transformPostResponse(res: ApiResponseWrapper<any>): BlogPost {
  return transformPost(res.data);
}

// =============================================================================
// Query Keys
// =============================================================================

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: BlogPostFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
  categories: () => [...postKeys.all, "categories"] as const,
  tags: () => [...postKeys.all, "tags"] as const,
  related: (slug: string) => [...postKeys.all, "related", slug] as const,
  search: (query: string, options?: Record<string, any>) =>
    [...postKeys.all, "search", query, options] as const,
  popularSearches: () => [...postKeys.all, "popularSearches"] as const,
};

// =============================================================================
// Posts Hooks
// =============================================================================

/**
 * Fetch all posts with optional cursor-based filters.
 * The apiGet call returns the full ApiResponseWrapper, so we unwrap and
 * transform the data before returning.
 */
export function usePosts(filters?: BlogPostFilters | null) {
  return useQuery({
    queryKey: postKeys.list(filters || {}),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>("/blog/posts", {
        cursor: filters?.cursor,
        limit: filters?.limit,
        categorySlug: filters?.categorySlug,
        tagSlug: filters?.tagSlug,
        search: filters?.search,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
        isFeatured: filters?.isFeatured,
        status: filters?.status,
      }).then(transformPostsResponse),
    // When filters is null, the query is disabled (used to skip fetching
    // when the component should show server-rendered data instead).
    enabled: filters !== null,
  });
}

/**
 * Fetch a single post by slug.
 * Fixed: uses /blog/posts/slug/:slug (not /blog/posts/:slug).
 */
export function usePost(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(`/blog/posts/slug/${slug}`).then(
        transformPostResponse,
      ),
    enabled: !!slug,
  });
}

/**
 * Fetch related posts for a given post
 */
export function useRelatedPosts(slug: string, limit = 3) {
  return useQuery({
    queryKey: postKeys.related(slug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<BlogPostPreview[]>>(
        `/blog/posts/${slug}/related`,
        { limit },
      ).then((res) => {
        const items = res.data ?? [];
        return items.map((p: any) => ({
          ...p,
          viewsCount: p.viewsCount ?? p.views ?? 0,
          author: p.author ? transformAuthor(p.author) : undefined,
        }));
      }),
    enabled: !!slug,
  });
}

/**
 * Fetch all blog categories
 */
export function useCategories() {
  return useQuery({
    queryKey: postKeys.categories(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<BlogCategoriesResponse>>(
        "/blog/categories",
      ).then((res) => res.data),
  });
}

/**
 * Fetch all blog tags
 */
export function useTags() {
  return useQuery({
    queryKey: postKeys.tags(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<BlogTagsResponse>>("/blog/tags").then(
        (res) => res.data,
      ),
  });
}

// =============================================================================
// Search Hooks
// =============================================================================

/**
 * Full-text search for blog posts.
 * Calls GET /search with query params.
 */
export function useSearchPosts(
  query: string,
  options?: {
    category?: string;
    tag?: string;
    author?: string;
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: postKeys.search(query, options),
    queryFn: () =>
      apiGet<ApiResponseWrapper<SearchResponse>>("/search", {
        q: query,
        category: options?.category,
        tag: options?.tag,
        author: options?.author,
        page: options?.page,
        limit: options?.limit,
      }).then((res) => res.data),
    enabled: !!query && query.trim().length > 0,
  });
}

/**
 * Fetch popular/trending search queries.
 * Calls GET /search/popular.
 */
export function usePopularSearches() {
  return useQuery({
    queryKey: postKeys.popularSearches(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PopularSearch[]>>("/search/popular").then(
        (res) => res.data ?? [],
      ),
  });
}

// =============================================================================
// Mutations
// =============================================================================

interface NewsletterSubscription {
  email: string;
  name?: string;
}

/**
 * Subscribe to newsletter
 */
export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: (data: NewsletterSubscription) =>
      apiPost<{ success: boolean }>("/newsletter/subscribe", data),
    onSuccess: () => {
      // Optionally invalidate related queries
    },
  });
}

/**
 * Increment post view count
 */
export function useIncrementPostViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      apiPost<{ viewsCount: number }>(`/blog/posts/${slug}/view`),
    onSuccess: (data, slug) => {
      // Update the post in cache with new view count
      queryClient.setQueryData<BlogPost>(postKeys.detail(slug), (old) => {
        if (old) {
          return { ...old, viewsCount: data.viewsCount };
        }
        return old;
      });
    },
  });
}
