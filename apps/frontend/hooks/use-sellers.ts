'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SellerProfile,
  SellerApplication,
  SellerEarnings,
  SellerPayout,
  StripeConnectStatus,
} from '../types/seller';

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

export const sellerKeys = {
  all: ['sellers'] as const,
  lists: () => [...sellerKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...sellerKeys.lists(), params] as const,
  detail: (slug: string) => [...sellerKeys.all, 'detail', slug] as const,
  me: () => [...sellerKeys.all, 'me'] as const,
  earnings: () => [...sellerKeys.all, 'earnings'] as const,
  payouts: (params?: Record<string, any>) => [...sellerKeys.all, 'payouts', params] as const,
  application: () => [...sellerKeys.all, 'application'] as const,
  stripeStatus: () => [...sellerKeys.all, 'stripe-status'] as const,
};

// ─── Public Hooks ──────────────────────────────────────────────────

export function useSellers(params?: { search?: string; specialty?: string }) {
  return useQuery({
    queryKey: sellerKeys.list(params || {}),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.specialty) searchParams.set('specialty', params.specialty);
      const qs = searchParams.toString();
      const res = await fetch(`${API_URL}/sellers${qs ? `?${qs}` : ''}`);
      const json = await res.json();
      return json.data as SellerProfile[];
    },
  });
}

export function useSeller(slug: string) {
  return useQuery({
    queryKey: sellerKeys.detail(slug),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/sellers/slug/${slug}`);
      const json = await res.json();
      return json.data as SellerProfile;
    },
    enabled: !!slug,
  });
}

// ─── Authenticated Seller Hooks ────────────────────────────────────

export function useMySellerProfile() {
  return useQuery({
    queryKey: sellerKeys.me(),
    queryFn: () => fetchWithAuth<SellerProfile>('/sellers/me'),
  });
}

export function useUpdateSellerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SellerProfile>) =>
      mutateWithAuth<SellerProfile>('/sellers/me', 'PATCH', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.me() });
      qc.invalidateQueries({ queryKey: sellerKeys.all });
    },
  });
}

export function useSellerEarnings() {
  return useQuery({
    queryKey: sellerKeys.earnings(),
    queryFn: () => fetchWithAuth<SellerEarnings>('/sellers/me/earnings'),
  });
}

export function useSellerPayouts() {
  return useQuery({
    queryKey: sellerKeys.payouts(),
    queryFn: () => fetchWithAuth<SellerPayout[]>('/sellers/me/payouts'),
  });
}

// ─── Application Hooks ─────────────────────────────────────────────

export function useMyApplication() {
  return useQuery({
    queryKey: sellerKeys.application(),
    queryFn: () => fetchWithAuth<SellerApplication | null>('/seller-applications/my-application'),
  });
}

export function useSubmitApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      displayName: string;
      bio?: string;
      website?: string;
      portfolioUrls?: string[];
      experienceDescription?: string;
      productCategories?: string[];
      sampleWorkUrls?: string[];
      specialties?: string[];
      applicationNote?: string;
    }) => mutateWithAuth<SellerApplication>('/seller-applications', 'POST', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.application() });
    },
  });
}

// ─── Stripe Connect Hooks ──────────────────────────────────────────

export function useStripeConnectStatus() {
  return useQuery({
    queryKey: sellerKeys.stripeStatus(),
    queryFn: () => fetchWithAuth<StripeConnectStatus>('/sellers/me/stripe-connect/status'),
  });
}

export function useCreateStripeConnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mutateWithAuth<{ url: string }>('/sellers/me/stripe-connect', 'POST'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.stripeStatus() });
    },
  });
}

export function useStripeDashboardLink() {
  return useMutation({
    mutationFn: () => mutateWithAuth<{ url: string }>('/sellers/me/stripe-connect/dashboard', 'POST'),
  });
}
