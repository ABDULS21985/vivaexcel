"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type IntegrationCategory =
    | "payments"
    | "identity"
    | "channels"
    | "cloud"
    | "ai"
    | "analytics"
    | "security"
    | "enterprise"
    | "blockchain"
    | "other";

export interface Integration {
    id: string;
    name: string;
    description?: string;
    category: IntegrationCategory;
    logo?: string;
    initials?: string;
    url?: string;
    featured?: boolean;
}

interface IntegrationShowcaseProps {
    integrations: Integration[];
    title?: string;
    subtitle?: string;
    accentColor?: string;
    showCategories?: boolean;
    compact?: boolean;
    className?: string;
}

/* ------------------------------------------------------------------ */
/* Category configuration                                              */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<IntegrationCategory, { label: string; color: string }> = {
    payments: { label: "Payments", color: "#10B981" },
    identity: { label: "Identity", color: "#8B5CF6" },
    channels: { label: "Channels", color: "#3B82F6" },
    cloud: { label: "Cloud", color: "#0EA5E9" },
    ai: { label: "AI", color: "#F59E0B" },
    analytics: { label: "Analytics", color: "#EC4899" },
    security: { label: "Security", color: "#EF4444" },
    enterprise: { label: "Enterprise", color: "#6366F1" },
    blockchain: { label: "Blockchain", color: "#14B8A6" },
    other: { label: "Other", color: "#6B7280" },
};

/* ------------------------------------------------------------------ */
/* IntegrationCard Component                                           */
/* ------------------------------------------------------------------ */

function IntegrationCard({
    integration,
    accentColor,
    compact,
    index,
}: {
    integration: Integration;
    accentColor: string;
    compact: boolean;
    index: number;
}) {
    const categoryInfo = categoryConfig[integration.category];

    const CardContent = (
        <div
            className={`
                group relative overflow-hidden rounded-xl
                bg-white border border-neutral-100
                shadow-sm hover:shadow-lg
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:border-neutral-200
                ${compact ? "p-4" : "p-5"}
                animate-fade-in-up
            `}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className="flex items-center gap-3">
                {/* Logo / Initials */}
                <div
                    className={`
                        relative flex-shrink-0 overflow-hidden
                        transition-all duration-300
                        ${compact ? "w-10 h-10" : "w-12 h-12"}
                        rounded-xl bg-neutral-50
                        flex items-center justify-center
                        group-hover:scale-105
                    `}
                >
                    {integration.logo ? (
                        <Image
                            src={integration.logo}
                            alt={integration.name}
                            fill
                            className="object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                    ) : (
                        <span
                            className="text-sm font-bold grayscale group-hover:grayscale-0 transition-all duration-300"
                            style={{ color: categoryInfo.color }}
                        >
                            {integration.initials || integration.name.substring(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-900 truncate text-sm">
                            {integration.name}
                        </h4>
                        {integration.featured && (
                            <Check
                                className="h-4 w-4 flex-shrink-0"
                                style={{ color: accentColor }}
                            />
                        )}
                    </div>
                    {!compact && integration.description && (
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {integration.description}
                        </p>
                    )}
                </div>

                {/* Category badge */}
                <span
                    className={`
                        flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium
                        transition-all duration-300
                        group-hover:scale-105
                    `}
                    style={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                    }}
                >
                    {categoryInfo.label}
                </span>

                {/* External link indicator */}
                {integration.url && (
                    <ExternalLink
                        className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
                    />
                )}
            </div>

            {/* Hover accent line */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: categoryInfo.color }}
            />
        </div>
    );

    if (integration.url) {
        return (
            <Link href={integration.url} target="_blank" rel="noopener noreferrer">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}

/* ------------------------------------------------------------------ */
/* IntegrationShowcase Component                                       */
/* ------------------------------------------------------------------ */

export function IntegrationShowcase({
    integrations,
    title = "Works With",
    subtitle,
    accentColor = "#2563EB",
    showCategories = true,
    compact = false,
    className = "",
}: IntegrationShowcaseProps) {
    const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "all">("all");

    // Get unique categories from integrations
    const categories = Array.from(
        new Set(integrations.map((i) => i.category))
    );

    // Filter integrations based on active category
    const filteredIntegrations =
        activeCategory === "all"
            ? integrations
            : integrations.filter((i) => i.category === activeCategory);

    return (
        <div className={className}>
            {/* Header */}
            {(title || subtitle) && (
                <div className="mb-6">
                    {title && (
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-2"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                            {title}
                        </div>
                    )}
                    {subtitle && (
                        <p className="text-neutral-700">{subtitle}</p>
                    )}
                </div>
            )}

            {/* Category filters */}
            {showCategories && categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`
                            px-3 py-1.5 rounded-full text-sm font-medium
                            transition-all duration-200
                            ${
                                activeCategory === "all"
                                    ? "text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }
                        `}
                        style={
                            activeCategory === "all"
                                ? { backgroundColor: accentColor }
                                : undefined
                        }
                    >
                        All ({integrations.length})
                    </button>
                    {categories.map((category) => {
                        const config = categoryConfig[category];
                        const count = integrations.filter((i) => i.category === category).length;
                        return (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`
                                    px-3 py-1.5 rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${
                                        activeCategory === category
                                            ? "text-white"
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }
                                `}
                                style={
                                    activeCategory === category
                                        ? { backgroundColor: config.color }
                                        : undefined
                                }
                            >
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Integration grid */}
            <div
                className={`
                    grid gap-3
                    ${compact
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }
                `}
            >
                {filteredIntegrations.map((integration, index) => (
                    <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        accentColor={accentColor}
                        compact={compact}
                        index={index}
                    />
                ))}
            </div>

            {/* Empty state */}
            {filteredIntegrations.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                    No integrations found in this category.
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* IntegrationLogosGrid - Simple logo-only variant                     */
/* ------------------------------------------------------------------ */

interface IntegrationLogosGridProps {
    integrations: Pick<Integration, "id" | "name" | "logo" | "initials">[];
    accentColor?: string;
    className?: string;
}

export function IntegrationLogosGrid({
    integrations,
    accentColor = "#2563EB",
    className = "",
}: IntegrationLogosGridProps) {
    return (
        <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
            {integrations.map((integration, index) => (
                <div
                    key={integration.id}
                    className="group relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center justify-center animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    title={integration.name}
                >
                    {integration.logo ? (
                        <Image
                            src={integration.logo}
                            alt={integration.name}
                            fill
                            className="object-contain p-3 grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                    ) : (
                        <span
                            className="text-sm font-bold grayscale group-hover:grayscale-0 transition-all duration-300"
                            style={{ color: accentColor }}
                        >
                            {integration.initials || integration.name.substring(0, 2).toUpperCase()}
                        </span>
                    )}

                    {/* Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        {integration.name}
                    </div>
                </div>
            ))}
        </div>
    );
}
