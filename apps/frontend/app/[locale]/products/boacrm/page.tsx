import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Landmark,
    Building2,
    CreditCard,
    Shield,
    Globe,
    Zap,
    Database,
    Sparkles,
    Users,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { TrustIndicators, CTASection, AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";
import {
    CostSavingsCalculator,
    ModuleLayerDiagram,
    FeatureExplorer,
} from "./interactive";
import type { FeatureDetail, ModuleLayer } from "./interactive";

export const metadata: Metadata = {
    title: "BoaCRM - Enterprise Banking CRM for Africa | Global Digitalbit Limited",
    description:
        "BoaCRM is a comprehensive enterprise-grade CRM platform purpose-built for African financial institutions. 35 integrated modules, native NDPR/KYC/AML compliance, omnichannel engagement, and AI-powered analytics.",
    keywords: [
        "banking CRM",
        "African banking software",
        "NDPR compliance",
        "KYC AML",
        "BVN verification",
        "NIN verification",
        "omnichannel banking",
        "customer 360",
        "Nigerian banking software",
        "microfinance CRM",
    ],
    openGraph: {
        title: "BoaCRM - The Operating System for Customer Relationships",
        description:
            "35 integrated modules, native African compliance, and 2M+ customers managed in production.",
        url: "https://globaldigibit.com/products/boacrm",
        images: [
            {
                url: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "BoaCRM - Enterprise Banking Platform",
            },
        ],
    },
};

const accent = "#4F46E5";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const benefits = [
    "35 integrated modules — no expensive add-ons or fragmented tools",
    "Native NDPR/NDPA, KYC/AML, and BVN/NIN compliance built into the core",
    "3–5x cost savings compared to Salesforce or Dynamics 365",
    "Omnichannel engagement across WhatsApp, SMS, email, voice, and in-branch",
    "AI-powered churn prediction, propensity scoring, and RFM analytics",
    "Production-proven with 2M+ customers managed across African institutions",
];

const moduleLayers: ModuleLayer[] = [
    {
        id: "core",
        label: "Core CRM",
        description:
            "Golden record management with multi-source deduplication, relationship mapping, data quality scoring, and Customer 360 views across all touchpoints.",
        accent: "#059669",
    },
    {
        id: "sales",
        label: "Sales & Service",
        description:
            "Pipeline management, opportunity tracking, contact center suite with IVR/ACD, quality assurance, workforce management, and real-time supervisor dashboards.",
        accent: "#0284C7",
    },
    {
        id: "compliance",
        label: "Compliance & Governance",
        description:
            "Native NDPR/NDPA compliance, BVN/NIN verification workflows, KYC/AML automation, tamper-evident audit trails, and Islamic banking support.",
        accent: "#7C3AED",
    },
    {
        id: "ai",
        label: "AI & Analytics",
        description:
            "ML-powered churn prediction, propensity scoring, RFM analysis, conversational AI chatbot builder, and real-time dashboards with WebSocket updates.",
        accent: accent,
    },
];

const featureDetails: FeatureDetail[] = [
    {
        id: "customer360",
        iconName: "Users",
        title: "Customer 360",
        description:
            "Golden record management with multi-source deduplication, relationship mapping, and data quality scoring across all touchpoints.",
        capabilities: [
            "Multi-source deduplication with fuzzy matching",
            "Relationship graph mapping across accounts",
            "Data quality scoring and enrichment pipelines",
            "Unified timeline across all interaction channels",
        ],
        highlight: "Single source of truth",
    },
    {
        id: "omnichannel",
        iconName: "MessageSquare",
        title: "Omnichannel Engagement",
        description:
            "Unified console for WhatsApp, SMS, email, voice, and in-branch interactions with intelligent routing and context preservation.",
        capabilities: [
            "WhatsApp Business API with template management",
            "Intelligent routing based on customer value tier",
            "Context preservation across channel switches",
            "Campaign orchestration with A/B testing",
        ],
        highlight: "5 channels unified",
    },
    {
        id: "contactcenter",
        iconName: "Phone",
        title: "Contact Center Suite",
        description:
            "Complete IVR, ACD, quality assurance, workforce management, and real-time supervisor dashboards for operational excellence.",
        capabilities: [
            "Visual IVR builder with drag-and-drop flows",
            "ACD with skills-based and priority routing",
            "Call recording with AI-powered quality scoring",
            "Workforce management and shift optimization",
        ],
        highlight: "Enterprise-grade",
    },
    {
        id: "compliance",
        iconName: "ShieldCheck",
        title: "Compliance & Governance",
        description:
            "Native NDPR/NDPA compliance, BVN/NIN verification, KYC/AML workflows, and tamper-evident audit trails for regulatory confidence.",
        capabilities: [
            "Automated BVN/NIN verification via NIBSS/NIMC",
            "KYC/AML workflow engine with risk scoring",
            "NDPR/NDPA consent management and data subject rights",
            "Tamper-evident audit logs with cryptographic hashing",
        ],
        highlight: "Africa-native compliance",
    },
    {
        id: "ai",
        iconName: "Bot",
        title: "Conversational AI",
        description:
            "Full chatbot builder with intent/entity management, 24/7 availability, and seamless human escalation when needed.",
        capabilities: [
            "Visual chatbot builder with intent management",
            "Multi-language support including Pidgin English",
            "Seamless handoff to human agents with full context",
            "Pre-built banking conversation templates",
        ],
        highlight: "24/7 availability",
    },
    {
        id: "analytics",
        iconName: "BarChart3",
        title: "ML-Powered Analytics",
        description:
            "Churn prediction, propensity scoring, RFM analysis, and real-time dashboards with WebSocket updates.",
        capabilities: [
            "Churn prediction with configurable risk thresholds",
            "Product propensity scoring for cross-sell/upsell",
            "RFM segmentation with automated campaign triggers",
            "Real-time dashboards with WebSocket streaming",
        ],
        highlight: "Predictive intelligence",
    },
];

const useCases = [
    {
        icon: Landmark,
        title: "Commercial Banks",
        description: "Complete CRM for tier-1 through tier-3 banks with full regulatory compliance and enterprise SLAs",
        metric: "Tier 1\u20133",
    },
    {
        icon: Building2,
        title: "Microfinance Banks",
        description: "Scalable, cost-effective solution purpose-built for the unique needs of Nigerian microfinance institutions",
        metric: "900+ MFBs",
    },
    {
        icon: CreditCard,
        title: "Payment Providers",
        description: "Customer lifecycle management for PSPs, fintechs, and mobile money operators across Africa",
        metric: "Fintech ready",
    },
    {
        icon: Shield,
        title: "Insurance Companies",
        description: "Policyholder relationship management, claims tracking, and agent performance analytics",
        metric: "Claims tracking",
    },
];

const howItWorks = [
    {
        title: "Assessment",
        duration: "Week 1",
        description:
            "We audit your current CRM landscape, map data sources, define compliance requirements, and design the target architecture.",
        deliverables: ["Gap analysis report", "Data mapping", "Architecture blueprint"],
    },
    {
        title: "Configuration",
        duration: "Week 2\u20133",
        description:
            "Module activation, workflow configuration, role-based access setup, and integration with core banking systems.",
        deliverables: ["Module setup", "Workflow rules", "RBAC configuration"],
    },
    {
        title: "Data Migration",
        duration: "Week 4\u20135",
        description:
            "Automated ETL pipelines migrate customer records, transaction histories, and compliance documents with zero data loss.",
        deliverables: ["ETL pipelines", "Data validation", "Reconciliation report"],
    },
    {
        title: "Go Live",
        duration: "Week 6\u20138",
        description:
            "Phased rollout with parallel running, staff training, hyper-care support, and performance optimization.",
        deliverables: ["User training", "Parallel run", "Hyper-care support"],
    },
];

const integrations = [
    { name: "Paystack", category: "Payments" },
    { name: "Flutterwave", category: "Payments" },
    { name: "BVN (NIBSS)", category: "Identity" },
    { name: "NIN (NIMC)", category: "Identity" },
    { name: "WhatsApp Business", category: "Channels" },
    { name: "Infobip SMS", category: "Channels" },
    { name: "SendGrid", category: "Email" },
    { name: "OpenAI / Claude", category: "AI" },
];

const faqs = [
    {
        question: "How does BoaCRM handle African compliance requirements?",
        answer: "BoaCRM has NDPR/NDPA, KYC/AML, BVN/NIN verification, and tamper-evident audit trails built into the core platform — not bolted on as expensive add-ons. Compliance is enforced at the data layer.",
    },
    {
        question: "What systems does BoaCRM integrate with?",
        answer: "BoaCRM provides pre-built connectors for Paystack, Flutterwave, NIBSS, NIMC, WhatsApp Business, Infobip, SendGrid, and leading AI providers, plus a REST API for custom integrations with core banking systems.",
    },
    {
        question: "What is the pricing model?",
        answer: "BoaCRM uses a per-seat licensing model with volume tiers. All 35 modules are included — no hidden per-module fees. Contact us for a detailed quote based on your institution size.",
    },
    {
        question: "How long does data migration take?",
        answer: "Typical migrations complete in 2\u20133 weeks using our automated ETL pipelines. We handle customer records, transaction history, and compliance documents with full reconciliation and zero data loss.",
    },
    {
        question: "Can BoaCRM support Islamic banking products?",
        answer: "Yes. BoaCRM includes dedicated modules for Murabaha, Ijara, and other Islamic finance products with Sharia-compliant profit calculation and reporting workflows.",
    },
    {
        question: "What uptime SLA does BoaCRM guarantee?",
        answer: "BoaCRM provides a 99.9% uptime SLA with enterprise support. Our cloud-native architecture on Kubernetes ensures high availability with automatic failover and horizontal scaling.",
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function BoaCRMPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f5f5ff] via-white to-white">
            {/* \u2500\u2500 Hero \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
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
                                Enterprise Banking CRM
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                BoaCRM
                                <span className="text-neutral-700">
                                    {" — The Operating System for Customer Relationships"}
                                </span>
                            </h1>

                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                A comprehensive enterprise-grade CRM platform purpose-built for African
                                financial institutions. 35 integrated modules, native compliance, and
                                omnichannel engagement to transform how banks manage customer relationships.
                            </p>

                            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full font-semibold"
                                    style={{ backgroundColor: accent, borderColor: accent }}
                                >
                                    <Link href="/contact?product=boacrm">
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
                                    icon={<Database size={18} />}
                                    label="Integrated modules"
                                    value="35 Modules"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Users size={18} />}
                                    label="Customers managed"
                                    value="2M+"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Zap size={18} />}
                                    label="Cost savings"
                                    value="3\u20135x Savings"
                                    accent={accent}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <CostSavingsCalculator accentColor={accent} />
                        </div>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Why BoaCRM + Module Diagram \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />

            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14 relative">
                <FloatingOrbs variant="section" />
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start relative z-10">
                    <div className="space-y-6">
                        <AnimateOnScroll animation="fade-up">
                            <SectionHeader title="Why BoaCRM" accent={accent} subtitle="Purpose-built for African financial institutions with measurable impact from day one." />
                        </AnimateOnScroll>
                        <div className="space-y-3">
                            {benefits.map((benefit, idx) => (
                                <AnimateOnScroll key={idx} animation="slide-right" delay={idx * 100}>
                                    <div className="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#4F46E5]/20">
                                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                                        <p className="text-neutral-800">{benefit}</p>
                                    </div>
                                </AnimateOnScroll>
                            ))}
                        </div>
                    </div>
                    <AnimateOnScroll animation="scale" delay={200}>
                        <ModuleLayerDiagram layers={moduleLayers} accentColor={accent} />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* \u2500\u2500 Platform Capabilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />

            <section id="features" className="bg-neutral-50 py-14 scroll-mt-20 relative overflow-hidden">
                <FloatingOrbs variant="section" />
                <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10">
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

            {/* \u2500\u2500 How It Works (timeline) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="How It Works"
                        accent={accent}
                        subtitle="From assessment to go-live in six to eight weeks."
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
                                                <div
                                                    className="w-px flex-1"
                                                    style={{
                                                        background: `linear-gradient(to bottom, ${accent}40, ${accent}10)`,
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 border border-neutral-100 rounded-xl p-4 shadow-sm mb-2 transition-all duration-300 hover:shadow-md hover:border-[#4F46E5]/20">
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
                                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-50 border border-neutral-200 transition-colors duration-200 hover:border-[#4F46E5]/30 hover:bg-[#4F46E5]/5"
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

            {/* \u2500\u2500 Industry Applications \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />

            <section className="bg-neutral-50 py-14 relative overflow-hidden">
                <FloatingOrbs variant="section" />
                <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="Industry Applications"
                            accent={accent}
                            subtitle="Trusted by financial institutions across Africa for customer relationship management."
                        />
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {useCases.map((uc, idx) => (
                            <AnimateOnScroll key={uc.title} animation="fade-up" delay={idx * 120}>
                                <div className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#4F46E5]/20 group h-full">
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

            {/* \u2500\u2500 Integrations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="Integrations"
                        accent={accent}
                        subtitle="Pre-built connectors for the African fintech ecosystem and beyond."
                    />
                </AnimateOnScroll>
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                    {integrations.map((integration, idx) => (
                        <AnimateOnScroll key={integration.name} animation="scale" delay={idx * 80}>
                            <div className="flex items-center gap-2.5 px-4 py-3 bg-white border border-neutral-100 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#4F46E5]/20 group">
                                <Globe className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" style={{ color: accent }} />
                                <span className="font-medium text-neutral-900">{integration.name}</span>
                                <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${accent}15`, color: accent }}
                                >
                                    {integration.category}
                                </span>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </section>

            {/* \u2500\u2500 FAQ \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <GradientDivider className="my-0" />

            <section className="bg-neutral-50 py-14 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 lg:px-10 relative z-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="BoaCRM FAQ"
                            accent={accent}
                            subtitle="Common questions from banking technology teams and decision-makers."
                        />
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-2 gap-4">
                        {faqs.map((faq, idx) => (
                            <AnimateOnScroll key={faq.question} animation="fade-up-rotate" delay={idx * 100}>
                                <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#4F46E5]/20 h-full">
                                    <p className="font-semibold text-neutral-900 mb-2">{faq.question}</p>
                                    <p className="text-sm text-neutral-700">{faq.answer}</p>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* \u2500\u2500 Trust + CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
            <AnimateOnScroll animation="fade-up">
                <TrustIndicators />
            </AnimateOnScroll>

            <AnimateOnScroll animation="scale">
                <CTASection
                    title="Ready to Transform Your Banking CRM?"
                    description="Schedule a personalized demo to see how BoaCRM can modernize your customer relationships with native African compliance and 35 integrated modules."
                    primaryCTA={{
                        label: "Request Live Demo",
                        href: "/contact?product=boacrm",
                    }}
                    secondaryCTA={{
                        label: "Download Product Brief",
                        href: "/contact?type=asset&name=boacrm-brief",
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
