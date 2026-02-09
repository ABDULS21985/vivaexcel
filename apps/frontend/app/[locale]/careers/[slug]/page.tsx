import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { jobPositions, type JobPosition } from "@/data/careers";
import { JobApplicationForm } from "@/components/careers/job-application-form";
import { Link } from "@/i18n/routing";
import {
    MapPin,
    Clock,
    Briefcase,
    Calendar,
    ArrowLeft,
    CheckCircle,
    Gift,
} from "lucide-react";

// Generate static params for all job slugs and locales
export function generateStaticParams() {
    const params: { locale: string; slug: string }[] = [];

    for (const locale of routing.locales) {
        for (const job of jobPositions) {
            params.push({ locale, slug: job.slug });
        }
    }

    return params;
}

// Generate metadata for SEO
type MetadataProps = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
    const { slug } = await params;
    const job = jobPositions.find((j) => j.slug === slug);

    if (!job) {
        return {
            title: "Job Not Found | Global Digitalbit Limited",
        };
    }

    return {
        title: `${job.title} | Careers | Global Digitalbit Limited`,
        description: job.description,
        openGraph: {
            title: `${job.title} at Global Digitalbit Limited`,
            description: job.description,
            url: `https://drkatangablog.com/careers/${job.slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${job.title} at Global Digitalbit Limited`,
            description: job.description,
        },
    };
}

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

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export default async function JobDetailsPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const t = await getTranslations("careers");

    const job = jobPositions.find((j) => j.slug === slug);

    if (!job) {
        notFound();
    }

    const formattedDate = new Date(job.postedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <main className="flex min-h-screen flex-col bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/95 to-secondary pt-32 pb-16 overflow-hidden">
                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <Link
                        href="/careers"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to all positions</span>
                    </Link>

                    {/* Job info */}
                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                                {job.department}
                            </span>
                            {job.isRemote && (
                                <span className="px-3 py-1 bg-accent-yellow/20 text-accent-yellow text-sm font-medium rounded-full">
                                    {t("positions.remote")}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap gap-6 text-white/80">
                            <span className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                {job.location}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {typeLabels[job.type]}
                            </span>
                            <span className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                {levelLabels[job.level]}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Posted {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                                    About the Role
                                </h2>
                                <p className="text-neutral-600 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                                    Responsibilities
                                </h2>
                                <ul className="space-y-3">
                                    {job.responsibilities.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-neutral-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                                    Requirements
                                </h2>
                                <ul className="space-y-3">
                                    {job.requirements.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                            <span className="text-neutral-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Benefits */}
                            <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Gift className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                        Benefits & Perks
                                    </h2>
                                </div>
                                <ul className="grid sm:grid-cols-2 gap-4">
                                    {job.benefits.map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-neutral-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Application form sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <JobApplicationForm position={job} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
