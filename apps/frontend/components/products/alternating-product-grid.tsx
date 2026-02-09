"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Shield,
    Blocks,
    Activity,
    Zap,
    Users,
    ArrowRight,
    CheckCircle,
    type LucideIcon,
    GitBranch,
    Layers,
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
    Link2,
    Eye,
    Smartphone,
    Globe,
    MessageSquare,
    Phone,
    ShieldCheck,
    Bot,
    BarChart3,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { products } from "@/data/products";
import type { Product } from "@/types/products";
import { AnimateOnScroll } from "@/components/shared";

/* ------------------------------------------------------------------ */
/* Icon mapping                                                         */
/* ------------------------------------------------------------------ */

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
    TrendingUp,
    LayoutDashboard,
    Blocks,
    Zap,
    Users,
    Link2,
    Eye,
    Smartphone,
    Globe,
    MessageSquare,
    Phone,
    ShieldCheck,
    Bot,
    BarChart3,
};

const productIcons: Record<string, LucideIcon> = {
    digigate: Shield,
    digitrust: Blocks,
    digitrack: Activity,
    trustmehub: Zap,
    boacrm: Users,
};

/* ------------------------------------------------------------------ */
/* Category configuration                                               */
/* ------------------------------------------------------------------ */

const categories = [
    { id: "all", label: "All Products" },
    { id: "security", label: "Security" },
    { id: "credentials", label: "Credentials" },
    { id: "tracking", label: "Tracking" },
    { id: "crm", label: "CRM" },
];

const productCategories: Record<string, string> = {
    digigate: "security",
    digitrust: "credentials",
    digitrack: "tracking",
    trustmehub: "credentials",
    boacrm: "crm",
};

const categoryLabels: Record<string, string> = {
    digigate: "API Security",
    digitrust: "Blockchain Credentials",
    digitrack: "Asset Tracking",
    trustmehub: "Digital Trust",
    boacrm: "Enterprise CRM",
};

/* ------------------------------------------------------------------ */
/* Full-width Product Card                                              */
/* ------------------------------------------------------------------ */

interface ProductCardProps {
    product: Product;
    reversed?: boolean;
    index: number;
}

