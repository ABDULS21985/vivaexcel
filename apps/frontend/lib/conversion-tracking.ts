// =============================================================================
// Conversion Event Tracking
// =============================================================================
// Unified utility that sends conversion events to both Google Analytics and the
// backend marketplace-analytics endpoint. Fire-and-forget -- never throws.

import { trackEvent } from "./analytics";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ConversionType =
  | "ADD_TO_CART"
  | "CHECKOUT_STARTED"
  | "CHECKOUT_COMPLETED"
  | "DOWNLOAD"
  | "REVIEW_WRITTEN";

interface ConversionPayload {
  digitalProductId?: string;
  orderId?: string;
  revenue?: number;
  currency?: string;
  quantity?: number;
  [key: string]: string | number | boolean | undefined;
}

// Map conversion types to GA event names
const GA_EVENT_MAP: Record<ConversionType, string> = {
  ADD_TO_CART: "add_to_cart",
  CHECKOUT_STARTED: "begin_checkout",
  CHECKOUT_COMPLETED: "purchase",
  DOWNLOAD: "download",
  REVIEW_WRITTEN: "review_submit",
};

// -----------------------------------------------------------------------------
// Session & Device Helpers
// -----------------------------------------------------------------------------

function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem("ktblog_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("ktblog_sid", sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

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

// -----------------------------------------------------------------------------
// UTM Persistence
// -----------------------------------------------------------------------------

const UTM_STORAGE_KEY = "ktblog_utm";

interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function captureAndPersistUtm(): UtmParams {
  try {
    // Check if we already have persisted UTM params
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Capture from current URL
    const params = new URLSearchParams(window.location.search);
    const utm: UtmParams = {};

    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");

    if (source) utm.utmSource = source;
    if (medium) utm.utmMedium = medium;
    if (campaign) utm.utmCampaign = campaign;

    // Only persist if we found at least one param
    if (source || medium || campaign) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }

    return utm;
  } catch {
    return {};
  }
}

// -----------------------------------------------------------------------------
// Main API
// -----------------------------------------------------------------------------

/**
 * Track a conversion event. Sends to both GA and backend analytics.
 * Fire-and-forget -- silently ignores errors.
 */
export function trackConversion(
  type: ConversionType,
  payload: ConversionPayload = {},
): void {
  if (typeof window === "undefined") return;

  // 1. Send to GA
  const gaEvent = GA_EVENT_MAP[type];
  trackEvent(gaEvent, {
    event_category: "conversion",
    conversion_type: type,
    ...(payload.digitalProductId && { item_id: payload.digitalProductId }),
    ...(payload.revenue !== undefined && { value: payload.revenue }),
    ...(payload.currency && { currency: payload.currency }),
  });

  // 2. Send to backend analytics
  const utm = captureAndPersistUtm();

  fetch(`${API_URL}/marketplace-analytics/events/conversion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      sessionId: getOrCreateSessionId(),
      deviceType: detectDeviceType(),
      ...utm,
      ...payload,
    }),
  }).catch(() => {
    // fire and forget
  });
}
