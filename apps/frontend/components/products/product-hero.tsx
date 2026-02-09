"use client";

import Link from "next/link";
import { ArrowRight, Shield, Blocks, Activity, Zap, Users } from "lucide-react";
import { Button } from "@digibit/ui/components";
import { productPreviews } from "@/data/products";

const productConfig = {
    digigate: {
        icon: Shield,
        color: "bg-primary",
        hoverColor: "group-hover:bg-primary",
        textColor: "text-primary",
    },
    digitrust: {
        icon: Blocks,
        color: "bg-accent-orange",
        hoverColor: "group-hover:bg-accent-orange",
        textColor: "text-accent-orange",
    },
    digitrack: {
        icon: Activity,
        color: "bg-accent-red",
        hoverColor: "group-hover:bg-accent-red",
        textColor: "text-accent-red",
    },
    trustmehub: {
        icon: Zap,
        color: "bg-emerald-500",
        hoverColor: "group-hover:bg-emerald-500",
        textColor: "text-emerald-500",
    },
    boacrm: {
        icon: Users,
        color: "bg-indigo-500",
        hoverColor: "group-hover:bg-indigo-500",
        textColor: "text-indigo-500",
    },
};

export function ProductHero() {
    return (
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary via-secondary to-primary overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-0.5 bg-accent-orange"></div>
                            <span className="text-xs md:text-sm font-bold tracking-wider text-white/80 uppercase">
                                Product Suite
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="text-white">
                                Five Powerful Products.
                            </span>
                            <br />
                            <span className="text-accent-orange">
                                One Digital Future.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                            From API governance to blockchain credentials, asset tracking to
                            instant verification — our enterprise-grade products power digital
                            transformation at national scale.
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white">99.99%</div>
                                <div className="text-xs text-white/60">Uptime SLA</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-accent-orange">&lt;10ms</div>
                                <div className="text-xs text-white/60">Response Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white">100K+</div>
                                <div className="text-xs text-white/60">TPS Capacity</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-accent-orange hover:bg-accent-red text-white rounded-full px-8 h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                            >
                                <Link href="/contact">
                                    Request Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
                            >
                                <a href="#products">Explore Products</a>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Product Cards Preview */}
                    <div className="relative animate-fade-in-up delay-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {productPreviews.map((product, index) => {
                                const config =
                                    productConfig[
                                        product.id as keyof typeof productConfig
                                    ] || productConfig.digigate;
                                const IconComponent = config.icon;
                                return (
                                    <Link
                                        key={product.id}
                                        href={`#${product.id}`}
                                        className="group flex flex-col p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white hover:border-white transition-all duration-300"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300`}>
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-neutral-900 transition-colors mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-white/70 group-hover:text-neutral-500 transition-colors line-clamp-2">
                                            {product.tagline}
                                        </p>
                                        <div className={`mt-3 flex items-center text-sm font-medium text-white/80 group-hover:${config.textColor} transition-colors`}>
                                            Learn more
                                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
