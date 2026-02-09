import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  WebTemplate,
  WebTemplateFilters,
  WebTemplatesResponse,
  TemplateDemo,
  TemplateLicense,
  CompatibilityCheckRequest,
  Framework,
} from "@/types/web-template";
import type {
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
 * Transform a single backend template into the frontend WebTemplate shape.
 * Normalizes fields that may arrive under different names from the backend.
 */
function transformTemplate(template: any): WebTemplate {
  if (!template) return template;
  return {
    ...template,
    features: template.features ?? [],
    browserSupport: template.browserSupport ?? [],
    previewImages: template.previewImages ?? [],
    demos: template.demos ?? [],
    licenses: template.licenses ?? [],
    pageCount: template.pageCount ?? 0,
    componentCount: template.componentCount ?? 0,
    hasTypeScript: template.hasTypeScript ?? false,
    supportDuration: template.supportDuration ?? 0,
    price: template.price ?? 0,
    creator: transformCreator(template.creator),
  };
}

/**
 * Transform a paginated templates response from the API wrapper format.
 */
function transformTemplatesResponse(
  res: ApiResponseWrapper<PaginatedResponse<any>>,
): WebTemplatesResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformTemplate),
    meta: (res.meta || res.data?.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as CursorMeta,
  };
}

/**
 * Unwrap a single-template API response and transform it.
 */
function transformTemplateResponse(
  res: ApiResponseWrapper<any>,
): WebTemplate {
  return transformTemplate(res.data);
}

// =============================================================================
// Query Keys
// =============================================================================

export const WEB_TEMPLATES_QUERY_KEYS = {
  all: ["web-templates"] as const,
  lists: () => [...WEB_TEMPLATES_QUERY_KEYS.all, "list"] as const,
  list: (filters?: WebTemplateFilters) =>
    [...WEB_TEMPLATES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...WEB_TEMPLATES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...WEB_TEMPLATES_QUERY_KEYS.details(), id] as const,
  slugs: () => [...WEB_TEMPLATES_QUERY_KEYS.all, "slug"] as const,
  slug: (slug: string) =>
    [...WEB_TEMPLATES_QUERY_KEYS.slugs(), slug] as const,
  frameworks: () => [...WEB_TEMPLATES_QUERY_KEYS.all, "framework"] as const,
  framework: (fw: Framework) =>
    [...WEB_TEMPLATES_QUERY_KEYS.frameworks(), fw] as const,
  demos: (templateId: string) =>
    [...WEB_TEMPLATES_QUERY_KEYS.all, "demos", templateId] as const,
  licenses: () => [...WEB_TEMPLATES_QUERY_KEYS.all, "licenses"] as const,
  userLicenses: (userId: string) =>
    [...WEB_TEMPLATES_QUERY_KEYS.licenses(), "user", userId] as const,
  compatibility: (params: CompatibilityCheckRequest) =>
    [...WEB_TEMPLATES_QUERY_KEYS.all, "compatibility", params] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch all web templates with optional cursor-based filters.
 * The apiGet call returns the full ApiResponseWrapper, so we unwrap and
 * transform the data before returning.
 */
export function useWebTemplates(filters?: WebTemplateFilters | null) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.list(filters || {}),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/templates",
        {
          cursor: filters?.cursor,
          limit: filters?.limit,
          search: filters?.search,
          templateType: filters?.templateType,
          framework: filters?.framework,
          licenseType: filters?.licenseType,
          status: filters?.status,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          hasTypeScript: filters?.hasTypeScript,
          features: filters?.features?.join(","),
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
      ).then(transformTemplatesResponse),
    enabled: filters !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single web template by ID.
 */
export function useWebTemplate(id: string) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.detail(id),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/templates/${id}`,
      ).then(transformTemplateResponse),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single web template by its URL slug.
 */
export function useWebTemplateBySlug(slug: string) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.slug(slug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/templates/slug/${slug}`,
      ).then(transformTemplateResponse),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch web templates by framework with an optional limit.
 */
export function useWebTemplatesByFramework(
  framework: Framework,
  limit?: number,
) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.framework(framework),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/templates",
        {
          framework,
          limit,
          sortBy: "createdAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformTemplate);
      }),
    enabled: !!framework,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch demos for a specific template.
 */
export function useTemplateDemos(templateId: string) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.demos(templateId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<TemplateDemo[]>>(
        `/templates/${templateId}/demos`,
      ).then((res) => res.data ?? []),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch template licenses for a specific user.
 */
export function useUserTemplateLicenses(userId: string) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.userLicenses(userId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<TemplateLicense[]>>(
        `/templates/licenses/user/${userId}`,
      ).then((res) => res.data ?? []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check template compatibility based on requirements.
 */
export function useTemplateCompatibility(params: CompatibilityCheckRequest) {
  return useQuery({
    queryKey: WEB_TEMPLATES_QUERY_KEYS.compatibility(params),
    queryFn: () =>
      apiGet<ApiResponseWrapper<WebTemplate[]>>(
        "/templates/compatibility",
        {
          framework: params.framework,
          features: params.features?.join(","),
          hasTypeScript: params.hasTypeScript,
          packageManager: params.packageManager,
          nodeVersion: params.nodeVersion,
        },
      ).then((res) => {
        const items = res.data ?? [];
        return Array.isArray(items) ? items.map(transformTemplate) : [];
      }),
    enabled:
      !!params.framework ||
      (!!params.features && params.features.length > 0) ||
      params.hasTypeScript !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
