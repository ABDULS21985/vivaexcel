"use client";

import Link from "next/link";
import {
    Zap,
    Link2,
    Eye,
    Building2,
    Smartphone,
    Globe,
    ArrowRight,
    CheckCircle,
    Clock,
    DollarSign,
    ShieldCheck,
    Gauge,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

const features = [
    {
        icon: Zap,
        title: "Instant Verification",
        description: "Sub-10ms verification responses with 92%+ cache hit rates",
    },
    {
        icon: Link2,
        title: "Blockchain Anchoring",
        description: "Hyperledger FireFly for immutable, tamper-proof records",
    },
    {
        icon: Eye,
        title: "Zero-Knowledge Proofs",
        description: "Privacy-preserving selective disclosure verification",
    },
    {
        icon: Building2,
        title: "Multi-Tenant Architecture",
        description: "Enterprise-grade Row-Level Security for data isolation",
    },
    {
        icon: Smartphone,
        title: "Mobile Wallet",
        description: "iOS/Android apps with offline credential support",
    },
    {
        icon: Globe,
        title: "Global Reach",
        description: "Multi-language: English, Arabic, French, Spanish, Portuguese, Chinese",
    },
];

const valueProps = [
    {
        metric: "<10ms",
        description: "Verification time",
        icon: Clock,
    },
    {
        metric: "99%",
        description: "Cost reduction",
        icon: DollarSign,
    },
    {
        metric: "98%",
        description: "Fraud eliminated",
        icon: ShieldCheck,
    },
    {
        metric: "100K+",
        description: "Verifications/second",
        icon: Gauge,
    },
];

const industries = [
    {
        title: "Education",
        description: "Eliminate 40% of global credential fraud",
        icon: "education",
    },
    {
        title: "Banking & KYC",
        description: "Reduce KYC from days to minutes",
        icon: "bank",
    },
    {
        title: "Healthcare",
        description: "Verify 600K+ medical professionals",
        icon: "health",
    },
    {
        title: "Government",
        description: "National identity and employment verification",
        icon: "building",
    },
    {
        title: "Real Estate",
        description: "Blockchain property titles and land registry",
        icon: "property",
    },
    {
        title: "Professional Services",
        description: "Licensing for 50+ professional bodies",
        icon: "license",
    },
];

export function TrustMeHubSection() {
    return (
        <section
            id="trustmehub"
            className="w-full py-16 md:py-24 bg-white scroll-mt-20"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Digital Trust Infrastructure
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>

                    {/* Product Icon */}
                    <div className="flex justify-center mb-6 animate-fade-in-up delay-100">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                            <Zap className="h-10 w-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 animate-fade-in-up delay-100">
                        TrustMeHub
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-emerald-500 mb-6 animate-fade-in-up delay-200">
                        Building Trust. Empowering Growth.
                    </p>
                    <p className="text-lg text-neutral-600 animate-fade-in-up delay-300">
                        A global digital trust infrastructure for instant, blockchain-anchored credential
                        verification. Verify any credential in milliseconds, not weeks. Transform how
                        credentials are issued, verified, and trusted at national scale.
                    </p>
                </div>

                {/* Value Props Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <prop.icon className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-1">
                                {prop.metric}
                            </div>
                            <div className="text-sm text-neutral-600">{prop.description}</div>
                        </div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="mb-12 md:mb-16">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8 animate-fade-in-up">
                        Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-100 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                                        <feature.icon
                                            className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-neutral-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="w-full h-full"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
                            Verification Dashboard Preview
                        </h3>

                        {/* Mock Dashboard */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-emerald-400 text-xs font-semibold mb-2">
                                    CREDENTIALS ISSUED
                                </div>
                                <div className="text-3xl font-bold text-white">2.4M</div>
                                <div className="text-green-400 text-sm mt-1">+18% this month</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-emerald-400 text-xs font-semibold mb-2">
                                    VERIFICATIONS TODAY
                                </div>
                                <div className="text-3xl font-bold text-white">847K</div>
                                <div className="text-neutral-400 text-sm mt-1">Avg: 3.2ms response</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-emerald-400 text-xs font-semibold mb-2">
                                    FRAUD BLOCKED
                                </div>
                                <div className="text-3xl font-bold text-white">12,847</div>
                                <div className="text-red-400 text-sm mt-1">98.7% detection rate</div>
                            </div>
                        </div>

                        {/* Verification Flow Placeholder */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-48 flex items-center justify-center border border-white/10">
                            <div className="text-center">
                                <Link2 className="h-12 w-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
                                <p className="text-white/60 text-sm">Blockchain Verification Flow</p>
                                <p className="text-white/40 text-xs mt-1">
                                    Instant credential verification anchored to Hyperledger FireFly
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industry Applications */}
                <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Industry Applications
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {industries.map((industry, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300"
                            >
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-neutral-900 block">
                                        {industry.title}
                                    </span>
                                    <span className="text-neutral-500 text-sm">
                                        {industry.description}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vision 2030 Alignment Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Aligned with Vision 2030
                        </h3>
                        <p className="text-lg text-white/90 mb-6">
                            TrustMeHub is purpose-built to support digital transformation initiatives,
                            enabling governments and enterprises to establish trust at national scale
                            with $60B+ annual economic impact potential.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">10,500+</div>
                                <div className="text-sm text-white/80">Lives saved annually</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">SOC 2</div>
                                <div className="text-sm text-white/80">Type II Certified</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">ISO 27001</div>
                                <div className="text-sm text-white/80">Certified</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">GDPR</div>
                                <div className="text-sm text-white/80">Compliant</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request TrustMeHub Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            <Link href="/products/trustmehub">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
