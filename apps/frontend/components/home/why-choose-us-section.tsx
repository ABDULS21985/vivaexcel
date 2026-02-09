"use client";

import { useEffect, useState, useRef } from "react";
import {
    Hammer,
    ShieldCheck,
    Globe,
    Headphones,
} from "lucide-react";

const features = [
    {
        icon: Hammer,
        title: "Built, Not Just Advised",
        description: "We implement what we recommend. Our hands-on approach means we're in the trenches with you, delivering real solutions.",
        proof: "500+ projects delivered",
        delay: 0,
    },
    {
        icon: ShieldCheck,
        title: "Security-First, Always",
        description: "Security isn't an afterthought—it's embedded in everything we build. We protect your data like it's our own.",
        proof: "Zero breaches across 200+ secured environments",
        delay: 100,
    },
    {
        icon: Globe,
        title: "Regional Expertise, Global Standards",
        description: "We understand local markets while maintaining international best practices and compliance standards.",
        proof: "Local presence in 50+ countries with ISO certifications",
        delay: 200,
    },
    {
        icon: Headphones,
        title: "24/7 Support & Monitoring",
        description: "Round-the-clock support ensures your systems never sleep. We monitor, respond, and resolve—fast.",
        proof: "Average response time under 15 minutes",
        delay: 300,
    },
];

export function WhyChooseUsSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full py-20 md:py-32 relative overflow-hidden"
            style={{ backgroundColor: "#F8FAFC" }}
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div
                    className={`mb-16 text-center max-w-4xl mx-auto transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    {/* Kicker */}
                    <span
                        className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
                        style={{ color: "#1E4DB7" }}
                    >
                        WHY CHOOSE US
                    </span>

                    {/* Headline */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                        The Differentiators That Matter
                    </h2>
                </div>

                {/* Features Grid - 2 columns */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-700 ${
                                isVisible
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-[30px]"
                            }`}
                            style={{ transitionDelay: `${feature.delay}ms` }}
                        >
                            <div className="group relative h-full">
                                {/* Card */}
                                <div
                                    className="relative h-full p-6 md:p-8 bg-white rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                                    style={{
                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    {/* Left Border Accent - Animated on hover */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 origin-top transition-transform duration-500 group-hover:scale-y-100"
                                        style={{
                                            backgroundColor: "#1E4DB7",
                                            transform: "scaleY(0.3)",
                                        }}
                                    />

                                    {/* Content Container */}
                                    <div className="flex gap-4 md:gap-6">
                                        {/* Icon */}
                                        <div
                                            className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: "rgba(30, 77, 183, 0.1)",
                                            }}
                                        >
                                            <feature.icon
                                                className="w-6 h-6 md:w-7 md:h-7"
                                                style={{ color: "#1E4DB7" }}
                                                strokeWidth={1.5}
                                            />
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1">
                                            {/* Title */}
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                                {feature.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
                                                {feature.description}
                                            </p>

                                            {/* Proof Point */}
                                            <div
                                                className="inline-flex items-center text-sm font-semibold"
                                                style={{ color: "#1E4DB7" }}
                                            >
                                                <span className="mr-2">→</span>
                                                {feature.proof}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
