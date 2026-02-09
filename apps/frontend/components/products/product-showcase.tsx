"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Shield,
    GitBranch,
    Layers,
    Activity,
    Code2,
    Settings,
    FileCheck,
    QrCode,
    ClipboardCheck,
    Plug,
    XCircle,
    Building2,
    MapPin,
    GitCommit,
    Timer,
    TrendingUp,
    LayoutDashboard,
    ArrowRight,
    CheckCircle,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import type { Product } from "@/types/products";

const iconMap: Record<string, LucideIcon> = {
    Shield,
    GitBranch,
    Layers,
    Activity,
    Code2,
    Settings,
    FileCheck,
    QrCode,
    ClipboardCheck,
    Plug,
    XCircle,
    Building2,
    MapPin,
    GitCommit,
    Timer,
    Link: GitBranch,
    TrendingUp,
    LayoutDashboard,
};

interface ProductShowcaseProps {
    product: Product;
    reversed?: boolean;
}

export function ProductShowcase({ product, reversed = false }: ProductShowcaseProps) {
    return (
        <div
            id={product.id}
            className="scroll-mt-24 py-16 md:py-24 border-b border-neutral-100 last:border-0"
        >
            <div
                className={`grid lg:grid-cols-2 gap-12 items-center ${reversed ? "lg:flex-row-reverse" : ""}`}
            >
                {/* Image */}
                <div
                    className={`relative animate-fade-in-up ${reversed ? "lg:order-2" : ""}`}
                >
                    <div className="relative h-80 md:h-[450px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-primary">
                                {product.tagline}
                            </span>
                        </div>
                    </div>
                    {/* Decorative blob */}
                    <div
                        className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-2xl"
                        style={{ backgroundColor: `${product.accentColor}20` }}
                    ></div>
                </div>

                {/* Content */}
                <div
                    className={`animate-fade-in-up delay-100 ${reversed ? "lg:order-1" : ""}`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                        {product.name}
                    </h2>
                    <p className="text-lg text-neutral-600 mb-8">
                        {product.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {product.features.slice(0, 6).map((feature, index) => {
                            const IconComponent = iconMap[feature.icon] || Shield;
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-primary/5 transition-colors"
                                >
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor: `${product.accentColor}15`,
                                        }}
                                    >
                                        <IconComponent
                                            className="h-5 w-5"
                                            style={{ color: product.accentColor }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 text-sm">
                                            {feature.title}
                                        </h4>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Value Props */}
                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                            Key Benefits
                        </h4>
                        <ul className="space-y-2">
                            {product.valuePropositions.map((prop, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-neutral-600"
                                >
                                    <CheckCircle
                                        className="h-4 w-4 flex-shrink-0"
                                        style={{ color: product.accentColor }}
                                    />
                                    {prop}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            asChild
                            className="rounded-full px-6"
                            style={{
                                backgroundColor: product.accentColor,
                            }}
                        >
                            <Link href="/contact">
                                Request Demo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-6 border-neutral-300"
                        >
                            <Link href={`/products/${product.id}`}>
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Use Cases */}
            <div className="mt-12 animate-fade-in-up delay-200">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4">
                    Industry Applications
                </h4>
                <div className="flex flex-wrap gap-3">
                    {product.useCases.map((useCase, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm hover:border-primary/30 hover:shadow-sm transition-all"
                        >
                            <span className="font-medium text-neutral-900">
                                {useCase.title}
                            </span>
                            <span className="text-neutral-400 mx-2">|</span>
                            <span className="text-neutral-500">
                                {useCase.description}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
