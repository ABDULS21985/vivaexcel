"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Backend response wrapper ────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
    status: string;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface DashboardOverview {
    totalViews: number;
    uniqueVisitors: number;
    totalPosts: number;
    totalSubscribers: number;
    subscriberGrowth: number;
    popularPosts: Array<{
        id: string;
        title: string;
        slug: string;
        views: number;
    }>;
}

export interface TopPost {
    id: string;
    title: string;
    slug: string;
    views: number;
    uniqueViews: number;
}

export interface TrafficSource {
    source: string;
    visits: number;
    percentage: number;
}

export interface PostStats {
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: string;
    topReferrers: TrafficSource[];
    dailyViews: Array<{ date: string; views: number }>;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const analyticsKeys = {
    all: ["analytics"] as const,
    dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
    topPosts: (period?: string) =>
        [...analyticsKeys.all, "top-posts", period] as const,
    trafficSources: (period?: string) =>
        [...analyticsKeys.all, "traffic-sources", period] as const,
    postStats: (id: string) =>
        [...analyticsKeys.all, "post-stats", id] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchDashboardOverview(): Promise<DashboardOverview> {
    const response =
        await apiClient.get<ApiResponseWrapper<DashboardOverview>>(
            "/analytics/dashboard",
        );
    return response.data;
}

async function fetchTopPosts(period?: string): Promise<TopPost[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) {
        params.period = period;
    }
    const response = await apiClient.get<ApiResponseWrapper<TopPost[]>>(
        "/analytics/top-posts",
        { params },
    );
    return response.data;
}

async function fetchTrafficSources(
    period?: string,
): Promise<TrafficSource[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) {
        params.period = period;
    }
    const response = await apiClient.get<ApiResponseWrapper<TrafficSource[]>>(
        "/analytics/traffic-sources",
        { params },
    );
    return response.data;
}

async function fetchPostStats(postId: string): Promise<PostStats> {
    const response = await apiClient.get<ApiResponseWrapper<PostStats>>(
        `/analytics/posts/${postId}/stats`,
    );
    return response.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAnalyticsDashboard() {
    return useQuery<DashboardOverview, ApiError>({
        queryKey: analyticsKeys.dashboard(),
        queryFn: fetchDashboardOverview,
    });
}

export function useTopPosts(period?: string) {
    return useQuery<TopPost[], ApiError>({
        queryKey: analyticsKeys.topPosts(period),
        queryFn: () => fetchTopPosts(period),
    });
}

export function useTrafficSources(period?: string) {
    return useQuery<TrafficSource[], ApiError>({
        queryKey: analyticsKeys.trafficSources(period),
        queryFn: () => fetchTrafficSources(period),
    });
}

export function usePostStats(postId: string) {
    return useQuery<PostStats, ApiError>({
        queryKey: analyticsKeys.postStats(postId),
        queryFn: () => fetchPostStats(postId),
        enabled: !!postId,
    });
}
