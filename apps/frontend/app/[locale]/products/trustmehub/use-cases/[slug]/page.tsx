import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Clock,
    DollarSign,
    Target,
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
    type LucideIcon,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { CTASection } from "@/components/shared";
import { UseCaseCard } from "@/components/products/trustmehub";
import {
    trustMeHubUseCases,
    getUseCaseBySlug,
    getRelatedUseCases,
} from "@/data/trustmehub/use-cases";

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

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
    return trustMeHubUseCases.map((useCase) => ({
        slug: useCase.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const useCase = getUseCaseBySlug(slug);

    if (!useCase) {
        return {
            title: "Use Case Not Found",
        };
    }

    return {
        title: `${useCase.title} - TrustMeHub Use Case | Global Digitalbit Limited`,
        description: useCase.fullDescription,
        keywords: [
            useCase.title.toLowerCase(),
            useCase.sector.toLowerCase(),
            "credential verification",
            "blockchain",
            "TrustMeHub",
        ],
        openGraph: {
            title: `${useCase.title} - TrustMeHub`,
            description: useCase.shortDescription,
            url: `https://globaldigibit.com/products/trustmehub/use-cases/${slug}`,
        },
    };
}

export default async function UseCasePage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const useCase = getUseCaseBySlug(slug);

    if (!useCase) {
        notFound();
    }

    const Icon = iconMap[useCase.icon] || Briefcase;
    const relatedUseCases = getRelatedUseCases(slug, 3);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    {/* Back Link */}
                    <Link
                        href="/products/trustmehub/use-cases"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All Use Cases
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <span className="text-emerald-200 text-sm font-medium">
                                        {useCase.sector}
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up delay-100">
                                {useCase.title}
                            </h1>

                            <p className="text-xl text-white/80 mb-8 animate-fade-in-up delay-200">
                                {useCase.fullDescription}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-full px-8"
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
                                    className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 rounded-full px-8"
                                >
                                    <Link href="/products/trustmehub/pricing">
                                        View Pricing
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                                <div className="text-center mb-6">
                                    <div className="text-5xl font-bold text-white mb-2">
                                        {useCase.economicImpact.annualValue}
                                    </div>
                                    <div className="text-emerald-200">
                                        Annual Economic Impact
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {useCase.roi.costReduction}
                                        </div>
                                        <div className="text-sm text-white/70">
                                            Cost Reduction
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {useCase.roi.efficiencyGain}
                                        </div>
                                        <div className="text-sm text-white/70">
                                            Efficiency Gain
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {useCase.roi.timeToValue}
                                        </div>
                                        <div className="text-sm text-white/70">
                                            Time to Value
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="w-full py-12 bg-emerald-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {useCase.statistics.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-neutral-900">
                                    {stat.label}
                                </div>
                                {stat.detail && (
                                    <div className="text-xs text-neutral-500 mt-1">
                                        {stat.detail}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Challenges Section */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Challenges */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900">
                                    Current Challenges
                                </h2>
                            </div>
                            <ul className="space-y-4">
                                {useCase.challenges.map((challenge, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                            <span className="text-red-600 text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <span className="text-neutral-700">{challenge}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Solutions */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Lightbulb className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900">
                                    TrustMeHub Solutions
                                </h2>
                            </div>
                            <ul className="space-y-4">
                                {useCase.solutions.map((solution, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <span className="text-neutral-700">{solution}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="w-full py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                                Key Benefits
                            </span>
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Transform Your {useCase.sector} Operations
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useCase.benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-md border border-neutral-100 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <p className="text-neutral-700 font-medium">{benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROI Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-teal-700">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Return on Investment
                        </h2>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Measurable impact from day one with TrustMeHub
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-7 w-7 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {useCase.roi.timeToValue}
                            </div>
                            <div className="text-white/80">Time to Value</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="h-7 w-7 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {useCase.roi.costReduction}
                            </div>
                            <div className="text-white/80">Cost Reduction</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-7 w-7 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {useCase.roi.efficiencyGain}
                            </div>
                            <div className="text-white/80">Efficiency Gain</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Use Cases */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Related Use Cases
                        </h2>
                        <p className="text-lg text-neutral-600">
                            Explore other sectors transforming with TrustMeHub
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedUseCases.map((related, index) => (
                            <div
                                key={related.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <UseCaseCard
                                    useCase={related}
                                    variant="compact"
                                    accentColor="#10B981"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full"
                        >
                            <Link href="/products/trustmehub/use-cases">
                                View All Use Cases
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <CTASection
                title={`Ready to Transform ${useCase.sector}?`}
                description="Schedule a personalized demo to see how TrustMeHub can address your specific challenges."
                primaryCTA={{
                    label: "Request Demo",
                    href: "/contact",
                }}
                secondaryCTA={{
                    label: "View Pricing",
                    href: "/products/trustmehub/pricing",
                }}
            />
        </div>
    );
}
