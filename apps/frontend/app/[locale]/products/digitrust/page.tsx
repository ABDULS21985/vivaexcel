import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    GraduationCap,
    Landmark,
    Shield,
    Briefcase,
    Zap,
    Lock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { TrustIndicators, CTASection, AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";
import {
    VerificationEstimator,
    CredentialLayerDiagram,
    FeatureExplorer,
} from "./interactive";
import type { FeatureDetail, CredentialLayer } from "./interactive";

export const metadata: Metadata = {
    title: "DigiTrust - Blockchain Credential Verification | Global Digitalbit Limited",
    description:
        "DigiTrust is a blockchain-based solution for issuing, verifying, and managing tamper-proof digital credentials. From educational certificates to professional licenses, land titles to insurance policies, DigiTrust ensures document authenticity is never in question.",
    keywords: [
        "blockchain credentials",
        "digital certificates",
        "document verification",
        "tamper-proof credentials",
        "credential issuance",
        "QR verification",
        "TrustMe platform",
        "digital documents",
    ],
    openGraph: {
        title: "DigiTrust - Immutable Trust for a Digital World",
        description:
            "Blockchain-based solution for issuing, verifying, and managing tamper-proof digital credentials.",
        url: "https://drkatangablog.com/products/digitrust",
        images: [
            {
                url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2670&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "DigiTrust - Blockchain Credential Platform",
            },
        ],
    },
};

const accent = "#D97706";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const benefits = [
    "Eliminate 100% of document fraud with blockchain-anchored credentials",
    "Reduce verification time from days to under 3 seconds",
    "GDPR and Qatar Data Protection Law fully compliant",
    "Immutable audit trail satisfies the strictest regulatory requirements",
    "Multi-language credential support (EN, AR, FR, ES, PT)",
    "Seamless RESTful API integration with existing enterprise systems",
];

const credentialLayers: CredentialLayer[] = [
    {
        id: "blockchain",
        label: "Blockchain Ledger",
        description:
            "Hyperledger Fabric anchors every credential hash on a distributed, tamper-proof ledger — providing the root of trust for the entire platform.",
        accent: "#059669",
    },
    {
        id: "crypto",
        label: "Cryptographic Layer",
        description:
            "PKI infrastructure with X.509 certificates and SHA-256 hashing ensures every credential carries a verifiable digital signature from the issuing authority.",
        accent: "#0284C7",
    },
    {
        id: "issuance",
        label: "Issuance & Management",
        description:
            "A full lifecycle engine for creating, updating, revoking, and expiring credentials — with batch operations, templates, and role-based access control.",
        accent: "#7C3AED",
    },
    {
        id: "portal",
        label: "Verification Portal",
        description:
            "A public-facing portal where any third party can scan a QR code or enter a credential ID to instantly verify authenticity and current status.",
        accent: accent,
    },
];

const featureDetails: FeatureDetail[] = [
    {
        id: "issuance",
        iconName: "FileCheck",
        title: "Credential Issuance System",
        description:
            "Secure generation and blockchain anchoring of digital documents with cryptographic signatures and tamper-proof storage.",
        capabilities: [
            "Batch issuance for thousands of credentials simultaneously",
            "Customizable credential templates with branding",
            "Automatic blockchain hash anchoring on confirmation",
            "Multi-signer approval workflows for high-value documents",
        ],
        highlight: "Blockchain-anchored",
    },
    {
        id: "verifier",
        iconName: "QrCode",
        title: "Public Verifier Portal",
        description:
            "Instant QR code or document ID verification accessible to anyone, anywhere, ensuring authenticity in seconds.",
        capabilities: [
            "Sub-3-second verification via QR scan or ID lookup",
            "No account required for third-party verifiers",
            "Real-time status check (active, revoked, expired)",
            "Embeddable verification widget for partner websites",
        ],
        highlight: "Instant verification",
    },
    {
        id: "admin",
        iconName: "ClipboardCheck",
        title: "Auditor / Admin Console",
        description:
            "Comprehensive compliance checks, lifecycle tracking, and detailed security logging for complete oversight.",
        capabilities: [
            "Role-based access with granular permissions",
            "Full credential lifecycle audit trail",
            "Compliance dashboard with exportable reports",
            "Anomaly detection and suspicious activity alerts",
        ],
        highlight: "Full audit trail",
    },
    {
        id: "api",
        iconName: "Plug",
        title: "RESTful API Integration",
        description:
            "Seamless connection to existing HR, banking, or registry systems through well-documented APIs and SDKs.",
        capabilities: [
            "OpenAPI 3.0 specification with interactive docs",
            "Webhook notifications for credential events",
            "SDKs for Node.js, Python, Java, and .NET",
            "Rate-limited sandbox environment for testing",
        ],
        highlight: "50+ integrations",
    },
    {
        id: "revocation",
        iconName: "XCircle",
        title: "Revocation Management",
        description:
            "Instant credential invalidation with full audit trail, ensuring compromised or expired documents are immediately flagged.",
        capabilities: [
            "One-click revocation with mandatory reason code",
            "Automatic propagation to all verification endpoints",
            "Scheduled expiration with renewal notifications",
            "Bulk revocation for institutional credential recalls",
        ],
        highlight: "Real-time propagation",
    },
    {
        id: "multitenant",
        iconName: "Building2",
        title: "Multi-Tenant Architecture",
        description:
            "Support for multiple issuers under a single deployment with complete data isolation and customization options.",
        capabilities: [
            "Isolated data stores per tenant with encryption at rest",
            "Custom branding, domains, and verification portals",
            "Per-tenant usage analytics and billing",
            "Federated identity with SSO support (SAML, OIDC)",
        ],
        highlight: "Enterprise-grade",
    },
];

const useCases = [
    {
        icon: GraduationCap,
        title: "Education",
        description: "Issue and verify academic credentials, diplomas, and certifications with blockchain authenticity that employers can trust instantly.",
        metric: "40% fraud eliminated",
    },
    {
        icon: Landmark,
        title: "Government",
        description: "Land titles, birth certificates, and licenses with immutable records and instant citizen-facing verification portals.",
        metric: "Instant verify",
    },
    {
        icon: Shield,
        title: "Insurance",
        description: "Policy documents and claims verification with tamper-proof records, reducing disputes and accelerating settlements.",
        metric: "Tamper-proof",
    },
    {
        icon: Briefcase,
        title: "Professional Bodies",
        description: "Certifications and membership credentials for regulatory bodies, enabling real-time license verification across borders.",
        metric: "50+ bodies",
    },
];

const howItWorks = [
    {
        title: "Integration",
        duration: "Week 1",
        description:
            "Connect DigiTrust to your existing systems via our RESTful API. We configure SSO, map data schemas, and provision your tenant environment.",
        deliverables: ["API configuration", "SSO setup", "Data schema mapping"],
    },
    {
        title: "Credential Design",
        duration: "Week 2",
        description:
            "Design credential templates with your branding, define approval workflows, and configure blockchain anchoring rules.",
        deliverables: ["Template design", "Workflow rules", "Blockchain config"],
    },
    {
        title: "Pilot Launch",
        duration: "Week 3\u20134",
        description:
            "Issue your first batch of credentials to a pilot group, test verification flows, and gather feedback from issuers and verifiers.",
        deliverables: ["Pilot issuance", "Verification testing", "Feedback review"],
    },
    {
        title: "Full Deployment",
        duration: "Month 2",
        description:
            "Roll out to all credential types and user groups with production monitoring, analytics dashboards, and ongoing support.",
        deliverables: ["Production rollout", "Analytics setup", "Support handoff"],
    },
];

const faqs = [
    {
        question: "What blockchain does DigiTrust use?",
        answer: "DigiTrust is built on Hyperledger Fabric, an enterprise-grade permissioned blockchain. This provides immutability and auditability without the energy costs and latency of public blockchains like Ethereum.",
    },
    {
        question: "How quickly can we deploy DigiTrust?",
        answer: "Standard deployments complete in 4\u20136 weeks. Organizations with existing API infrastructure can see first credentials issued within 2 weeks during the pilot phase.",
    },
    {
        question: "Is DigiTrust compliant with data protection regulations?",
        answer: "Yes. DigiTrust is fully GDPR compliant and adheres to Qatar Data Protection Law. Credential data is encrypted at rest and in transit, and personal data can be managed per data subject requests.",
    },
    {
        question: "Can third parties verify credentials without an account?",
        answer: "Absolutely. The public verification portal requires no account — anyone can scan a QR code or enter a credential ID to check authenticity and current status in under 3 seconds.",
    },
    {
        question: "How does revocation work?",
        answer: "Authorized admins can revoke any credential with a single click and a mandatory reason code. Revocation propagates instantly to all verification endpoints, so any subsequent check reflects the updated status in real time.",
    },
    {
        question: "What is the pricing model?",
        answer: "DigiTrust uses a per-credential-per-month model with volume tiers. We also offer flat-rate enterprise plans for organizations issuing over 100K credentials monthly. Contact us for a detailed quote.",
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function DigiTrustPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fffbf5] via-white to-white">
            {/* \u2500\u2500 Hero \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="relative overflow-hidden">
                <FloatingOrbs variant="hero" />
                <div
                    className="absolute inset-0 opacity-70"
                    style={{
                        background: `radial-gradient(circle at 20% 20%, ${accent}22, transparent 35%), radial-gradient(circle at 80% 10%, ${accent}1a, transparent 30%), linear-gradient(135deg, ${accent}0f 0%, #ffffff 60%)`,
                    }}
                />
                <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 md:py-24 relative z-10">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Link>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
                        <div className="space-y-6">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up"
                                style={{ backgroundColor: `${accent}15`, color: accent }}
                            >
                                <Sparkles size={16} />
                                Blockchain Credential Platform
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                DigiTrust
                                <span className="text-neutral-700">
                                    {" — Immutable Trust for a Digital World"}
                                </span>
                            </h1>

                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                DigiTrust, powered by the TrustMe platform, is a blockchain-based
                                solution for issuing, verifying, and managing tamper-proof digital
                                credentials. From educational certificates to professional licenses,
                                DigiTrust ensures document authenticity is never in question.
                            </p>

                            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full font-semibold"
                                    style={{ backgroundColor: accent, borderColor: accent }}
                                >
                                    <Link href="/contact?product=digitrust">
                                        Request Live Demo
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full border-2"
                                    style={{ borderColor: accent, color: accent }}
                                >
                                    <Link href="#features">Explore Features</Link>
                                </Button>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl animate-fade-in-up delay-400">
                                <StatPill
                                    icon={<ShieldCheck size={18} />}
                                    label="Fraud protection"
                                    value="100% Fraud-proof"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Zap size={18} />}
                                    label="Verification speed"
                                    value="Seconds Verification"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Lock size={18} />}
                                    label="Data protection"
                                    value="GDPR Compliant"
                                    accent={accent}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <VerificationEstimator accentColor={accent} />
                        </div>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Why DigiTrust + Architecture Diagram \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="relative container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
                    <div className="space-y-6">
                        <AnimateOnScroll animation="fade-up">
                            <SectionHeader title="Why DigiTrust" accent={accent} subtitle="Blockchain-backed trust that transforms how your organization handles credentials." />
                        </AnimateOnScroll>
                        <div className="space-y-3">
                            {benefits.map((benefit, idx) => (
                                <AnimateOnScroll key={idx} animation="slide-right" delay={idx * 100}>
                                    <div
                                        className="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                                        <p className="text-neutral-800">{benefit}</p>
                                    </div>
                                </AnimateOnScroll>
                            ))}
                        </div>
                    </div>
                    <AnimateOnScroll animation="scale" delay={200}>
                        <CredentialLayerDiagram layers={credentialLayers} accentColor={accent} />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* \u2500\u2500 Platform Capabilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section id="features" className="relative overflow-hidden bg-neutral-50 py-14 scroll-mt-20">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="Platform Capabilities"
                            accent={accent}
                            subtitle="Click any feature to explore its full capability set."
                        />
                    </AnimateOnScroll>
                    <AnimateOnScroll animation="fade-up" delay={150}>
                        <FeatureExplorer features={featureDetails} accentColor={accent} />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* \u2500\u2500 How It Works (timeline) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="How It Works"
                        accent={accent}
                        subtitle="From API integration to full credential deployment in four stages."
                    />
                </AnimateOnScroll>
                <AnimateOnScroll animation="scale" delay={100}>
                <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
                    <div className="space-y-4">
                        {howItWorks.map((step, idx) => (
                            <AnimateOnScroll key={step.title} animation="slide-right" delay={idx * 150}>
                            <div
                                className="flex gap-4"
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 transition-transform duration-300 hover:scale-110"
                                        style={{ backgroundColor: accent }}
                                    >
                                        {idx + 1}
                                    </div>
                                    {idx < howItWorks.length - 1 && (
                                        <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, ${accent}40, ${accent}10)` }} />
                                    )}
                                </div>
                                <div className="flex-1 border border-neutral-100 rounded-xl p-4 shadow-sm mb-2 transition-all duration-300 hover:shadow-md">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <p className="font-semibold text-neutral-900">{step.title}</p>
                                        <span
                                            className="text-xs font-semibold px-2 py-1 rounded-full"
                                            style={{ backgroundColor: `${accent}15`, color: accent }}
                                        >
                                            {step.duration}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700 mt-1">{step.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {step.deliverables.map((d) => (
                                            <span
                                                key={d}
                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-50 border border-neutral-200"
                                            >
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
                </AnimateOnScroll>
            </section>

            {/* \u2500\u2500 Industry Applications \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="relative overflow-hidden bg-neutral-50 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="Industry Applications"
                            accent={accent}
                            subtitle="Trusted by organizations across multiple sectors for credential verification."
                        />
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {useCases.map((uc, idx) => (
                            <AnimateOnScroll key={uc.title} animation="fade-up" delay={idx * 120}>
                            <div
                                className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group h-full"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    style={{ backgroundColor: `${accent}15`, color: accent }}
                                >
                                    <uc.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-1">{uc.title}</h3>
                                <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
                                    style={{ backgroundColor: `${accent}15`, color: accent }}
                                >
                                    {uc.metric}
                                </span>
                                <p className="text-sm text-neutral-600">{uc.description}</p>
                            </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 FAQ \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="DigiTrust FAQ"
                        accent={accent}
                        subtitle="Common questions from credential teams and decision-makers."
                    />
                </AnimateOnScroll>
                <div className="grid md:grid-cols-2 gap-4">
                    {faqs.map((faq, idx) => (
                        <AnimateOnScroll key={faq.question} animation="fade-up-rotate" delay={idx * 100}>
                        <div
                            className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md h-full"
                        >
                            <p className="font-semibold text-neutral-900 mb-2">{faq.question}</p>
                            <p className="text-sm text-neutral-700">{faq.answer}</p>
                        </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </section>

            {/* \u2500\u2500 Trust + CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <AnimateOnScroll animation="fade-up">
                <TrustIndicators />
            </AnimateOnScroll>

            <AnimateOnScroll animation="scale">
                <CTASection
                    title="Ready to Transform Document Verification?"
                    description="Schedule a personalized demo to see how DigiTrust can eliminate document fraud and provide instant credential verification for your organization."
                    primaryCTA={{
                        label: "Request Live Demo",
                        href: "/contact?product=digitrust",
                    }}
                    secondaryCTA={{
                        label: "Download Technical Brief",
                        href: "/contact?type=asset&name=digitrust-brief",
                    }}
                />
            </AnimateOnScroll>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

function SectionHeader({
    title,
    subtitle,
    accent: a,
}: {
    title: string;
    subtitle?: string;
    accent: string;
}) {
    return (
        <div className="mb-6">
            <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${a}15`, color: a }}
            >
                {title}
            </div>
            {subtitle && <p className="text-neutral-700 mt-2">{subtitle}</p>}
        </div>
    );
}

function StatPill({
    icon,
    label,
    value,
    accent: a,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className="bg-white border border-neutral-100 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3">
            <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${a}15`, color: a }}
            >
                {icon}
            </div>
            <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
                <p className="font-semibold text-neutral-900">{value}</p>
            </div>
        </div>
    );
}
