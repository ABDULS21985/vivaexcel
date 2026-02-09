"use client";

import Image from "next/image";
import { Quote, Star, TrendingUp, Building2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Testimonial {
    id: string;
    quote: string;
    author: {
        name: string;
        title: string;
        company: string;
        avatar?: string;
        initials?: string;
    };
    metric?: {
        value: string;
        label: string;
    };
    rating?: number;
    featured?: boolean;
}

interface TestimonialCalloutProps {
    testimonial: Testimonial;
    accentColor?: string;
    variant?: "default" | "large" | "compact";
    className?: string;
}

/* ------------------------------------------------------------------ */
/* TestimonialCallout Component                                        */
/* ------------------------------------------------------------------ */

export function TestimonialCallout({
    testimonial,
    accentColor = "#2563EB",
    variant = "default",
    className = "",
}: TestimonialCalloutProps) {
    const isLarge = variant === "large";
    const isCompact = variant === "compact";

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                bg-white border border-neutral-100
                shadow-lg hover:shadow-xl
                transition-all duration-300
                ${isLarge ? "p-8 md:p-10" : isCompact ? "p-5" : "p-6 md:p-8"}
                ${className}
            `}
        >
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none"
                style={{
                    background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`,
                }}
            />

            {/* Quote icon */}
            <div
                className={`
                    absolute opacity-10
                    ${isLarge ? "top-6 left-6" : "top-4 left-4"}
                `}
            >
                <Quote
                    className={isLarge ? "h-16 w-16" : "h-12 w-12"}
                    style={{ color: accentColor }}
                />
            </div>

            <div className={`relative z-10 ${isLarge ? "pl-12" : "pl-8"}`}>
                {/* Rating stars */}
                {testimonial.rating && (
                    <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < testimonial.rating!
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-neutral-200"
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Quote text */}
                <blockquote
                    className={`
                        text-neutral-800 leading-relaxed mb-6
                        ${isLarge ? "text-xl md:text-2xl font-medium" : isCompact ? "text-base" : "text-lg"}
                    `}
                >
                    &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author info + Metric */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    {/* Author */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                            className={`
                                relative flex-shrink-0 rounded-full overflow-hidden
                                ${isLarge ? "w-14 h-14" : "w-12 h-12"}
                            `}
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            {testimonial.author.avatar ? (
                                <Image
                                    src={testimonial.author.avatar}
                                    alt={testimonial.author.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center font-semibold"
                                    style={{ color: accentColor }}
                                >
                                    {testimonial.author.initials ||
                                        testimonial.author.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Title */}
                        <div>
                            <p className="font-semibold text-neutral-900">
                                {testimonial.author.name}
                            </p>
                            <p className="text-sm text-neutral-500">
                                {testimonial.author.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Building2 className="h-3 w-3 text-neutral-400" />
                                <span className="text-xs text-neutral-500">
                                    {testimonial.author.company}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric */}
                    {testimonial.metric && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ backgroundColor: `${accentColor}08` }}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${accentColor}15` }}
                            >
                                <TrendingUp className="h-5 w-5" style={{ color: accentColor }} />
                            </div>
                            <div>
                                <p
                                    className="text-xl font-bold"
                                    style={{ color: accentColor }}
                                >
                                    {testimonial.metric.value}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {testimonial.metric.label}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Accent border */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* TestimonialGrid - Multiple testimonials layout                      */
/* ------------------------------------------------------------------ */

interface TestimonialGridProps {
    testimonials: Testimonial[];
    accentColor?: string;
    columns?: 1 | 2 | 3;
    className?: string;
}

export function TestimonialGrid({
    testimonials,
    accentColor = "#2563EB",
    columns = 2,
    className = "",
}: TestimonialGridProps) {
    const gridCols =
        columns === 1
            ? "grid-cols-1"
            : columns === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    // Find featured testimonial
    const featured = testimonials.find((t) => t.featured);
    const others = testimonials.filter((t) => !t.featured);

    return (
        <div className={className}>
            {/* Featured testimonial */}
            {featured && (
                <div className="mb-6 animate-fade-in-up">
                    <TestimonialCallout
                        testimonial={featured}
                        accentColor={accentColor}
                        variant="large"
                    />
                </div>
            )}

            {/* Other testimonials */}
            {others.length > 0 && (
                <div className={`grid gap-4 md:gap-6 ${gridCols}`}>
                    {others.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <TestimonialCallout
                                testimonial={testimonial}
                                accentColor={accentColor}
                                variant="compact"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* FeaturedTestimonial - Full-width hero-style testimonial             */
/* ------------------------------------------------------------------ */

interface FeaturedTestimonialProps {
    testimonial: Testimonial;
    accentColor?: string;
    backgroundImage?: string;
    className?: string;
}

export function FeaturedTestimonial({
    testimonial,
    accentColor = "#2563EB",
    backgroundImage,
    className = "",
}: FeaturedTestimonialProps) {
    return (
        <section
            className={`relative overflow-hidden py-16 md:py-24 ${className}`}
            style={{
                background: backgroundImage
                    ? undefined
                    : `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 50%, white 100%)`,
            }}
        >
            {/* Background image overlay */}
            {backgroundImage && (
                <>
                    <Image
                        src={backgroundImage}
                        alt=""
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
                </>
            )}

            <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Large quote icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            <Quote className="h-8 w-8" style={{ color: accentColor }} />
                        </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-neutral-800 leading-relaxed mb-8">
                        &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Avatar */}
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            {testimonial.author.avatar ? (
                                <Image
                                    src={testimonial.author.avatar}
                                    alt={testimonial.author.name}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-xl font-semibold"
                                    style={{ color: accentColor }}
                                >
                                    {testimonial.author.initials ||
                                        testimonial.author.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-semibold text-neutral-900">
                                {testimonial.author.name}
                            </p>
                            <p className="text-neutral-600">
                                {testimonial.author.title}, {testimonial.author.company}
                            </p>
                        </div>

                        {/* Metric */}
                        {testimonial.metric && (
                            <div
                                className="mt-4 flex items-center gap-3 px-6 py-3 rounded-full"
                                style={{ backgroundColor: `${accentColor}10` }}
                            >
                                <TrendingUp
                                    className="h-5 w-5"
                                    style={{ color: accentColor }}
                                />
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: accentColor }}
                                >
                                    {testimonial.metric.value}
                                </span>
                                <span className="text-neutral-600">
                                    {testimonial.metric.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
