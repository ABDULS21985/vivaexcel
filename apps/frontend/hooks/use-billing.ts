import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Billing Types
// =============================================================================

export interface SubscriptionInfo {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "none";
  plan: "free" | "basic" | "pro" | "premium";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  status: "paid" | "pending" | "failed" | "void";
  invoiceUrl?: string;
  pdfUrl?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface BillingInfoResponse {
  subscription: SubscriptionInfo;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

interface PortalSessionResponse {
  url: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  highlighted?: boolean;
  badge?: string;
}

interface PricingResponse {
  tiers: PricingTier[];
}

// =============================================================================
// Query Keys
// =============================================================================

export const billingKeys = {
  all: ["billing"] as const,
  info: () => [...billingKeys.all, "info"] as const,
  pricing: () => [...billingKeys.all, "pricing"] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch the current user's billing information (subscription, invoices, payment methods).
 */
export function useBillingInfo() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: billingKeys.info(),
    queryFn: () => apiGet<BillingInfoResponse>("/billing"),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch pricing tiers from the backend.
 */
export function usePricingTiers() {
  return useQuery({
    queryKey: billingKeys.pricing(),
    queryFn: () => apiGet<PricingResponse>("/billing/pricing", undefined, { skipAuth: true }),
    staleTime: 30 * 60 * 1000, // 30 minutes - pricing rarely changes
  });
}

/**
 * Create a Stripe Checkout session for a subscription.
 * Redirects the user to Stripe Checkout.
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({
      tierId,
      interval,
    }: {
      tierId: string;
      interval: "month" | "year";
    }) => {
      const response = await apiPost<CheckoutSessionResponse>(
        "/stripe/create-checkout",
        {
          tierId,
          interval,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/membership?canceled=true`,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

/**
 * Open the Stripe Customer Portal for managing subscriptions.
 */
export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<PortalSessionResponse>(
        "/stripe/create-portal",
        {
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

/**
 * Cancel the current subscription.
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reason,
      feedback,
    }: {
      reason: string;
      feedback?: string;
    }) => {
      return apiPost<{ message: string }>("/stripe/cancel-subscription", {
        reason,
        feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.info() });
    },
  });
}

/**
 * Change the subscription plan.
 */
export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tierId,
      interval,
    }: {
      tierId: string;
      interval: "month" | "year";
    }) => {
      return apiPost<{ message: string }>("/stripe/change-plan", {
        tierId,
        interval,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.info() });
    },
  });
}
