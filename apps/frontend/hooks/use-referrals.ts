'use client';

import { useQuery } from '@tanstack/react-query';
import type { ReferralCode, Referral, ReferralStats, PaginatedResponse } from '../types/affiliate';

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

export const referralKeys = {
  all: ['referrals'] as const,
  myCode: () => [...referralKeys.all, 'my-code'] as const,
  myReferrals: (params?: Record<string, any>) => [...referralKeys.all, 'list', params] as const,
  myStats: () => [...referralKeys.all, 'stats'] as const,
};

export function useMyReferralCode() {
  return useQuery({
    queryKey: referralKeys.myCode(),
    queryFn: () => fetchWithAuth<ReferralCode>('/referrals/my-code'),
  });
}

export function useMyReferrals(params?: { cursor?: string; limit?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const queryString = qs.toString();

  return useQuery({
    queryKey: referralKeys.myReferrals(params),
    queryFn: () => fetchPaginatedWithAuth<Referral>(`/referrals/my-referrals${queryString ? `?${queryString}` : ''}`),
  });
}

export function useMyReferralStats() {
  return useQuery({
    queryKey: referralKeys.myStats(),
    queryFn: () => fetchWithAuth<ReferralStats>('/referrals/my-stats'),
  });
}
