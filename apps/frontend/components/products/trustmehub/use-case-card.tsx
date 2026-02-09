"use client";

import Link from "next/link";
import {
    GraduationCap,
    Landmark,
    HeartPulse,
    Building,
    Home,
    Receipt,
    Briefcase,
    Flame,
    Scale,
    Fingerprint,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";
import type { TrustMeHubUseCase } from "@/types/trustmehub";

const iconMap: Record<string, LucideIcon> = {
    GraduationCap,
    Landmark,
    HeartPulse,
    Building,
    Home,
    Receipt,
    Briefcase,
    Flame,
    Scale,
    Fingerprint,
};

interface UseCaseCardProps {
    useCase: TrustMeHubUseCase;
    variant?: "compact" | "detailed";
    accentColor?: string;
}

export function UseCaseCard({
    useCase,
    variant = "compact",
    accentColor = "#10B981",
}: UseCaseCardProps) {
    const Icon = iconMap[useCase.icon] || Briefcase;

    if (variant === "compact") {
        return (
            <Link
                href={`/products/trustmehub/use-cases/${useCase.slug}`}
                className="group block bg-gradient-to-br from-neutral-50 to-emerald-50 rounded-xl p-6 border border-neutral-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
            >
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${accentColor}20` }}
                >
                    <Icon className="h-6 w-6" style={{ color: accentColor }} />
                </div>

                <div className="text-xs font-medium text-neutral-500 mb-1">
                    {useCase.sector}
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {useCase.title}
                </h3>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {useCase.shortDescription}
                </p>

                <div className="flex items-center justify-between">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: `${accentColor}15`,
                            color: accentColor,
                        }}
                    >
                        {useCase.economicImpact.annualValue} annual impact
                    </span>
                    <ArrowRight
                        className="h-4 w-4 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
                    />
                </div>
            </Link>
        );
    }

    // Detailed variant for use case index page
    return (
        <Link
            href={`/products/trustmehub/use-cases/${useCase.slug}`}
            className="group block bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-xl border border-neutral-100 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div
                    className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${accentColor}15` }}
                >
                    <Icon className="h-8 w-8" style={{ color: accentColor }} />
                </div>

                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                                backgroundColor: `${accentColor}10`,
                                color: accentColor,
                            }}
                        >
                            {useCase.sector}
                        </span>
                        <span
                            className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                            style={{ backgroundColor: accentColor }}
                        >
                            {useCase.economicImpact.annualValue}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {useCase.title}
                    </h3>

                    <p className="text-neutral-600 mb-4">
                        {useCase.shortDescription}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {useCase.statistics.slice(0, 3).map((stat, index) => (
                            <div key={index} className="text-center">
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: accentColor }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-xs text-neutral-500">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div className="flex gap-4 text-sm text-neutral-500">
                            <span>ROI: {useCase.roi.costReduction} cost reduction</span>
                            <span>{useCase.roi.timeToValue} to value</span>
                        </div>
                        <ArrowRight
                            className="h-5 w-5 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