function FullWidthProductCard({ product, reversed, index }: ProductCardProps) {
    const IconComponent = productIcons[product.id] || Shield;

    return (
        <AnimateOnScroll animation={reversed ? "slide-left" : "slide-right"} delay={100}>
            <div
                id={product.id}
                className={`
                    group relative scroll-mt-24 rounded-3xl overflow-hidden
                    bg-white border border-neutral-100 shadow-lg
                    transition-all duration-500 hover:shadow-2xl hover:border-neutral-200
                `}
            >
                <div className={`grid lg:grid-cols-2 ${reversed ? "lg:flex-row-reverse" : ""}`}>
                    {/* Image Section */}
                    <div className={`relative h-80 lg:h-[500px] ${reversed ? "lg:order-2" : ""}`}>
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                        {/* Category Badge */}
                        <div className="absolute top-6 left-6">
                            <span
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md"
                                style={{ backgroundColor: `${product.accentColor}cc` }}
                            >
                                <IconComponent className="w-4 h-4" />
                                {categoryLabels[product.id]}
                            </span>
                        </div>

                        {/* Product Logo */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <div
                                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${product.accentColor}15` }}
                                >
                                    <IconComponent className="w-6 h-6" style={{ color: product.accentColor }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900">{product.name}</h3>
                                    <p className="text-sm text-neutral-500">{product.tagline}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${reversed ? "lg:order-1" : ""}`}>
                        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Key Features */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            {product.features.slice(0, 4).map((feature, idx) => {
                                const FeatureIcon = iconMap[feature.icon] || Shield;
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                    >
                                        <div
                                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${product.accentColor}15` }}
                                        >
                                            <FeatureIcon
                                                className="h-5 w-5"
                                                style={{ color: product.accentColor }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900 text-sm">
                                                {feature.title}
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Value Props */}
                        <div className="mb-8">
                            <ul className="grid sm:grid-cols-2 gap-2">
                                {product.valuePropositions.slice(0, 4).map((prop, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center gap-2 text-sm text-neutral-600"
                                    >
                                        <CheckCircle
                                            className="h-4 w-4 flex-shrink-0"
                                            style={{ color: product.accentColor }}
                                        />
                                        <span className="line-clamp-1">{prop}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8 font-semibold transition-all duration-300 hover:scale-105"
                                style={{ backgroundColor: product.accentColor }}
                            >
                                <Link href="/contact">
                                    Request Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full px-8 border-2 font-semibold transition-all duration-300 hover:scale-105"
                                style={{ borderColor: product.accentColor, color: product.accentColor }}
                            >
                                <Link href={`/products/${product.id}`}>
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimateOnScroll>
    );
}

/* ------------------------------------------------------------------ */
/* Half-width Product Card                                              */
/* ------------------------------------------------------------------ */

function HalfWidthProductCard({ product, index }: ProductCardProps) {
    const IconComponent = productIcons[product.id] || Shield;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <AnimateOnScroll animation="fade-up" delay={index * 100}>
            <Link
                href={`#${product.id}-detail`}
                id={product.id}
                className="group block scroll-mt-24"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    className={`
                        relative rounded-2xl overflow-hidden h-full
                        bg-white border border-neutral-100 shadow-lg
                        transition-all duration-500
                        ${isHovered ? "shadow-2xl border-neutral-200 -translate-y-2" : ""}
                    `}
                    style={{
                        boxShadow: isHovered ? `0 20px 60px -15px ${product.accentColor}30` : undefined
                    }}
                >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : ""}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md"
                                style={{ backgroundColor: `${product.accentColor}cc` }}
                            >
                                <IconComponent className="w-3.5 h-3.5" />
                                {categoryLabels[product.id]}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className={`
                                    w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                                    transition-all duration-300
                                    ${isHovered ? "scale-110 rotate-3" : ""}
                                `}
                                style={{ backgroundColor: `${product.accentColor}15` }}
                            >
                                <IconComponent className="w-7 h-7" style={{ color: product.accentColor }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">{product.name}</h3>
                                <p className="text-sm text-neutral-500">{product.tagline}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                            {product.description}
                        </p>

                        {/* Key Features (compact) */}
                        <ul className="space-y-2 mb-6">
                            {product.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                                    <CheckCircle
                                        className="h-4 w-4 flex-shrink-0"
                                        style={{ color: product.accentColor }}
                                    />
                                    <span className="line-clamp-1">{feature.title}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <div
                            className={`
                                flex items-center gap-2 text-sm font-semibold
                                transition-all duration-300
                                ${isHovered ? "translate-x-2" : ""}
                            `}
                            style={{ color: product.accentColor }}
                        >
                            Learn more
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Hover glow effect */}
                    <div
                        className={`
                            absolute inset-0 pointer-events-none rounded-2xl
                            transition-opacity duration-500
                            ${isHovered ? "opacity-100" : "opacity-0"}
                        `}
                        style={{
                            boxShadow: `inset 0 0 0 2px ${product.accentColor}40`
                        }}
                    />
                </div>
            </Link>
        </AnimateOnScroll>
    );
}

/* ------------------------------------------------------------------ */
/* Category Filter                                                      */
/* ------------------------------------------------------------------ */

interface CategoryFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`
                        px-5 py-2.5 rounded-full text-sm font-medium
                        transition-all duration-300
                        ${activeCategory === category.id
                            ? "bg-primary text-white shadow-lg"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }
                    `}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main Alternating Product Grid                                        */
/* ------------------------------------------------------------------ */

export function AlternatingProductGrid() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => productCategories[p.id] === activeCategory);

    // Create layout pattern: Full -> Half+Half -> Full -> Half+Half
    const renderProducts = () => {
        const elements: ReactElement[] = [];
        let i = 0;

        while (i < filteredProducts.length) {
            const isEvenGroup = Math.floor(i / 3) % 2 === 0;

            if (isEvenGroup && i < filteredProducts.length) {
                // Full-width card
                elements.push(
                    <FullWidthProductCard
                        key={filteredProducts[i].id}
                        product={filteredProducts[i]}
                        reversed={Math.floor(i / 3) % 2 === 1}
                        index={i}
                    />
                );
                i++;
            }

            // Two half-width cards
            if (i < filteredProducts.length) {
                const halfCards: ReactElement[] = [];

                for (let j = 0; j < 2 && i < filteredProducts.length; j++) {
                    halfCards.push(
                        <HalfWidthProductCard
                            key={filteredProducts[i].id}
                            product={filteredProducts[i]}
                            index={i}
                        />
                    );
                    i++;
                }

                if (halfCards.length > 0) {
                    elements.push(
                        <div key={`half-${i}`} className="grid md:grid-cols-2 gap-6">
                            {halfCards}
                        </div>
                    );
                }
            }
        }

        return elements;
    };

    return (
        <section id="products" className="w-full py-20 md:py-28 bg-gradient-to-b from-white via-neutral-50/50 to-white scroll-mt-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <AnimateOnScroll animation="fade-up">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-0.5 bg-accent-orange"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                                Product Suite
                            </span>
                            <div className="w-12 h-0.5 bg-accent-orange"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] mb-4">
                            Explore Our Products
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Five powerful solutions designed to transform your
                            digital infrastructure with enterprise-grade reliability
                        </p>
                    </div>
                </AnimateOnScroll>

                {/* Category Filter */}
                <AnimateOnScroll animation="fade-up" delay={100}>
                    <CategoryFilter
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </AnimateOnScroll>

                {/* Product Grid */}
                <div className="space-y-8">
                    {renderProducts()}
                </div>
            </div>
        </section>
    );
}
