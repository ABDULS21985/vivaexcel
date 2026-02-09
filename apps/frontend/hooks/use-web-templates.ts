'use client';

import { useQuery } from '@tanstack/react-query';
import {
  WebTemplate,
  WebTemplateFilters,
  WebTemplatesResponse,
  TemplateCategory,
  TemplateTag,
} from '../types/web-template';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const webTemplateKeys = {
  all: ['web-templates'] as const,
  lists: () => [...webTemplateKeys.all, 'list'] as const,
  list: (filters?: WebTemplateFilters) =>
    [...webTemplateKeys.lists(), filters] as const,
  details: () => [...webTemplateKeys.all, 'detail'] as const,
  detail: (slug: string) => [...webTemplateKeys.details(), slug] as const,
  categories: () => [...webTemplateKeys.all, 'categories'] as const,
  tags: () => [...webTemplateKeys.all, 'tags'] as const,
  related: (slug: string) =>
    [...webTemplateKeys.all, 'related', slug] as const,
};

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

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

export function useWebTemplates(filters?: WebTemplateFilters) {
  return useQuery<WebTemplatesResponse>({
    queryKey: webTemplateKeys.list(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters);
      const res = await fetch(`${API_URL}/templates${qs}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      return {
        items: json.data?.items ?? [],
        meta: json.data?.meta ?? {},
      };
    },
  });
}

export function useWebTemplate(slug: string) {
  return useQuery<WebTemplate | null>({
    queryKey: webTemplateKeys.detail(slug),
    queryFn: async () => {
      try {
        return await fetchFromApi<WebTemplate>(`/templates/slug/${slug}`);
      } catch {
        return null;
      }
    },
    enabled: !!slug,
  });
}

export function useTemplateCategories() {
  return useQuery<TemplateCategory[]>({
    queryKey: webTemplateKeys.categories(),
    queryFn: () =>
      fetchFromApi<TemplateCategory[]>('/digital-product-categories'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplateTags() {
  return useQuery<TemplateTag[]>({
    queryKey: webTemplateKeys.tags(),
    queryFn: () => fetchFromApi<TemplateTag[]>('/digital-product-tags'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedTemplates(slug: string, limit = 4) {
  return useQuery<WebTemplate[]>({
    queryKey: webTemplateKeys.related(slug),
    queryFn: async () => {
      const template = await fetchFromApi<WebTemplate>(
        `/templates/slug/${slug}`,
      );
      if (!template) return [];
      const qs = buildQueryString({
        framework: template.framework,
        templateType: template.templateType,
        limit: limit + 1,
        sortBy: 'downloadCount',
        sortOrder: 'DESC',
      });
      const res = await fetch(`${API_URL}/templates${qs}`);
      if (!res.ok) return [];
      const json = await res.json();
      const items: WebTemplate[] = json.data?.items ?? [];
      return items.filter((t) => t.id !== template.id).slice(0, limit);
    },
    enabled: !!slug,
  });
}
