import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type {
  Order,
  OrdersResponse,
  CheckoutSessionResponse,
  CheckoutSuccessResponse,
} from "@/types/order";

// =============================================================================
// Cart / Order Query Keys
// =============================================================================

export const cartKeys = {
  all: ["cart"] as const,
  orders: () => [...cartKeys.all, "orders"] as const,
  orderList: (filters: Record<string, unknown>) =>
    [...cartKeys.orders(), "list", filters] as const,
  orderDetail: (id: string) => [...cartKeys.orders(), "detail", id] as const,
  checkoutSuccess: (sessionId: string) =>
    [...cartKeys.all, "checkout-success", sessionId] as const,
};

// =============================================================================
// Order Hooks
// =============================================================================

interface OrderListFilters {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Fetch paginated order history for the authenticated user.
 */
export function useOrders(filters?: OrderListFilters) {
  return useQuery({
    queryKey: cartKeys.orderList(filters || {}),
    queryFn: () =>
      apiGet<OrdersResponse>("/orders", {
        page: filters?.page,
        limit: filters?.limit,
        status: filters?.status,
      }),
  });
}

/**
 * Fetch a single order by ID.
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: cartKeys.orderDetail(id),
    queryFn: () => apiGet<{ order: Order }>(`/orders/${id}`).then((res) => res.order),
    enabled: !!id,
  });
}

/**
 * Verify a checkout session and retrieve the order after Stripe redirect.
 */
export function useCheckoutSuccess(sessionId: string) {
  return useQuery({
    queryKey: cartKeys.checkoutSuccess(sessionId),
    queryFn: () =>
      apiGet<CheckoutSuccessResponse>("/checkout/success", {
        session_id: sessionId,
      }).then((res) => res.order),
    enabled: !!sessionId,
    retry: 2,
    staleTime: Infinity, // The result won't change
  });
}

/**
 * Mutation to create a Stripe Checkout session.
 * On success, the caller should redirect to the returned URL.
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { successUrl: string; cancelUrl: string; couponCode?: string }) =>
      apiPost<CheckoutSessionResponse>("/checkout", data),
    onSuccess: () => {
      // Invalidate cart queries since checkout will consume the cart
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
