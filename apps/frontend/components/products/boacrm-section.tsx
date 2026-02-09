"use client";

import Link from "next/link";
import {
    Users,
    MessageSquare,
    Phone,
    ShieldCheck,
    Bot,
    BarChart3,
    ArrowRight,
    CheckCircle,
    Building2,
    CreditCard,
    Shield,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";

const features = [
    {
        icon: Users,
        title: "Customer 360",
        description: "Golden record with multi-source deduplication and relationship mapping",
    },
    {
        icon: MessageSquare,
        title: "Omnichannel Engagement",
        description: "Unified console for WhatsApp, SMS, email, voice, and in-branch",
    },
    {
        icon: Phone,
        title: "Contact Center Suite",
        description: "IVR, ACD, quality assurance, workforce management",
    },
    {
        icon: ShieldCheck,
        title: "Compliance & Governance",
        description: "NDPR/NDPA, BVN/NIN verification, KYC/AML workflows",
    },
    {
        icon: Bot,
        title: "Conversational AI",
        description: "Full chatbot builder with 24/7 availability",
    },
    {
        icon: BarChart3,
        title: "ML Analytics",
        description: "Churn prediction, propensity scoring, real-time dashboards",
    },
];

const valueProps = [
    {
        metric: "35",
        description: "Integrated modules",
        icon: Building2,
    },
    {
        metric: "2M+",
        description: "Customers managed",
        icon: Users,
    },
    {
        metric: "99.9%",
        description: "Platform uptime",
        icon: Shield,
    },
    {
        metric: "3-5x",
        description: "Cost savings",
        icon: CreditCard,
    },
];

const industries = [
    {
        title: "Commercial Banks",
        description: "Complete CRM for tier-1 and tier-2 banks",
        icon: "bank",
    },
    {
        title: "Microfinance Banks",
        description: "Scalable solution for 900+ Nigerian MFBs",
        icon: "microfinance",
    },
    {
        title: "Payment Providers",
        description: "Customer management for PSPs and fintechs",
        icon: "payment",
    },
    {
        title: "Insurance Companies",
        description: "Policyholder relationship management",
        icon: "insurance",
    },
    {
        title: "Credit Unions",
        description: "Member management and engagement",
        icon: "credit",
    },
];

export function BoaCRMSection() {
    return (
        <section
            id="boacrm"
            className="w-full py-16 md:py-24 bg-white scroll-mt-20"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Banking CRM Platform
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>

                    {/* Product Icon */}
                    <div className="flex justify-center mb-6 animate-fade-in-up delay-100">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg">
                            <Users className="h-10 w-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 animate-fade-in-up delay-100">
                        BoaCRM
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-indigo-500 mb-6 animate-fade-in-up delay-200">
                        The Operating System for Customer Relationships
                    </p>
                    <p className="text-lg text-neutral-600 animate-fade-in-up delay-300">
                        A comprehensive enterprise-grade CRM platform purpose-built for African financial
                        institutions. With 35 integrated modules, native compliance for NDPR/KYC/AML,
                        and omnichannel engagement capabilities, it transforms how banks manage
                        customer relationships at scale.
                    </p>
                </div>

                {/* Value Props Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <prop.icon className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">
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
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
                                        <feature.icon
                                            className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
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
                            Customer 360 Dashboard
                        </h3>

                        {/* Mock Dashboard */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-indigo-400 text-xs font-semibold mb-2">
                                    ACTIVE CUSTOMERS
                                </div>
                                <div className="text-3xl font-bold text-white">2.4M</div>
                                <div className="text-green-400 text-sm mt-1">+8.2% this quarter</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-indigo-400 text-xs font-semibold mb-2">
                                    OPEN CASES
                                </div>
                                <div className="text-3xl font-bold text-white">1,247</div>
                                <div className="text-neutral-400 text-sm mt-1">89% within SLA</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-indigo-400 text-xs font-semibold mb-2">
                                    CSAT SCORE
                                </div>
                                <div className="text-3xl font-bold text-white">4.7/5</div>
                                <div className="text-green-400 text-sm mt-1">Above target</div>
                            </div>
                        </div>

                        {/* CRM Placeholder */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-48 flex items-center justify-center border border-white/10">
                            <div className="text-center">
                                <Users className="h-12 w-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
                                <p className="text-white/60 text-sm">Unified Customer View</p>
                                <p className="text-white/40 text-xs mt-1">
                                    Complete customer lifecycle management across all channels
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industry Applications */}
                <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Built for African Financial Institutions
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {industries.map((industry, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300"
                            >
                                <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
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

                {/* Compliance Banner */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Native African Compliance
                        </h3>
                        <p className="text-lg text-white/90 mb-6">
                            Purpose-built for African regulatory requirements with NDPR/NDPA compliance,
                            BVN/NIN verification, and KYC/AML workflows built-in. No expensive add-ons required.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-xl font-bold">NDPR</div>
                                <div className="text-sm text-white/80">Compliant</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-xl font-bold">BVN/NIN</div>
                                <div className="text-sm text-white/80">Verification</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-xl font-bold">KYC/AML</div>
                                <div className="text-sm text-white/80">Workflows</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-xl font-bold">PCI-DSS</div>
                                <div className="text-sm text-white/80">Level 3</div>
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
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request BoaCRM Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            <Link href="/products/boacrm">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
