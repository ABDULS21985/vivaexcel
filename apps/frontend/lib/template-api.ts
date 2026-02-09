import {
  WebTemplate,
  WebTemplateFilters,
  WebTemplatesResponse,
  TemplateCategory,
  TemplateTag,
  ApiResponseWrapper,
} from '../types/web-template';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface PaginatedApiResponse<T> {
  status: string;
  data: {
    items: T[];
    meta: {
      total: number;
      hasNextPage: boolean;
      nextCursor: string | null;
    };
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: { revalidate?: number },
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    next: { revalidate: options?.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

function buildQueryString(filters?: WebTemplateFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchTemplates(
  filters?: WebTemplateFilters,
): Promise<WebTemplatesResponse> {
  const qs = buildQueryString(filters);
  const res = await fetch(`${API_URL}/templates${qs}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json: PaginatedApiResponse<WebTemplate> = await res.json();
  return {
    items: json.data.items,
    meta: json.data.meta,
  };
}

export async function fetchTemplateBySlug(
  slug: string,
): Promise<WebTemplate | null> {
  try {
    return await fetchApi<WebTemplate>(`/templates/slug/${slug}`, {
      revalidate: 120,
    });
  } catch {
    return null;
  }
}

export async function fetchTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    return await fetchApi<TemplateCategory[]>('/digital-product-categories', {
      revalidate: 300,
    });
  } catch {
    return [];
  }
}

export async function fetchTemplateTags(): Promise<TemplateTag[]> {
  try {
    return await fetchApi<TemplateTag[]>('/digital-product-tags', {
      revalidate: 300,
    });
  } catch {
    return [];
  }
}

export async function fetchFeaturedTemplates(
  limit = 6,
): Promise<WebTemplate[]> {
  try {
    const result = await fetchTemplates({
      isFeatured: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    return result.items;
  } catch {
    return [];
  }
}

export async function fetchTemplatesByFramework(
  framework: string,
  limit = 12,
): Promise<WebTemplate[]> {
  try {
    const result = await fetchTemplates({
      framework: framework as any,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    return result.items;
  } catch {
    return [];
  }
}

export async function fetchRelatedTemplates(
  template: WebTemplate,
  limit = 4,
): Promise<WebTemplate[]> {
  try {
    const result = await fetchTemplates({
      framework: template.framework,
      templateType: template.templateType,
      limit: limit + 1,
      sortBy: 'downloadCount',
      sortOrder: 'DESC',
    });
    return result.items.filter((t) => t.id !== template.id).slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchStarterKits(
  limit = 12,
): Promise<WebTemplate[]> {
  try {
    const result = await fetchTemplates({
      templateType: 'STARTUP_KIT' as any,
      limit,
      sortBy: 'downloadCount',
      sortOrder: 'DESC',
    });
    return result.items;
  } catch {
    return [];
  }
}
