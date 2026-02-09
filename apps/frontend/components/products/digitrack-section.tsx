"use client";

import Link from "next/link";
import {
    MapPin,
    GitCommit,
    Timer,
    Link as LinkIcon,
    TrendingUp,
    LayoutDashboard,
    ArrowRight,
    CheckCircle,
    Eye,
    TrendingDown,
    Wrench,
    BarChart,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";

const features = [
    {
        icon: MapPin,
        title: "Real-Time Location",
        description: "GPS, RFID, and IoT sensor integration",
    },
    {
        icon: GitCommit,
        title: "Transaction Traceability",
        description: "End-to-end audit trails for financial operations",
    },
    {
        icon: Timer,
        title: "Service Monitoring",
        description: "SLA tracking, escalation management, performance metrics",
    },
    {
        icon: LinkIcon,
        title: "Chain of Custody",
        description: "Immutable handoff records for regulated industries",
    },
    {
        icon: TrendingUp,
        title: "Predictive Analytics",
        description: "ML-powered anomaly detection and forecasting",
    },
    {
        icon: LayoutDashboard,
        title: "Custom Dashboards",
        description: "Role-based views with drill-down capabilities",
    },
];

const valueProps = [
    {
        metric: "100%",
        description: "Asset visibility",
        icon: Eye,
    },
    {
        metric: "40%",
        description: "Fewer operational losses",
        icon: TrendingDown,
    },
    {
        metric: "60%",
        description: "Reduced downtime",
        icon: Wrench,
    },
    {
        metric: "Auto",
        description: "Compliance reporting",
        icon: BarChart,
    },
];

const industries = [
    {
        title: "Supply Chain",
        description: "Track goods from origin to delivery",
        icon: "package",
    },
    {
        title: "Financial Services",
        description: "Transaction lifecycle monitoring",
        icon: "bank",
    },
    {
        title: "Healthcare",
        description: "Medical device and specimen tracking",
        icon: "health",
    },
    {
        title: "Government",
        description: "Asset management and procurement",
        icon: "building",
    },
    {
        title: "Energy Sector",
        description: "Equipment maintenance and compliance",
        icon: "energy",
    },
];

export function DigiTrackSection() {
    return (
        <section
            id="digitrack"
            className="w-full py-16 md:py-24 bg-white scroll-mt-20"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Asset Tracking Platform
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>

                    {/* Product Icon */}
                    <div className="flex justify-center mb-6 animate-fade-in-up delay-100">
                        <div className="w-20 h-20 rounded-2xl bg-accent-red flex items-center justify-center shadow-lg">
                            <MapPin className="h-10 w-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 animate-fade-in-up delay-100">
                        DigiTrack
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-accent-orange mb-6 animate-fade-in-up delay-200">
                        Complete Visibility Across Your Digital Operations
                    </p>
                    <p className="text-lg text-neutral-600 animate-fade-in-up delay-300">
                        Real-time tracking and traceability for physical assets, digital transactions,
                        and service delivery workflows. Built for industries requiring complete
                        chain-of-custody documentation and operational transparency.
                    </p>
                </div>

                {/* Value Props Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-accent-red/5 to-accent-red/10 rounded-xl p-6 text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center">
                                    <prop.icon className="h-6 w-6 text-accent-red" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-accent-red mb-1">
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
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent-red/10 flex items-center justify-center group-hover:bg-accent-red group-hover:scale-110 transition-all duration-300">
                                        <feature.icon
                                            className="h-7 w-7 text-accent-red group-hover:text-white transition-colors"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-accent-red transition-colors">
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

                {/* Dashboard Preview */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="w-full h-full"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
                            Real-Time Dashboard Preview
                        </h3>

                        {/* Mock Dashboard */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-accent-orange text-xs font-semibold mb-2">
                                    ACTIVE ASSETS
                                </div>
                                <div className="text-3xl font-bold text-white">2,847</div>
                                <div className="text-green-400 text-sm mt-1">+12% this week</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-accent-orange text-xs font-semibold mb-2">
                                    IN TRANSIT
                                </div>
                                <div className="text-3xl font-bold text-white">489</div>
                                <div className="text-neutral-400 text-sm mt-1">23 delayed</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-accent-orange text-xs font-semibold mb-2">
                                    SLA COMPLIANCE
                                </div>
                                <div className="text-3xl font-bold text-white">98.7%</div>
                                <div className="text-green-400 text-sm mt-1">Above target</div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 h-48 flex items-center justify-center border border-white/10">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 text-accent-orange mx-auto mb-3 animate-bounce" />
                                <p className="text-white/60 text-sm">Interactive Map View</p>
                                <p className="text-white/40 text-xs mt-1">
                                    Track assets in real-time across all locations
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industry Applications */}
                <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] text-center mb-8">
                        Industry Applications
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {industries.map((industry, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-accent-red/30 transition-all duration-300"
                            >
                                <CheckCircle className="h-5 w-5 text-accent-red flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-neutral-900 block">
                                        {industry.title}
                                    </span>
                                    <span className="text-neutral-500 text-sm">
                                        {industry.description}
                                    </span>
                                </div>
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
                            className="bg-accent-red hover:bg-accent-orange text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/contact">
                                Request DigiTrack Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-accent-red text-accent-red hover:bg-accent-red hover:text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                        >
                            <Link href="/products/digitrack">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
