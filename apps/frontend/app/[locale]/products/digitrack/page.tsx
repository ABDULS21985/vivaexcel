import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Truck,
    CreditCard,
    HeartPulse,
    Fuel,
    Zap,
    Eye,
    Shield,
    Sparkles,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { TrustIndicators, CTASection, AnimateOnScroll, FloatingOrbs, GradientDivider } from "@/components/shared";
import {
    ROICalculator,
    TrackingLayerDiagram,
    FeatureExplorer,
} from "./interactive";
import type { FeatureDetail, TrackingLayer } from "./interactive";

export const metadata: Metadata = {
    title: "DigiTrack - Asset Tracking & Traceability | Global Digitalbit Limited",
    description:
        "DigiTrack provides real-time tracking and traceability for physical assets, digital transactions, and service delivery workflows. Built for industries requiring complete chain-of-custody documentation and operational transparency.",
    keywords: [
        "asset tracking",
        "supply chain tracking",
        "transaction traceability",
        "GPS tracking",
        "RFID tracking",
        "IoT sensors",
        "chain of custody",
        "predictive analytics",
        "operational transparency",
    ],
    openGraph: {
        title: "DigiTrack - Complete Visibility Across Your Digital Operations",
        description:
            "Real-time tracking and traceability for physical assets, digital transactions, and service delivery workflows.",
        url: "https://drkatangablog.com/products/digitrack",
        images: [
            {
                url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "DigiTrack - Asset Tracking Platform",
            },
        ],
    },
};

const accent = "#EA580C";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const benefits = [
    "100% visibility into asset locations and states",
    "Reduce operational losses by up to 40%",
    "Automated compliance reporting for regulated industries",
    "Predictive maintenance reduces downtime by 60%",
    "Multi-modal tracking — GPS, RFID, BLE, IoT sensors",
    "Real-time alerts and configurable notifications",
];

const trackingLayers: TrackingLayer[] = [
    {
        id: "iot",
        label: "IoT & Sensors",
        description:
            "GPS, RFID, BLE beacons, and temperature sensors form the physical data collection layer — providing raw telemetry from every asset in the field.",
        accent: "#059669",
    },
    {
        id: "ingestion",
        label: "Data Ingestion",
        description:
            "MQTT and edge computing normalize and route millions of events per second into a unified, time-series pipeline.",
        accent: "#0284C7",
    },
    {
        id: "analytics",
        label: "Analytics Engine",
        description:
            "ML-powered anomaly detection, predictive maintenance, and pattern recognition turn raw data into actionable insights.",
        accent: "#7C3AED",
    },
    {
        id: "dashboard",
        label: "Dashboards & Alerts",
        description:
            "Role-based real-time views with WebSocket updates and configurable alert workflows keep every stakeholder informed.",
        accent: accent,
    },
];

const featureDetails: FeatureDetail[] = [
    {
        id: "location",
        iconName: "MapPin",
        title: "Real-Time Location Tracking",
        description:
            "GPS, RFID, and IoT sensor integration for precise asset location monitoring across your entire operation.",
        capabilities: [
            "Sub-metre GPS accuracy with SBAS correction",
            "Indoor tracking via BLE beacons and RFID",
            "Geofence alerts and zone dwell-time monitoring",
            "Historical route replay and heat-map analysis",
        ],
        highlight: "Sub-metre accuracy",
    },
    {
        id: "traceability",
        iconName: "GitCommit",
        title: "Transaction Traceability",
        description:
            "End-to-end audit trails for financial operations with complete visibility into every transaction lifecycle.",
        capabilities: [
            "Immutable, append-only transaction ledger",
            "Cryptographic hash verification at every step",
            "Cross-system reconciliation engine",
            "Exportable audit packages for regulators",
        ],
        highlight: "Immutable audit trail",
    },
    {
        id: "sla",
        iconName: "Timer",
        title: "Service Delivery Monitoring",
        description:
            "SLA tracking, escalation management, and performance metrics to ensure service excellence.",
        capabilities: [
            "Configurable SLA rule engine with breach alerts",
            "Automated escalation workflows",
            "Performance scorecards per vendor or team",
            "Trend analysis with rolling benchmarks",
        ],
        highlight: "99.9% SLA compliance",
    },
    {
        id: "custody",
        iconName: "Link",
        title: "Chain of Custody",
        description:
            "Immutable handoff records for regulated industries with cryptographic verification at every step.",
        capabilities: [
            "Digital signature capture at each handoff",
            "Temperature and condition logging in transit",
            "FDA 21 CFR Part 11 compatible records",
            "Photo and barcode evidence attachment",
        ],
        highlight: "Regulatory-grade",
    },
    {
        id: "analytics",
        iconName: "TrendingUp",
        title: "Predictive Analytics",
        description:
            "ML-powered anomaly detection and forecasting to prevent issues before they impact operations.",
        capabilities: [
            "Anomaly detection with configurable sensitivity",
            "Predictive maintenance scheduling",
            "Demand and capacity forecasting",
            "Root-cause analysis recommendations",
        ],
        highlight: "60% less downtime",
    },
    {
        id: "dashboards",
        iconName: "LayoutDashboard",
        title: "Custom Dashboards",
        description:
            "Role-based views with drill-down capabilities for insights tailored to each stakeholder.",
        capabilities: [
            "Drag-and-drop dashboard builder",
            "Real-time WebSocket data updates",
            "Scheduled report generation (PDF, CSV, API)",
            "Embeddable widgets for external portals",
        ],
        highlight: "Real-time updates",
    },
];

