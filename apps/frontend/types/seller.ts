export enum SellerStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  IDENTITY_VERIFIED = 'identity_verified',
  BUSINESS_VERIFIED = 'business_verified',
}

export enum PayoutSchedule {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface SellerProfile {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  stripeOnboardingComplete: boolean;
  commissionRate: number;
  status: SellerStatus;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  verificationStatus: VerificationStatus;
  payoutSchedule: PayoutSchedule;
  minimumPayout: number;
  specialties?: string[];
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SellerPayout {
  id: string;
  sellerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  netAmount: number;
  stripeTransferId?: string;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  itemCount: number;
  failureReason?: string;
  createdAt: string;
}

export interface SellerApplication {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  portfolioUrls?: string[];
  experienceDescription?: string;
  productCategories?: string[];
  sampleWorkUrls?: string[];
  specialties?: string[];
  applicationNote?: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface SellerEarnings {
  totalRevenue: number;
  totalSales: number;
  pendingPayout: number;
  commissionRate: number;
  averageRating: number;
}

export interface StripeConnectStatus {
  complete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: 'Unverified',
  [VerificationStatus.IDENTITY_VERIFIED]: 'Identity Verified',
  [VerificationStatus.BUSINESS_VERIFIED]: 'Business Verified',
};

export const VERIFICATION_COLORS: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: 'bg-zinc-100 text-zinc-700',
  [VerificationStatus.IDENTITY_VERIFIED]: 'bg-blue-100 text-blue-700',
  [VerificationStatus.BUSINESS_VERIFIED]: 'bg-green-100 text-green-700',
};

export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  [SellerStatus.PENDING_REVIEW]: 'Pending Review',
  [SellerStatus.APPROVED]: 'Approved',
  [SellerStatus.SUSPENDED]: 'Suspended',
  [SellerStatus.REJECTED]: 'Rejected',
};

export const SELLER_STATUS_COLORS: Record<SellerStatus, string> = {
  [SellerStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-700',
  [SellerStatus.APPROVED]: 'bg-green-100 text-green-700',
  [SellerStatus.SUSPENDED]: 'bg-red-100 text-red-700',
  [SellerStatus.REJECTED]: 'bg-zinc-100 text-zinc-700',
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: 'Pending',
  [PayoutStatus.PROCESSING]: 'Processing',
  [PayoutStatus.COMPLETED]: 'Completed',
  [PayoutStatus.FAILED]: 'Failed',
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [PayoutStatus.PROCESSING]: 'bg-blue-100 text-blue-700',
  [PayoutStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [PayoutStatus.FAILED]: 'bg-red-100 text-red-700',
};
