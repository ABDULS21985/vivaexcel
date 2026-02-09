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
    Boxes,
    FileCheck,
    Zap,
    Shield,
    Gauge,
    Sparkles,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { TrustIndicators, CTASection, AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";
import {
    PerformanceEstimator,
    GatewayLayerDiagram,
    FeatureExplorer,
} from "./interactive";
import type { FeatureDetail, GatewayLayer } from "./interactive";

export const metadata: Metadata = {
    title: "DigiGate - API Gateway & Lifecycle Management | Global Digitalbit Limited",
    description:
        "DigiGate is a comprehensive API gateway and lifecycle management solution that acts as the centralized control layer for an organization's entire digital infrastructure. It manages all inbound and outbound API traffic while enforcing security, routing policies, and governance at scale.",
    keywords: [
        "API gateway",
        "API management",
        "microservices",
        "API security",
        "load balancing",
        "rate limiting",
        "OAuth 2.0",
        "JWT validation",
        "developer portal",
    ],
    openGraph: {
        title: "DigiGate - The Command Center for Your Digital Ecosystem",
        description:
            "Comprehensive API gateway and lifecycle management for enterprise digital infrastructure.",
        url: "https://globaldigibit.com/products/digigate",
        images: [
            {
                url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2670&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "DigiGate - API Gateway Platform",
            },
        ],
    },
};

const accent = "#2563EB";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const benefits = [
    "Centralized security enforcement for every API endpoint",
    "Intelligent traffic routing with automatic failover",
    "Real-time monitoring and anomaly detection across all services",
    "Self-service developer portal with sandbox environments",
    "Policy-driven governance with granular access controls",
    "Seamless API composition for optimized client experiences",
];

const gatewayLayers: GatewayLayer[] = [
    {
        id: "clients",
        label: "Client Apps",
        description:
            "Web, mobile, IoT, and third-party applications connect through a unified ingress layer with automatic SDK generation and rate-limited access.",
        accent: "#059669",
    },
    {
        id: "security",
        label: "Security Layer",
        description:
            "OAuth 2.0, JWT validation, mTLS, WAF, and threat protection enforce zero-trust security policies before any request reaches your services.",
        accent: "#7C3AED",
    },
    {
        id: "routing",
        label: "Routing & Composition",
        description:
            "Intelligent load balancing, canary deployments, API versioning, and request aggregation orchestrate traffic to the right services at the right time.",
        accent: "#0284C7",
    },
    {
        id: "backend",
        label: "Backend Services",
        description:
            "Microservices, legacy systems, databases, and third-party APIs are abstracted behind a consistent interface with circuit-breaking and retry logic.",
        accent: accent,
    },
];

const featureDetails: FeatureDetail[] = [
    {
        id: "security",
        iconName: "Shield",
        title: "Centralized Security Enforcement",
        description:
            "OAuth 2.0, JWT validation, rate limiting, and threat protection for all your APIs in one unified security layer.",
        capabilities: [
            "OAuth 2.0 / OpenID Connect with multi-provider support",
            "JWT validation and token introspection at the edge",
            "WAF integration with OWASP Top 10 protection",
            "IP allowlisting, geo-blocking, and bot detection",
        ],
        highlight: "Zero-trust ready",
    },
    {
        id: "routing",
        iconName: "GitBranch",
        title: "Intelligent Traffic Routing",
        description:
            "Load balancing, failover, API versioning, and canary deployments out of the box for seamless traffic management.",
        capabilities: [
            "Weighted round-robin and least-connection balancing",
            "Automatic failover with health-check probes",
            "Header-based and path-based routing rules",
            "Canary and blue-green deployment strategies",
        ],
        highlight: "99.99% uptime",
    },
    {
        id: "composition",
        iconName: "Layers",
        title: "API Composition & Aggregation",
        description:
            "Combine multiple microservices into single client responses for optimal performance and simplified client integration.",
        capabilities: [
            "GraphQL-to-REST and REST-to-REST aggregation",
            "Response transformation and field filtering",
            "Parallel fan-out with configurable timeouts",
            "Caching layer with invalidation hooks",
        ],
        highlight: "3x faster responses",
    },
    {
        id: "monitoring",
        iconName: "Activity",
        title: "Real-Time Monitoring & Analytics",
        description:
            "Unified logging, tracing, performance dashboards, and anomaly detection for complete API observability.",
        capabilities: [
            "Distributed tracing with OpenTelemetry integration",
            "Real-time latency, error rate, and throughput dashboards",
            "ML-powered anomaly detection and alerting",
            "Custom metric pipelines with Prometheus export",
        ],
        highlight: "Full observability",
    },
    {
        id: "devportal",
        iconName: "Code2",
        title: "Developer Portal",
        description:
            "Self-service API documentation, sandbox testing, and key management to accelerate developer adoption.",
        capabilities: [
            "Auto-generated OpenAPI / Swagger documentation",
            "Interactive sandbox with mock backends",
            "API key and OAuth credential self-service",
            "Usage analytics and quota dashboards per developer",
        ],
        highlight: "Self-service",
    },
    {
        id: "policy",
        iconName: "Settings",
        title: "Policy Management",
        description:
            "Configurable security policies, throttling rules, and access controls with granular governance capabilities.",
        capabilities: [
            "Visual policy editor with drag-and-drop rules",
            "Per-route and per-consumer throttling policies",
            "Role-based access control with LDAP/AD sync",
            "Audit logging with tamper-proof trail export",
        ],
        highlight: "Enterprise governance",
    },
];

const useCases = [
    {
        icon: Landmark,
        title: "Financial Institutions",
        description: "Complex integrations with regulatory compliance, secure data handling, and real-time fraud detection at the API layer.",
        metric: "PCI-DSS ready",
    },
    {
        icon: Building2,
        title: "Government Digital Transformation",
        description: "Secure inter-agency data exchange with comprehensive audit trails and citizen-facing service orchestration.",
        metric: "Audit-grade",
    },
    {
        icon: Boxes,
        title: "Enterprise Microservices",
        description: "Unified API layer for distributed architectures with seamless service mesh integration and traffic shaping.",
        metric: "100+ APIs",
    },
    {
        icon: FileCheck,
        title: "Regulatory Compliance",
        description: "Built-in compliance controls for PCI-DSS, GDPR, and local data sovereignty regulations with automated reporting.",
        metric: "GDPR/local",
    },
];

const howItWorks = [
    {
        title: "Discovery",
        duration: "Day 1-2",
        description:
            "We audit your existing API landscape, map dependencies, and design the optimal gateway topology for your architecture.",
        deliverables: ["API inventory", "Dependency map", "Architecture blueprint"],
    },
    {
        title: "Security Setup",
        duration: "Week 1",
        description:
            "Deploy the security layer with OAuth 2.0, JWT validation, rate limiting, and threat protection policies tailored to your requirements.",
        deliverables: ["Auth configuration", "WAF rules", "Rate limit policies"],
    },
    {
        title: "Traffic Migration",
        duration: "Week 2-3",
        description:
            "Gradually migrate API traffic through DigiGate with canary deployments, monitoring, and rollback capabilities at every step.",
        deliverables: ["Canary routing", "Health checks", "Traffic dashboards"],
    },
    {
        title: "Full Operations",
        duration: "Week 4",
        description:
            "All traffic flows through DigiGate with full observability, developer portal live, and governance policies enforced across the estate.",
        deliverables: ["Dev portal launch", "Alerting workflows", "Compliance reports"],
    },
];

const faqs = [
    {
        question: "What protocols and API styles does DigiGate support?",
        answer: "DigiGate supports REST, GraphQL, gRPC, WebSocket, and SOAP APIs. It can also proxy raw TCP/UDP for legacy protocol support with custom plugins.",
    },
    {
        question: "How does DigiGate handle authentication and authorization?",
        answer: "DigiGate supports OAuth 2.0, OpenID Connect, JWT validation, mTLS, API keys, and HMAC. It integrates with enterprise identity providers including Okta, Azure AD, and Keycloak.",
    },
    {
        question: "Can DigiGate handle our traffic volume?",
        answer: "DigiGate is horizontally scalable and routinely handles 10M+ requests per minute. Our architecture supports auto-scaling based on traffic patterns with sub-millisecond routing latency.",
    },
    {
        question: "How quickly can we deploy DigiGate?",
        answer: "Standard deployments complete in 4 weeks. Organizations with existing API documentation can see first traffic routed within 48 hours of kickoff.",
    },
    {
        question: "Does DigiGate support multi-cloud and hybrid deployments?",
        answer: "Yes. DigiGate is Kubernetes-native and supports AWS, Azure, GCP, and on-premise deployments. A single control plane manages gateways across all environments.",
    },
    {
        question: "What is the pricing model for DigiGate?",
        answer: "DigiGate uses a per-API-call pricing model with volume tiers and enterprise agreements. Contact us for a detailed quote based on your traffic patterns and required modules.",
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function DigiGatePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f5f8ff] via-white to-white">
            {/* ── Hero ─────────────────────────────────────────────── */}
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
                                Enterprise API Management
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                DigiGate
                                <span className="text-neutral-700">
                                    {" "}— The Command Center for Your Digital Ecosystem
                                </span>
                            </h1>

                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                A comprehensive API gateway and lifecycle management solution that acts
                                as the centralized control layer for your entire digital infrastructure.
                                Manage all inbound and outbound API traffic while enforcing security,
                                routing policies, and governance at scale.
                            </p>

                            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full font-semibold"
                                    style={{ backgroundColor: accent, borderColor: accent }}
                                >
                                    <Link href="/contact?product=digigate">
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
                                    icon={<Shield size={18} />}
                                    label="Security incidents"
                                    value="95% Less"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Gauge size={18} />}
                                    label="API uptime"
                                    value="99.99%"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Zap size={18} />}
                                    label="Integration time"
                                    value="Days"
                                    accent={accent}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <PerformanceEstimator accentColor={accent} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why DigiGate + Gateway Diagram ──────────────────── */}
            <GradientDivider className="my-0" />
            <section className="relative container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
                    <div className="space-y-6">
                        <AnimateOnScroll animation="fade-up">
                            <SectionHeader title="Why DigiGate" accent={accent} subtitle="Enterprise-grade API management from day one." />
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
                        <GatewayLayerDiagram layers={gatewayLayers} accentColor={accent} />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* ── Platform Capabilities ───────────────────────────── */}
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

            {/* ── How It Works (timeline) ─────────────────────────── */}
            <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="How It Works"
                        accent={accent}
                        subtitle="From discovery to full operations in four weeks."
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

            {/* ── Industry Applications ───────────────────────────── */}
            <GradientDivider className="my-0" />
            <section className="relative overflow-hidden bg-neutral-50 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-10">
                    <AnimateOnScroll animation="fade-up">
                        <SectionHeader
                            title="Industry Applications"
                            accent={accent}
                            subtitle="Trusted by enterprises across multiple sectors for API management."
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

            {/* ── FAQ ─────────────────────────────────────────────── */}
            <GradientDivider className="my-0" />
            <section className="relative overflow-hidden container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <AnimateOnScroll animation="fade-up">
                    <SectionHeader
                        title="DigiGate FAQ"
                        accent={accent}
                        subtitle="Common questions from engineering teams and decision-makers."
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

            {/* ── Trust + CTA ─────────────────────────────────────── */}
            <AnimateOnScroll animation="fade-up">
                <TrustIndicators />
            </AnimateOnScroll>

            <AnimateOnScroll animation="scale">
                <CTASection
                    title="Ready to Transform Your API Infrastructure?"
                    description="Schedule a personalized demo to see how DigiGate can secure, manage, and optimize your API ecosystem at enterprise scale."
                    primaryCTA={{
                        label: "Request Live Demo",
                        href: "/contact?product=digigate",
                    }}
                    secondaryCTA={{
                        label: "Download Technical Brief",
                        href: "/contact?type=asset&name=digigate-brief",
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
