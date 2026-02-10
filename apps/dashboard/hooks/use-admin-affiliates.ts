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

// ─── Query Key Factory ──────────────────────────────────────────────

export const affiliateAdminKeys = {
  all: ['admin-affiliates'] as const,
  affiliates: (params?: Record<string, any>) => [...affiliateAdminKeys.all, 'list', params] as const,
  affiliate: (id: string) => [...affiliateAdminKeys.all, 'detail', id] as const,
  stats: () => [...affiliateAdminKeys.all, 'stats'] as const,
  commissions: (params?: Record<string, any>) => [...affiliateAdminKeys.all, 'commissions', params] as const,
  payouts: (params?: Record<string, any>) => [...affiliateAdminKeys.all, 'payouts', params] as const,
  fraud: (params?: Record<string, any>) => [...affiliateAdminKeys.all, 'fraud', params] as const,
};

// ─── Affiliates ─────────────────────────────────────────────────────

export function useAdminAffiliates(params?: { search?: string; status?: string; tier?: string }) {
  return useQuery({
    queryKey: affiliateAdminKeys.affiliates(params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.status) sp.set('status', params.status);
      if (params?.tier) sp.set('tier', params.tier);
      const qs = sp.toString();
      return fetchWithMeta<any>(`/admin/affiliates${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useAdminAffiliate(id: string) {
  return useQuery({
    queryKey: affiliateAdminKeys.affiliate(id),
    queryFn: () => fetchWithAuth<any>(`/admin/affiliates/${id}`),
    enabled: !!id,
  });
}

export function useAdminAffiliateStats() {
  return useQuery({
    queryKey: affiliateAdminKeys.stats(),
    queryFn: () => fetchWithAuth<any>('/admin/affiliates/stats'),
  });
}

export function useUpdateAffiliate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      mutateWithAuth<any>(`/admin/affiliates/${id}`, 'PATCH', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

export function useReviewAffiliateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, reviewNotes }: { id: string; decision: 'approve' | 'reject'; reviewNotes?: string }) =>
      mutateWithAuth<any>(`/admin/affiliates/${id}/review`, 'PATCH', { decision, reviewNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

export function useSuspendAffiliate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      mutateWithAuth<any>(`/admin/affiliates/${id}/suspend`, 'POST', { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

// ─── Commissions ────────────────────────────────────────────────────

export function useAdminCommissions(params?: { status?: string; flagged?: boolean }) {
  return useQuery({
    queryKey: affiliateAdminKeys.commissions(params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      if (params?.flagged !== undefined) sp.set('flagged', String(params.flagged));
      const qs = sp.toString();
      return fetchWithMeta<any>(`/admin/affiliates/commissions${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useReviewCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) =>
      mutateWithAuth<any>(`/admin/affiliates/commissions/${id}/review`, 'PATCH', { decision }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

export function useBulkApproveCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commissionIds: string[]) =>
      mutateWithAuth<any>('/admin/affiliates/commissions/bulk-approve', 'POST', { commissionIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

// ─── Payouts ────────────────────────────────────────────────────────

export function useAdminAffiliatePayouts(params?: { status?: string }) {
  return useQuery({
    queryKey: affiliateAdminKeys.payouts(params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      const qs = sp.toString();
      return fetchWithMeta<any>(`/admin/affiliates/payouts${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useProcessAffiliatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateWithAuth<any>(`/admin/affiliates/payouts/${id}/process`, 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateAdminKeys.all });
    },
  });
}

// ─── Fraud ──────────────────────────────────────────────────────────

export function useAdminFlaggedCommissions() {
  return useQuery({
    queryKey: affiliateAdminKeys.fraud(),
    queryFn: () => fetchWithMeta<any>('/admin/affiliates/fraud'),
  });
}
