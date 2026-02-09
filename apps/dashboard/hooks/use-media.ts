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

// ─── Media Types ─────────────────────────────────────────────────────────────

export interface MediaAsset {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    alt?: string;
    title?: string;
    description?: string;
    folderId?: string | null;
    tags?: string[];
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface MediaFolder {
    id: string;
    name: string;
    slug?: string;
    parentId?: string | null;
    createdAt: string;
}

export interface MediaFilters {
    search?: string;
    type?: string;
    folderId?: string;
    cursor?: string;
    limit?: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const mediaKeys = {
    all: ["media"] as const,
    list: (filters?: MediaFilters) =>
        [...mediaKeys.all, "list", filters] as const,
    folders: () => [...mediaKeys.all, "folders"] as const,
    detail: (id: string) => [...mediaKeys.all, "detail", id] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchMediaList(
    filters?: MediaFilters,
): Promise<MediaAsset[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<MediaAsset[]>>(
        "/media",
        { params },
    );
    return response.data;
}

async function fetchMediaFolders(): Promise<MediaFolder[]> {
    const response = await apiClient.get<ApiResponseWrapper<MediaFolder[]>>(
        "/media/folders",
    );
    return response.data;
}

async function uploadMedia(formData: FormData): Promise<MediaAsset> {
    const response = await apiClient.upload<ApiResponseWrapper<MediaAsset>>(
        "/media/upload",
        formData,
    );
    return response.data;
}

async function updateMedia({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<MediaAsset> {
    const response = await apiClient.patch<ApiResponseWrapper<MediaAsset>>(
        `/media/${id}`,
        data,
    );
    return response.data;
}

async function deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${id}`);
}

async function createFolder(
    data: Record<string, unknown>,
): Promise<MediaFolder> {
    const response = await apiClient.post<ApiResponseWrapper<MediaFolder>>(
        "/media/folders",
        data,
    );
    return response.data;
}

async function deleteFolder(id: string): Promise<void> {
    await apiClient.delete(`/media/folders/${id}`);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useMediaList(filters?: MediaFilters) {
    return useQuery<MediaAsset[], ApiError>({
        queryKey: mediaKeys.list(filters),
        queryFn: () => fetchMediaList(filters),
    });
}

export function useMediaFolders() {
    return useQuery<MediaFolder[], ApiError>({
        queryKey: mediaKeys.folders(),
        queryFn: fetchMediaFolders,
    });
}

export function useUploadMedia() {
    const queryClient = useQueryClient();

    return useMutation<MediaAsset, ApiError, FormData>({
        mutationFn: (formData) => uploadMedia(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.all });
        },
    });
}

export function useUpdateMedia() {
    const queryClient = useQueryClient();

    return useMutation<
        MediaAsset,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateMedia(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.all });
            queryClient.invalidateQueries({
                queryKey: mediaKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteMedia() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteMedia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.all });
        },
    });
}

export function useCreateFolder() {
    const queryClient = useQueryClient();

    return useMutation<MediaFolder, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createFolder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.folders() });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteFolder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.folders() });
        },
    });
}
