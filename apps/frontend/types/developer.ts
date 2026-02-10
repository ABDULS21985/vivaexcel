// =============================================================================
// Developer Portal Types
// =============================================================================
// Type definitions for API keys, webhooks, embed widgets, and developer tools.

export enum ApiKeyEnvironment {
  LIVE = "LIVE",
  TEST = "TEST",
}

export enum ApiKeyStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
  rateLimit: number;
  allowedOrigins: string[];
  allowedIPs: string[];
  lastUsedAt?: string;
  requestCount: number;
  monthlyRequestCount: number;
  monthlyRequestLimit: number;
  status: ApiKeyStatus;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
  rateLimit?: number;
  allowedOrigins?: string[];
  allowedIPs?: string[];
  expiresAt?: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  fullKey: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret?: string;
  events: string[];
  status: "ACTIVE" | "DISABLED" | "FAILING";
  failureCount: number;
  lastDeliveryAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  status?: "ACTIVE" | "DISABLED";
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  responseStatus?: number;
  responseBody?: string;
  duration?: number;
  status: "PENDING" | "DELIVERED" | "FAILED" | "RETRIED";
  attempts: number;
  deliveredAt?: string;
  createdAt: string;
}

export interface EmbedConfig {
  widgetType: "product-card" | "product-grid" | "buy-button";
  productId?: string;
  theme: "light" | "dark" | "auto";
  accentColor: string;
  borderRadius: number;
  locale: string;
}

export interface EmbedCodeResponse {
  html: string;
  react: string;
  vue: string;
  wordpress: string;
}

// =============================================================================
// Constants
// =============================================================================

export const API_SCOPES = [
  {
    value: "products:read",
    label: "Read Products",
    description: "Access product catalog",
  },
  {
    value: "orders:read",
    label: "Read Orders",
    description: "View order details",
  },
  {
    value: "orders:write",
    label: "Write Orders",
    description: "Create and modify orders",
  },
  {
    value: "analytics:read",
    label: "Read Analytics",
    description: "Access analytics data",
  },
  {
    value: "webhooks:manage",
    label: "Manage Webhooks",
    description: "Create and manage webhooks",
  },
  {
    value: "cart:write",
    label: "Write Cart",
    description: "Manage shopping carts",
  },
  {
    value: "checkout:write",
    label: "Write Checkout",
    description: "Create checkout sessions",
  },
] as const;

export const WEBHOOK_EVENTS = [
  { value: "order.created", label: "Order Created" },
  { value: "order.completed", label: "Order Completed" },
  { value: "order.refunded", label: "Order Refunded" },
  { value: "product.created", label: "Product Created" },
  { value: "product.updated", label: "Product Updated" },
  { value: "product.published", label: "Product Published" },
  { value: "review.created", label: "Review Created" },
  { value: "review.approved", label: "Review Approved" },
  { value: "subscription.created", label: "Subscription Created" },
  { value: "subscription.canceled", label: "Subscription Canceled" },
  { value: "payout.completed", label: "Payout Completed" },
  { value: "license.activated", label: "License Activated" },
] as const;

export type ApiScopeValue = (typeof API_SCOPES)[number]["value"];
export type WebhookEventValue = (typeof WEBHOOK_EVENTS)[number]["value"];
