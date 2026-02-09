import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    Building2,
    Landmark,
    Heart,
    Radio,
    Truck,
    type LucideIcon,
} from "lucide-react";
import { routing } from "@/i18n/routing";
import { industries } from "@/data/industries";
import { FadeUp } from "@/components/ui/animations";
import { CTASection } from "@/components/shared";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: "Industries We Serve | Global Digitalbit Limited",
    description:
        "Explore our deep industry expertise across Financial Services, Healthcare, Government, Telecommunications, and Logistics. We deliver tailored solutions for sector-specific challenges.",
    openGraph: {
        title: "Industries We Serve | Global Digitalbit",
        description:
            "Deep industry expertise delivering tailored digital transformation solutions across key sectors.",
        url: "https://globaldigibit.com/industries",
    },
};

// Icon mapping for industries
const iconMap: Record<string, LucideIcon> = {
    Landmark,
    Heart,
    Building2,
    Radio,
    Truck,
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function IndustriesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-secondary">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <FadeUp>
                            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold text-white/90 uppercase tracking-wider mb-6">
                                Industry Expertise
                            </span>
                        </FadeUp>
                        <FadeUp delay={0.1}>
                            <h1 className="text-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                Industries{" "}
                                <span className="text-accent-orange">We Serve</span>
                            </h1>
                        </FadeUp>
                        <FadeUp delay={0.2}>
                            <p className="text-lead text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
                                Deep domain expertise across key industries, enabling us to
                                deliver contextually relevant solutions that address
                                sector-specific challenges and regulatory requirements.
                            </p>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* Industries Grid Section */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white to-neutral-50/50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    {/* Section Header */}
                    <FadeUp>
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <span className="overline text-xs font-bold tracking-wider text-primary uppercase mb-4 block">
                                Our Focus Areas
                            </span>
                            <h2 className="text-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                                Transforming Industries Through{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    Innovation
                                </span>
                            </h2>
                            <p className="text-lead text-lg text-neutral-600">
                                We bring specialized knowledge and proven methodologies to
                                help organizations in these sectors achieve their digital
                                transformation goals.
                            </p>
                        </div>
                    </FadeUp>

                    {/* Industries Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {industries.map((industry, index) => {
                            const IconComponent = iconMap[industry.icon] || Building2;
                            return (
                                <FadeUp key={industry.id} delay={index * 0.1}>
                                    <Link
                                        href={`/industries/${industry.slug}`}
                                        className="group block h-full"
                                    >
                                        <article className="card-interactive h-full bg-white rounded-2xl overflow-hidden shadow-md border border-neutral-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            {/* Card Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <Image
                                                    src={industry.heroImage}
                                                    alt={industry.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background: `linear-gradient(to top, ${industry.accentColor}dd 0%, ${industry.accentColor}66 50%, transparent 100%)`,
                                                    }}
                                                />
                                                {/* Icon Badge */}
                                                <div className="absolute bottom-4 left-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                                        style={{ backgroundColor: `${industry.accentColor}cc` }}
                                                    >
                                                        <IconComponent className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors">
                                                    {industry.name}
                                                </h3>
                                                <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                    {industry.description}
                                                </p>

                                                {/* Stats Preview */}
                                                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-neutral-100">
                                                    {industry.stats.slice(0, 2).map((stat, statIndex) => (
                                                        <div key={statIndex} className="text-center">
                                                            <div
                                                                className="text-lg font-bold"
                                                                style={{ color: industry.accentColor }}
                                                            >
                                                                {stat.value}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">
                                                                {stat.label}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* CTA */}
                                                <div
                                                    className="flex items-center gap-2 text-sm font-semibold transition-colors"
                                                    style={{ color: industry.accentColor }}
                                                >
                                                    <span>Explore Solutions</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </FadeUp>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Industry Expertise Matters */}
            <section className="py-20 md:py-28 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <FadeUp>
                            <div>
                                <span className="overline text-xs font-bold tracking-wider text-primary uppercase mb-4 block">
                                    Why It Matters
                                </span>
                                <h2 className="text-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                                    Industry Expertise{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                        Drives Results
                                    </span>
                                </h2>
                                <p className="text-lead text-lg text-neutral-600 mb-6">
                                    Generic solutions rarely address the unique challenges of
                                    specific industries. Our deep domain knowledge ensures that
                                    every solution we deliver is tailored to your sector&apos;s
                                    regulatory landscape, operational requirements, and
                                    competitive dynamics.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Regulatory compliance expertise specific to your industry",
                                        "Understanding of sector-specific operational challenges",
                                        "Proven track record with similar organizations",
                                        "Access to industry-specific best practices and benchmarks",
                                        "Faster time-to-value through relevant experience",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span className="text-neutral-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.2}>
                            <div className="relative">
                                <div className="grid grid-cols-2 gap-4">
                                    {industries.slice(0, 4).map((industry, index) => {
                                        const IconComponent = iconMap[industry.icon] || Building2;
                                        return (
                                            <div
                                                key={industry.id}
                                                className="bg-white rounded-xl p-6 shadow-md border border-neutral-100"
                                                style={{
                                                    animationDelay: `${index * 100}ms`,
                                                }}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                                    style={{ backgroundColor: `${industry.accentColor}15` }}
                                                >
                                                    <IconComponent
                                                        className="h-5 w-5"
                                                        style={{ color: industry.accentColor }}
                                                    />
                                                </div>
                                                <h3 className="font-semibold text-neutral-900 text-sm">
                                                    {industry.name}
                                                </h3>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Decorative element */}
                                <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl" />
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title="Ready to Transform"
                accentTitle="Your Industry?"
                description="Connect with our industry specialists to discuss how we can help address your sector-specific challenges and accelerate your digital transformation."
                primaryCTA={{
                    label: "Schedule Consultation",
                    href: "/contact",
                }}
                secondaryCTA={{
                    label: "View Our Services",
                    href: "/services",
                }}
            />
        </div>
    );
}
