"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { companyValues } from "@/data/careers";

export function CultureSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const t = useTranslations("careers");

    return (
        <section
            ref={sectionRef}
            className="relative py-24 md:py-32 bg-white overflow-hidden"
            aria-label="Culture section"
        >
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image side */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Main image */}
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
                                alt="Team collaboration at Global Digitalbit"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                        </div>

                        {/* Floating accent card */}
                        <motion.div
                            className="absolute -bottom-6 -right-6 lg:-right-10 bg-white rounded-xl p-6 shadow-xl border border-neutral-100 max-w-xs"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-yellow to-accent-orange flex items-center justify-center text-white font-bold text-lg">
                                    98%
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">{t("culture.satisfaction.value")}</p>
                                    <p className="text-sm text-neutral-500">{t("culture.satisfaction.label")}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Background decoration */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent-orange/10 rounded-xl -z-10" />
                    </motion.div>

                    {/* Content side */}
                    <div>
                        <motion.span
                            className="inline-flex items-center gap-3 text-primary text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent-orange" />
                            {t("culture.overline")}
                        </motion.span>

                        <motion.h2
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {t("culture.title")}
                        </motion.h2>

                        <motion.p
                            className="text-lg text-neutral-600 leading-relaxed mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {t("culture.description")}
                        </motion.p>

                        {/* Values grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            {companyValues.map((value, index) => (
                                <motion.div
                                    key={value.id}
                                    className="relative pl-6 border-l-2 border-primary/20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                >
                                    <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary -translate-x-[5px]" />
                                    <h3 className="font-bold text-neutral-900 mb-1">
                                        {t(`culture.values.${value.id}.title`)}
                                    </h3>
                                    <p className="text-sm text-neutral-600">
                                        {t(`culture.values.${value.id}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
