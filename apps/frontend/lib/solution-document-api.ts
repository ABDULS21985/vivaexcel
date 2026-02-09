// =============================================================================
// Server-Side Solution Document API
// =============================================================================
// Utility for fetching solution document data from the backend in Next.js
// server components. Uses plain fetch() with ISR caching -- NOT the client-side
// apiClient which relies on localStorage for JWT tokens.

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
): Promise<{ data: T | undefined; meta?: SolutionDocumentCursorMeta }> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[solution-document-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return { data: undefined };
    }

    const json: ApiResponseWrapper<T> = await response.json();

    return {
      data: json.data,
      meta: json.meta as SolutionDocumentCursorMeta | undefined,
    };
  } catch (error) {
    console.error(`[solution-document-api] GET ${endpoint} error:`, error);
    return { data: undefined };
  }
}

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

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
 * Transform an array of backend solution documents.
 */
function transformDocuments(items: any[]): SolutionDocument[] {
  if (!Array.isArray(items)) return [];
  return items.map(transformDocument);
}

/**
 * Transform a bundle response.
 */
function transformBundle(data: any): DocumentBundle {
  if (!data) return data;
  return {
    ...data,
    documents: transformDocuments(data.documents ?? []),
  };
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch a paginated list of solution documents with optional cursor-based filters.
 */
export async function fetchSolutionDocuments(
  filters?: SolutionDocumentQueryParams,
): Promise<SolutionDocumentsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    const mappings: Record<string, string | number | boolean | undefined> = {
      cursor: filters.cursor,
      limit: filters.limit,
      search: filters.search,
      documentType: filters.documentType,
      domain: filters.domain,
      cloudPlatform: filters.cloudPlatform,
      complianceFramework: filters.complianceFramework,
      maturityLevel: filters.maturityLevel,
      templateFormat: filters.templateFormat,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      technology: filters.technology,
      hasEditableDiagrams: filters.hasEditableDiagrams,
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
  const endpoint = `/solution-documents${qs ? `?${qs}` : ""}`;

  const { data, meta } = await fetchApi<{
    items: any[];
    meta: SolutionDocumentCursorMeta;
  }>(endpoint, 60);

  if (!data) {
    return { items: [], meta: { hasNextPage: false, hasPreviousPage: false } };
  }

  return {
    items: transformDocuments(data.items),
    meta: (meta || data.meta || {
      hasNextPage: false,
      hasPreviousPage: false,
    }) as SolutionDocumentCursorMeta,
  };
}

/**
 * Fetch a single solution document by ID or slug.
 * Returns null if not found.
 */
export async function fetchSolutionDocument(
  idOrSlug: string,
): Promise<SolutionDocument | null> {
  const { data } = await fetchApi<any>(
    `/solution-documents/${idOrSlug}`,
    60,
  );

  if (!data) return null;

  return transformDocument(data);
}

/**
 * Fetch featured solution documents.
 */
export async function fetchFeaturedDocuments(
  limit: number = 8,
): Promise<SolutionDocument[]> {
  const result = await fetchSolutionDocuments({
    limit,
    sortBy: "updatedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch solution documents by domain.
 */
export async function fetchDocumentsByDomain(
  domain: Domain,
  limit: number = 12,
): Promise<SolutionDocument[]> {
  const result = await fetchSolutionDocuments({
    domain,
    limit,
    sortBy: "updatedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch solution documents by type.
 */
export async function fetchDocumentsByType(
  type: DocumentType,
  limit: number = 12,
): Promise<SolutionDocument[]> {
  const result = await fetchSolutionDocuments({
    documentType: type,
    limit,
    sortBy: "updatedAt",
    sortOrder: "DESC",
  });
  return result.items;
}

/**
 * Fetch related solution documents for a given document.
 */
export async function fetchRelatedDocuments(
  document: SolutionDocument,
  limit: number = 4,
): Promise<SolutionDocument[]> {
  const result = await fetchSolutionDocuments({
    domain: document.domain,
    limit: limit + 1,
    sortBy: "freshnessScore",
    sortOrder: "DESC",
  });

  return result.items
    .filter((d) => d.id !== document.id)
    .slice(0, limit);
}

/**
 * Fetch all document bundles.
 */
export async function fetchDocumentBundles(): Promise<DocumentBundle[]> {
  const { data } = await fetchApi<DocumentBundle[]>(
    "/solution-documents/bundles",
    120,
  );
  if (!data) return [];
  return (data as any[]).map(transformBundle);
}

/**
 * Fetch a single document bundle by ID or slug.
 */
export async function fetchDocumentBundle(
  idOrSlug: string,
): Promise<DocumentBundle | null> {
  const { data } = await fetchApi<any>(
    `/solution-documents/bundles/${idOrSlug}`,
    60,
  );
  if (!data) return null;
  return transformBundle(data);
}

/**
 * Fetch solution document landing page data.
 */
export async function fetchLandingPageData(): Promise<SolutionDocumentLandingData | null> {
  const { data } = await fetchApi<SolutionDocumentLandingData>(
    "/solution-documents/landing",
    300,
  );
  return data || null;
}

/**
 * Fetch aggregate stats.
 */
export async function fetchSolutionDocumentStats(): Promise<SolutionDocumentStatsData | null> {
  const { data } = await fetchApi<SolutionDocumentStatsData>(
    "/solution-documents/stats",
    300,
  );
  return data || null;
}

/**
 * Fetch update history for a document.
 */
export async function fetchDocumentUpdates(
  documentId: string,
): Promise<DocumentUpdate[]> {
  const { data } = await fetchApi<DocumentUpdate[]>(
    `/solution-documents/${documentId}/updates`,
    120,
  );
  return data || [];
}
