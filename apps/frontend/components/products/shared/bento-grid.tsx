"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type BentoGridSize = "sm" | "md" | "lg" | "wide" | "tall";

export interface BentoGridItem {
    id: string;
    title: string;
    description: string;
    icon?: LucideIcon;
    size?: BentoGridSize;
    highlight?: string;
    accentColor?: string;
    customContent?: ReactNode;
}

interface BentoGridProps {
    items: BentoGridItem[];
    accentColor?: string;
    className?: string;
}

/* ------------------------------------------------------------------ */
/* Size mappings for grid spans                                        */
/* ------------------------------------------------------------------ */

const sizeClasses: Record<BentoGridSize, string> = {
    sm: "md:col-span-1 md:row-span-1",
    md: "md:col-span-1 md:row-span-1",
    lg: "md:col-span-2 md:row-span-2",
    wide: "md:col-span-2 md:row-span-1",
    tall: "md:col-span-1 md:row-span-2",
};

const sizeContentClasses: Record<BentoGridSize, string> = {
    sm: "p-5",
    md: "p-6",
    lg: "p-8",
    wide: "p-6",
    tall: "p-6",
};

/* ------------------------------------------------------------------ */
/* BentoGridCard Component                                             */
/* ------------------------------------------------------------------ */

function BentoGridCard({
    item,
    defaultAccent,
    index,
}: {
    item: BentoGridItem;
    defaultAccent: string;
    index: number;
}) {
    const size = item.size || "md";
    const accent = item.accentColor || defaultAccent;
    const Icon = item.icon;

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl
                bg-white border border-neutral-100
                shadow-sm hover:shadow-xl
                transition-all duration-500 ease-out
                hover:-translate-y-1 hover:border-neutral-200
                ${sizeClasses[size]}
                animate-fade-in-up
            `}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Gradient overlay on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${accent}08 0%, ${accent}03 50%, transparent 100%)`,
                }}
            />

            {/* Accent corner decoration */}
            <div
                className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4"
                style={{
                    background: `radial-gradient(circle at top right, ${accent}15, transparent 70%)`,
                }}
            />

            <div className={`relative z-10 h-full flex flex-col ${sizeContentClasses[size]}`}>
                {/* Icon */}
                {Icon && (
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ backgroundColor: `${accent}12` }}
                    >
                        <Icon
                            className="h-6 w-6 transition-colors duration-300"
                            style={{ color: accent }}
                        />
                    </div>
                )}

                {/* Highlight badge */}
                {item.highlight && (
                    <span
                        className="inline-flex self-start px-2.5 py-1 rounded-full text-xs font-semibold mb-3 transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                        {item.highlight}
                    </span>
                )}

                {/* Title */}
                <h3
                    className={`font-bold text-neutral-900 mb-2 transition-colors duration-300 group-hover:text-neutral-800 ${
                        size === "lg" ? "text-xl md:text-2xl" : "text-lg"
                    }`}
                >
                    {item.title}
                </h3>

                {/* Description */}
                <p
                    className={`text-neutral-600 leading-relaxed flex-grow ${
                        size === "lg" ? "text-base" : "text-sm"
                    }`}
                >
                    {item.description}
                </p>

                {/* Custom content */}
                {item.customContent && (
                    <div className="mt-4">{item.customContent}</div>
                )}

                {/* Hover indicator line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ backgroundColor: accent }}
                />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* BentoGrid Component                                                 */
/* ------------------------------------------------------------------ */

export function BentoGrid({
    items,
    accentColor = "#2563EB",
    className = "",
}: BentoGridProps) {
    return (
        <div
            className={`
                grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6
                auto-rows-fr
                ${className}
            `}
        >
            {items.map((item, index) => (
                <BentoGridCard
                    key={item.id}
                    item={item}
                    defaultAccent={accentColor}
                    index={index}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* BentoGridFeatures - Pre-configured feature showcase variant         */
/* ------------------------------------------------------------------ */

export interface BentoFeature {
    id: string;
    iconName: string;
    title: string;
    description: string;
    capabilities?: string[];
    highlight?: string;
    size?: BentoGridSize;
}

interface BentoGridFeaturesProps {
    features: BentoFeature[];
    accentColor?: string;
    iconMap?: Record<string, LucideIcon>;
    className?: string;
}

export function BentoGridFeatures({
    features,
    accentColor = "#2563EB",
    iconMap = {},
    className = "",
}: BentoGridFeaturesProps) {
    const items: BentoGridItem[] = features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        icon: iconMap[feature.iconName],
        size: feature.size,
        highlight: feature.highlight,
        customContent: feature.capabilities && feature.capabilities.length > 0 ? (
            <ul className="space-y-1.5 mt-2">
                {feature.capabilities.slice(0, 4).map((cap, idx) => (
                    <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-neutral-500"
                    >
                        <span
                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: accentColor }}
                        />
                        {cap}
                    </li>
                ))}
            </ul>
        ) : undefined,
    }));

    return (
        <BentoGrid
            items={items}
            accentColor={accentColor}
            className={className}
        />
    );
}
