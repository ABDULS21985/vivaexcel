"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
    MapPin,
    Clock,
    Briefcase,
    ChevronRight,
    Filter,
    Code,
    Brain,
    Shield,
    Users,
    Package,
    Settings,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { jobPositions, departments } from "@/data/careers";
import { cn } from "@digibit/ui/components";

const departmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    code: Code,
    brain: Brain,
    shield: Shield,
    users: Users,
    package: Package,
    settings: Settings,
};

const levelLabels: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    executive: "Executive",
};

const typeLabels: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    remote: "Remote",
};

export function OpenPositions() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const t = useTranslations("careers");

    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

    const filteredPositions = selectedDepartment === "all"
        ? jobPositions
        : jobPositions.filter((job) => job.department.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === selectedDepartment);

    return (
        <section
            ref={sectionRef}
            className="relative py-24 md:py-32 bg-neutral-50 overflow-hidden"
            aria-label="Open positions section"
        >
            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #0A1628 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="max-w-3xl mb-12">
                    <motion.span
                        className="inline-flex items-center gap-3 text-primary text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent-orange" />
                        {t("positions.overline")}
                    </motion.span>

                    <motion.h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {t("positions.title")}
                    </motion.h2>

                    <motion.p
                        className="text-lg text-neutral-600 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t("positions.description")}
                    </motion.p>
                </div>

                {/* Department filters */}
                <motion.div
                    className="flex flex-wrap gap-3 mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <button
                        onClick={() => setSelectedDepartment("all")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            selectedDepartment === "all"
                                ? "bg-primary text-white"
                                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        {t("positions.allDepartments")}
                    </button>
                    {departments.map((dept) => {
                        const Icon = departmentIcons[dept.icon] || Briefcase;
                        return (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDepartment(dept.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    selectedDepartment === dept.id
                                        ? "bg-primary text-white"
                                        : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {dept.name}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Job listings */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {filteredPositions.length > 0 ? (
                            filteredPositions.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/careers/${job.slug}`}
                                        className="group block bg-white rounded-xl border border-neutral-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Job info */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                        {job.department}
                                                    </span>
                                                    {job.isRemote && (
                                                        <span className="px-2.5 py-0.5 bg-accent-yellow/10 text-accent-orange text-xs font-medium rounded-full">
                                                            {t("positions.remote")}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                                                    {job.title}
                                                </h3>

                                                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                                                    {job.description}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {typeLabels[job.type]}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Briefcase className="w-4 h-4" />
                                                        {levelLabels[job.level]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Apply button */}
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <span>{t("positions.apply")}</span>
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-16"
                            >
                                <p className="text-neutral-500 text-lg">
                                    {t("positions.noPositions")}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CTA for general applications */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <p className="text-neutral-600 mb-4">
                        {t("positions.dontSee")}
                    </p>
                    <Link
                        href="/contact?subject=general-application"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                        {t("positions.generalApplication")}
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
