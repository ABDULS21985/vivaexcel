"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle, MessageCircle, FileText, Users, Sparkles } from "lucide-react";
import { Button } from "@ktblog/ui/components";
import { AnimateOnScroll } from "@/components/shared";

/* ------------------------------------------------------------------ */
/* Help Options                                                         */
/* ------------------------------------------------------------------ */

const helpOptions = [
    {
        icon: MessageCircle,
        title: "Talk to an Expert",
        description: "Schedule a 30-minute consultation with our solutions architects to find the perfect fit.",
        cta: "Book a Call",
        href: "/contact?type=consultation",
        color: "#1E4DB7",
    },
    {
        icon: FileText,
        title: "Compare Products",
        description: "View our detailed comparison guide to understand the capabilities of each product.",
        cta: "View Comparison",
        href: "/products/comparison",
        color: "#F59A23",
    },
    {
        icon: Users,
        title: "See Customer Stories",
        description: "Learn how organizations like yours have transformed with our solutions.",
        cta: "Read Case Studies",
        href: "/case-studies",
        color: "#10B981",
    },
];

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */

export function ProductComparisonCTA() {
    return (
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1e36] to-[#1a0f2e]"></div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <div
                    className="absolute w-[500px] h-[500px] rounded-full animate-float-slow opacity-10"
                    style={{
                        background: "radial-gradient(circle, #1E4DB7 0%, transparent 70%)",
                        top: "-20%",
                        left: "-10%",
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full animate-float2 opacity-10"
                    style={{
                        background: "radial-gradient(circle, #F59A23 0%, transparent 70%)",
                        bottom: "-15%",
                        right: "-5%",
                    }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <AnimateOnScroll animation="fade-up">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                            <HelpCircle className="w-5 h-5 text-accent-orange" />
                            <span className="text-sm font-semibold text-white/80">
                                Decision Support
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Need Help{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-secondary-yellow">
                                Choosing?
                            </span>
                        </h2>

                        <p className="text-lg text-white/70 max-w-2xl mx-auto">
                            Our team of solutions architects can help you identify the right products
                            for your specific use case, industry, and scale requirements.
                        </p>
                    </div>
                </AnimateOnScroll>

                {/* Help Options Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {helpOptions.map((option, index) => (
                        <AnimateOnScroll key={option.title} animation="fade-up" delay={index * 100}>
                            <Link
                                href={option.href}
                                className="group block h-full"
                            >
                                <div
                                    className="
                                        relative h-full p-8 rounded-2xl
                                        bg-white/5 backdrop-blur-sm border border-white/10
                                        transition-all duration-500
                                        hover:bg-white/10 hover:border-white/20 hover:-translate-y-2
                                    "
                                >
                                    {/* Icon */}
                                    <div
                                        className="
                                            w-14 h-14 rounded-xl flex items-center justify-center mb-6
                                            transition-all duration-300 group-hover:scale-110
                                        "
                                        style={{ backgroundColor: `${option.color}20` }}
                                    >
                                        <option.icon className="w-7 h-7" style={{ color: option.color }} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {option.title}
                                    </h3>
                                    <p className="text-white/60 mb-6">
                                        {option.description}
                                    </p>

                                    {/* CTA */}
                                    <div
                                        className="
                                            flex items-center gap-2 text-sm font-semibold
                                            transition-all duration-300 group-hover:translate-x-2
                                        "
                                        style={{ color: option.color }}
                                    >
                                        {option.cta}
                                        <ArrowRight className="h-4 w-4" />
                                    </div>

                                    {/* Hover glow */}
                                    <div
                                        className="
                                            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                                            transition-opacity duration-500 pointer-events-none
                                        "
                                        style={{
                                            boxShadow: `0 20px 60px -15px ${option.color}30, inset 0 0 0 1px ${option.color}20`
                                        }}
                                    />
                                </div>
                            </Link>
                        </AnimateOnScroll>
                    ))}
                </div>

                {/* Bottom CTA */}
                <AnimateOnScroll animation="scale" delay={300}>
                    <div className="relative max-w-3xl mx-auto">
                        <div
                            className="
                                relative p-8 md:p-12 rounded-3xl overflow-hidden
                                bg-gradient-to-r from-primary via-secondary to-primary
                            "
                        >
                            {/* Animated background */}
                            <div className="absolute inset-0 opacity-30">
                                <div
                                    className="absolute inset-0 animate-gradient-shift"
                                    style={{
                                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                        backgroundSize: "200% 100%",
                                    }}
                                />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                                    <Sparkles className="w-4 h-4 text-white" />
                                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                                        Enterprise Ready
                                    </span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    Ready to Transform Your Operations?
                                </h3>

                                <p className="text-white/80 mb-8 max-w-lg mx-auto">
                                    Join leading organizations across Africa and the Middle East
                                    who trust our products for mission-critical operations.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-white text-primary hover:bg-neutral-100 rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                                    >
                                        <Link href="/contact">
                                            Schedule a Demo
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="border-2 border-white/50 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                                    >
                                        <Link href="/contact?type=quote">
                                            Get Custom Quote
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
}
