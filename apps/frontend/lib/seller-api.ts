import type { SellerProfile, SellerApplication } from '../types/seller';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(path: string, options?: { revalidate?: number }): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: options?.revalidate ?? 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function fetchApiWithMeta<T>(path: string, options?: { revalidate?: number }): Promise<{
  data: T[];
  meta: { hasNextPage: boolean; nextCursor?: string };
} | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: options?.revalidate ?? 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return { data: json.data ?? [], meta: json.meta ?? { hasNextPage: false } };
  } catch {
    return null;
  }
}

export async function fetchSellers(params?: {
  search?: string;
  specialty?: string;
  cursor?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.specialty) searchParams.set('specialty', params.specialty);
  if (params?.cursor) searchParams.set('cursor', params.cursor);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return fetchApiWithMeta<SellerProfile>(`/sellers${qs ? `?${qs}` : ''}`, { revalidate: 300 });
}

export async function fetchSellerBySlug(slug: string) {
  return fetchApi<SellerProfile>(`/sellers/slug/${slug}`, { revalidate: 300 });
}

export async function fetchTopSellers(limit = 12) {
  return fetchApiWithMeta<SellerProfile>(`/sellers?limit=${limit}&sortBy=totalSales&sortOrder=desc`, {
    revalidate: 600,
  });
}
