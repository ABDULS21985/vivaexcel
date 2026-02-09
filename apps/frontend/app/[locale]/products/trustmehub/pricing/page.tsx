import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Zap, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { PricingTable, ComparisonTable, CTASection } from "@/components/shared";
import { pricingTiers, comparisonMetrics, faqItems } from "@/data/trustmehub/pricing";

export const metadata: Metadata = {
    title: "TrustMeHub Pricing - Plans for Every Organization | Global Digitalbit Limited",
    description:
        "Choose the right TrustMeHub plan for your organization. From free tier for testing to unlimited enterprise deployments. Compare traditional verification costs vs TrustMeHub.",
    keywords: [
        "TrustMeHub pricing",
        "credential verification pricing",
        "blockchain verification cost",
        "verification API pricing",
        "enterprise credential verification",
    ],
    openGraph: {
        title: "TrustMeHub Pricing - Plans for Every Organization",
        description:
            "From $0 to unlimited. Choose the right credential verification plan for your organization.",
        url: "https://drkatangablog.com/products/trustmehub/pricing",
    },
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function TrustMeHubPricingPage({ params }: Props) {
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
                        Choose Your Plan
                    </h1>

                    <p className="text-xl text-white/80 max-w-2xl mb-8 animate-fade-in-up delay-200">
                        From free testing to unlimited enterprise deployments.
                        Start verifying credentials in milliseconds, not weeks.
                    </p>

                    <div className="flex flex-wrap gap-6 text-white/90 animate-fade-in-up delay-300">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                            <span>14-day Pro trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Table Section */}
            <section className="w-full py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <PricingTable tiers={pricingTiers} accentColor="#10B981" />
                </div>
            </section>

            {/* Comparison Section */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                                Value Comparison
                            </span>
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Traditional vs TrustMeHub
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            See how TrustMeHub transforms credential verification with
                            99%+ improvements across all key metrics.
                        </p>
                    </div>

                    <ComparisonTable
                        metrics={comparisonMetrics}
                        leftLabel="Traditional"
                        rightLabel="TrustMeHub"
                        accentColor="#10B981"
                    />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="w-full py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <HelpCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqItems.map((item, index) => (
                            <details
                                key={index}
                                className="group bg-white rounded-xl border border-neutral-200 overflow-hidden"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <span className="font-semibold text-neutral-900">
                                        {item.question}
                                    </span>
                                    <ChevronDown className="h-5 w-5 text-neutral-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-6 pb-6 text-neutral-600">
                                    {item.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise CTA */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-teal-700">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Need a Custom Solution?
                    </h2>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                        Our enterprise team will design a solution tailored to your
                        organization&apos;s specific requirements and scale.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-full px-8"
                        >
                            <Link href="/contact?plan=enterprise">Contact Sales</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 rounded-full px-8"
                        >
                            <Link href="/products/trustmehub">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <CTASection
                title="Ready to Get Started?"
                description="Start with our free tier and scale as you grow. No credit card required."
                primaryCTA={{
                    label: "Start Free",
                    href: "/contact?plan=free",
                }}
                secondaryCTA={{
                    label: "View All Products",
                    href: "/products",
                }}
            />
        </div>
    );
}
