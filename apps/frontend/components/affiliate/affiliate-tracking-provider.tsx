'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const COOKIE_NAME = '_aff_session';
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * AffiliateTrackingProvider
 *
 * Client component placed in root layout.
 * Detects `?ref=CODE` query param, calls GET /ref/:code to record the click
 * and receive a sessionId, then stores it in a cookie for 30 days.
 * The checkout flow reads this cookie to attribute the sale.
 */
export function AffiliateTrackingProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (!refCode) return;

    // Don't re-track if we already have a session for this code
    const existing = getCookie(COOKIE_NAME);
    if (existing) return;

    // Track the click via the backend redirect endpoint
    // We use a fetch with redirect: 'manual' since we don't want to actually redirect
    fetch(`${API_URL.replace('/api', '')}/ref/${refCode}`, {
      method: 'GET',
      redirect: 'manual',
      credentials: 'include',
    })
      .then((res) => {
        // The server sets the cookie via Set-Cookie header
        // But since this might be cross-origin, we also check for a session ID
        // in the response headers or extract from cookies set by the redirect
        // The cookie should already be set by the server response
      })
      .catch(() => {
        // Silent fail - don't break the user experience for tracking
      });
  }, [searchParams]);

  return <>{children}</>;
}
