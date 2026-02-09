"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ProductPageConfig {
    id: string;
    name: string;
    tagline: string;
    description: string;
    accentColor: string;
    category: string;
    backgroundGradient?: string;
}

export interface ProductStat {
    icon: ReactNode;
    label: string;
    value: string;
}

export interface ProductNavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    active?: boolean;
}

/* ------------------------------------------------------------------ */
/* ProductHeroSection                                                  */
/* ------------------------------------------------------------------ */

interface ProductHeroSectionProps {
    config: ProductPageConfig;
    stats?: ProductStat[];
    navItems?: ProductNavItem[];
    primaryCta?: {
        label: string;
        href: string;
    };
    secondaryCta?: {
        label: string;
        href: string;
    };
    interactiveComponent?: ReactNode;
    children?: ReactNode;
}

export function ProductHeroSection({
    config,
    stats,
    navItems,
    primaryCta,
    secondaryCta,
    interactiveComponent,
    children,
}: ProductHeroSectionProps) {
    const { accentColor } = config;

    return (
        <>
            <section className="relative overflow-hidden">
                <FloatingOrbs variant="hero" />
                <div
                    className="absolute inset-0 opacity-70"
                    style={{
                        background: config.backgroundGradient ||
                            `radial-gradient(circle at 20% 20%, ${accentColor}22, transparent 35%),
                             radial-gradient(circle at 80% 10%, ${accentColor}1a, transparent 30%),
                             linear-gradient(135deg, ${accentColor}0f 0%, #ffffff 60%)`,
                    }}
                />
                <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 md:py-24 relative z-10">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Link>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
                        <div className="space-y-6">
                            {/* Category badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                            >
                                {config.category}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                {config.name}
                                <span className="text-neutral-700">
                                    {" — "}{config.tagline}
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                {config.description}
                            </p>

                            {/* CTAs */}
                            {(primaryCta || secondaryCta) && (
                                <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                    {primaryCta && (
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-full font-semibold"
                                            style={{ backgroundColor: accentColor, borderColor: accentColor }}
                                        >
                                            <Link href={primaryCta.href}>
                                                {primaryCta.label}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                    {secondaryCta && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full border-2"
                                            style={{ borderColor: accentColor, color: accentColor }}
                                        >
                                            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Stats */}
                            {stats && stats.length > 0 && (
                                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl animate-fade-in-up delay-400">
                                    {stats.map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white border border-neutral-100 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3"
                                        >
                                            <div
                                                className="h-10 w-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                                            >
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-neutral-500">
                                                    {stat.label}
                                                </p>
                                                <p className="font-semibold text-neutral-900">
                                                    {stat.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {children}
                        </div>

                        {/* Interactive component */}
                        {interactiveComponent && (
                            <div className="animate-fade-in-up delay-200">
                                {interactiveComponent}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Sub Navigation */}
            {navItems && navItems.length > 0 && (
                <section className="w-full py-4 bg-white border-b border-neutral-200 sticky top-0 z-40">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
                            {navItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                            transition-colors whitespace-nowrap
                                            ${item.active
                                                ? "text-white"
                                                : "text-neutral-600 hover:bg-neutral-50"
                                            }
                                        `}
                                        style={
                                            item.active
                                                ? { backgroundColor: accentColor }
                                                : undefined
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

/* ------------------------------------------------------------------ */
/* ProductSection - Reusable section wrapper                           */
/* ------------------------------------------------------------------ */

interface ProductSectionProps {
    title: string;
    subtitle?: string;
    accentColor: string;
    background?: "white" | "neutral" | "gradient";
    showDivider?: boolean;
    showOrbs?: boolean;
    id?: string;
    className?: string;
    children: ReactNode;
}

export function ProductSection({
    title,
    subtitle,
    accentColor,
    background = "white",
    showDivider = true,
    showOrbs = false,
    id,
    className = "",
    children,
}: ProductSectionProps) {
    const bgClass =
        background === "neutral"
            ? "bg-neutral-50"
            : background === "gradient"
            ? ""
            : "bg-white";

    return (
        <>
            {showDivider && <GradientDivider className="my-0" />}
            <section
                id={id}
                className={`relative py-14 ${bgClass} ${id ? "scroll-mt-20" : ""} ${className}`}
                style={
                    background === "gradient"
                        ? {
                              background: `linear-gradient(135deg, ${accentColor}05 0%, white 50%, ${accentColor}03 100%)`,
                          }
                        : undefined
                }
            >
                {showOrbs && <FloatingOrbs variant="section" />}
                <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10">
                    <AnimateOnScroll animation="fade-up">
                        <div className="mb-6">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                            >
                                {title}
                            </div>
                            {subtitle && (
                                <p className="text-neutral-700 mt-2">{subtitle}</p>
                            )}
                        </div>
                    </AnimateOnScroll>
                    <AnimateOnScroll animation="fade-up" delay={100}>
                        {children}
                    </AnimateOnScroll>
                </div>
            </section>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* ProductTimelineSection - For "How It Works" sections                */
/* ------------------------------------------------------------------ */

export interface TimelineStep {
    title: string;
    duration: string;
    description: string;
    deliverables: string[];
}

interface ProductTimelineSectionProps {
    title?: string;
    subtitle?: string;
    steps: TimelineStep[];
    accentColor: string;
    className?: string;
}

export function ProductTimelineSection({
    title = "How It Works",
    subtitle,
    steps,
    accentColor,
    className = "",
}: ProductTimelineSectionProps) {
    return (
        <ProductSection
            title={title}
            subtitle={subtitle}
            accentColor={accentColor}
            showDivider={false}
            className={className}
        >
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
                <div className="space-y-4">
                    {steps.map((step, idx) => (
                        <AnimateOnScroll key={step.title} animation="slide-right" delay={idx * 150}>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 transition-transform duration-300 hover:scale-110"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {idx + 1}
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className="w-px flex-1"
                                            style={{
                                                background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10)`,
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 border border-neutral-100 rounded-xl p-4 shadow-sm mb-2 transition-all duration-300 hover:shadow-md">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <p className="font-semibold text-neutral-900">{step.title}</p>
                                        <span
                                            className="text-xs font-semibold px-2 py-1 rounded-full"
                                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                                        >
                                            {step.duration}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700 mt-1">{step.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {step.deliverables.map((d) => (
                                            <span
                                                key={d}
                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-50 border border-neutral-200"
                                            >
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
        </ProductSection>
    );
}

/* ------------------------------------------------------------------ */
/* ProductFAQSection - For FAQ sections                                */
/* ------------------------------------------------------------------ */

export interface FAQItem {
    question: string;
    answer: string;
}

interface ProductFAQSectionProps {
    title?: string;
    subtitle?: string;
    faqs: FAQItem[];
    accentColor: string;
    columns?: 1 | 2;
    className?: string;
}

export function ProductFAQSection({
    title = "FAQ",
    subtitle,
    faqs,
    accentColor,
    columns = 2,
    className = "",
}: ProductFAQSectionProps) {
    const gridCols = columns === 1 ? "grid-cols-1" : "md:grid-cols-2";

    return (
        <ProductSection
            title={title}
            subtitle={subtitle}
            accentColor={accentColor}
            background="neutral"
            showOrbs={false}
            className={className}
        >
            <div className={`grid ${gridCols} gap-4`}>
                {faqs.map((faq, idx) => (
                    <AnimateOnScroll key={faq.question} animation="fade-up-rotate" delay={idx * 100}>
                        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md h-full">
                            <p className="font-semibold text-neutral-900 mb-2">{faq.question}</p>
                            <p className="text-sm text-neutral-700">{faq.answer}</p>
                        </div>
                    </AnimateOnScroll>
                ))}
            </div>
        </ProductSection>
    );
}

/* ------------------------------------------------------------------ */
/* ProductUseCasesSection - For industry/use case grids                */
/* ------------------------------------------------------------------ */

export interface UseCase {
    icon: LucideIcon;
    title: string;
    description: string;
    metric?: string;
    href?: string;
}

interface ProductUseCasesSectionProps {
    title?: string;
    subtitle?: string;
    useCases: UseCase[];
    accentColor: string;
    columns?: 2 | 3 | 4;
    className?: string;
}

export function ProductUseCasesSection({
    title = "Industry Applications",
    subtitle,
    useCases,
    accentColor,
    columns = 4,
    className = "",
}: ProductUseCasesSectionProps) {
    const gridCols =
        columns === 2
            ? "md:grid-cols-2"
            : columns === 3
            ? "md:grid-cols-2 lg:grid-cols-3"
            : "md:grid-cols-2 lg:grid-cols-4";

    return (
        <ProductSection
            title={title}
            subtitle={subtitle}
            accentColor={accentColor}
            background="neutral"
            showOrbs={true}
            className={className}
        >
            <div className={`grid ${gridCols} gap-4`}>
                {useCases.map((uc, idx) => {
                    const Icon = uc.icon;
                    const content = (
                        <div className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group h-full">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                            >
                                <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">{uc.title}</h3>
                            {uc.metric && (
                                <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
                                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                                >
                                    {uc.metric}
                                </span>
                            )}
                            <p className="text-sm text-neutral-600">{uc.description}</p>
                        </div>
                    );

                    return (
                        <AnimateOnScroll key={uc.title} animation="fade-up" delay={idx * 120}>
                            {uc.href ? (
                                <Link href={uc.href} className="block h-full">
                                    {content}
                                </Link>
                            ) : (
                                content
                            )}
                        </AnimateOnScroll>
                    );
                })}
            </div>
        </ProductSection>
    );
}
