"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  useMySubscription,
  useMyCreditBalance,
} from "@/hooks/use-marketplace-subscription";
import type {
  MarketplaceSubscription,
  CreditBalance,
  ProductAccessInfo,
  MarketplacePlanSlug,
  AccessLevel,
} from "@/types/marketplace-subscription";

interface SubscriptionContextValue {
  subscription: MarketplaceSubscription | null | undefined;
  credits: CreditBalance | null | undefined;
  isSubscribed: boolean;
  isLoading: boolean;
  currentPlanId: string | null;
  currentPlanSlug: MarketplacePlanSlug | null;
  currentAccessLevel: AccessLevel | null;
  canAccessProduct: (product: { price: number }) => boolean;
  getCreditCost: (product: { price: number }) => number;
  isIncludedInPlan: (product: { price: number }) => boolean;
  getProductAccessInfo: (product: { price: number }) => ProductAccessInfo;
  hasEnoughCredits: (product: { price: number }) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  free: 0,
  standard: 1,
  premium: 2,
  all: 3,
};

function getRequiredAccessLevel(price: number): AccessLevel {
  if (price <= 0) return "free" as AccessLevel;
  if (price <= 50) return "standard" as AccessLevel;
  if (price <= 150) return "premium" as AccessLevel;
  return "all" as AccessLevel;
}

function calculateCreditCost(
  price: number,
  accessLevel?: AccessLevel | null,
): number {
  if (accessLevel === ("all" as AccessLevel)) return 0;
  if (price <= 0) return 0;
  if (price <= 25) return 1;
  if (price <= 75) return 2;
  if (price <= 150) return 3;
  return 5;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { data: credits, isLoading: creditsLoading } = useMyCreditBalance();

  const isSubscribed =
    !!subscription &&
    ["active", "trialing"].includes(subscription.status);
  const isLoading = subLoading || creditsLoading;
  const currentPlanId = subscription?.planId ?? null;
  const currentPlanSlug =
    (subscription?.plan?.slug as MarketplacePlanSlug) ?? null;
  const currentAccessLevel =
    (subscription?.plan?.accessLevel as AccessLevel) ?? null;

  const canAccessProduct = useCallback(
    (product: { price: number }) => {
      if (!isSubscribed || !currentAccessLevel) return false;
      const required = getRequiredAccessLevel(product.price);
      return (
        ACCESS_LEVEL_RANK[currentAccessLevel] >= ACCESS_LEVEL_RANK[required]
      );
    },
    [isSubscribed, currentAccessLevel],
  );

  const getCreditCost = useCallback(
    (product: { price: number }) =>
      calculateCreditCost(product.price, currentAccessLevel),
    [currentAccessLevel],
  );

  const isIncludedInPlan = useCallback(
    (product: { price: number }) => canAccessProduct(product),
    [canAccessProduct],
  );

  const hasEnoughCredits = useCallback(
    (product: { price: number }) => {
      if (!credits) return false;
      return (
        credits.remaining >=
        calculateCreditCost(product.price, currentAccessLevel)
      );
    },
    [credits, currentAccessLevel],
  );

  const getProductAccessInfo = useCallback(
    (product: { price: number }): ProductAccessInfo => {
      const included = canAccessProduct(product);
      const creditCost = getCreditCost(product);
      const requiresUpgrade = !included && product.price > 0;

      let suggestedPlan: MarketplacePlanSlug | undefined;
      if (requiresUpgrade) {
        const required = getRequiredAccessLevel(product.price);
        if (required === ("standard" as AccessLevel))
          suggestedPlan = "starter" as MarketplacePlanSlug;
        else if (required === ("premium" as AccessLevel))
          suggestedPlan = "professional" as MarketplacePlanSlug;
        else suggestedPlan = "enterprise" as MarketplacePlanSlug;
      }

      return {
        isIncluded: included,
        creditCost,
        requiresUpgrade,
        suggestedPlan,
      };
    },
    [canAccessProduct, getCreditCost],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      credits,
      isSubscribed,
      isLoading,
      currentPlanId,
      currentPlanSlug,
      currentAccessLevel,
      canAccessProduct,
      getCreditCost,
      isIncludedInPlan,
      getProductAccessInfo,
      hasEnoughCredits,
    }),
    [
      subscription,
      credits,
      isSubscribed,
      isLoading,
      currentPlanId,
      currentPlanSlug,
      currentAccessLevel,
      canAccessProduct,
      getCreditCost,
      isIncludedInPlan,
      getProductAccessInfo,
      hasEnoughCredits,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
