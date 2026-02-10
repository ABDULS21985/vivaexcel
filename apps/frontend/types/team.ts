// =============================================================================
// Team & Enterprise Workspace Types
// =============================================================================

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum TeamPlan {
  TEAM_STARTER = "team_starter",
  TEAM_PROFESSIONAL = "team_professional",
  TEAM_ENTERPRISE = "team_enterprise",
}

export enum TeamMemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

export enum TeamPurchaseStatus {
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum TeamLicenseStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface TeamMemberPermissions {
  canPurchase: boolean;
  canDownload: boolean;
  canManageMembers: boolean;
  canViewAnalytics: boolean;
  canApproveRequests: boolean;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  plan: TeamPlan;
  maxMembers: number;
  ownerId: string;
  billingEmail: string | null;
  billingAddress: Record<string, unknown> | null;
  ssoEnabled: boolean;
  ssoProvider: string | null;
  domainVerified: boolean;
  verifiedDomains: string[];
  sharedLibraryEnabled: boolean;
  purchaseApprovalRequired: boolean;
  monthlyBudget: number | null;
  currentMonthSpend: number;
  invoicingEnabled: boolean;
  isActive: boolean;
  owner?: TeamUser;
  createdAt: string;
  updatedAt: string;
}

export interface TeamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  permissions: TeamMemberPermissions;
  invitedBy: string | null;
  invitedAt: string | null;
  joinedAt: string;
  lastActiveAt: string | null;
  spendLimit: number | null;
  currentMonthSpend: number;
  user?: TeamUser;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamMemberRole;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  sentAt: string;
  acceptedAt: string | null;
}

export interface TeamPurchase {
  id: string;
  teamId: string;
  orderId: string | null;
  purchasedBy: string;
  approvedBy: string | null;
  status: TeamPurchaseStatus;
  requestNote: string | null;
  approvalNote: string | null;
  digitalProductId: string;
  amount: number;
  seatCount: number;
  digitalProduct?: {
    id: string;
    title: string;
    slug: string;
    featuredImage?: string;
    type: string;
  };
  createdAt: string;
}

export interface SharedLibraryItem {
  id: string;
  teamId: string;
  digitalProductId: string;
  addedBy: string;
  licenseId: string | null;
  accessCount: number;
  notes: string | null;
  tags: string[];
  digitalProduct?: {
    id: string;
    title: string;
    slug: string;
    featuredImage?: string;
    type: string;
    price: number;
  };
  createdAt: string;
}

export interface SeatActivation {
  memberId: string;
  activatedAt: string;
}

export interface TeamLicense {
  id: string;
  teamId: string;
  digitalProductId: string;
  licenseType: string;
  seatCount: number;
  usedSeats: number;
  licenseKey: string;
  activations: SeatActivation[];
  expiresAt: string | null;
  status: TeamLicenseStatus;
  digitalProduct?: {
    id: string;
    title: string;
    slug: string;
    type: string;
  };
  createdAt: string;
}

export interface VolumeDiscount {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  discountPercentage: number;
  applicableTo: "all" | "specific_products" | "specific_categories";
  applicableIds: string[];
  isActive: boolean;
}

export interface VolumeCalculation {
  unitPrice: number;
  quantity: number;
  discountPercentage: number;
  discountedUnitPrice: number;
  totalPrice: number;
  savings: number;
}

export interface TeamStats {
  memberCount: number;
  maxMembers: number;
  plan: TeamPlan;
  monthlyBudget: number | null;
  currentMonthSpend: number;
  remainingBudget: number | null;
  sharedLibraryEnabled: boolean;
  purchaseApprovalRequired: boolean;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponseWrapper<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  meta?: {
    total?: number;
    limit?: number;
    nextCursor?: string;
    previousCursor?: string;
  };
}
