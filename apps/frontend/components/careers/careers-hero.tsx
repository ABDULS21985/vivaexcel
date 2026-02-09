"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowDown, Briefcase, MapPin, Users } from "lucide-react";

export function CareersHero() {
    const heroRef = useRef<HTMLElement>(null);
    const t = useTranslations("careers");

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const stats = [
        { icon: Users, value: "150+", label: t("hero.stats.employees") },
        { icon: MapPin, value: "50+", label: t("hero.stats.countries") },
        { icon: Briefcase, value: "6", label: t("hero.stats.openings") },
    ];

    return (
        <section
            ref={heroRef}
            className="relative w-full min-h-[90vh] overflow-hidden flex items-center"
            aria-label="Careers hero section"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0D2137] to-[#0A1628]" />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Floating orbs */}
                <motion.div
                    className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent-yellow/20 to-accent-orange/10 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-primary/20 to-accent-yellow/10 blur-3xl"
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 0%, rgba(10, 22, 40, 0.4) 100%)",
                }}
            />

            {/* Content */}
            <motion.div
                className="relative z-20 container mx-auto px-5 sm:px-6 lg:px-8 py-20"
                style={{
                    y: contentY,
                    opacity: contentOpacity,
                }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    {/* Kicker text */}
                    <motion.span
                        className="inline-flex items-center gap-3 text-accent-yellow text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="w-10 h-0.5 bg-gradient-to-r from-accent-yellow to-accent-orange" />
                        {t("hero.kicker")}
                        <span className="w-10 h-0.5 bg-gradient-to-l from-accent-yellow to-accent-orange" />
                    </motion.span>

                    {/* Main heading */}
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {t("hero.title.line1")}{" "}
                        <span className="bg-gradient-to-r from-accent-yellow via-accent-orange to-accent-red bg-clip-text text-transparent">
                            {t("hero.title.highlight")}
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {t("hero.subtitle")}
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-8 md:gap-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon className="w-5 h-5 text-accent-yellow" />
                                    <span className="text-3xl md:text-4xl font-bold text-white">{stat.value}</span>
                                </div>
                                <span className="text-sm text-white/60">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
            >
                <span className="text-xs uppercase tracking-[0.1em] text-white/40">
                    {t("hero.scroll")}
                </span>
                <motion.div
                    className="w-6 h-10 rounded-full border border-white/30 flex justify-center pt-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                        animate={{ y: [0, 16, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}
