export enum AffiliateStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum AffiliateTier {
  STANDARD = 'standard',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REVERSED = 'reversed',
}

export enum AffiliatePayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReferralStatus {
  PENDING = 'pending',
  SIGNUP_COMPLETE = 'signup_complete',
  FIRST_PURCHASE = 'first_purchase',
  REWARDED = 'rewarded',
}

export interface AffiliateProfile {
  id: string;
  userId: string;
  affiliateCode: string;
  customSlug?: string;
  status: AffiliateStatus;
  tier: AffiliateTier;
  commissionRate: number;
  lifetimeSales: number;
  lifetimeRevenue: number;
  lifetimeCommission: number;
  pendingBalance: number;
  paidBalance: number;
  stripeConnectAccountId?: string;
  stripeOnboardingComplete: boolean;
  payoutThreshold: number;
  payoutSchedule: string;
  bio?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  promotionMethods?: string[];
  applicationNote?: string;
  approvedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  digitalProductId?: string;
  shortCode: string;
  fullUrl: string;
  customCampaign?: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  isActive: boolean;
  createdAt: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  orderId: string;
  orderItemId: string;
  productId?: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: CommissionStatus;
  approvedAt?: string;
  paidAt?: string;
  flagged: boolean;
  createdAt: string;
  order?: {
    orderNumber: string;
  };
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  netAmount: number;
  status: AffiliatePayoutStatus;
  periodStart: string;
  periodEnd: string;
  commissionCount: number;
  processedAt?: string;
  createdAt: string;
}

export interface AffiliateStats {
  profile: AffiliateProfile;
  earnings: AffiliateEarnings;
  lifetimeSales: number;
  lifetimeRevenue: number;
  lifetimeCommission: number;
  pendingBalance: number;
  paidBalance: number;
  currentTier: AffiliateTier;
  commissionRate: number;
  nextTier: AffiliateTier | null;
  nextTierThreshold: number | null;
  progressToNextTier: number;
}

export interface AffiliateEarnings {
  pending: number;
  available: number;
  paid: number;
  total: number;
  paidBalance: number;
}

export interface StripeConnectStatus {
  complete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  referralCount: number;
  rewardEarned: number;
  isActive: boolean;
  shareUrl: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referralCodeId: string;
  status: ReferralStatus;
  referrerReward: number;
  referredReward: number;
  rewardedAt?: string;
  orderId?: string;
  createdAt: string;
  referredUser?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  rewardsEarned: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
