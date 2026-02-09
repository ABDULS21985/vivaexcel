"use client";

import { useState, useEffect } from "react";
import { Shield, Blocks, Activity, Zap, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@digibit/ui/components";
import { products } from "@/data/products";
import { ProductShowcase } from "./product-showcase";

const productIcons = {
    digigate: Shield,
    digitrust: Blocks,
    digitrack: Activity,
    trustmehub: Zap,
    boacrm: Users,
};

const productIds = products.map((p) => p.id);

export function ProductTabs() {
    const [activeTab, setActiveTab] = useState(products[0].id);

    // Handle URL hash navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1); // Remove #
            if (hash && productIds.includes(hash)) {
                setActiveTab(hash);
                // Scroll to products section
                const productsSection = document.getElementById("products");
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: "smooth" });
                }
            }
        };

        // Check hash on mount
        handleHashChange();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Update URL hash when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.replaceState(null, "", `#${value}`);
    };

    return (
        <section id="products" className="w-full py-16 md:py-24 bg-white scroll-mt-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                        <span className="text-xs md:text-sm font-bold tracking-wider text-gray-600 uppercase">
                            Product Suite
                        </span>
                        <div className="w-12 h-0.5 bg-accent-orange"></div>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] mb-4">
                        Explore Our Products
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Five powerful solutions designed to transform your
                        digital infrastructure
                    </p>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="w-full flex justify-center gap-2 md:gap-4 mb-8 bg-transparent p-0 animate-fade-in-up delay-100">
                        {products.map((product) => {
                            const IconComponent =
                                productIcons[
                                    product.id as keyof typeof productIcons
                                ] || Shield;
                            return (
                                <TabsTrigger
                                    key={product.id}
                                    value={product.id}
                                    className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-full border-2 border-neutral-200 bg-white text-neutral-600 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 hover:border-primary/50"
                                >
                                    <IconComponent className="h-5 w-5" />
                                    <span className="hidden sm:inline font-medium">
                                        {product.name}
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {products.map((product, index) => (
                        <TabsContent
                            key={product.id}
                            value={product.id}
                            className="mt-0 focus-visible:outline-none"
                        >
                            <ProductShowcase
                                product={product}
                                reversed={index % 2 === 1}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}
