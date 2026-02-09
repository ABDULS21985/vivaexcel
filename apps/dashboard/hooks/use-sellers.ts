'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function fetchWithAuth<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  const json = await res.json();
  return json.data;
}

async function fetchWithMeta<T>(path: string): Promise<{ data: T[]; meta: any }> {
  const res = await fetch(`${API_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  const json = await res.json();
  return { data: json.data ?? [], meta: json.meta ?? {} };
}

async function mutateWithAuth<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  const json = await res.json();
  return json.data;
}

export const sellerAdminKeys = {
  all: ['admin-sellers'] as const,
  sellers: (params?: Record<string, any>) => [...sellerAdminKeys.all, 'list', params] as const,
  seller: (id: string) => [...sellerAdminKeys.all, 'detail', id] as const,
  applications: (params?: Record<string, any>) => [...sellerAdminKeys.all, 'applications', params] as const,
  application: (id: string) => [...sellerAdminKeys.all, 'application', id] as const,
  payouts: (params?: Record<string, any>) => [...sellerAdminKeys.all, 'payouts', params] as const,
};

// ─── Sellers ───────────────────────────────────────────────────────

export function useAdminSellers(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: sellerAdminKeys.sellers(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchWithMeta<any>(`/admin/sellers${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useAdminSeller(id: string) {
  return useQuery({
    queryKey: sellerAdminKeys.seller(id),
    queryFn: () => fetchWithAuth<any>(`/admin/sellers/${id}`),
    enabled: !!id,
  });
}

export function useUpdateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      mutateWithAuth<any>(`/admin/sellers/${id}`, 'PATCH', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
  });
}

export function useSuspendSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateWithAuth<any>(`/admin/sellers/${id}/suspend`, 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
  });
}

export function useReinstateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateWithAuth<any>(`/admin/sellers/${id}/reinstate`, 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
  });
}

// ─── Applications ──────────────────────────────────────────────────

export function useSellerApplications(params?: { status?: string }) {
  return useQuery({
    queryKey: sellerAdminKeys.applications(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchWithMeta<any>(`/seller-applications${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useSellerApplication(id: string) {
  return useQuery({
    queryKey: sellerAdminKeys.application(id),
    queryFn: () => fetchWithAuth<any>(`/seller-applications/${id}`),
    enabled: !!id,
  });
}

export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, reviewNotes }: { id: string; decision: 'approve' | 'reject'; reviewNotes?: string }) =>
      mutateWithAuth<any>(`/seller-applications/${id}/review`, 'PATCH', { decision, reviewNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
  });
}

// ─── Payouts ───────────────────────────────────────────────────────

export function useAdminPayouts(params?: { status?: string; sellerId?: string }) {
  return useQuery({
    queryKey: sellerAdminKeys.payouts(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.sellerId) searchParams.set('sellerId', params.sellerId);
      const qs = searchParams.toString();
      return fetchWithMeta<any>(`/admin/sellers/payouts/all${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useProcessPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateWithAuth<any>(`/admin/sellers/payouts/${id}/process`, 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
  });
}
