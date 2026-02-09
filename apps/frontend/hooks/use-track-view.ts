"use client";

import { useEffect } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// View Tracking Hook
// =============================================================================

/**
 * Fire-and-forget hook that posts a product view event on mount.
 * Captures session, referrer, device, and traffic source information.
 */
export function useTrackView(productId: string, sessionId?: string) {
  useEffect(() => {
    if (!productId) return;

    const sid = sessionId || getOrCreateSessionId();
    const source = detectTrafficSource();

    fetch(`${API_URL}/marketplace-analytics/events/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        digitalProductId: productId,
        sessionId: sid,
        source,
        referrer: document.referrer || undefined,
        deviceType: detectDeviceType(),
        browser: detectBrowser(),
      }),
    }).catch(() => {
      // fire and forget -- silently ignore network errors
    });
  }, [productId, sessionId]);
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Retrieve or create a persistent session identifier stored in sessionStorage.
 */
function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem("ktblog_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("ktblog_sid", sid);
    }
    return sid;
  } catch {
    // sessionStorage may be unavailable (e.g. SSR, private browsing)
    return crypto.randomUUID();
  }
}

/**
 * Detect the traffic source from UTM parameters or referrer hostname.
 */
function detectTrafficSource(): string {
  try {
    const params = new URLSearchParams(window.location.search);

    const utmSource = params.get("utm_source");
    if (utmSource) return utmSource;

    const utmMedium = params.get("utm_medium");
    if (utmMedium) return utmMedium;

    if (document.referrer) {
      try {
        const referrerHost = new URL(document.referrer).hostname;

        if (referrerHost.includes("google")) return "google";
        if (referrerHost.includes("bing")) return "bing";
        if (referrerHost.includes("facebook") || referrerHost.includes("fb.com"))
          return "facebook";
        if (referrerHost.includes("twitter") || referrerHost.includes("x.com"))
          return "twitter";
        if (referrerHost.includes("linkedin")) return "linkedin";
        if (referrerHost.includes("youtube")) return "youtube";
        if (referrerHost.includes("reddit")) return "reddit";

        // Same-site navigation
        if (referrerHost === window.location.hostname) return "internal";

        return referrerHost;
      } catch {
        return "referral";
      }
    }

    return "direct";
  } catch {
    return "unknown";
  }
}

/**
 * Detect device type based on viewport width.
 */
function detectDeviceType(): string {
  try {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  } catch {
    return "unknown";
  }
}

/**
 * Parse the browser name from the user agent string.
 */
function detectBrowser(): string {
  try {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox/")) return "firefox";
    if (ua.includes("Edg/")) return "edge";
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "opera";
    if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "chrome";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";

    return "other";
  } catch {
    return "unknown";
  }
}
