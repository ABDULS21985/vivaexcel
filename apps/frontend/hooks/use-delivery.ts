import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  DownloadLink,
  License,
  LicenseActivation,
  UserProductUpdate,
  ProductUpdateInfo,
  DeliveryApiResponse,
  PaginatedDeliveryResponse,
  DeliveryCursorMeta,
} from "@/types/delivery";

// =============================================================================
// Query Keys
// =============================================================================

export const deliveryKeys = {
  all: ["delivery"] as const,

  // Downloads
  downloads: () => [...deliveryKeys.all, "downloads"] as const,
  downloadList: (cursor?: string, limit?: number) =>
    [...deliveryKeys.downloads(), { cursor, limit }] as const,

  // Licenses
  licenses: () => [...deliveryKeys.all, "licenses"] as const,
  licenseList: (cursor?: string, limit?: number) =>
    [...deliveryKeys.licenses(), { cursor, limit }] as const,
  licenseDetail: (id: string) =>
    [...deliveryKeys.licenses(), "detail", id] as const,

  // Updates
  updates: () => [...deliveryKeys.all, "updates"] as const,
  myUpdates: () => [...deliveryKeys.updates(), "my-updates"] as const,
  productChangelog: (productId: string) =>
    [...deliveryKeys.updates(), "changelog", productId] as const,
};

// =============================================================================
// Response Transform Helpers
// =============================================================================

function unwrapPaginated<T>(
  res: DeliveryApiResponse<PaginatedDeliveryResponse<T>>,
): { items: T[]; meta: DeliveryCursorMeta } {
  return {
    items: res.data?.items ?? [],
    meta: res.data?.meta ?? { hasNextPage: false, hasPreviousPage: false },
  };
}

function unwrapData<T>(res: DeliveryApiResponse<T>): T {
  return res.data;
}

// =============================================================================
// Download Hooks
// =============================================================================

/**
 * Fetch the current user's download links (purchased products).
 * Requires authentication -- the backend identifies the user by JWT.
 */
export function useMyDownloads(cursor?: string, limit: number = 20) {
  return useQuery({
    queryKey: deliveryKeys.downloadList(cursor, limit),
    queryFn: () =>
      apiGet<DeliveryApiResponse<PaginatedDeliveryResponse<DownloadLink>>>(
        "/downloads/my-products",
        { cursor, limit },
      ).then(unwrapPaginated),
  });
}

/**
 * Mutation to refresh an expired download link.
 * Returns a new download link with a fresh token and expiry.
 */
export function useRefreshDownloadLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (downloadLinkId: string) =>
      apiPost<DeliveryApiResponse<DownloadLink>>(
        `/downloads/${downloadLinkId}/refresh`,
      ).then(unwrapData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.downloads() });
    },
  });
}

// =============================================================================
// License Hooks
// =============================================================================

/**
 * Fetch the current user's licenses.
 */
export function useMyLicenses(cursor?: string, limit: number = 20) {
  return useQuery({
    queryKey: deliveryKeys.licenseList(cursor, limit),
    queryFn: () =>
      apiGet<DeliveryApiResponse<PaginatedDeliveryResponse<License>>>(
        "/licenses/my-licenses",
        { cursor, limit },
      ).then(unwrapPaginated),
  });
}

/**
 * Fetch detailed information about a single license including activations.
 */
export function useLicenseDetails(licenseId: string) {
  return useQuery({
    queryKey: deliveryKeys.licenseDetail(licenseId),
    queryFn: () =>
      apiGet<DeliveryApiResponse<License>>(
        `/licenses/${licenseId}`,
      ).then(unwrapData),
    enabled: !!licenseId,
  });
}

/**
 * Mutation to activate a license on a domain or machine.
 */
export function useActivateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      licenseId,
      domain,
      machineId,
    }: {
      licenseId: string;
      domain?: string;
      machineId?: string;
    }) =>
      apiPost<DeliveryApiResponse<LicenseActivation>>(
        `/licenses/${licenseId}/activate`,
        { domain, machineId },
      ).then(unwrapData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: deliveryKeys.licenseDetail(variables.licenseId),
      });
      queryClient.invalidateQueries({
        queryKey: deliveryKeys.licenses(),
      });
    },
  });
}

/**
 * Mutation to deactivate a specific activation from a license.
 */
export function useDeactivateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      licenseId,
      activationId,
    }: {
      licenseId: string;
      activationId: string;
    }) =>
      apiDelete<void>(
        `/licenses/${licenseId}/activations/${activationId}`,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: deliveryKeys.licenseDetail(variables.licenseId),
      });
      queryClient.invalidateQueries({
        queryKey: deliveryKeys.licenses(),
      });
    },
  });
}

// =============================================================================
// Product Update Hooks
// =============================================================================

/**
 * Fetch all available updates for the current user's purchased products.
 */
export function useMyUpdates() {
  return useQuery({
    queryKey: deliveryKeys.myUpdates(),
    queryFn: () =>
      apiGet<DeliveryApiResponse<UserProductUpdate[]>>(
        "/products/updates/my-updates",
      ).then(unwrapData),
  });
}

/**
 * Fetch the public changelog for a specific product.
 */
export function useProductChangelog(productId: string) {
  return useQuery({
    queryKey: deliveryKeys.productChangelog(productId),
    queryFn: () =>
      apiGet<DeliveryApiResponse<ProductUpdateInfo[]>>(
        `/digital-products/${productId}/changelog`,
      ).then(unwrapData),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
