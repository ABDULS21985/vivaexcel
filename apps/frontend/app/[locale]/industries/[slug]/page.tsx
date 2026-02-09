import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Building2,
    Landmark,
    Heart,
    Radio,
    Truck,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { industries, getIndustryBySlug, getAllIndustrySlugs } from "@/data/industries";
import { getCaseStudiesByIndustry } from "@/data/case-studies";
import { FadeUp } from "@/components/ui/animations";
import { CTASection } from "@/components/shared";

// Icon mapping for industries
const iconMap: Record<string, LucideIcon> = {
    Landmark,
    Heart,
    Building2,
    Radio,
    Truck,
};

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
    const slugs = getAllIndustrySlugs();
    return slugs.map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const industry = getIndustryBySlug(slug);

    if (!industry) {
        return {
            title: "Industry Not Found",
        };
    }

    return {
        title: `${industry.name} Solutions | Global Digitalbit Limited`,
        description: industry.description,
        keywords: [
            industry.name.toLowerCase(),
            "digital transformation",
            "consulting",
            "technology solutions",
            ...industry.relatedServices.map((s) => s.toLowerCase()),
        ],
        openGraph: {
            title: `${industry.name} Solutions - Global Digitalbit`,
            description: industry.description,
            url: `https://globaldigibit.com/industries/${slug}`,
            images: [
                {
                    url: industry.heroImage,
                    width: 1600,
                    height: 900,
                    alt: industry.name,
                },
            ],
        },
    };
}

