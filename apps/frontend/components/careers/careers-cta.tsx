"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Mail, Send } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@digibit/ui/components";

export function CareersCta() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const t = useTranslations("careers");

    return (
        <section
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden"
            aria-label="Careers call to action"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0D2137] to-[#0A1628]" />

            {/* Decorative elements */}
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

                {/* Gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent-yellow/20 to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-primary/20 to-transparent blur-3xl" />
            </div>

            <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-orange mb-8"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <Send className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {t("cta.title")}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t("cta.description")}
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button
                            asChild
                            size="lg"
                            className="bg-accent-yellow hover:bg-accent-orange text-[#0A1628] font-bold px-8 py-6 rounded-xl"
                        >
                            <Link href="/contact?subject=career-inquiry" className="flex items-center gap-2">
                                {t("cta.primary")}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-xl"
                        >
                            <a href="mailto:careers@globaldigibit.com" className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                {t("cta.secondary")}
                            </a>
                        </Button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        className="mt-12 pt-12 border-t border-white/10"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <p className="text-sm text-white/50 mb-4">{t("cta.trustedBy")}</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                            {/* Placeholder for partner logos - can be replaced with actual logos */}
                            {["Central Banks", "Fortune 500", "Government Agencies", "Tech Startups"].map((partner) => (
                                <span key={partner} className="text-white/70 text-sm font-medium">
                                    {partner}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
