import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Zap, TrendingUp } from "lucide-react";
import { CTASection } from "@/components/shared";
import { UseCaseCard } from "@/components/products/trustmehub";
import { trustMeHubUseCases, totalEconomicImpact } from "@/data/trustmehub/use-cases";

export const metadata: Metadata = {
    title: "TrustMeHub Use Cases - National-Scale Credential Verification | Global Digitalbit Limited",
    description:
        "Explore 10 national-scale use cases for TrustMeHub across education, banking, healthcare, government, and more. $60B+ combined economic impact.",
    keywords: [
        "credential verification use cases",
        "education verification",
        "KYC verification",
        "healthcare licensing",
        "government credentials",
        "Vision 2030",
    ],
    openGraph: {
        title: "TrustMeHub Use Cases - National-Scale Credential Verification",
        description:
            "10 use cases transforming credential verification with $60B+ economic impact.",
        url: "https://drkatangablog.com/products/trustmehub/use-cases",
    },
};

function formatCurrency(value: number): string {
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(1)}B+`;
    }
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(0)}M+`;
    }
    return `$${value.toLocaleString()}`;
}

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function TrustMeHubUseCasesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
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
                        href="/products/trustmehub"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to TrustMeHub
                    </Link>

                    <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white/80 font-medium">TrustMeHub</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
                        National-Scale Use Cases
                    </h1>

                    <p className="text-xl text-white/80 max-w-2xl mb-8 animate-fade-in-up delay-200">
                        Transforming credential verification across every major sector.
                        Explore real-world applications with measurable economic impact.
                    </p>
                </div>
            </section>

            {/* Economic Impact Banner */}
            <section className="w-full py-8 bg-emerald-50 border-b border-emerald-100">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-emerald-600">
                                    {formatCurrency(totalEconomicImpact)}
                                </div>
                                <div className="text-sm text-neutral-600">
                                    Combined Annual Economic Impact
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-12 bg-emerald-200"></div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold text-neutral-900">
                                {trustMeHubUseCases.length} Use Cases
                            </div>
                            <div className="text-sm text-neutral-600">
                                Across multiple sectors and industries
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Grid */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {trustMeHubUseCases.map((useCase, index) => (
                            <div
                                key={useCase.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <UseCaseCard
                                    useCase={useCase}
                                    variant="detailed"
                                    accentColor="#10B981"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision 2030 Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-teal-700">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Aligned with Vision 2030
                    </h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                        TrustMeHub is purpose-built to support digital transformation
                        initiatives, enabling governments and enterprises to establish
                        trust at national scale while driving economic growth.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                10,500+
                            </div>
                            <div className="text-sm text-white/80">Lives Saved Annually</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                35M+
                            </div>
                            <div className="text-sm text-white/80">Citizens Served</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                99%
                            </div>
                            <div className="text-sm text-white/80">Cost Reduction</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                98%
                            </div>
                            <div className="text-sm text-white/80">Fraud Eliminated</div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Ready to Transform Your Sector?"
                description="Schedule a demo to see how TrustMeHub can address your specific use case with measurable ROI."
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
