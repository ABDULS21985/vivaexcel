'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AffiliateProfile,
  AffiliateLink,
  AffiliateCommission,
  AffiliatePayout,
  AffiliateStats,
  AffiliateEarnings,
  StripeConnectStatus,
  PaginatedResponse,
} from '../types/affiliate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
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

async function fetchPaginatedWithAuth<T>(path: string): Promise<PaginatedResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  const json = await res.json();
  return { items: json.items || json.data || [], meta: json.meta || {} };
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

export const affiliateKeys = {
  all: ['affiliates'] as const,
  me: () => [...affiliateKeys.all, 'me'] as const,
  stats: () => [...affiliateKeys.all, 'stats'] as const,
  earnings: () => [...affiliateKeys.all, 'earnings'] as const,
  links: (params?: Record<string, any>) => [...affiliateKeys.all, 'links', params] as const,
  commissions: (params?: Record<string, any>) => [...affiliateKeys.all, 'commissions', params] as const,
  payouts: (params?: Record<string, any>) => [...affiliateKeys.all, 'payouts', params] as const,
  stripeStatus: () => [...affiliateKeys.all, 'stripe-status'] as const,
};

// ─── Profile Hooks ──────────────────────────────────────────────────

export function useMyAffiliateProfile() {
  return useQuery({
    queryKey: affiliateKeys.me(),
    queryFn: () => fetchWithAuth<AffiliateProfile>('/affiliates/me'),
    retry: false,
  });
}

export function useApplyAsAffiliate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customSlug?: string;
      bio?: string;
      website?: string;
      socialLinks?: Record<string, string>;
      promotionMethods?: string[];
      applicationNote?: string;
    }) => mutateWithAuth<AffiliateProfile>('/affiliates/apply', 'POST', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateKeys.me() });
    },
  });
}

export function useUpdateAffiliateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AffiliateProfile>) =>
      mutateWithAuth<AffiliateProfile>('/affiliates/me', 'PATCH', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateKeys.me() });
    },
  });
}

// ─── Stats & Earnings ───────────────────────────────────────────────

export function useAffiliateStats() {
  return useQuery({
    queryKey: affiliateKeys.stats(),
    queryFn: () => fetchWithAuth<AffiliateStats>('/affiliates/me/stats'),
  });
}

export function useAffiliateEarnings() {
  return useQuery({
    queryKey: affiliateKeys.earnings(),
    queryFn: () => fetchWithAuth<AffiliateEarnings>('/affiliates/me/earnings'),
  });
}

// ─── Link Hooks ─────────────────────────────────────────────────────

export function useAffiliateLinks(params?: { cursor?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const queryString = qs.toString();

  return useQuery({
    queryKey: affiliateKeys.links(params),
    queryFn: () => fetchPaginatedWithAuth<AffiliateLink>(`/affiliates/me/links${queryString ? `?${queryString}` : ''}`),
  });
}

export function useCreateAffiliateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullUrl: string; digitalProductId?: string; customCampaign?: string }) =>
      mutateWithAuth<AffiliateLink>('/affiliates/me/links', 'POST', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateKeys.links() });
    },
  });
}

export function useDeleteAffiliateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) =>
      mutateWithAuth<void>(`/affiliates/me/links/${linkId}`, 'DELETE'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateKeys.links() });
    },
  });
}

// ─── Commission Hooks ───────────────────────────────────────────────

export function useAffiliateCommissions(params?: { cursor?: string; limit?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const queryString = qs.toString();

  return useQuery({
    queryKey: affiliateKeys.commissions(params),
    queryFn: () => fetchPaginatedWithAuth<AffiliateCommission>(`/affiliates/me/commissions${queryString ? `?${queryString}` : ''}`),
  });
}

// ─── Payout Hooks ───────────────────────────────────────────────────

export function useAffiliatePayouts(params?: { cursor?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const queryString = qs.toString();

  return useQuery({
    queryKey: affiliateKeys.payouts(params),
    queryFn: () => fetchPaginatedWithAuth<AffiliatePayout>(`/affiliates/me/payouts${queryString ? `?${queryString}` : ''}`),
  });
}

// ─── Stripe Connect Hooks ───────────────────────────────────────────

export function useAffiliateStripeStatus() {
  return useQuery({
    queryKey: affiliateKeys.stripeStatus(),
    queryFn: () => fetchWithAuth<StripeConnectStatus>('/affiliates/me/stripe-connect/status'),
  });
}

export function useCreateAffiliateStripeConnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mutateWithAuth<{ url: string }>('/affiliates/me/stripe-connect', 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: affiliateKeys.stripeStatus() });
    },
  });
}

export function useAffiliateDashboardLink() {
  return useMutation({
    mutationFn: () => mutateWithAuth<{ url: string }>('/affiliates/me/stripe-connect/dashboard', 'POST'),
  });
}