const useCases = [
    {
        icon: Truck,
        title: "Supply Chain",
        description: "Track goods from origin to delivery with complete chain of custody documentation",
        metric: "99.9% uptime",
    },
    {
        icon: CreditCard,
        title: "Financial Services",
        description: "Transaction lifecycle monitoring with comprehensive audit trails for compliance",
        metric: "100% auditability",
    },
    {
        icon: HeartPulse,
        title: "Healthcare",
        description: "Medical device and specimen tracking with temperature monitoring and compliance",
        metric: "FDA compliant",
    },
    {
        icon: Fuel,
        title: "Energy Sector",
        description: "Equipment maintenance tracking, compliance documentation, and predictive analytics",
        metric: "40% less loss",
    },
];

const howItWorks = [
    {
        title: "Connect",
        duration: "Day 1",
        description:
            "Integrate IoT sensors, RFID tags, and existing systems through our universal connector library.",
        deliverables: ["Sensor configuration", "API integrations", "Edge node setup"],
    },
    {
        title: "Ingest & Normalize",
        duration: "Week 1",
        description:
            "Our edge computing layer normalizes data from heterogeneous sources into a unified event stream.",
        deliverables: ["Data pipeline", "Schema mapping", "Quality checks"],
    },
    {
        title: "Analyze & Predict",
        duration: "Week 2–4",
        description:
            "ML models begin learning patterns, detecting anomalies, and generating predictive insights.",
        deliverables: ["Anomaly baselines", "Predictive models", "Alert rules"],
    },
    {
        title: "Visualize & Act",
        duration: "Month 2",
        description:
            "Custom dashboards go live with real-time WebSocket updates and role-based access control.",
        deliverables: ["Custom dashboards", "Alert workflows", "Compliance reports"],
    },
];

const faqs = [
    {
        question: "What tracking technologies does DigiTrack support?",
        answer: "DigiTrack integrates with GPS, RFID, BLE beacons, NFC, IoT temperature/humidity sensors, and barcode/QR systems through our universal connector layer.",
    },
    {
        question: "How quickly can we deploy DigiTrack?",
        answer: "Standard deployments complete in 4–8 weeks. Organizations with existing IoT infrastructure can see first data within 48 hours.",
    },
    {
        question: "Does DigiTrack work with our existing ERP/WMS?",
        answer: "Yes. DigiTrack provides pre-built connectors for SAP, Oracle, Microsoft Dynamics, and 50+ other enterprise systems, plus a REST API for custom integrations.",
    },
    {
        question: "What compliance standards does DigiTrack help with?",
        answer: "DigiTrack generates audit-ready reports for FDA 21 CFR Part 11, GxP, ISO 9001, HACCP, and customs/trade compliance requirements.",
    },
    {
        question: "How does the predictive analytics engine work?",
        answer: "Our ML pipeline trains on your historical data to detect anomalies, predict equipment failures, and forecast demand patterns with continuously improving accuracy.",
    },
    {
        question: "What is the pricing model?",
        answer: "DigiTrack uses a per-asset-per-month model with volume tiers. Contact us for a detailed quote based on your asset count and required modules.",
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function DigiTrackPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fffbf7] via-white to-white">
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
                                Enterprise Tracking Platform
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight animate-fade-in-up delay-100">
                                DigiTrack
                                <span className="text-neutral-700">
                                    {" "}— Complete visibility across your digital operations
                                </span>
                            </h1>

                            <p className="text-lg text-neutral-700 max-w-3xl animate-fade-in-up delay-200">
                                Real-time tracking and traceability for physical assets, digital
                                transactions, and service delivery workflows. Built for industries
                                requiring complete chain-of-custody documentation and operational
                                transparency.
                            </p>

                            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full font-semibold"
                                    style={{ backgroundColor: accent, borderColor: accent }}
                                >
                                    <Link href="/contact?product=digitrack">
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
                                    icon={<Eye size={18} />}
                                    label="Asset visibility"
                                    value="100% Real-Time"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Shield size={18} />}
                                    label="Loss reduction"
                                    value="Up to 40%"
                                    accent={accent}
                                />
                                <StatPill
                                    icon={<Zap size={18} />}
                                    label="Uptime boost"
                                    value="60% Less Downtime"
                                    accent={accent}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <ROICalculator accentColor={accent} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why DigiTrack + Architecture Diagram ────────────── */}
            <GradientDivider className="my-0" />
            <section className="relative container mx-auto px-4 md:px-6 lg:px-10 py-14">
                <FloatingOrbs variant="section" />
                <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
                    <div className="space-y-6">
                        <AnimateOnScroll animation="fade-up">
                            <SectionHeader title="Why DigiTrack" accent={accent} subtitle="Measurable impact from day one across your entire operation." />
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
                        <TrackingLayerDiagram layers={trackingLayers} accentColor={accent} />
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
                        subtitle="From sensor integration to operational intelligence in four stages."
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
                            subtitle="Trusted by organizations across multiple sectors for operational visibility."
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
                        title="DigiTrack FAQ"
                        accent={accent}
                        subtitle="Common questions from operations teams and decision-makers."
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
                    title="Ready to Achieve Complete Operational Visibility?"
                    description="Schedule a personalized demo to see DigiTrack in action with your own asset data and workflows."
                    primaryCTA={{
                        label: "Request Live Demo",
                        href: "/contact?product=digitrack",
                    }}
                    secondaryCTA={{
                        label: "Download Technical Brief",
                        href: "/contact?type=asset&name=digitrack-brief",
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
