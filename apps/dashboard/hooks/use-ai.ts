"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContentAnalysis {
    readabilityScore: number;
    wordCount: number;
    estimatedReadTime: number;
    sentimentScore: number;
    keyTopics: string[];
    seoScore: number;
    suggestions: string[];
}

export type WritingTone = "professional" | "casual" | "technical";

interface AiTitlesResponse {
    status: string;
    message: string;
    data: { titles: string[] };
}

interface AiTextResponse {
    status: string;
    message: string;
    data: { text: string };
}

interface AiAnalysisResponse {
    status: string;
    message: string;
    data: { analysis: ContentAnalysis };
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function generateTitles(content: string): Promise<string[]> {
    const response = await apiClient.post<AiTitlesResponse>("/ai/titles", {
        content,
    });
    return response.data.titles;
}

async function generateMetaDescription(
    title: string,
    content: string
): Promise<string> {
    const response = await apiClient.post<AiTextResponse>(
        "/ai/meta-description",
        { title, content }
    );
    return response.data.text;
}

async function generateExcerpt(
    content: string,
    maxLength?: number
): Promise<string> {
    const response = await apiClient.post<AiTextResponse>("/ai/excerpt", {
        content,
        maxLength,
    });
    return response.data.text;
}

async function generateOutline(
    topic: string,
    keywords?: string[]
): Promise<string> {
    const response = await apiClient.post<AiTextResponse>("/ai/outline", {
        topic,
        keywords,
    });
    return response.data.text;
}

async function analyzeContent(content: string): Promise<ContentAnalysis> {
    const response = await apiClient.post<AiAnalysisResponse>("/ai/analyze", {
        content,
    });
    return response.data.analysis;
}

async function improveText(
    text: string,
    tone?: WritingTone
): Promise<string> {
    const response = await apiClient.post<AiTextResponse>("/ai/improve", {
        text,
        tone,
    });
    return response.data.text;
}

async function generateAltText(imageDescription: string): Promise<string> {
    const response = await apiClient.post<AiTextResponse>("/ai/alt-text", {
        imageDescription,
    });
    return response.data.text;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook to generate title suggestions for blog content.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useGenerateTitles();
 * mutate("My blog content...");
 * ```
 */
export function useGenerateTitles() {
    return useMutation<string[], ApiError, string>({
        mutationFn: (content: string) => generateTitles(content),
    });
}

/**
 * Hook to generate an SEO meta description.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useGenerateMetaDescription();
 * mutate({ title: "My Title", content: "My content..." });
 * ```
 */
export function useGenerateMetaDescription() {
    return useMutation<
        string,
        ApiError,
        { title: string; content: string }
    >({
        mutationFn: ({ title, content }) =>
            generateMetaDescription(title, content),
    });
}

/**
 * Hook to generate an excerpt from blog content.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useGenerateExcerpt();
 * mutate({ content: "My content...", maxLength: 160 });
 * ```
 */
export function useGenerateExcerpt() {
    return useMutation<
        string,
        ApiError,
        { content: string; maxLength?: number }
    >({
        mutationFn: ({ content, maxLength }) =>
            generateExcerpt(content, maxLength),
    });
}

/**
 * Hook to generate an article outline for a given topic.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useGenerateOutline();
 * mutate({ topic: "NestJS Best Practices", keywords: ["NestJS", "TypeScript"] });
 * ```
 */
export function useGenerateOutline() {
    return useMutation<
        string,
        ApiError,
        { topic: string; keywords?: string[] }
    >({
        mutationFn: ({ topic, keywords }) =>
            generateOutline(topic, keywords),
    });
}

/**
 * Hook to analyze blog content for readability, SEO, and more.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useAnalyzeContent();
 * mutate("My blog content...");
 * ```
 */
export function useAnalyzeContent() {
    return useMutation<ContentAnalysis, ApiError, string>({
        mutationFn: (content: string) => analyzeContent(content),
    });
}

/**
 * Hook to improve text in a specified tone.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useImproveText();
 * mutate({ text: "My text...", tone: "professional" });
 * ```
 */
export function useImproveText() {
    return useMutation<
        string,
        ApiError,
        { text: string; tone?: WritingTone }
    >({
        mutationFn: ({ text, tone }) => improveText(text, tone),
    });
}

/**
 * Hook to generate accessible alt text for an image.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending, error } = useGenerateAltText();
 * mutate("A photo of a sunset over the ocean");
 * ```
 */
export function useGenerateAltText() {
    return useMutation<string, ApiError, string>({
        mutationFn: (imageDescription: string) =>
            generateAltText(imageDescription),
    });
}
