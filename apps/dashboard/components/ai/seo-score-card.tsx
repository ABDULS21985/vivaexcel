"use client";

import * as React from "react";
import { cn } from "@digibit/ui/components";
import {
    CheckCircle2,
    Circle,
    AlertTriangle,
    XCircle,
    TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SeoScoreCardProps {
    /** SEO score from 0-100 */
    score: number;
    /** Improvement suggestions from AI analysis */
    suggestions: string[];
    /** SEO checklist items (optional, for detailed view) */
    checklist?: SeoChecklistItem[];
    className?: string;
}

export interface SeoChecklistItem {
    category: string;
    label: string;
    passed: boolean;
    description?: string;
}

// ─── Score Color Helpers ─────────────────────────────────────────────────────

function getScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
}

function getScoreTrackColor(score: number): string {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-red-500";
}

function getScoreBgColor(score: number): string {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
}

function getScoreLabel(score: number): string {
    if (score >= 80) return "Good";
    if (score >= 50) return "Needs Work";
    return "Poor";
}

function getScoreIcon(score: number) {
    if (score >= 80)
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (score >= 50)
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
}

// ─── Circular Progress Component ─────────────────────────────────────────────

function CircularProgress({
    score,
    size = 100,
    strokeWidth = 8,
}: {
    score: number;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-zinc-200 dark:text-zinc-700"
                />
                {/* Progress track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn(
                        getScoreTrackColor(score),
                        "transition-all duration-700 ease-out"
                    )}
                />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className={cn(
                        "text-2xl font-bold",
                        getScoreColor(score)
                    )}
                >
                    {score}
                </span>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    SEO
                </span>
            </div>
        </div>
    );
}

// ─── Default Checklist Generator ─────────────────────────────────────────────

function generateDefaultChecklist(
    score: number,
    suggestions: string[]
): SeoChecklistItem[] {
    const items: SeoChecklistItem[] = [
        {
            category: "Title",
            label: "Title is between 40-70 characters",
            passed: score >= 50,
            description: "Optimal title length for search engines",
        },
        {
            category: "Meta Description",
            label: "Meta description is present",
            passed: score >= 40,
            description: "Helps search engines understand your content",
        },
        {
            category: "Content Length",
            label: "Content has 800+ words",
            passed: score >= 60,
            description:
                "Longer content tends to rank higher in search results",
        },
        {
            category: "Headings",
            label: "Content uses H2 and H3 headings",
            passed: score >= 55,
            description: "Proper heading structure improves readability and SEO",
        },
        {
            category: "Images",
            label: "Images have alt text",
            passed: score >= 70,
            description: "Alt text improves accessibility and image SEO",
        },
        {
            category: "Internal Links",
            label: "Contains internal links",
            passed: score >= 65,
            description: "Internal links help search engines crawl your site",
        },
    ];

    // Mark items as failing if there are related suggestions
    const lowerSuggestions = suggestions.map((s) => s.toLowerCase());

    items.forEach((item) => {
        const categoryLower = item.category.toLowerCase();
        if (
            lowerSuggestions.some(
                (s) =>
                    s.includes(categoryLower) ||
                    s.includes(item.label.toLowerCase())
            )
        ) {
            item.passed = false;
        }
    });

    return items;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SeoScoreCard({
    score,
    suggestions,
    checklist,
    className,
}: SeoScoreCardProps) {
    const items = checklist || generateDefaultChecklist(score, suggestions);
    const passedCount = items.filter((item) => item.passed).length;

    return (
        <div
            className={cn(
                "rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden",
                className
            )}
        >
            {/* Header with score */}
            <div
                className={cn(
                    "flex items-center gap-4 p-4",
                    getScoreBgColor(score)
                )}
            >
                <CircularProgress score={score} size={80} strokeWidth={6} />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {getScoreIcon(score)}
                        <span
                            className={cn(
                                "text-sm font-semibold",
                                getScoreColor(score)
                            )}
                        >
                            {getScoreLabel(score)}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {passedCount} of {items.length} SEO checks passed
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <TrendingUp className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-400">
                            Score: {score}/100
                        </span>
                    </div>
                </div>
            </div>

            {/* Checklist */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 px-4 py-3"
                    >
                        <div className="mt-0.5 shrink-0">
                            {item.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        item.passed
                                            ? "text-zinc-700 dark:text-zinc-300"
                                            : "text-zinc-400 dark:text-zinc-500"
                                    )}
                                >
                                    {item.label}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 shrink-0">
                                    {item.category}
                                </span>
                            </div>
                            {item.description && (
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                    <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Improvement Suggestions
                    </h4>
                    <ul className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                            >
                                <span className="text-primary mt-0.5 shrink-0">
                                    {index + 1}.
                                </span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SeoScoreCard;
