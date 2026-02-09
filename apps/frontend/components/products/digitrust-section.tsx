"use client";

import Link from "next/link";
import {
    FileCheck,
    QrCode,
    ClipboardCheck,
    Plug,
    XCircle,
    Building2,
    ArrowRight,
    CheckCircle,
    ShieldCheck,
    Clock,
    Scale,
    FileText,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

const features = [
    {
        icon: FileCheck,
        title: "Credential Issuance",
        description: "Secure generation and blockchain anchoring of digital documents",
    },
    {
        icon: QrCode,
        title: "Public Verifier",
        description: "Instant QR code or document ID verification for anyone",
    },
    {
        icon: ClipboardCheck,
        title: "Auditor Console",
        description: "Compliance checks, lifecycle tracking, security logging",
    },
    {
        icon: Plug,
        title: "API Integration",
        description: "Seamless connection to existing HR, banking, or registry systems",
    },
    {
        icon: XCircle,
        title: "Revocation Management",
        description: "Instant credential invalidation with full audit trail",
    },
    {
        icon: Building2,
        title: "Multi-Tenant Support",
        description: "Support for multiple issuers under single deployment",
    },
];

const valueProps = [
    {
        metric: "100%",
        description: "Fraud elimination",
        icon: ShieldCheck,
    },
    {
        metric: "Seconds",
        description: "Verification time (vs days)",
        icon: Clock,
    },
    {
        metric: "GDPR",
        description: "Compliant & Qatar DPL",
        icon: Scale,
    },
    {
        metric: "Immutable",
        description: "Audit trail for compliance",
        icon: FileText,
    },
];

const useCases = [
    "Educational Institutions - academic credentials",
    "Government Registries - land titles, certificates",
    "Insurance Companies - policy verification",
    "Professional Bodies - certifications, licenses",
    "HR Departments - employment verification",
];

export function DigiTrustSection() {
    return (
        <section
            id="digitrust"
            className="w-full py-16 md:py-24 bg-neutral-50 scroll-mt-20"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Blockchain Credentials
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>

                    {/* Product Icon */}
                    <div className="flex justify-center mb-6 animate-fade-in-up delay-100">
                        <div className="w-20 h-20 rounded-2xl bg-accent-orange flex items-center justify-center shadow-lg">
                            <FileCheck className="h-10 w-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 animate-fade-in-up delay-100">
                        DigiTrust
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-accent-orange mb-6 animate-fade-in-up delay-200">
                        Immutable Trust for a Digital World
                    </p>
                    <p className="text-lg text-neutral-600 animate-fade-in-up delay-300">
                        A blockchain-based solution for issuing, verifying, and managing tamper-proof
                        digital credentials. From educational certificates to professional licenses,
                        land titles to insurance policies, DigiTrust ensures document authenticity
                        is never in question.
                    </p>
                </div>

                {/* Value Props Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-500 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-accent-orange/10 flex items-center justify-center">
                                    <prop.icon className="h-6 w-6 text-accent-orange" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-accent-orange mb-1">
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
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent-orange/10 flex items-center justify-center group-hover:bg-accent-orange group-hover:scale-110 transition-all duration-300">
                                        <feature.icon
                                            className="h-7 w-7 text-accent-orange group-hover:text-white transition-colors"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-accent-orange transition-colors">
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

                {/* Technology Stack */}
                <div className="bg-white rounded-2xl p-8 md:p-12 mb-12 shadow-lg animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Powered By
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-bold text-neutral-900 mb-2">Hyperledger Fabric</h4>
                            <p className="text-sm text-neutral-600">Enterprise-grade blockchain</p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-orange/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-accent-orange"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-bold text-neutral-900 mb-2">Zero-Knowledge Proofs</h4>
                            <p className="text-sm text-neutral-600">Privacy-preserving verification</p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-red/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-accent-red"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-bold text-neutral-900 mb-2">IPFS Storage</h4>
                            <p className="text-sm text-neutral-600">Decentralized document storage</p>
                        </div>
                    </div>
                </div>

                {/* Use Cases */}
                <div className="bg-gradient-to-br from-accent-orange/5 to-accent-orange/10 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Ideal For
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-accent-orange/20 shadow-sm"
                            >
                                <CheckCircle className="h-5 w-5 text-accent-orange flex-shrink-0" />
                                <span className="text-neutral-700 text-sm">{useCase}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-accent-orange hover:bg-accent-red text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request DigiTrust Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            <Link href="/products/digitrust">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
