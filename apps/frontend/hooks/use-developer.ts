// =============================================================================
// Developer Portal Hooks
// =============================================================================
// TanStack React Query hooks for API keys, webhooks, and embed widgets.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  WebhookEndpoint,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  EmbedConfig,
  EmbedCodeResponse,
} from "@/types/developer";

// =============================================================================
// Query Key Factory
// =============================================================================

export const developerKeys = {
  all: ["developer"] as const,

  // API Keys
  apiKeys: () => [...developerKeys.all, "api-keys"] as const,
  apiKey: (id: string) => [...developerKeys.apiKeys(), id] as const,

  // Webhooks
  webhookEndpoints: () => [...developerKeys.all, "webhook-endpoints"] as const,
  webhookEndpoint: (id: string) =>
    [...developerKeys.webhookEndpoints(), id] as const,
  webhookDeliveries: (endpointId?: string) =>
    [...developerKeys.all, "webhook-deliveries", endpointId] as const,

  // Embeds
  embedCode: (config: EmbedConfig) =>
    [...developerKeys.all, "embed-code", config] as const,
};

// =============================================================================
// API Key Hooks
// =============================================================================

/**
 * Fetch all API keys for the current user.
 */
export function useApiKeys() {
  return useQuery({
    queryKey: developerKeys.apiKeys(),
    queryFn: () =>
      apiGet<{ apiKeys: ApiKey[] }>("/api-keys").then(
        (res) => (res as any)?.data?.apiKeys ?? (res as any)?.apiKeys ?? res,
      ),
  });
}

/**
 * Create a new API key. Returns the full key only once.
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) =>
      apiPost<CreateApiKeyResponse>("/api-keys", data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: developerKeys.apiKeys() });
    },
  });
}

/**
 * Revoke (delete) an API key permanently.
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<void>(`/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: developerKeys.apiKeys() });
    },
  });
}

/**
 * Rotate an API key -- invalidates the old key and returns a new full key.
 */
export function useRotateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost<CreateApiKeyResponse>(`/api-keys/${id}/rotate`).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: developerKeys.apiKeys() });
    },
  });
}

// =============================================================================
// Webhook Endpoint Hooks
// =============================================================================

/**
 * Fetch all webhook endpoints.
 */
export function useWebhookEndpoints() {
  return useQuery({
    queryKey: developerKeys.webhookEndpoints(),
    queryFn: () =>
      apiGet<{ endpoints: WebhookEndpoint[] }>("/webhooks/endpoints").then(
        (res) =>
          (res as any)?.data?.endpoints ?? (res as any)?.endpoints ?? res,
      ),
  });
}

/**
 * Create a new webhook endpoint.
 */
export function useCreateWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookRequest) =>
      apiPost<WebhookEndpoint>("/webhooks/endpoints", data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: developerKeys.webhookEndpoints(),
      });
    },
  });
}

/**
 * Update a webhook endpoint (URL, events, status).
 */
export function useUpdateWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateWebhookRequest & { id: string }) =>
      apiPatch<WebhookEndpoint>(`/webhooks/endpoints/${id}`, data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: developerKeys.webhookEndpoints(),
      });
    },
  });
}

/**
 * Delete a webhook endpoint.
 */
export function useDeleteWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<void>(`/webhooks/endpoints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: developerKeys.webhookEndpoints(),
      });
    },
  });
}

/**
 * Send a test event to a webhook endpoint.
 */
export function useTestWebhook() {
  return useMutation({
    mutationFn: ({ id, event }: { id: string; event?: string }) =>
      apiPost<{ delivery: WebhookDelivery }>(
        `/webhooks/endpoints/${id}/test`,
        { event },
      ).then((res) => (res as any)?.data ?? res),
  });
}

// =============================================================================
// Webhook Delivery Hooks
// =============================================================================

/**
 * Fetch webhook deliveries, optionally filtered by endpoint.
 */
export function useWebhookDeliveries(endpointId?: string) {
  return useQuery({
    queryKey: developerKeys.webhookDeliveries(endpointId),
    queryFn: () =>
      apiGet<{ deliveries: WebhookDelivery[] }>("/webhooks/deliveries", {
        ...(endpointId ? { endpointId } : {}),
      }).then(
        (res) =>
          (res as any)?.data?.deliveries ?? (res as any)?.deliveries ?? res,
      ),
  });
}

/**
 * Retry a failed webhook delivery.
 */
export function useRetryDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost<WebhookDelivery>(`/webhooks/deliveries/${id}/retry`).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: developerKeys.all,
      });
    },
  });
}

// =============================================================================
// Embed Code Hooks
// =============================================================================

/**
 * Fetch generated embed code for a given configuration.
 */
export function useEmbedCode(config: EmbedConfig) {
  return useQuery({
    queryKey: developerKeys.embedCode(config),
    queryFn: () =>
      apiGet<EmbedCodeResponse>("/embeds/code", {
        widgetType: config.widgetType,
        productId: config.productId,
        theme: config.theme,
        accentColor: config.accentColor,
        borderRadius: config.borderRadius,
        locale: config.locale,
      }).then((res) => (res as any)?.data ?? res),
    enabled: !!config.widgetType,
    staleTime: 30 * 1000, // 30 seconds
  });
}
