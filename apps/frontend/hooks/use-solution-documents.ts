import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  SolutionDocument,
  SolutionDocumentsResponse,
  SolutionDocumentQueryParams,
  SolutionDocumentLandingData,
  SolutionDocumentStatsData,
  SolutionDocumentCursorMeta,
  DocumentBundle,
  DocumentUpdate,
  Domain,
  DocumentType,
} from "@/types/solution-document";

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
  meta: SolutionDocumentCursorMeta;
}

/**
 * Transform a single backend solution document into the frontend shape.
 */
function transformDocument(data: any): SolutionDocument {
  if (!data) return data;
  return {
    ...data,
    technologyStack: data.technologyStack ?? [],
    pageCount: data.pageCount ?? 0,
    wordCount: data.wordCount ?? 0,
    diagramCount: data.diagramCount ?? 0,
    hasEditableDiagrams: data.hasEditableDiagrams ?? false,
    diagramTool: data.diagramTool ?? "none",
    templateFormat: data.templateFormat ?? [],
    complianceFrameworks: data.complianceFrameworks ?? [],
    maturityLevel: data.maturityLevel ?? "starter",
    tableOfContents: data.tableOfContents ?? [],
    freshnessScore: data.freshnessScore ?? 0,
    includes: data.includes ?? {
      editableTemplates: false,
      diagramFiles: false,
      implementationChecklist: false,
      costEstimator: false,
    },
    updates: data.updates ?? [],
    aiSuggestedTags: data.aiSuggestedTags ?? [],
  };
}

/**
 * Transform a paginated solution documents response from the API wrapper format.
 */
function transformDocumentsResponse(
  res: ApiResponseWrapper<PaginatedResponse<any>>,
): SolutionDocumentsResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformDocument),
    meta: (res.meta || res.data?.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as SolutionDocumentCursorMeta,
  };
}

/**
 * Unwrap a single-document API response and transform it.
 */
function transformDocumentResponse(
  res: ApiResponseWrapper<any>,
): SolutionDocument {
  return transformDocument(res.data);
}

/**
 * Transform a bundle response.
 */
function transformBundle(data: any): DocumentBundle {
  if (!data) return data;
  return {
    ...data,
    documents: (data.documents ?? []).map(transformDocument),
  };
}

// =============================================================================
// Query Keys
// =============================================================================

export const solutionDocumentKeys = {
  all: ["solution-documents"] as const,
  lists: () => [...solutionDocumentKeys.all, "list"] as const,
  list: (filters: SolutionDocumentQueryParams) =>
    [...solutionDocumentKeys.lists(), filters] as const,
  details: () => [...solutionDocumentKeys.all, "detail"] as const,
  detail: (id: string) => [...solutionDocumentKeys.details(), id] as const,
  featured: (limit?: number) =>
    [...solutionDocumentKeys.all, "featured", limit] as const,
  landing: () => [...solutionDocumentKeys.all, "landing"] as const,
  domain: (name: string, limit?: number) =>
    [...solutionDocumentKeys.all, "domain", name, limit] as const,
  type: (name: string, limit?: number) =>
    [...solutionDocumentKeys.all, "type", name, limit] as const,
  stats: () => [...solutionDocumentKeys.all, "stats"] as const,
  bundles: () => [...solutionDocumentKeys.all, "bundles"] as const,
  bundleDetail: (id: string) =>
    [...solutionDocumentKeys.all, "bundle", id] as const,
  updates: (documentId: string) =>
    [...solutionDocumentKeys.all, "updates", documentId] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch a paginated list of solution documents with optional filters.
 */
export function useSolutionDocuments(
  params?: SolutionDocumentQueryParams | null,
) {
  return useQuery({
    queryKey: solutionDocumentKeys.list(params || {}),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/solution-documents",
        {
          cursor: params?.cursor,
          limit: params?.limit,
          search: params?.search,
          documentType: params?.documentType,
          domain: params?.domain,
          cloudPlatform: params?.cloudPlatform,
          complianceFramework: params?.complianceFramework,
          maturityLevel: params?.maturityLevel,
          templateFormat: params?.templateFormat,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          technology: params?.technology,
          hasEditableDiagrams: params?.hasEditableDiagrams,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      ).then(transformDocumentsResponse),
    enabled: params !== null,
  });
}

/**
 * Fetch a single solution document by ID or slug.
 */
export function useSolutionDocument(idOrSlug: string) {
  return useQuery({
    queryKey: solutionDocumentKeys.detail(idOrSlug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/solution-documents/${idOrSlug}`,
      ).then(transformDocumentResponse),
    enabled: !!idOrSlug,
  });
}

/**
 * Fetch featured solution documents.
 */
export function useFeaturedDocuments(limit: number = 8) {
  return useQuery({
    queryKey: solutionDocumentKeys.featured(limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/solution-documents",
        {
          isFeatured: true,
          limit,
          sortBy: "updatedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformDocument);
      }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch curated landing page data for solution documents.
 */
export function useSolutionDocumentLanding() {
  return useQuery({
    queryKey: solutionDocumentKeys.landing(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<SolutionDocumentLandingData>>(
        "/solution-documents/landing",
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch solution documents filtered by domain.
 */
export function useDocumentsByDomain(domain: Domain, limit: number = 12) {
  return useQuery({
    queryKey: solutionDocumentKeys.domain(domain, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/solution-documents",
        {
          domain,
          limit,
          sortBy: "updatedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformDocument);
      }),
    enabled: !!domain,
  });
}

/**
 * Fetch solution documents filtered by document type.
 */
export function useDocumentsByType(type: DocumentType, limit: number = 12) {
  return useQuery({
    queryKey: solutionDocumentKeys.type(type, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<PaginatedResponse<any>>>(
        "/solution-documents",
        {
          documentType: type,
          limit,
          sortBy: "updatedAt",
          sortOrder: "DESC",
        },
      ).then((res) => {
        const items = res.data?.items ?? [];
        return items.map(transformDocument);
      }),
    enabled: !!type,
  });
}

/**
 * Fetch aggregate statistics for solution documents.
 */
export function useSolutionDocumentStats() {
  return useQuery({
    queryKey: solutionDocumentKeys.stats(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<SolutionDocumentStatsData>>(
        "/solution-documents/stats",
      ).then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch all document bundles.
 */
export function useDocumentBundles() {
  return useQuery({
    queryKey: solutionDocumentKeys.bundles(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<DocumentBundle[]>>(
        "/solution-documents/bundles",
      ).then((res) => {
        const bundles = res.data ?? [];
        return bundles.map(transformBundle);
      }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single document bundle by ID or slug.
 */
export function useDocumentBundle(idOrSlug: string) {
  return useQuery({
    queryKey: solutionDocumentKeys.bundleDetail(idOrSlug),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/solution-documents/bundles/${idOrSlug}`,
      ).then((res) => transformBundle(res.data)),
    enabled: !!idOrSlug,
  });
}

/**
 * Fetch update history for a document.
 */
export function useDocumentUpdates(documentId: string) {
  return useQuery({
    queryKey: solutionDocumentKeys.updates(documentId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<DocumentUpdate[]>>(
        `/solution-documents/${documentId}/updates`,
      ).then((res) => res.data ?? []),
    enabled: !!documentId,
  });
}
