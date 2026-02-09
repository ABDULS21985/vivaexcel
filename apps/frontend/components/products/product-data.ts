import {
    Shield,
    FileCheck,
    MapPin,
    GitBranch,
    Layers,
    Activity,
    Code2,
    Settings,
    QrCode,
    ClipboardCheck,
    Plug,
    XCircle,
    Building2,
    GitCommit,
    Timer,
    Link,
    TrendingUp,
    LayoutDashboard,
    Zap,
    Link2,
    Eye,
    Smartphone,
    Globe,
    Users,
    MessageSquare,
    Phone,
    ShieldCheck,
    Bot,
    BarChart3,
    type LucideIcon,
} from "lucide-react";

export interface ProductFeature {
    name: string;
    description: string;
    icon: LucideIcon;
}

export interface ProductUseCase {
    title: string;
    description: string;
}

export interface ProductValueProp {
    metric: string;
    description: string;
}

export interface ProductData {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: LucideIcon;
    features: ProductFeature[];
    useCases: ProductUseCase[];
    valueProps: ProductValueProp[];
    accentColor: string;
}

export const productData: ProductData[] = [
    {
        id: "digigate",
        name: "DigiGate",
        tagline: "The Command Center for Your Digital Ecosystem",
        description:
            "A comprehensive API gateway and lifecycle management solution that acts as the centralized control layer for your entire digital infrastructure. Manage all inbound and outbound API traffic while enforcing security, routing policies, and governance at scale.",
        icon: Shield,
        accentColor: "#1E4DB7",
        features: [
            {
                name: "Centralized Security",
                description: "OAuth 2.0, JWT validation, rate limiting, threat protection",
                icon: Shield,
            },
            {
                name: "Intelligent Routing",
                description: "Load balancing, failover, API versioning, canary deployments",
                icon: GitBranch,
            },
            {
                name: "API Composition",
                description: "Combine multiple microservices into single client responses",
                icon: Layers,
            },
            {
                name: "Real-Time Monitoring",
                description: "Unified logging, tracing, performance dashboards, anomaly detection",
                icon: Activity,
            },
            {
                name: "Developer Portal",
                description: "Self-service API documentation, sandbox testing, key management",
                icon: Code2,
            },
            {
                name: "Policy Management",
                description: "Configurable security policies, throttling rules, access controls",
                icon: Settings,
            },
        ],
        useCases: [
            {
                title: "Financial Institutions",
                description: "Complex integrations with regulatory compliance (PCI-DSS, GDPR)",
            },
            {
                title: "Government Digital Transformation",
                description: "Secure citizen services and inter-agency communication",
            },
            {
                title: "Microservices Architecture",
                description: "Unified gateway for distributed services",
            },
        ],
        valueProps: [
            {
                metric: "95%",
                description: "Fewer security incidents",
            },
            {
                metric: "99.99%",
                description: "API uptime achieved",
            },
        ],
    },
    {
        id: "digitrust",
        name: "DigiTrust",
        tagline: "Immutable Trust for a Digital World",
        description:
            "A blockchain-based solution for issuing, verifying, and managing tamper-proof digital credentials. From educational certificates to professional licenses, land titles to insurance policies, DigiTrust ensures document authenticity is never in question.",
        icon: FileCheck,
        accentColor: "#F59A23",
        features: [
            {
                name: "Credential Issuance",
                description: "Secure generation and blockchain anchoring of digital documents",
                icon: FileCheck,
            },
            {
                name: "Public Verifier",
                description: "Instant QR code or document ID verification for anyone",
                icon: QrCode,
            },
            {
                name: "Auditor Console",
                description: "Compliance checks, lifecycle tracking, security logging",
                icon: ClipboardCheck,
            },
            {
                name: "API Integration",
                description: "Seamless connection to existing HR, banking, or registry systems",
                icon: Plug,
            },
            {
                name: "Revocation Management",
                description: "Instant credential invalidation with full audit trail",
                icon: XCircle,
            },
            {
                name: "Multi-Tenant Support",
                description: "Support for multiple issuers under single deployment",
                icon: Building2,
            },
        ],
        useCases: [
            {
                title: "Educational Institutions",
                description: "Issue and verify academic credentials instantly",
            },
            {
                title: "Government Registries",
                description: "Land titles, birth certificates, professional licenses",
            },
            {
                title: "Insurance Companies",
                description: "Policy documents and claims verification",
            },
        ],
        valueProps: [
            {
                metric: "100%",
                description: "Fraud elimination",
            },
            {
                metric: "Seconds",
                description: "Verification time (vs days)",
            },
        ],
    },
    {
        id: "digitrack",
        name: "DigiTrack",
        tagline: "Complete Visibility Across Your Digital Operations",
        description:
            "Real-time tracking and traceability for physical assets, digital transactions, and service delivery workflows. Built for industries requiring complete chain-of-custody documentation and operational transparency.",
        icon: MapPin,
        accentColor: "#E86A1D",
        features: [
            {
                name: "Real-Time Location",
                description: "GPS, RFID, and IoT sensor integration",
                icon: MapPin,
            },
            {
                name: "Transaction Traceability",
                description: "End-to-end audit trails for financial operations",
                icon: GitCommit,
            },
            {
                name: "Service Monitoring",
                description: "SLA tracking, escalation management, performance metrics",
                icon: Timer,
            },
            {
                name: "Chain of Custody",
                description: "Immutable handoff records for regulated industries",
                icon: Link,
            },
            {
                name: "Predictive Analytics",
                description: "ML-powered anomaly detection and forecasting",
                icon: TrendingUp,
            },
            {
                name: "Custom Dashboards",
                description: "Role-based views with drill-down capabilities",
                icon: LayoutDashboard,
            },
        ],
        useCases: [
            {
                title: "Supply Chain",
                description: "Track goods from origin to delivery with full transparency",
            },
            {
                title: "Financial Services",
                description: "Transaction lifecycle monitoring and compliance",
            },
            {
                title: "Healthcare",
                description: "Medical device and specimen tracking with audit trails",
            },
        ],
        valueProps: [
            {
                metric: "100%",
                description: "Asset visibility",
            },
            {
                metric: "40%",
                description: "Fewer operational losses",
            },
        ],
    },
    {
        id: "trustmehub",
        name: "TrustMeHub",
        tagline: "Building Trust. Empowering Growth.",
        description:
            "A global digital trust infrastructure for instant, blockchain-anchored credential verification. Verify any credential in milliseconds, not weeks. Transform how credentials are issued, verified, and trusted at national scale.",
        icon: Zap,
        accentColor: "#10B981",
        features: [
            {
                name: "Instant Verification",
                description: "Sub-10ms verification responses, 92%+ cache hit rates",
                icon: Zap,
            },
            {
                name: "Blockchain Anchoring",
                description: "Hyperledger FireFly for immutable, tamper-proof records",
                icon: Link2,
            },
            {
                name: "Zero-Knowledge Proofs",
                description: "Privacy-preserving selective disclosure verification",
                icon: Eye,
            },
            {
                name: "Multi-Tenant Architecture",
                description: "Enterprise-grade Row-Level Security for data isolation",
                icon: Building2,
            },
            {
                name: "Mobile Wallet",
                description: "iOS/Android apps with offline credential support",
                icon: Smartphone,
            },
            {
                name: "Global Reach",
                description: "Multi-language support: English, Arabic, French, Spanish, Portuguese, Chinese",
                icon: Globe,
            },
        ],
        useCases: [
            {
                title: "Education Verification",
                description: "Eliminate 40% of global credential fraud",
            },
            {
                title: "Banking & KYC",
                description: "Reduce KYC from 3-5 days to 3 minutes",
            },
            {
                title: "Healthcare Licensing",
                description: "Verify 600K+ medical professionals instantly",
            },
        ],
        valueProps: [
            {
                metric: "<10ms",
                description: "Verification time",
            },
            {
                metric: "99%",
                description: "Cost reduction",
            },
        ],
    },
    {
        id: "boacrm",
        name: "BoaCRM",
        tagline: "The Operating System for Customer Relationships",
        description:
            "A comprehensive enterprise-grade CRM platform purpose-built for African financial institutions. With 35 integrated modules, native compliance, and omnichannel engagement, it transforms how banks manage customer relationships at scale.",
        icon: Users,
        accentColor: "#6366F1",
        features: [
            {
                name: "Customer 360",
                description: "Golden record with multi-source deduplication and relationship mapping",
                icon: Users,
            },
            {
                name: "Omnichannel Engagement",
                description: "Unified console for WhatsApp, SMS, email, voice, and in-branch",
                icon: MessageSquare,
            },
            {
                name: "Contact Center Suite",
                description: "IVR, ACD, quality assurance, workforce management",
                icon: Phone,
            },
            {
                name: "Compliance & Governance",
                description: "NDPR/NDPA, BVN/NIN verification, KYC/AML workflows",
                icon: ShieldCheck,
            },
            {
                name: "Conversational AI",
                description: "Full chatbot builder with 24/7 availability",
                icon: Bot,
            },
            {
                name: "ML Analytics",
                description: "Churn prediction, propensity scoring, real-time dashboards",
                icon: BarChart3,
            },
        ],
        useCases: [
            {
                title: "Commercial Banks",
                description: "Complete CRM for tier-1 and tier-2 banks",
            },
            {
                title: "Microfinance Banks",
                description: "Scalable solution for 900+ Nigerian MFBs",
            },
            {
                title: "Payment Providers",
                description: "Customer management for PSPs and fintechs",
            },
        ],
        valueProps: [
            {
                metric: "35",
                description: "Integrated modules",
            },
            {
                metric: "2M+",
                description: "Customers managed",
            },
        ],
    },
];

export const getProductDataById = (id: string): ProductData | undefined => {
    return productData.find((product) => product.id === id);
};

export const getProductDataByIndex = (index: number): ProductData | undefined => {
    return productData[index];
};
