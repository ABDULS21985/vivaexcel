import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Zap,
    Code2,
    Terminal,
    Copy,
    ExternalLink,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { CTASection } from "@/components/shared";
import { sdkList, apiFeatures, apiEndpoints, codeExamples } from "@/data/trustmehub/api-docs";

export const metadata: Metadata = {
    title: "TrustMeHub API Documentation - Developer Guide | Global Digitalbit Limited",
    description:
        "Integrate TrustMeHub credential verification into your application. OpenAPI 3.0 documentation, SDKs for Node.js, Python, Go, and Rust. Sub-10ms response times.",
    keywords: [
        "TrustMeHub API",
        "credential verification API",
        "blockchain verification SDK",
        "Node.js SDK",
        "Python SDK",
        "OpenAPI 3.0",
    ],
    openGraph: {
        title: "TrustMeHub API Documentation - Developer Guide",
        description:
            "Integrate credential verification in minutes with auto-generated SDKs and comprehensive documentation.",
        url: "https://drkatangablog.com/products/trustmehub/docs",
    },
};

const iconMap: Record<string, string> = {
    nodejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
};

const methodColors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-purple-100 text-purple-700",
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function TrustMeHubDocsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    {/* Back Link */}
                    <Link
                        href="/products/trustmehub"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to TrustMeHub
                    </Link>

                    <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Code2 className="h-6 w-6 text-emerald-400" />
                        </div>
                        <span className="text-white/60 font-medium">TrustMeHub</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
                        Developer Documentation
                    </h1>

                    <p className="text-xl text-white/70 max-w-2xl mb-8 animate-fade-in-up delay-200">
                        Integrate credential verification in minutes with our comprehensive
                        API and auto-generated SDKs. Sub-10ms response times guaranteed.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                        <Button
                            asChild
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8"
                        >
                            <Link href="/contact?subject=api-access">
                                Request API Access
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8"
                        >
                            <Link href="#quickstart">Quick Start Guide</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* API Features */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                                API Capabilities
                            </span>
                            <div className="w-12 h-0.5 bg-emerald-500"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Enterprise-Grade API
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Everything you need to integrate credential verification
                            into your application
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apiFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-neutral-50 rounded-xl p-6 border border-neutral-100 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                    <Zap className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SDKs Section */}
            <section className="w-full py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Official SDKs
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Auto-generated, type-safe SDKs for your favorite language
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sdkList.map((sdk, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-md border border-neutral-100 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={iconMap[sdk.icon]}
                                        alt={sdk.language}
                                        className="w-10 h-10"
                                    />
                                    <h3 className="text-lg font-bold text-neutral-900">
                                        {sdk.language}
                                    </h3>
                                </div>

                                <div className="bg-neutral-900 rounded-lg p-3 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Terminal className="h-4 w-4 text-neutral-500" />
                                        <Copy className="h-4 w-4 text-neutral-500 cursor-pointer hover:text-white" />
                                    </div>
                                    <code className="text-emerald-400 text-sm">
                                        {sdk.installCommand}
                                    </code>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                    >
                                        <Link
                                            href={sdk.docsUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Docs
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                    >
                                        <Link
                                            href={sdk.githubUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            GitHub
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="w-full py-16 md:py-24 bg-neutral-900 scroll-mt-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Quick Start
                        </h2>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                            Start verifying credentials in under 5 minutes
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Verify Example */}
                        <div className="bg-neutral-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-neutral-700/50 border-b border-neutral-700">
                                <span className="text-sm font-medium text-neutral-300">
                                    Verify a Credential
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500">JavaScript</span>
                                    <Copy className="h-4 w-4 text-neutral-500 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                                <code className="text-sm text-neutral-300">
                                    {codeExamples.verifyCredential}
                                </code>
                            </pre>
                        </div>

                        {/* Issue Example */}
                        <div className="bg-neutral-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-neutral-700/50 border-b border-neutral-700">
                                <span className="text-sm font-medium text-neutral-300">
                                    Issue a Credential
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500">JavaScript</span>
                                    <Copy className="h-4 w-4 text-neutral-500 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                                <code className="text-sm text-neutral-300">
                                    {codeExamples.issueCredential}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* API Endpoints */}
            <section className="w-full py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            API Endpoints
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            RESTful API with OpenAPI 3.0 documentation
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            {apiEndpoints.map((endpoint, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-4 ${
                                        index !== apiEndpoints.length - 1
                                            ? "border-b border-neutral-200"
                                            : ""
                                    }`}
                                >
                                    <span
                                        className={`px-3 py-1 rounded-md text-xs font-bold ${
                                            methodColors[endpoint.method]
                                        }`}
                                    >
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm font-mono text-neutral-700 flex-1">
                                        {endpoint.path}
                                    </code>
                                    <span className="text-sm text-neutral-500 hidden md:block">
                                        {endpoint.description}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full"
                            >
                                <Link
                                    href="https://api.trustmehub.com/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Full API Reference
                                    <ExternalLink className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="w-full py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                            Built for Performance
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                                &lt;10ms
                            </div>
                            <div className="text-sm text-neutral-600">P95 Latency</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                                100K+
                            </div>
                            <div className="text-sm text-neutral-600">Requests/Second</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                                99.9%
                            </div>
                            <div className="text-sm text-neutral-600">Uptime SLA</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                                92%+
                            </div>
                            <div className="text-sm text-neutral-600">Cache Hit Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Ready to Integrate?"
                description="Get your API key and start verifying credentials in minutes."
                primaryCTA={{
                    label: "Request API Access",
                    href: "/contact?subject=api-access",
                }}
                secondaryCTA={{
                    label: "View Pricing",
                    href: "/products/trustmehub/pricing",
                }}
            />
        </div>
    );
}
