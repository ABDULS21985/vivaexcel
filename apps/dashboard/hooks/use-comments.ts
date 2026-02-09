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

// ─── Comment Types ───────────────────────────────────────────────────────────

export interface Comment {
    id: string;
    postId: string;
    parentId?: string | null;
    authorId?: string | null;
    authorName?: string;
    authorEmail?: string;
    content: string;
    status: "pending" | "approved" | "rejected" | "spam";
    ipAddress?: string;
    createdAt: string;
    updatedAt: string;
    post?: { id: string; title: string; slug: string };
    author?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    replies?: Comment[];
}

export interface CommentFilters {
    status?: string;
    limit?: number;
    cursor?: string;
    search?: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const commentKeys = {
    all: ["comments"] as const,
    list: (filters?: CommentFilters) =>
        [...commentKeys.all, "list", filters] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchAllComments(
    filters?: CommentFilters,
): Promise<Comment[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<Comment[]>>(
        "/blog/comments",
        { params },
    );
    return response.data;
}

async function approveComment({
    postId,
    commentId,
}: {
    postId: string;
    commentId: string;
}): Promise<Comment> {
    const response = await apiClient.post<ApiResponseWrapper<Comment>>(
        `/blog/posts/${postId}/comments/${commentId}/approve`,
    );
    return response.data;
}

async function rejectComment({
    postId,
    commentId,
}: {
    postId: string;
    commentId: string;
}): Promise<Comment> {
    const response = await apiClient.post<ApiResponseWrapper<Comment>>(
        `/blog/posts/${postId}/comments/${commentId}/reject`,
    );
    return response.data;
}

async function spamComment({
    postId,
    commentId,
}: {
    postId: string;
    commentId: string;
}): Promise<Comment> {
    const response = await apiClient.post<ApiResponseWrapper<Comment>>(
        `/blog/posts/${postId}/comments/${commentId}/spam`,
    );
    return response.data;
}

async function deleteComment({
    postId,
    commentId,
}: {
    postId: string;
    commentId: string;
}): Promise<void> {
    await apiClient.delete(
        `/blog/posts/${postId}/comments/${commentId}`,
    );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAllComments(filters?: CommentFilters) {
    return useQuery<Comment[], ApiError>({
        queryKey: commentKeys.list(filters),
        queryFn: () => fetchAllComments(filters),
    });
}

export function useApproveComment() {
    const queryClient = useQueryClient();

    return useMutation<
        Comment,
        ApiError,
        { postId: string; commentId: string }
    >({
        mutationFn: (variables) => approveComment(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.all });
        },
    });
}

export function useRejectComment() {
    const queryClient = useQueryClient();

    return useMutation<
        Comment,
        ApiError,
        { postId: string; commentId: string }
    >({
        mutationFn: (variables) => rejectComment(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.all });
        },
    });
}

export function useSpamComment() {
    const queryClient = useQueryClient();

    return useMutation<
        Comment,
        ApiError,
        { postId: string; commentId: string }
    >({
        mutationFn: (variables) => spamComment(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.all });
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        ApiError,
        { postId: string; commentId: string }
    >({
        mutationFn: (variables) => deleteComment(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.all });
        },
    });
}
