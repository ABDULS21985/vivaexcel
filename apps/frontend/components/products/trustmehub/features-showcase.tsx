"use client";

import { useState } from "react";
import {
    FileCheck,
    Zap,
    Link2,
    Layers,
    Building2,
    Eye,
    Shield,
    Code2,
    Bell,
    PenTool,
    QrCode,
    FileText,
    Smartphone,
    BarChart3,
    Globe,
    type LucideIcon,
} from "lucide-react";
import type { TrustMeHubFeature, FeatureCategoryInfo } from "@/types/trustmehub";

const iconMap: Record<string, LucideIcon> = {
    FileCheck,
    Zap,
    Link2,
    Layers,
    Building2,
    Eye,
    Shield,
    Code2,
    Bell,
    PenTool,
    QrCode,
    FileText,
    Smartphone,
    BarChart3,
    Globe,
};

interface FeaturesShowcaseProps {
    features: TrustMeHubFeature[];
    categories: FeatureCategoryInfo[];
    accentColor?: string;
}

export function FeaturesShowcase({
    features,
    categories,
    accentColor = "#10B981",
}: FeaturesShowcaseProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "core");

    const filteredFeatures = features.filter((f) => f.category === activeCategory);

    return (
        <div className="w-full">
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            activeCategory === category.id
                                ? "text-white shadow-lg"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                        style={
                            activeCategory === category.id
                                ? { backgroundColor: accentColor }
                                : undefined
                        }
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Category Description */}
            <div className="text-center mb-8">
                <p className="text-neutral-600 max-w-2xl mx-auto">
                    {categories.find((c) => c.id === activeCategory)?.description}
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((feature, index) => {
                    const Icon = iconMap[feature.icon] || Zap;
                    return (
                        <div
                            key={feature.id}
                            className="group bg-white rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-100 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                                    style={{ backgroundColor: `${accentColor}15` }}
                                >
                                    <Icon
                                        className="h-7 w-7 transition-colors"
                                        style={{ color: accentColor }}
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className="text-lg font-bold text-neutral-900 mb-2 group-hover:transition-colors"
                                        style={{
                                            transition: "color 0.3s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                                        {feature.description}
                                    </p>
                                    {feature.highlights && (
                                        <div className="flex flex-wrap gap-2">
                                            {feature.highlights.map((highlight, hIndex) => (
                                                <span
                                                    key={hIndex}
                                                    className="text-xs px-2 py-1 rounded-full"
                                                    style={{
                                                        backgroundColor: `${accentColor}10`,
                                                        color: accentColor,
                                                    }}
                                                >
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Features Count */}
            <div className="text-center mt-8">
                <p className="text-sm text-neutral-500">
                    Showing {filteredFeatures.length} of {features.length} enterprise features
                </p>
            </div>
        </div>
    );
}
