// =============================================================================
// Digital Asset Delivery Types
// =============================================================================
// Frontend types for download links, licenses, product updates, and analytics.

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum DownloadLinkStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  EXHAUSTED = "exhausted",
}

export enum LicenseType {
  PERSONAL = "personal",
  COMMERCIAL = "commercial",
  EXTENDED = "extended",
  ENTERPRISE = "enterprise",
  UNLIMITED = "unlimited",
}

export enum LicenseStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

// -----------------------------------------------------------------------------
// Download Link Types
// -----------------------------------------------------------------------------

export interface DownloadLink {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  digitalProductId: string;
  variantId?: string;
  token: string;
  shortCode: string;
  status: DownloadLinkStatus;
  maxDownloads: number;
  downloadCount: number;
  expiresAt: string;
  lastDownloadedAt?: string;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    type: string;
    featuredImage?: string;
    version?: number;
  };
  order?: {
    id: string;
    orderNumber: string;
    completedAt?: string;
  };
  latestUpdate?: ProductUpdateInfo;
}

// -----------------------------------------------------------------------------
// Download Log
// -----------------------------------------------------------------------------

export interface DownloadLogEntry {
  id: string;
  downloadLinkId: string;
  ipAddress: string;
  country?: string;
  fileVersion?: string;
  bytesTransferred: number;
  completedSuccessfully: boolean;
  downloadedAt: string;
}

// -----------------------------------------------------------------------------
// License Types
// -----------------------------------------------------------------------------

export interface License {
  id: string;
  userId: string;
  digitalProductId: string;
  orderId: string;
  licenseKey: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  activationCount: number;
  maxActivations: number;
  activatedDomains: string[];
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    type: string;
    featuredImage?: string;
  };
  activations?: LicenseActivation[];
}

export interface LicenseActivation {
  id: string;
  licenseId: string;
  domain?: string;
  machineId?: string;
  ipAddress: string;
  activatedAt: string;
  deactivatedAt?: string;
  isActive: boolean;
}

export interface LicenseValidationResult {
  valid: boolean;
  product?: string;
  type?: string;
  features?: string[];
  message?: string;
}

// -----------------------------------------------------------------------------
// Product Update Types
// -----------------------------------------------------------------------------

export interface ProductUpdateInfo {
  id: string;
  digitalProductId: string;
  version: string;
  releaseNotes: string;
  fileId?: string;
  isBreaking: boolean;
  publishedAt: string;
  notifiedBuyers: boolean;
}

export interface UserProductUpdate {
  product: {
    id: string;
    title: string;
    slug: string;
    featuredImage?: string;
  };
  currentVersion?: string;
  updates: ProductUpdateInfo[];
}

// -----------------------------------------------------------------------------
// Download Analytics (admin)
// -----------------------------------------------------------------------------

export interface DownloadAnalytics {
  totalDownloads: number;
  totalBandwidth: number;
  downloadsByProduct: {
    productId: string;
    productTitle: string;
    count: number;
  }[];
  downloadsByCountry: { country: string; count: number }[];
  recentDownloads: DownloadLogEntry[];
}

// -----------------------------------------------------------------------------
// API Response Wrappers (reuse from digital-product types)
// -----------------------------------------------------------------------------

export interface DeliveryApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface DeliveryCursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedDeliveryResponse<T> {
  items: T[];
  meta: DeliveryCursorMeta;
}

// -----------------------------------------------------------------------------
// Display Helpers
// -----------------------------------------------------------------------------

export const licenseTypeLabels: Record<LicenseType, string> = {
  [LicenseType.PERSONAL]: "Personal",
  [LicenseType.COMMERCIAL]: "Commercial",
  [LicenseType.EXTENDED]: "Extended",
  [LicenseType.ENTERPRISE]: "Enterprise",
  [LicenseType.UNLIMITED]: "Unlimited",
};

export const licenseTypeColors: Record<LicenseType, string> = {
  [LicenseType.PERSONAL]: "bg-blue-100 text-blue-800",
  [LicenseType.COMMERCIAL]: "bg-green-100 text-green-800",
  [LicenseType.EXTENDED]: "bg-purple-100 text-purple-800",
  [LicenseType.ENTERPRISE]: "bg-orange-100 text-orange-800",
  [LicenseType.UNLIMITED]: "bg-amber-100 text-amber-800",
};

export const licenseStatusColors: Record<LicenseStatus, string> = {
  [LicenseStatus.ACTIVE]: "bg-green-100 text-green-800",
  [LicenseStatus.SUSPENDED]: "bg-yellow-100 text-yellow-800",
  [LicenseStatus.REVOKED]: "bg-red-100 text-red-800",
  [LicenseStatus.EXPIRED]: "bg-gray-100 text-gray-800",
};

export const licenseStatusLabels: Record<LicenseStatus, string> = {
  [LicenseStatus.ACTIVE]: "Active",
  [LicenseStatus.SUSPENDED]: "Suspended",
  [LicenseStatus.REVOKED]: "Revoked",
  [LicenseStatus.EXPIRED]: "Expired",
};

export const downloadLinkStatusColors: Record<DownloadLinkStatus, string> = {
  [DownloadLinkStatus.ACTIVE]: "bg-green-100 text-green-800",
  [DownloadLinkStatus.EXPIRED]: "bg-gray-100 text-gray-800",
  [DownloadLinkStatus.REVOKED]: "bg-red-100 text-red-800",
  [DownloadLinkStatus.EXHAUSTED]: "bg-yellow-100 text-yellow-800",
};

export const downloadLinkStatusLabels: Record<DownloadLinkStatus, string> = {
  [DownloadLinkStatus.ACTIVE]: "Active",
  [DownloadLinkStatus.EXPIRED]: "Expired",
  [DownloadLinkStatus.REVOKED]: "Revoked",
  [DownloadLinkStatus.EXHAUSTED]: "Exhausted",
};
