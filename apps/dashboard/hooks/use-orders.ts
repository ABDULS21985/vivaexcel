"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Backend response wrapper ────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
    status: string;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
}

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
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    metadata?: Record<string, unknown>;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface OrderFilters {
    status?: string;
    search?: string;
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    dateFrom?: string;
    dateTo?: string;
}

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface OrdersData {
    items: Order[];
    meta: CursorMeta;
}

interface OrderStatsData {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    refundedOrders: number;
    currency: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
    stats: () => [...orderKeys.all, "stats"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchOrders(filters?: OrderFilters): Promise<OrdersData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<OrdersData>>(
        "/admin/orders",
        { params }
    );
    return response.data;
}

async function fetchOrder(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponseWrapper<Order>>(
        `/admin/orders/${id}`
    );
    return response.data;
}

async function fetchOrderStats(): Promise<OrderStatsData> {
    const response = await apiClient.get<ApiResponseWrapper<OrderStatsData>>(
        "/admin/orders/stats"
    );
    return response.data;
}

async function refundOrder(id: string): Promise<Order> {
    const response = await apiClient.post<ApiResponseWrapper<Order>>(
        `/admin/orders/${id}/refund`
    );
    return response.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of orders.
 */
export function useOrders(filters?: OrderFilters) {
    return useQuery<OrdersData, ApiError>({
        queryKey: orderKeys.list(filters),
        queryFn: () => fetchOrders(filters),
    });
}

/**
 * Fetch a single order by ID.
 */
export function useOrder(id: string) {
    return useQuery<Order, ApiError>({
        queryKey: orderKeys.detail(id),
        queryFn: () => fetchOrder(id),
        enabled: !!id,
    });
}

/**
 * Fetch order stats for the admin dashboard.
 */
export function useOrderStats() {
    return useQuery<OrderStatsData, ApiError>({
        queryKey: orderKeys.stats(),
        queryFn: fetchOrderStats,
        staleTime: 60 * 1000,
    });
}

/**
 * Refund an order.
 */
export function useRefundOrder() {
    const queryClient = useQueryClient();

    return useMutation<Order, ApiError, string>({
        mutationFn: (id) => refundOrder(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: orderKeys.stats(),
            });
        },
    });
}
