"use client";

import * as React from "react";
import { cn, Badge } from "@ktblog/ui/components";
import {
    BookOpen,
    Clock,
    Hash,
    TrendingUp,
    MessageSquare,
    Lightbulb,
    BarChart3,
    Smile,
    Meh,
    Frown,
} from "lucide-react";
import type { ContentAnalysis } from "../../hooks/use-ai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContentAnalysisCardProps {
    /** The content analysis data from the AI service */
    analysis: ContentAnalysis;
    className?: string;
}

// ─── Helper: Gauge Component ─────────────────────────────────────────────────

function Gauge({
    value,
    max,
    label,
    color,
}: {
    value: number;
    max: number;
    label: string;
    color: string;
}) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {label}
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {value}
                    {max === 100 ? "/100" : ""}
                </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        color
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// ─── Helper: Stat Card ───────────────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    sublabel,
    className,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sublabel?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3",
                className
            )}
        >
            <div className="h-9 w-9 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {label}
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {value}
                </p>
                {sublabel && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {sublabel}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Helper: Readability Score ───────────────────────────────────────────────

function getReadabilityLabel(score: number): string {
    if (score >= 80) return "Very Easy";
    if (score >= 60) return "Easy";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Difficult";
    return "Very Difficult";
}

function getReadabilityColor(score: number): string {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-emerald-400";
    if (score >= 40) return "bg-amber-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
}

// ─── Helper: Sentiment Display ───────────────────────────────────────────────

function SentimentDisplay({ score }: { score: number }) {
    const getSentimentInfo = () => {
        if (score > 0.3)
            return {
                label: "Positive",
                icon: <Smile className="h-4 w-4 text-emerald-500" />,
                color: "text-emerald-500",
            };
        if (score < -0.3)
            return {
                label: "Negative",
                icon: <Frown className="h-4 w-4 text-red-500" />,
                color: "text-red-500",
            };
        return {
            label: "Neutral",
            icon: <Meh className="h-4 w-4 text-amber-500" />,
            color: "text-amber-500",
        };
    };

    const info = getSentimentInfo();

    return (
        <div className="flex items-center gap-2">
            {info.icon}
            <div>
                <p className={cn("text-sm font-semibold", info.color)}>
                    {info.label}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Score: {score.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ContentAnalysisCard({
    analysis,
    className,
}: ContentAnalysisCardProps) {
    const {
        readabilityScore,
        wordCount,
        estimatedReadTime,
        sentimentScore,
        keyTopics,
        suggestions,
    } = analysis;

    return (
        <div
            className={cn(
                "rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Content Analysis
                </h3>
            </div>

            <div className="p-4 space-y-5">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <StatCard
                        icon={
                            <Hash className="h-4 w-4 text-primary" />
                        }
                        label="Word Count"
                        value={wordCount.toLocaleString()}
                        sublabel={
                            wordCount < 300
                                ? "Too short"
                                : wordCount < 800
                                  ? "Short"
                                  : wordCount < 1500
                                    ? "Medium"
                                    : "Long-form"
                        }
                    />
                    <StatCard
                        icon={
                            <Clock className="h-4 w-4 text-indigo-500" />
                        }
                        label="Read Time"
                        value={`${estimatedReadTime} min`}
                        sublabel="Avg. reading speed"
                    />
                </div>

                {/* Readability */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Readability
                            </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                            {getReadabilityLabel(readabilityScore)}
                        </span>
                    </div>
                    <Gauge
                        value={readabilityScore}
                        max={100}
                        label="Flesch Reading Ease"
                        color={getReadabilityColor(readabilityScore)}
                    />
                </div>

                {/* Sentiment */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Sentiment
                        </span>
                    </div>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
                        <SentimentDisplay score={sentimentScore} />
                    </div>
                </div>

                {/* Key Topics */}
                {keyTopics.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Key Topics
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {keyTopics.map((topic, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-[11px] px-2 py-0.5"
                                >
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Improvement Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Suggestions
                            </span>
                        </div>
                        <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-amber-50/50 dark:bg-amber-900/10 p-3"
                                >
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-px shrink-0">
                                        {index + 1}
                                    </span>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ContentAnalysisCard;
