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

// ─── Newsletter Types ────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
    id: string;
    email: string;
    name?: string;
    status: "active" | "pending" | "unsubscribed";
    subscribedAt: string;
    confirmedAt?: string;
    createdAt: string;
}

export interface NewsletterStats {
    totalSubscribers: number;
    activeSubscribers: number;
    pendingSubscribers: number;
    unsubscribedCount: number;
    recentSubscriptions: number;
}

export interface SubscriberFilters {
    search?: string;
    status?: string;
    cursor?: string;
    limit?: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const newsletterKeys = {
    all: ["newsletter"] as const,
    subscribers: (filters?: SubscriberFilters) =>
        [...newsletterKeys.all, "subscribers", filters] as const,
    stats: () => [...newsletterKeys.all, "stats"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchSubscribers(
    filters?: SubscriberFilters,
): Promise<NewsletterSubscriber[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<
        ApiResponseWrapper<NewsletterSubscriber[]>
    >("/newsletter/subscribers", { params });
    return response.data;
}

async function fetchNewsletterStats(): Promise<NewsletterStats> {
    const response = await apiClient.get<ApiResponseWrapper<NewsletterStats>>(
        "/newsletter/stats",
    );
    return response.data;
}

async function sendNewsletter({ id }: { id: string }): Promise<void> {
    await apiClient.post(`/newsletter/send/${id}`);
}

async function scheduleNewsletter({
    id,
    scheduledAt,
}: {
    id: string;
    scheduledAt: string;
}): Promise<void> {
    await apiClient.post(`/newsletter/schedule/${id}`, { scheduledAt });
}

async function testNewsletter({ id }: { id: string }): Promise<void> {
    await apiClient.post(`/newsletter/test/${id}`);
}

async function deleteSubscriber({ id }: { id: string }): Promise<void> {
    await apiClient.delete(`/newsletter/subscribers/${id}`);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useNewsletterSubscribers(filters?: SubscriberFilters) {
    return useQuery<NewsletterSubscriber[], ApiError>({
        queryKey: newsletterKeys.subscribers(filters),
        queryFn: () => fetchSubscribers(filters),
    });
}

export function useNewsletterStats() {
    return useQuery<NewsletterStats, ApiError>({
        queryKey: newsletterKeys.stats(),
        queryFn: fetchNewsletterStats,
    });
}

export function useSendNewsletter() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, { id: string }>({
        mutationFn: (variables) => sendNewsletter(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
        },
    });
}

export function useScheduleNewsletter() {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        ApiError,
        { id: string; scheduledAt: string }
    >({
        mutationFn: (variables) => scheduleNewsletter(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
        },
    });
}

export function useTestNewsletter() {
    return useMutation<void, ApiError, { id: string }>({
        mutationFn: (variables) => testNewsletter(variables),
    });
}

export function useDeleteSubscriber() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, { id: string }>({
        mutationFn: (variables) => deleteSubscriber(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: newsletterKeys.subscribers(),
            });
        },
    });
}
