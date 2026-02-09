import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Sparkles,
    Zap,
    Shield,
    Gauge,
    FileText,
    CreditCard,
    Code2,
    GraduationCap,
    Landmark,
    HeartPulse,
    Building,
    Home,
    Briefcase,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { TrustIndicators, CTASection, AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";
import {
    ImpactCalculator,
    TrustLayerDiagram,
    FeatureExplorer,
} from "./interactive";
import type { FeatureDetail, TrustLayer } from "./interactive";

export const metadata: Metadata = {
    title: "TrustMeHub - Global Digital Trust Infrastructure | Global Digitalbit Limited",
    description:
        "TrustMeHub is a global digital trust infrastructure for instant, blockchain-anchored credential verification. Verify any credential in milliseconds, not weeks. Eliminate fraud, reduce costs by 99%, and scale to 100,000+ verifications per second.",
    keywords: [
        "credential verification",
        "blockchain credentials",
        "digital trust",
        "KYC verification",
        "education verification",
        "healthcare licensing",
        "zero knowledge proofs",
        "Hyperledger FireFly",
        "Vision 2030",
    ],
    openGraph: {
        title: "TrustMeHub - Building Trust. Empowering Growth.",
        description:
            "Verify any credential in milliseconds, not weeks. Global digital trust infrastructure for blockchain-anchored credential verification.",
        url: "https://drkatangablog.com/products/trustmehub",
        images: [
            {
                url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2670&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "TrustMeHub - Digital Trust Infrastructure",
            },
        ],
    },
};

const accent = "#059669";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const benefits = [
    "Sub-10ms credential verification with 92%+ cache hit rates",
    "Reduce verification costs by 99% — from $500 to $0.10 per check",
    "Eliminate 98% of credential fraud with blockchain-anchored proofs",
    "Privacy-preserving verification via zero-knowledge proofs",
    "National-scale capacity at 100,000+ verifications per second",
    "Multi-language support for global deployment across 6 languages",
];

const trustLayers: TrustLayer[] = [
    {
        id: "blockchain",
        label: "Hyperledger FireFly",
        description:
            "The immutable blockchain core anchors every credential to a tamper-proof distributed ledger. Ethereum-compatible smart contracts manage credential lifecycle, revocation, and audit trails with enterprise-grade permissioning.",
        accent: "#059669",
    },
    {
        id: "zkp",
        label: "Zero-Knowledge Proofs",
        description:
            "Cryptographic privacy layer enables selective disclosure — verifiers confirm credential validity without accessing sensitive personal data. Supports W3C Verifiable Credentials standard for interoperability.",
        accent: "#0284C7",
    },
    {
        id: "api",
        label: "API & SDKs",
        description:
            "RESTful APIs and SDKs for Node.js, Python, Go, and Rust enable rapid integration. OpenAPI 3.0 documentation, webhook notifications, and batch processing support enterprise workflows.",
        accent: "#7C3AED",
    },
    {
        id: "wallet",
        label: "Mobile Wallet & Portal",
        description:
            "iOS and Android mobile wallets with offline support let credential holders carry, share, and manage their verified credentials. Web portal provides enterprise dashboard with role-based access control.",
        accent: "#EA580C",
    },
];

const featureDetails: FeatureDetail[] = [
    {
        id: "instant",
        iconName: "Zap",
        title: "Instant Verification",
        description:
            "Sub-10ms verification responses with 92%+ cache hit rates. Transform verification from weeks to milliseconds.",
        capabilities: [
            "Sub-10ms p95 response time globally",
            "92%+ distributed cache hit rate",
            "Batch verification for bulk operations",
            "Real-time webhook notifications on status changes",
        ],
        highlight: "<10ms response",
    },
    {
        id: "blockchain",
        iconName: "Link2",
        title: "Blockchain Anchoring",
        description:
            "Hyperledger FireFly integration ensures immutable, tamper-proof credential records that cannot be forged or altered.",
        capabilities: [
            "Ethereum-compatible smart contracts",
            "Immutable credential lifecycle management",
            "Automated revocation propagation",
            "Cross-chain interoperability support",
        ],
        highlight: "Tamper-proof",
    },
    {
        id: "zkp",
        iconName: "Eye",
        title: "Zero-Knowledge Proofs",
        description:
            "Selective disclosure enables privacy-preserving verification without exposing sensitive personal data.",
        capabilities: [
            "W3C Verifiable Credentials compliant",
            "Selective attribute disclosure",
            "Age/qualification proofs without PII exposure",
            "Cryptographic proof generation in <50ms",
        ],
        highlight: "Privacy-first",
    },
    {
        id: "multitenant",
        iconName: "Building2",
        title: "Multi-Tenant Architecture",
        description:
            "Enterprise-grade Row-Level Security provides complete data isolation across organizations and jurisdictions.",
        capabilities: [
            "PostgreSQL Row-Level Security enforcement",
            "Per-tenant encryption keys",
            "Configurable data residency policies",
            "Tenant-scoped API keys and rate limiting",
        ],
        highlight: "Enterprise-grade",
    },
    {
        id: "mobile",
        iconName: "Smartphone",
        title: "Mobile Wallet",
        description:
            "iOS and Android apps with offline support allow credential holders to carry and share credentials anywhere.",
        capabilities: [
            "Native iOS and Android applications",
            "Offline credential presentation via QR",
            "Biometric authentication integration",
            "Push notification for credential updates",
        ],
        highlight: "Offline capable",
    },
    {
        id: "global",
        iconName: "Globe",
        title: "Multi-Language Support",
        description:
            "English, Arabic, French, Spanish, Portuguese, and Chinese support out of the box for global deployment.",
        capabilities: [
            "6 languages supported natively",
            "RTL layout support for Arabic",
            "Locale-aware date and number formatting",
            "Custom language packs via API",
        ],
        highlight: "6 languages",
    },
];

const useCases = [
    {
        icon: GraduationCap,
        title: "Education Verification",
        description: "Eliminate 40% of global credential fraud in academic certificates",
        impact: "$114M+ annual impact",
        slug: "education-certificate-verification",
    },
    {
        icon: Landmark,
        title: "Banking & KYC",
        description: "Reduce KYC completion from 3-5 days to 3 minutes",
        impact: "$928M+ annual impact",
        slug: "banking-kyc-compliance",
    },
    {
        icon: HeartPulse,
        title: "Healthcare Licensing",
        description: "Verify 600K+ healthcare workers, save 5,000+ lives annually",
        impact: "$318M+ annual impact",
        slug: "healthcare-licensing",
    },
    {
        icon: Building,
        title: "Government Services",
        description: "Eliminate ghost workers and verify civil service credentials",
        impact: "$239M+ annual impact",
        slug: "government-employment",
    },
    {
        icon: Home,
        title: "Land & Property",
        description: "Blockchain property titles ending double allocation fraud",
        impact: "$213M+ annual impact",
        slug: "land-registry-titles",
    },
    {
        icon: Briefcase,
        title: "Professional Licensing",
        description: "Verify credentials across 50+ professional regulatory bodies",
        impact: "$1.8B+ annual impact",
        slug: "professional-licensing",
    },
];

const howItWorks = [
    {
        title: "Integration",
        duration: "Week 1",
        description:
            "Connect TrustMeHub to your existing systems via REST APIs and pre-built connectors. Configure authentication, webhooks, and data mapping.",
        deliverables: ["API integration", "SSO configuration", "Webhook setup"],
    },
    {
        title: "Credential Schema Design",
        duration: "Week 2",
        description:
            "Define credential schemas, verification rules, and issuer policies. Configure blockchain anchoring and zero-knowledge proof parameters.",
        deliverables: ["Schema definitions", "Verification rules", "Issuer onboarding"],
    },
    {
        title: "Pilot Launch",
        duration: "Week 3\u20134",
        description:
            "Deploy to a pilot group with monitoring dashboards. Validate performance, gather feedback, and fine-tune configurations.",
        deliverables: ["Pilot deployment", "Performance validation", "User training"],
    },
    {
        title: "National Rollout",
        duration: "Month 2\u20133",
        description:
            "Scale to full production with load balancing, geo-distributed caching, and 99.9% SLA monitoring across all regions.",
        deliverables: ["Production scaling", "SLA monitoring", "Compliance audit"],
    },
];

const faqs = [
    {
        question: "How does TrustMeHub verify credentials in under 10ms?",
        answer: "TrustMeHub uses a multi-tier caching architecture with geo-distributed Redis clusters achieving 92%+ cache hit rates. For cache misses, optimized blockchain queries and pre-indexed credential states ensure sub-second verification even at national scale.",
    },
    {
        question: "What blockchain technology does TrustMeHub use?",
        answer: "TrustMeHub is built on Hyperledger FireFly, an enterprise-grade blockchain platform that is Ethereum-compatible. This provides immutable credential anchoring with permissioned access control suitable for government and enterprise deployments.",
    },
    {
        question: "How does zero-knowledge proof verification work?",
        answer: "Zero-knowledge proofs allow a verifier to confirm a credential claim (e.g., 'this person has a valid medical license') without seeing the underlying personal data. TrustMeHub generates cryptographic proofs in under 50ms that are W3C Verifiable Credentials compliant.",
    },
    {
        question: "Can TrustMeHub integrate with our existing systems?",
        answer: "Yes. TrustMeHub provides RESTful APIs with OpenAPI 3.0 documentation, SDKs for Node.js, Python, Go, and Rust, plus pre-built connectors for common identity providers and enterprise systems. Most integrations complete within one week.",
    },
    {
        question: "What compliance standards does TrustMeHub meet?",
        answer: "TrustMeHub is GDPR compliant, ISO 27001 certified, SOC 2 Type II certified, aligned with Saudi PDPL requirements, and fully compliant with the W3C Verifiable Credentials standard.",
    },
    {
        question: "What is the pricing model for TrustMeHub?",
        answer: "TrustMeHub offers tiered pricing based on verification volume, starting from pay-as-you-go for small deployments to enterprise agreements for national-scale implementations. Visit our pricing page for detailed plans.",
    },
];

const compliance = [
    { name: "GDPR Compliant", status: "certified" },
    { name: "ISO 27001", status: "certified" },
    { name: "SOC 2 Type II", status: "certified" },
    { name: "Saudi PDPL", status: "aligned" },
    { name: "W3C VC Standard", status: "compliant" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function TrustMeHubPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fdf9] via-white to-white">
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
                                Global Digital Trust Infrastructure
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                TrustMeHub
                                <span className="text-neutral-700">
                                    {" — Building Trust. Empowering Growth."}
                                </span>
                            </h1>

                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                A global digital trust infrastructure for instant, blockchain-anchored
                                credential verification. Verify any credential in milliseconds, not weeks.
                                Transform how credentials are issued, verified, and trusted at national scale.
                            </p>

                            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full font-semibold"
                                    style={{ backgroundColor: accent, borderColor: accent }}
                                >
                                    <Link href="/contact?product=trustmehub">
                                        Request Demo
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
                                    <Link href="/products/trustmehub/pricing">View Pricing</Link>
                                </Button>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl animate-fade-in-up delay-400">
                                <StatPill
                                    icon={<Zap size={18} />}
                                    label="Verification speed"
                                    value="<10ms Verify"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Shield size={18} />}
                                    label="Cost reduction"
                                    value="99% Cost Cut"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Gauge size={18} />}
                                    label="Throughput"
                                    value="100K+ TPS"
                                    accent={accent}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <ImpactCalculator accentColor={accent} />
                        </div>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Sub Navigation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="w-full py-4 bg-white border-b border-neutral-200 sticky top-16 z-30">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
                        <Link
                            href="/products/trustmehub"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap bg-emerald-500 text-white"
                        >
                            <Zap className="h-4 w-4" />
                            Overview
                        </Link>
                        <Link
                            href="/products/trustmehub/use-cases"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <FileText className="h-4 w-4" />
                            Use Cases
                        </Link>
                        <Link
                            href="/products/trustmehub/pricing"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <CreditCard className="h-4 w-4" />
                            Pricing
                        </Link>
                        <Link
                            href="/products/trustmehub/docs"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <Code2 className="h-4 w-4" />
                            API Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Why TrustMeHub + Trust Diagram \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="relative container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
                    <div className="space-y-6">
                        <AnimateOnScroll animation="fade-up">
                            <SectionHeader title="Why TrustMeHub" accent={accent} subtitle="Measurable impact from day one across credential verification workflows." />
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
                        <TrustLayerDiagram layers={trustLayers} accentColor={accent} />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* \u2500\u2500 Platform Capabilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
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

            {/* \u2500\u2500 How It Works (timeline) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="How It Works"
                        accent={accent}
                        subtitle="From integration to national rollout in four stages."
                    />
                </AnimateOnScroll>
                <AnimateOnScroll animation="scale" delay={100}>
                    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
                        <div className="space-y-4">
                            {howItWorks.map((step, idx) => (
                                <AnimateOnScroll key={step.title} animation="slide-right" delay={idx * 150}>
                                    <div className="flex gap-4">
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

            {/* \u2500\u2500 Use Cases \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="relative overflow-hidden bg-neutral-50 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="Industry Applications"
                            accent={accent}
                            subtitle="Transforming credential verification across every major sector with $60B+ annual economic impact."
                        />
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {useCases.map((uc, idx) => (
                            <AnimateOnScroll key={uc.slug} animation="fade-up" delay={idx * 120}>
                                <Link
                                    href={`/products/trustmehub/use-cases/${uc.slug}`}
                                    className="group bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg block"
                                >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${accent}15`, color: accent }}
                                >
                                    <uc.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-emerald-600 transition-colors">
                                    {uc.title}
                                </h3>
                                <p className="text-sm text-neutral-600 mb-4">{uc.description}</p>
                                <div className="flex items-center justify-between">
                                    <span
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ backgroundColor: `${accent}15`, color: accent }}
                                    >
                                        {uc.impact}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                </Link>
                            </AnimateOnScroll>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full border-2"
                            style={{ borderColor: accent, color: accent }}
                        >
                            <Link href="/products/trustmehub/use-cases">
                                View All 10 Use Cases
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Vision 2030 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="Aligned with Vision 2030"
                        accent={accent}
                        subtitle="Purpose-built to support digital transformation initiatives at national scale."
                    />
                </AnimateOnScroll>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { value: "10,500+", label: "Lives saved annually" },
                        { value: "$60B+", label: "Annual market value" },
                        { value: "35M+", label: "Citizens served" },
                        { value: "99.9%", label: "Uptime SLA" },
                    ].map((stat, idx) => (
                        <AnimateOnScroll key={stat.label} animation="scale" delay={idx * 100}>
                            <div
                                className="bg-white border border-neutral-100 rounded-2xl p-6 text-center shadow-sm"
                            >
                                <div className="text-2xl md:text-3xl font-bold" style={{ color: accent }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-600 mt-1">{stat.label}</div>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </section>

            {/* \u2500\u2500 Compliance \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 pb-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="Compliance & Certifications"
                        accent={accent}
                        subtitle="Enterprise-grade security and regulatory compliance built in."
                    />
                </AnimateOnScroll>
                <AnimateOnScroll animation="fade-up" delay={100}>
                    <div className="flex flex-wrap gap-3">
                    {compliance.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-100 rounded-full shadow-sm"
                        >
                            <CheckCircle className="h-4 w-4" style={{ color: accent }} />
                            <span className="text-sm font-medium text-neutral-800">{item.name}</span>
                            <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                                style={{ backgroundColor: `${accent}15`, color: accent }}
                            >
                                {item.status}
                            </span>
                        </div>
                    ))}
                    </div>
                </AnimateOnScroll>
            </section>

            {/* \u2500\u2500 FAQ \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />
            <section className="bg-neutral-50 py-14">
                <div className="container mx-auto px-4 md:px-6 lg:px-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="TrustMeHub FAQ"
                            accent={accent}
                            subtitle="Common questions from enterprise teams and decision-makers."
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
                </div>
            </section>

            {/* \u2500\u2500 Trust + CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <AnimateOnScroll animation="fade-up">
                <TrustIndicators />
            </AnimateOnScroll>

            <AnimateOnScroll animation="scale">
                <CTASection
                    title="Ready to Transform Credential Verification?"
                    description="Schedule a personalized demo to see how TrustMeHub can eliminate fraud, reduce costs by 99%, and verify credentials in milliseconds."
                    primaryCTA={{
                        label: "Request Demo",
                        href: "/contact?product=trustmehub",
                    }}
                    secondaryCTA={{
                        label: "View Pricing",
                        href: "/products/trustmehub/pricing",
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
