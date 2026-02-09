"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import {
    Globe,
    Heart,
    GraduationCap,
    TrendingUp,
    Calendar,
    Users,
} from "lucide-react";
import { companyBenefits } from "@/data/careers";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    globe: Globe,
    heart: Heart,
    "graduation-cap": GraduationCap,
    "trending-up": TrendingUp,
    calendar: Calendar,
    users: Users,
};

export function WhyJoinUs() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const t = useTranslations("careers");

    return (
        <section
            ref={sectionRef}
            className="relative py-24 md:py-32 bg-white overflow-hidden"
            aria-label="Benefits section"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neutral-50 to-transparent" />

            <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="max-w-3xl mb-16">
                    <motion.span
                        className="inline-flex items-center gap-3 text-primary text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent-orange" />
                        {t("benefits.overline")}
                    </motion.span>

                    <motion.h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {t("benefits.title")}
                    </motion.h2>

                    <motion.p
                        className="text-lg text-neutral-600 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t("benefits.description")}
                    </motion.p>
                </div>

                {/* Benefits grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {companyBenefits.map((benefit, index) => {
                        const Icon = iconMap[benefit.icon] || Globe;

                        return (
                            <motion.div
                                key={benefit.id}
                                className="group relative p-8 bg-white rounded-2xl border border-neutral-200 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent-orange/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-7 h-7 text-primary" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                    {t(`benefits.items.${benefit.id}.title`)}
                                </h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    {t(`benefits.items.${benefit.id}.description`)}
                                </p>

                                {/* Hover gradient */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
