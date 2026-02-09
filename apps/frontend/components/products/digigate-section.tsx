"use client";

import Link from "next/link";
import {
    Shield,
    GitBranch,
    Layers,
    Activity,
    Code2,
    Settings,
    ArrowRight,
    CheckCircle,
    Zap,
    Lock,
    BarChart3,
    Server,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

const features = [
    {
        icon: Shield,
        title: "Centralized Security",
        description: "OAuth 2.0, JWT validation, rate limiting, threat protection",
    },
    {
        icon: GitBranch,
        title: "Intelligent Routing",
        description: "Load balancing, failover, API versioning, canary deployments",
    },
    {
        icon: Layers,
        title: "API Composition",
        description: "Combine multiple microservices into single client responses",
    },
    {
        icon: Activity,
        title: "Real-Time Monitoring",
        description: "Unified logging, tracing, performance dashboards, anomaly detection",
    },
    {
        icon: Code2,
        title: "Developer Portal",
        description: "Self-service API documentation, sandbox testing, key management",
    },
    {
        icon: Settings,
        title: "Policy Management",
        description: "Configurable security policies, throttling rules, access controls",
    },
];

const valueProps = [
    {
        metric: "95%",
        description: "Fewer security incidents",
        icon: Lock,
    },
    {
        metric: "99.99%",
        description: "API uptime achieved",
        icon: Zap,
    },
    {
        metric: "Days",
        description: "Integration time (vs weeks)",
        icon: BarChart3,
    },
    {
        metric: "Single",
        description: "Pane of glass for all APIs",
        icon: Server,
    },
];

const useCases = [
    "Financial Institutions with complex integrations",
    "Government digital transformation initiatives",
    "Enterprises with microservices architectures",
    "Organizations requiring PCI-DSS, GDPR compliance",
];

export function DigiGateSection() {
    return (
        <section
            id="digigate"
            className="w-full py-16 md:py-24 bg-white scroll-mt-20"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            API Gateway Solution
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>

                    {/* Product Icon */}
                    <div className="flex justify-center mb-6 animate-fade-in-up delay-100">
                        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                            <Shield className="h-10 w-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 animate-fade-in-up delay-100">
                        DigiGate
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-accent-orange mb-6 animate-fade-in-up delay-200">
                        The Command Center for Your Digital Ecosystem
                    </p>
                    <p className="text-lg text-neutral-600 animate-fade-in-up delay-300">
                        A comprehensive API gateway and lifecycle management solution that acts as the
                        centralized control layer for your entire digital infrastructure. Manage all
                        inbound and outbound API traffic while enforcing security, routing policies,
                        and governance at scale.
                    </p>
                </div>

                {/* Value Props Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <prop.icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
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
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                        <feature.icon
                                            className="h-7 w-7 text-primary group-hover:text-white transition-colors"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
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

                {/* Use Cases */}
                <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Ideal For
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-100 shadow-sm"
                            >
                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="text-neutral-700">{useCase}</span>
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
                            className="bg-primary hover:bg-secondary text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request DigiGate Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            <Link href="/products/digigate">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
