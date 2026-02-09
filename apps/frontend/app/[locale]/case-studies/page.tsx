"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import { FadeUp } from "@/components/ui/animations/scroll-reveal";
import { CTASection } from "@/components/shared";
import { caseStudies, getAllIndustries, type CaseStudy } from "@/data/case-studies";

// ============================================
// CASE STUDIES LISTING PAGE
// ============================================

function CaseStudyCard({ caseStudy, featured = false }: { caseStudy: CaseStudy; featured?: boolean }) {
    return (
        <Link
            href={`/case-studies/${caseStudy.slug}`}
            className={`group card-interactive block bg-white rounded-2xl border border-neutral-200 overflow-hidden ${
                featured ? "md:col-span-2 md:row-span-2" : ""
            }`}
        >
            {/* Thumbnail */}
            <div className={`relative overflow-hidden ${featured ? "h-64 md:h-80" : "h-48"}`}>
                <Image
                    src={caseStudy.thumbnail}
                    alt={caseStudy.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Industry badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-semibold rounded-full">
                        <Building2 className="h-3 w-3" />
                        {caseStudy.industry}
                    </span>
                </div>

                {/* Featured badge */}
                {caseStudy.featured && (
                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                            <TrendingUp className="h-3 w-3" />
                            Featured
                        </span>
                    </div>
                )}

                {/* Metrics preview - shown on hover for featured cards */}
                {featured && (
                    <div className="absolute bottom-4 left-4 right-4 flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {caseStudy.metrics.slice(0, 3).map((metric, index) => (
                            <div
                                key={index}
                                className="flex-1 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center"
                            >
                                <div className="text-lg font-bold text-primary">{metric.value}</div>
                                <div className="text-xs text-neutral-600 truncate">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 md:p-6">
                {/* Client */}
                <p className="text-sm text-neutral-500 font-medium mb-2">{caseStudy.client}</p>

                {/* Title */}
                <h3 className={`font-semibold text-neutral-900 mb-3 group-hover:text-primary transition-colors ${
                    featured ? "text-xl md:text-2xl" : "text-lg"
                }`}>
                    {caseStudy.title}
                </h3>

                {/* Excerpt */}
                <p className={`text-neutral-600 mb-4 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
                    {caseStudy.excerpt}
                </p>

                {/* Metrics preview for non-featured cards */}
                {!featured && (
                    <div className="flex gap-4 mb-4 pb-4 border-b border-neutral-100">
                        {caseStudy.metrics.slice(0, 2).map((metric, index) => (
                            <div key={index}>
                                <div className="text-lg font-bold text-primary">{metric.value}</div>
                                <div className="text-xs text-neutral-500">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Read more link */}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
                    View Case Study
                    <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </Link>
    );
}

function IndustryFilter({
    industries,
    activeIndustry,
    onSelect,
}: {
    industries: string[];
    activeIndustry: string;
    onSelect: (industry: string) => void;
}) {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            <button
                onClick={() => onSelect("All")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeIndustry === "All"
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
            >
                All Industries
            </button>
            {industries.map((industry) => (
                <button
                    key={industry}
                    onClick={() => onSelect(industry)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeIndustry === industry
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                >
                    {industry}
                </button>
            ))}
        </div>
    );
}

export default function CaseStudiesPage() {
    const [activeIndustry, setActiveIndustry] = useState("All");
    const industries = getAllIndustries();

    const filteredCaseStudies = useMemo(() => {
        if (activeIndustry === "All") {
            // Sort with featured first
            return [...caseStudies].sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });
        }
        return caseStudies.filter((cs) => cs.industry === activeIndustry);
    }, [activeIndustry]);

    const featuredCaseStudies = filteredCaseStudies.filter((cs) => cs.featured);
    const regularCaseStudies = filteredCaseStudies.filter((cs) => !cs.featured);

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative w-full py-24 md:py-32 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
                    <FadeUp>
                        <div className="max-w-3xl mx-auto text-center">
                            {/* Overline */}
                            <span className="overline text-accent-orange mb-4 block">
                                Case Studies
                            </span>

                            {/* Headline */}
                            <h1 className="text-display text-neutral-900 mb-6">
                                Real Results for{" "}
                                <span className="text-primary">Real Businesses</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lead text-neutral-600 mb-12">
                                Discover how we have helped organizations across industries transform
                                their operations, enhance security, and achieve measurable business outcomes.
                            </p>
                        </div>
                    </FadeUp>

                    {/* Industry Filter */}
                    <FadeUp delay={0.2}>
                        <IndustryFilter
                            industries={industries}
                            activeIndustry={activeIndustry}
                            onSelect={setActiveIndustry}
                        />
                    </FadeUp>
                </div>
            </section>

            {/* Case Studies Grid */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    {/* Featured Case Studies */}
                    {featuredCaseStudies.length > 0 && activeIndustry === "All" && (
                        <div className="mb-16">
                            <FadeUp>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
                                    Featured Case Studies
                                </h2>
                            </FadeUp>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {featuredCaseStudies.map((caseStudy, index) => (
                                    <FadeUp key={caseStudy.id} delay={index * 0.1}>
                                        <CaseStudyCard caseStudy={caseStudy} featured />
                                    </FadeUp>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All/Filtered Case Studies */}
                    <div>
                        {activeIndustry === "All" && featuredCaseStudies.length > 0 && (
                            <FadeUp>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
                                    All Case Studies
                                </h2>
                            </FadeUp>
                        )}

                        {filteredCaseStudies.length === 0 ? (
                            <FadeUp>
                                <div className="text-center py-16">
                                    <p className="text-lg text-neutral-500">
                                        No case studies found for this industry.
                                    </p>
                                </div>
                            </FadeUp>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {(activeIndustry === "All" ? regularCaseStudies : filteredCaseStudies).map(
                                    (caseStudy, index) => (
                                        <FadeUp key={caseStudy.id} delay={index * 0.1}>
                                            <CaseStudyCard caseStudy={caseStudy} />
                                        </FadeUp>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title="Ready to Achieve"
                accentTitle="Similar Results?"
                description="Let us discuss how our expertise can help transform your organization and deliver measurable outcomes."
                primaryCTA={{
                    label: "Start Your Project",
                    href: "/contact",
                }}
                secondaryCTA={{
                    label: "Explore Our Services",
                    href: "/services",
                }}
            />
        </main>
    );
}
