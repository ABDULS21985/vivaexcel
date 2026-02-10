'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContributorApplication } from '../types/contributor';

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

export const contributorKeys = {
  all: ['contributors'] as const,
  application: () => [...contributorKeys.all, 'application'] as const,
};

// ─── Application Hooks ─────────────────────────────────────────────

export function useMyContributorApplication() {
  return useQuery({
    queryKey: contributorKeys.application(),
    queryFn: () => fetchWithAuth<ContributorApplication | null>('/contributor-applications/my-application'),
  });
}

export function useSubmitContributorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      displayName: string;
      bio?: string;
      website?: string;
      portfolioUrls?: string[];
      experienceDescription?: string;
      contentCategories?: string[];
      sampleWorkUrls?: string[];
      specialties?: string[];
      applicationNote?: string;
    }) => mutateWithAuth<ContributorApplication>('/contributor-applications', 'POST', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contributorKeys.application() });
    },
  });
}
