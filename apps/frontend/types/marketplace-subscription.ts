export enum MarketplacePlanSlug {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum AccessLevel {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ALL = 'all',
}

export enum MarketplaceSubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum CreditTransactionType {
  CREDIT_GRANT = 'credit_grant',
  CREDIT_USED = 'credit_used',
  CREDIT_ROLLOVER = 'credit_rollover',
  CREDIT_EXPIRED = 'credit_expired',
  CREDIT_BONUS = 'credit_bonus',
  CREDIT_REFUND = 'credit_refund',
}

export interface MarketplacePlan {
  id: string;
  name: string;
  slug: MarketplacePlanSlug;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyCredits: number;
  rolloverCredits: boolean;
  maxRolloverCredits: number;
  simultaneousDownloads: number;
  accessLevel: AccessLevel;
  includedProductTypes: string[];
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  trialDays: number;
}

export interface MarketplaceSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: MarketplacePlan;
  stripeSubscriptionId?: string;
  status: MarketplaceSubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  creditsRemaining: number;
  creditsUsedThisPeriod: number;
  totalCreditsUsed: number;
  rolloverCreditsAmount: number;
  cancelAtPeriodEnd: boolean;
  pausedAt?: string;
  trialEndsAt?: string;
}

export interface CreditBalance {
  remaining: number;
  usedThisPeriod: number;
  total: number;
  rollover: number;
  periodEnd: string;
}

export interface CreditTransaction {
  id: string;
  type: CreditTransactionType;
  amount: number;
  balance: number;
  digitalProductId?: string;
  description?: string;
  createdAt: string;
}

export interface SubscriptionDownload {
  id: string;
  digitalProductId: string;
  digitalProduct?: {
    id: string;
    title: string;
    slug: string;
    featuredImage?: string;
    price: number;
  };
  creditsCost: number;
  downloadedAt: string;
  isActive: boolean;
}

export interface UsageAnalytics {
  creditsUsed: number;
  creditsRemaining: number;
  utilizationRate: number;
  estimatedSavings: number;
  downloadsThisPeriod: number;
}

export interface ProductAccessInfo {
  isIncluded: boolean;
  creditCost: number;
  requiresUpgrade: boolean;
  suggestedPlan?: MarketplacePlanSlug;
}
