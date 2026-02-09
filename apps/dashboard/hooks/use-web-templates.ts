'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API error');
  }
  const json = await res.json();
  return json.data ?? json;
}

export const webTemplateKeys = {
  all: ['web-templates'] as const,
  lists: () => [...webTemplateKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...webTemplateKeys.lists(), filters] as const,
  details: () => [...webTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...webTemplateKeys.details(), id] as const,
  licenses: (templateId: string) => [...webTemplateKeys.all, 'licenses', templateId] as const,
};

interface WebTemplateFilters {
  search?: string;
  status?: string;
  templateType?: string;
  framework?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  cursor?: string;
}

export function useWebTemplates(filters?: WebTemplateFilters) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
  }
  const qs = params.toString();

  return useQuery({
    queryKey: webTemplateKeys.list(filters),
    queryFn: () => apiCall<any>(`/templates${qs ? `?${qs}` : ''}`),
  });
}

export function useWebTemplate(id: string) {
  return useQuery({
    queryKey: webTemplateKeys.detail(id),
    queryFn: () => apiCall<any>(`/templates/${id}`),
    enabled: !!id,
  });
}

export function useCreateWebTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiCall<any>('/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.lists() });
    },
  });
}

export function useUpdateWebTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiCall<any>(`/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.lists() });
    },
  });
}

export function useDeleteWebTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiCall<any>(`/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.lists() });
    },
  });
}

export function usePublishWebTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiCall<any>(`/templates/${id}/publish`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.lists() });
    },
  });
}

export function useArchiveWebTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiCall<any>(`/templates/${id}/archive`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: webTemplateKeys.lists() });
    },
  });
}

export function useTemplateLicenses(templateId: string) {
  return useQuery({
    queryKey: webTemplateKeys.licenses(templateId),
    queryFn: () => apiCall<any[]>(`/template-licenses/template/${templateId}`),
    enabled: !!templateId,
  });
}
