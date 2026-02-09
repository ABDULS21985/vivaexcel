"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ProductForm, ProductFormData } from "@/components/forms/product-form";
import { FormModal, ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@ktblog/ui/components";
import {
    ArrowLeft,
    Edit,
    Trash2,
    ExternalLink,
    CheckCircle,
    Clock,
    Archive,
    Star,
    Activity,
    Globe,
    Zap,
} from "lucide-react";

interface ProductFeature {
    name: string;
    value: string;
}

interface Product {
    id: string;
    name: string;
    tagline: string;
    description: string;
    status: "draft" | "published" | "archived";
    accentColor: string;
    websiteUrl: string;
    features: ProductFeature[];
    useCases: { title: string; description: string }[];
    valueProps: { metric: string; description: string }[];
    createdAt: string;
    updatedAt: string;
}

const productsData: Record<string, Product> = {
    digigate: {
        id: "digigate",
        name: "DigiGate",
        tagline: "The Command Center for Your Digital Ecosystem",
        description:
            "A comprehensive API gateway and lifecycle management solution that acts as the centralized control layer for your entire digital infrastructure. Manage all inbound and outbound API traffic while enforcing security, routing policies, and governance at scale.",
        status: "published",
        accentColor: "#1E4DB7",
        websiteUrl: "/products",
        features: [
            { name: "Centralized Security", value: "OAuth 2.0, JWT validation, rate limiting, threat protection" },
            { name: "Intelligent Routing", value: "Load balancing, failover, API versioning, canary deployments" },
            { name: "API Composition", value: "Combine multiple microservices into single client responses" },
            { name: "Real-Time Monitoring", value: "Unified logging, tracing, performance dashboards, anomaly detection" },
            { name: "Developer Portal", value: "Self-service API documentation, sandbox testing, key management" },
            { name: "Policy Management", value: "Configurable security policies, throttling rules, access controls" },
        ],
        useCases: [
            { title: "Financial Institutions", description: "Complex integrations with regulatory compliance (PCI-DSS, GDPR)" },
            { title: "Government Digital Transformation", description: "Secure citizen services and inter-agency communication" },
            { title: "Microservices Architecture", description: "Unified gateway for distributed services" },
        ],
        valueProps: [
            { metric: "95%", description: "Fewer security incidents" },
            { metric: "99.99%", description: "API uptime achieved" },
        ],
        createdAt: "2024-01-01",
        updatedAt: "2024-12-15",
    },
    digitrust: {
        id: "digitrust",
        name: "DigiTrust",
        tagline: "Immutable Trust for a Digital World",
        description:
            "A blockchain-based solution for issuing, verifying, and managing tamper-proof digital credentials. From educational certificates to professional licenses, land titles to insurance policies, DigiTrust ensures document authenticity is never in question.",
        status: "published",
        accentColor: "#F59A23",
        websiteUrl: "/products",
        features: [
            { name: "Credential Issuance", value: "Secure generation and blockchain anchoring of digital documents" },
            { name: "Public Verifier", value: "Instant QR code or document ID verification for anyone" },
            { name: "Auditor Console", value: "Compliance checks, lifecycle tracking, security logging" },
            { name: "API Integration", value: "Seamless connection to existing HR, banking, or registry systems" },
            { name: "Revocation Management", value: "Instant credential invalidation with full audit trail" },
            { name: "Multi-Tenant Support", value: "Support for multiple issuers under single deployment" },
        ],
        useCases: [
            { title: "Educational Institutions", description: "Issue and verify academic credentials instantly" },
            { title: "Government Registries", description: "Land titles, birth certificates, professional licenses" },
            { title: "Insurance Companies", description: "Policy documents and claims verification" },
        ],
        valueProps: [
            { metric: "100%", description: "Fraud elimination" },
            { metric: "Seconds", description: "Verification time (vs days)" },
        ],
        createdAt: "2024-01-15",
        updatedAt: "2024-12-10",
    },
    digitrack: {
        id: "digitrack",
        name: "DigiTrack",
        tagline: "Complete Visibility Across Your Digital Operations",
        description:
            "Real-time tracking and traceability for physical assets, digital transactions, and service delivery workflows. Built for industries requiring complete chain-of-custody documentation and operational transparency.",
        status: "published",
        accentColor: "#E86A1D",
        websiteUrl: "/products",
        features: [
            { name: "Real-Time Location", value: "GPS, RFID, and IoT sensor integration" },
            { name: "Transaction Traceability", value: "End-to-end audit trails for financial operations" },
            { name: "Service Monitoring", value: "SLA tracking, escalation management, performance metrics" },
            { name: "Chain of Custody", value: "Immutable handoff records for regulated industries" },
            { name: "Predictive Analytics", value: "ML-powered anomaly detection and forecasting" },
            { name: "Custom Dashboards", value: "Role-based views with drill-down capabilities" },
        ],
        useCases: [
            { title: "Supply Chain", description: "Track goods from origin to delivery with full transparency" },
            { title: "Financial Services", description: "Transaction lifecycle monitoring and compliance" },
            { title: "Healthcare", description: "Medical device and specimen tracking with audit trails" },
        ],
        valueProps: [
            { metric: "100%", description: "Asset visibility" },
            { metric: "40%", description: "Fewer operational losses" },
        ],
        createdAt: "2024-02-01",
        updatedAt: "2024-12-08",
    },
    trustmehub: {
        id: "trustmehub",
        name: "TrustMeHub",
        tagline: "Building Trust. Empowering Growth.",
        description:
            "A global digital trust infrastructure for instant, blockchain-anchored credential verification. Verify any credential in milliseconds, not weeks. Transform how credentials are issued, verified, and trusted at national scale with sub-10ms verification, 99% cost reduction, and 100,000+ verifications per second capacity.",
        status: "published",
        accentColor: "#10B981",
        websiteUrl: "/products/trustmehub",
        features: [
            { name: "Instant Verification", value: "Sub-10ms verification responses with 92%+ cache hit rates" },
            { name: "Blockchain Anchoring", value: "Hyperledger FireFly for immutable, tamper-proof records" },
            { name: "Zero-Knowledge Proofs", value: "Privacy-preserving selective disclosure verification" },
            { name: "Multi-Tenant Architecture", value: "Enterprise-grade Row-Level Security for data isolation" },
            { name: "Mobile Wallet", value: "iOS/Android apps with offline credential support" },
            { name: "Global Reach", value: "Multi-language: English, Arabic, French, Spanish, Portuguese, Chinese" },
            { name: "Batch Processing", value: "Process thousands of credentials at once" },
            { name: "Template Designer", value: "Drag-and-drop credential template creation" },
            { name: "QR Code Verification", value: "Instant mobile verification" },
            { name: "PDF Receipt Generation", value: "Audit-ready verification records" },
            { name: "API Gateway & SDKs", value: "OpenAPI 3.0 with Node.js, Python, Go, Rust SDKs" },
            { name: "Analytics Dashboard", value: "Real-time metrics and compliance reporting" },
            { name: "Webhook & Event Streaming", value: "Real-time notifications" },
            { name: "Role-based Access Control", value: "40+ granular permissions" },
            { name: "W3C Verifiable Credentials", value: "Standards-compliant credential format" },
        ],
        useCases: [
            { title: "Education Verification", description: "Eliminate 40% of global credential fraud" },
            { title: "Banking & KYC", description: "Reduce KYC from 3-5 days to 3 minutes" },
            { title: "Healthcare Licensing", description: "Verify 600K+ medical professionals instantly" },
            { title: "Government ID Systems", description: "National-scale identity verification" },
            { title: "Employment Background Checks", description: "Instant employment history verification" },
            { title: "Professional Licensing", description: "Engineers, lawyers, accountants verification" },
            { title: "Immigration & Visas", description: "Cross-border credential verification" },
            { title: "Insurance Underwriting", description: "Instant credential verification for policies" },
            { title: "Real Estate", description: "Property ownership and agent verification" },
            { title: "Supply Chain", description: "Supplier and vendor certification verification" },
        ],
        valueProps: [
            { metric: "<10ms", description: "Verification time" },
            { metric: "99%", description: "Cost reduction" },
            { metric: "$60B+", description: "Market opportunity" },
            { metric: "100K+", description: "Verifications/second" },
        ],
        createdAt: "2024-03-01",
        updatedAt: "2024-12-20",
    },
    boacrm: {
        id: "boacrm",
        name: "BoaCRM",
        tagline: "The Operating System for Customer Relationships",
        description:
            "A comprehensive enterprise-grade CRM platform purpose-built for African financial institutions. With 35 integrated modules, native compliance, and omnichannel engagement, it transforms how banks manage customer relationships at scale.",
        status: "published",
        accentColor: "#6366F1",
        websiteUrl: "/products",
        features: [
            { name: "Customer 360", value: "Golden record with multi-source deduplication and relationship mapping" },
            { name: "Omnichannel Engagement", value: "Unified console for WhatsApp, SMS, email, voice, and in-branch" },
            { name: "Contact Center Suite", value: "IVR, ACD, quality assurance, workforce management" },
            { name: "Compliance & Governance", value: "NDPR/NDPA, BVN/NIN verification, KYC/AML workflows" },
            { name: "Conversational AI", value: "Full chatbot builder with 24/7 availability" },
            { name: "ML Analytics", value: "Churn prediction, propensity scoring, real-time dashboards" },
        ],
        useCases: [
            { title: "Commercial Banks", description: "Complete CRM for tier-1 and tier-2 banks" },
            { title: "Microfinance Banks", description: "Scalable solution for 900+ Nigerian MFBs" },
            { title: "Payment Providers", description: "Customer management for PSPs and fintechs" },
        ],
        valueProps: [
            { metric: "35", description: "Integrated modules" },
            { metric: "2M+", description: "Customers managed" },
        ],
        createdAt: "2024-03-15",
        updatedAt: "2024-12-18",
    },
};

const statusConfig = {
    published: {
        label: "Published",
        icon: CheckCircle,
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    draft: {
        label: "Draft",
        icon: Clock,
        className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    },
    archived: {
        label: "Archived",
        icon: Archive,
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { success, error } = useToast();
    const productId = params.id as string;

    const [product, setProduct] = React.useState<Product | null>(null);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        // In production, this would be an API call
        const productData = productsData[productId];
        if (productData) {
            setProduct(productData);
        }
    }, [productId]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                        Product not found
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                        The product you're looking for doesn't exist.
                    </p>
                    <Button onClick={() => router.push("/products")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </div>
            </div>
        );
    }

    const statusInfo = statusConfig[product.status];
    const StatusIcon = statusInfo.icon;
    const isFeatured = product.id === "trustmehub";

    const handleEditSubmit = async (data: ProductFormData) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Convert form features (string[]) to ProductFeature[]
            const updatedFeatures: ProductFeature[] = data.features.map((name) => ({
                name,
                value: product?.features.find((f) => f.name === name)?.value || "",
            }));
            setProduct((prev) => prev ? {
                ...prev,
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                status: data.status,
                accentColor: data.accentColor,
                websiteUrl: data.websiteUrl,
                features: updatedFeatures,
                updatedAt: new Date().toISOString(),
            } : null);
            success("Product updated", `${data.name} has been updated successfully.`);
            setIsEditOpen(false);
        } catch {
            error("Error", "Failed to update product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            success("Product deleted", `${product.name} has been deleted.`);
            router.push("/products");
        } catch {
            error("Error", "Failed to delete product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title={product.name}
                description={product.tagline}
                backHref="/products"
                backLabel="Back to Products"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: product.name },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <a
                            href={`https://drkatangablog.com${product.websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Live
                        </a>
                        <PageHeaderButton
                            onClick={() => setIsEditOpen(true)}
                            icon={<Edit className="h-4 w-4" />}
                        >
                            Edit Product
                        </PageHeaderButton>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Product Header Card */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Product Icon */}
                        <div
                            className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: product.accentColor }}
                        >
                            <span className="text-3xl font-bold text-white">
                                {product.name.charAt(0)}
                            </span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.className}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {statusInfo.label}
                                </span>
                                {isFeatured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Star className="h-4 w-4" />
                                        Featured
                                    </span>
                                )}
                                <div
                                    className="h-6 w-6 rounded-full border-2 border-white dark:border-zinc-700 shadow-sm"
                                    style={{ backgroundColor: product.accentColor }}
                                    title={`Accent Color: ${product.accentColor}`}
                                />
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                                {product.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    Created: {new Date(product.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Activity className="h-4 w-4" />
                                    Updated: {new Date(product.updatedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Globe className="h-4 w-4" />
                                    {product.websiteUrl}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Value Props */}
                {product.valueProps.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {product.valueProps.map((prop, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 text-center"
                            >
                                <div
                                    className="text-2xl font-bold mb-1"
                                    style={{ color: product.accentColor }}
                                >
                                    {prop.metric}
                                </div>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {prop.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Features */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Zap className="h-5 w-5" style={{ color: product.accentColor }} />
                                Features ({product.features.length})
                            </h2>
                        </div>
                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {product.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4"
                                >
                                    <h3 className="font-medium text-zinc-900 dark:text-white mb-1">
                                        {feature.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {feature.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-5 w-5" style={{ color: product.accentColor }} />
                                Use Cases ({product.useCases.length})
                            </h2>
                        </div>
                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {product.useCases.map((useCase, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4"
                                >
                                    <h3 className="font-medium text-zinc-900 dark:text-white mb-1">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {useCase.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                        Danger Zone
                    </h2>
                    <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
                        Deleting a product is permanent and cannot be undone. This will remove the product from all pages.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                    </Button>
                </div>
            </div>

            {/* Edit Modal */}
            <FormModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                title={`Edit ${product.name}`}
                description="Update the product details below."
                size="lg"
            >
                <ProductForm
                    initialData={{
                        id: product.id,
                        name: product.name,
                        tagline: product.tagline,
                        description: product.description,
                        status: product.status,
                        accentColor: product.accentColor,
                        websiteUrl: product.websiteUrl,
                        features: product.features.map((f) => f.name),
                    }}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditOpen(false)}
                    isLoading={isLoading}
                    mode="edit"
                />
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${product.name}"? This action cannot be undone and will remove the product from the website.`}
                confirmLabel="Delete Product"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