export default async function IndustryDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const industry = getIndustryBySlug(slug);

    if (!industry) {
        notFound();
    }

    const IconComponent = iconMap[industry.icon] || Building2;
    const industryCaseStudies = getCaseStudiesByIndustry(industry.name);

    // Get other industries for navigation
    const otherIndustries = industries.filter((i) => i.slug !== slug).slice(0, 3);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative w-full py-20 md:py-32 overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${industry.accentColor} 0%, ${industry.accentColor}dd 50%, ${industry.accentColor}bb 100%)`,
                }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
                        style={{ backgroundColor: `${industry.accentColor}40` }}
                    />
                    <div
                        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
                        style={{ backgroundColor: `${industry.accentColor}30` }}
                    />
                    {/* Background image overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <Image
                            src={industry.heroImage}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    {/* Back Link */}
                    <FadeUp>
                        <Link
                            href="/industries"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            All Industries
                        </Link>
                    </FadeUp>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <FadeUp delay={0.1}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                        <IconComponent className="h-8 w-8 text-white" />
                                    </div>
                                    <span className="overline text-sm font-semibold text-white/80 uppercase tracking-wider">
                                        Industry Focus
                                    </span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={0.2}>
                                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                    {industry.name}
                                </h1>
                            </FadeUp>

                            <FadeUp delay={0.3}>
                                <p className="text-lead text-lg md:text-xl text-white/90 mb-8">
                                    {industry.description}
                                </p>
                            </FadeUp>

                            <FadeUp delay={0.4}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-full px-8"
                                    >
                                        <Link href={`/contact?industry=${industry.slug}`}>
                                            Get Started
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="border-2 border-white text-white hover:bg-white hover:text-neutral-900 rounded-full px-8"
                                    >
                                        <Link href="#solutions">
                                            View Solutions
                                        </Link>
                                    </Button>
                                </div>
                            </FadeUp>
                        </div>

                        {/* Stats Card */}
                        <FadeUp delay={0.3}>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">
                                    Our Impact in {industry.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {industry.stats.map((stat, index) => (
                                        <div
                                            key={index}
                                            className="text-center p-4 bg-white/5 rounded-xl"
                                        >
                                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-white/70">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* Challenges Section */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <FadeUp>
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${industry.accentColor}15` }}
                                >
                                    <AlertTriangle
                                        className="h-6 w-6"
                                        style={{ color: industry.accentColor }}
                                    />
                                </div>
                            </div>
                            <span className="overline text-xs font-bold tracking-wider text-neutral-500 uppercase mb-4 block">
                                Industry Challenges
                            </span>
                            <h2 className="text-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                                Common Challenges in{" "}
                                <span
                                    className="text-transparent bg-clip-text"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${industry.accentColor}, ${industry.accentColor}cc)`,
                                    }}
                                >
                                    {industry.name}
                                </span>
                            </h2>
                            <p className="text-lead text-lg text-neutral-600">
                                We understand the unique challenges facing {industry.name.toLowerCase()} organizations today.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-4">
                            {industry.challenges.map((challenge, index) => (
                                <FadeUp key={index} delay={index * 0.05}>
                                    <div className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
                                        <div
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                                            style={{ backgroundColor: `${industry.accentColor}15` }}
                                        >
                                            <AlertTriangle
                                                className="h-4 w-4"
                                                style={{ color: industry.accentColor }}
                                            />
                                        </div>
                                        <p className="text-neutral-700 text-sm leading-relaxed">
                                            {challenge}
                                        </p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section
                id="solutions"
                className="py-20 md:py-28 bg-gradient-to-b from-neutral-50 to-white scroll-mt-20"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <FadeUp>
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${industry.accentColor}15` }}
                                >
                                    <Lightbulb
                                        className="h-6 w-6"
                                        style={{ color: industry.accentColor }}
                                    />
                                </div>
                            </div>
                            <span className="overline text-xs font-bold tracking-wider text-neutral-500 uppercase mb-4 block">
                                Our Solutions
                            </span>
                            <h2 className="text-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                                How We Help{" "}
                                <span
                                    className="text-transparent bg-clip-text"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${industry.accentColor}, ${industry.accentColor}cc)`,
                                    }}
                                >
                                    {industry.name}
                                </span>{" "}
                                Organizations
                            </h2>
                            <p className="text-lead text-lg text-neutral-600">
                                Comprehensive solutions tailored to address your sector-specific needs.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-4">
                            {industry.solutions.map((solution, index) => (
                                <FadeUp key={index} delay={index * 0.05}>
                                    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                                            style={{ backgroundColor: `${industry.accentColor}15` }}
                                        >
                                            <CheckCircle
                                                className="h-4 w-4"
                                                style={{ color: industry.accentColor }}
                                            />
                                        </div>
                                        <p className="text-neutral-700 text-sm leading-relaxed">
                                            {solution}
                                        </p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>

                    {/* Related Services */}
                    <FadeUp delay={0.3}>
                        <div className="max-w-4xl mx-auto mt-16">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">
                                Related Service Areas
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {industry.relatedServices.map((service, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:shadow-sm"
                                        style={{
                                            borderColor: `${industry.accentColor}40`,
                                            color: industry.accentColor,
                                            backgroundColor: `${industry.accentColor}08`,
                                        }}
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* Case Studies Section */}
            {industryCaseStudies.length > 0 && (
                <section className="py-20 md:py-28 bg-white">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <FadeUp>
                            <div className="max-w-3xl mx-auto text-center mb-12">
                                <span className="overline text-xs font-bold tracking-wider text-neutral-500 uppercase mb-4 block">
                                    Success Stories
                                </span>
                                <h2 className="text-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                                    Case Studies in{" "}
                                    <span
                                        className="text-transparent bg-clip-text"
                                        style={{
                                            backgroundImage: `linear-gradient(to right, ${industry.accentColor}, ${industry.accentColor}cc)`,
                                        }}
                                    >
                                        {industry.name}
                                    </span>
                                </h2>
                                <p className="text-lead text-lg text-neutral-600">
                                    See how we&apos;ve helped organizations in this industry achieve their goals.
                                </p>
                            </div>
                        </FadeUp>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {industryCaseStudies.map((caseStudy, index) => (
                                <FadeUp key={caseStudy.id} delay={index * 0.1}>
                                    <article className="group bg-white rounded-2xl overflow-hidden shadow-md border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        {/* Card Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={caseStudy.thumbnail}
                                                alt={caseStudy.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                                            />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                                                    {caseStudy.client}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {caseStudy.title}
                                            </h3>
                                            <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                                                {caseStudy.excerpt}
                                            </p>

                                            {/* Metrics Preview */}
                                            <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-neutral-100">
                                                {caseStudy.metrics.slice(0, 2).map((metric, metricIndex) => (
                                                    <div key={metricIndex} className="text-center">
                                                        <div
                                                            className="text-lg font-bold"
                                                            style={{ color: industry.accentColor }}
                                                        >
                                                            {metric.value}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            {metric.label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Read More Link */}
                                            <div
                                                className="flex items-center gap-2 text-sm font-semibold"
                                                style={{ color: industry.accentColor }}
                                            >
                                                <span>Read Case Study</span>
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </article>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Other Industries Section */}
            <section className="py-20 md:py-28 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <FadeUp>
                        <div className="text-center mb-12">
                            <h2 className="text-display text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                                Explore Other Industries
                            </h2>
                            <p className="text-neutral-600">
                                Discover our expertise across other sectors.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {otherIndustries.map((otherIndustry, index) => {
                            const OtherIcon = iconMap[otherIndustry.icon] || Building2;
                            return (
                                <FadeUp key={otherIndustry.id} delay={index * 0.1}>
                                    <Link
                                        href={`/industries/${otherIndustry.slug}`}
                                        className="group block"
                                    >
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all hover:-translate-y-1">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                                style={{ backgroundColor: `${otherIndustry.accentColor}15` }}
                                            >
                                                <OtherIcon
                                                    className="h-6 w-6"
                                                    style={{ color: otherIndustry.accentColor }}
                                                />
                                            </div>
                                            <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                                                {otherIndustry.name}
                                            </h3>
                                            <p className="text-sm text-neutral-600 line-clamp-2">
                                                {otherIndustry.description}
                                            </p>
                                        </div>
                                    </Link>
                                </FadeUp>
                            );
                        })}
                    </div>

                    <FadeUp delay={0.3}>
                        <div className="text-center mt-8">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full"
                            >
                                <Link href="/industries">
                                    View All Industries
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title={`Ready to Transform Your ${industry.name}`}
                accentTitle="Organization?"
                description={`Connect with our ${industry.name.toLowerCase()} specialists to discuss how we can help address your sector-specific challenges and drive digital transformation.`}
                primaryCTA={{
                    label: "Schedule Consultation",
                    href: `/contact?industry=${industry.slug}`,
                }}
                secondaryCTA={{
                    label: "View Our Services",
                    href: "/services",
                }}
            />
        </div>
    );
}
