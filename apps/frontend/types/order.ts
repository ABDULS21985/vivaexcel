// =============================================================================
// Order Types
// =============================================================================
// Frontend types for orders and checkout, based on backend entities.

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// -----------------------------------------------------------------------------
// Core Types
// -----------------------------------------------------------------------------

export interface DownloadToken {
  id: string;
  token: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  productSlug: string;
  price: number;
  currency: string;
  variantId?: string;
  digitalProductId: string;
  downloadTokens?: DownloadToken[];
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  billingEmail: string;
  billingName?: string;
  completedAt?: string;
  createdAt: string;
  items: OrderItem[];
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface OrdersResponse {
  items: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CheckoutSuccessResponse {
  order: Order;
}

// -----------------------------------------------------------------------------
// Display Helpers
// -----------------------------------------------------------------------------

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.COMPLETED]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [OrderStatus.PENDING]:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  [OrderStatus.PROCESSING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [OrderStatus.FAILED]:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [OrderStatus.REFUNDED]:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-700/30 dark:text-neutral-400",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.FAILED]: "Failed",
  [OrderStatus.REFUNDED]: "Refunded",
};
