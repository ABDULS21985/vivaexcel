import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    Users,
    Quote,
    CheckCircle2,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { FadeUp } from "@/components/ui/animations/scroll-reveal";
import { CTASection } from "@/components/shared";
import {
    caseStudies,
    getCaseStudyBySlug,
    type CaseStudy,
} from "@/data/case-studies";

// ============================================
// CASE STUDY DETAIL PAGE
// ============================================

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
    return caseStudies.map((cs) => ({
        slug: cs.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const caseStudy = getCaseStudyBySlug(slug);

    if (!caseStudy) {
        return {
            title: "Case Study Not Found",
        };
    }

    return {
        title: `${caseStudy.title} | Case Study | Global Digitalbit Limited`,
        description: caseStudy.excerpt,
        keywords: [
            caseStudy.industry.toLowerCase(),
            ...caseStudy.services.map((s) => s.toLowerCase()),
            "case study",
            "success story",
            "global digitalbit",
        ],
        openGraph: {
            title: caseStudy.title,
            description: caseStudy.excerpt,
            url: `https://globaldigibit.com/case-studies/${slug}`,
            images: caseStudy.heroImage ? [{ url: caseStudy.heroImage }] : undefined,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: caseStudy.title,
            description: caseStudy.excerpt,
            images: caseStudy.heroImage ? [caseStudy.heroImage] : undefined,
        },
    };
}

function MetricCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center card-interactive">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</div>
            <div className="text-sm text-neutral-600 font-medium">{label}</div>
        </div>
    );
}

function ContentSection({
    title,
    content,
    icon: Icon,
}: {
    title: string;
    content: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const paragraphs = content.split("\n\n").filter(Boolean);

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
            </div>
            <div className="prose prose-neutral max-w-none">
                {paragraphs.map((paragraph, index) => {
                    // Check if paragraph contains bullet points
                    if (paragraph.includes("- ")) {
                        const lines = paragraph.split("\n");
                        const titleLine = lines[0].endsWith(":") ? lines[0] : null;
                        const bulletLines = lines.filter((line) => line.startsWith("- "));

                        return (
                            <div key={index} className="mb-4">
                                {titleLine && (
                                    <p className="text-neutral-700 font-medium mb-3">{titleLine}</p>
                                )}
                                <ul className="space-y-2">
                                    {bulletLines.map((line, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-neutral-600">{line.slice(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }

                    return (
                        <p key={index} className="text-neutral-600 leading-relaxed mb-4">
                            {paragraph}
                        </p>
                    );
                })}
            </div>
        </div>
    );
}

function RelatedCaseStudy({ caseStudy }: { caseStudy: CaseStudy }) {
    return (
        <Link
            href={`/case-studies/${caseStudy.slug}`}
            className="group card-interactive block bg-white rounded-xl border border-neutral-200 overflow-hidden"
        >
            <div className="relative h-40 overflow-hidden">
                <Image
                    src={caseStudy.thumbnail}
                    alt={caseStudy.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-white/90 text-xs font-medium text-neutral-700 rounded">
                        {caseStudy.industry}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <p className="text-xs text-neutral-500 mb-1">{caseStudy.client}</p>
                <h4 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {caseStudy.title}
                </h4>
            </div>
        </Link>
    );
}

export default async function CaseStudyDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const caseStudy = getCaseStudyBySlug(slug);

    if (!caseStudy) {
        notFound();
    }

    // Get related case studies (same industry or services)
    const relatedCaseStudies = caseStudies
        .filter(
            (cs) =>
                cs.id !== caseStudy.id &&
                (cs.industry === caseStudy.industry ||
                    cs.services.some((s) => caseStudy.services.includes(s)))
        )
        .slice(0, 3);

    const formattedDate = new Date(caseStudy.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section - Full Width Image */}
            <section className="relative w-full min-h-[50vh] md:min-h-[60vh] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={caseStudy.heroImage}
                        alt={caseStudy.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12 pt-32">
                    {/* Back Link */}
                    <FadeUp>
                        <Link
                            href="/case-studies"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors w-fit"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Case Studies
                        </Link>
                    </FadeUp>

                    {/* Industry Badge */}
                    <FadeUp delay={0.1}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold rounded-full w-fit mb-4">
                            <Building2 className="h-4 w-4" />
                            {caseStudy.industry}
                        </span>
                    </FadeUp>

                    {/* Client Name */}
                    <FadeUp delay={0.15}>
                        <p className="text-white/70 text-lg mb-2">{caseStudy.client}</p>
                    </FadeUp>

                    {/* Title */}
                    <FadeUp delay={0.2}>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mb-6">
                            {caseStudy.title}
                        </h1>
                    </FadeUp>

                    {/* Meta Info */}
                    <FadeUp delay={0.25}>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/70">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{caseStudy.teamSize}</span>
                            </div>
                            <span className="text-white/50">|</span>
                            <span>Duration: {caseStudy.duration}</span>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* Metrics Row */}
            <section className="py-12 bg-neutral-50">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    <FadeUp>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                            {caseStudy.metrics.map((metric, index) => (
                                <MetricCard key={index} value={metric.value} label={metric.label} />
                            ))}
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Content Area */}
                        <div className="lg:col-span-8">
                            {/* Challenge Section */}
                            <FadeUp>
                                <ContentSection
                                    title="The Challenge"
                                    content={caseStudy.challenge}
                                    icon={({ className }) => (
                                        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                />
                            </FadeUp>

                            {/* Solution Section */}
                            <FadeUp delay={0.1}>
                                <ContentSection
                                    title="Our Solution"
                                    content={caseStudy.solution}
                                    icon={({ className }) => (
                                        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    )}
                                />
                            </FadeUp>

                            {/* Results Section */}
                            <FadeUp delay={0.2}>
                                <ContentSection
                                    title="The Results"
                                    content={caseStudy.results}
                                    icon={({ className }) => (
                                        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    )}
                                />
                            </FadeUp>

                            {/* Technologies Used */}
                            <FadeUp delay={0.3}>
                                <div className="mb-12">
                                    <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                                        Technologies Used
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {caseStudy.technologies.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-primary/5 text-primary border border-primary/20 text-sm font-medium rounded-full"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </FadeUp>

                            {/* Testimonial */}
                            {caseStudy.testimonial && (
                                <FadeUp delay={0.4}>
                                    <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 md:p-10 text-white">
                                        <Quote className="h-10 w-10 text-white/30 mb-6" />
                                        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                                            &ldquo;{caseStudy.testimonial.quote}&rdquo;
                                        </blockquote>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                                <span className="text-lg font-bold">
                                                    {caseStudy.testimonial.author.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{caseStudy.testimonial.author}</p>
                                                <p className="text-white/70 text-sm">
                                                    {caseStudy.testimonial.role}, {caseStudy.testimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeUp>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
                                {/* Project Details Card */}
                                <FadeUp delay={0.1}>
                                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                                        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                                            Project Details
                                        </h3>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm text-neutral-500 mb-1">Client</dt>
                                                <dd className="font-medium text-neutral-900">{caseStudy.client}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-neutral-500 mb-1">Industry</dt>
                                                <dd className="font-medium text-neutral-900">{caseStudy.industry}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-neutral-500 mb-1">Duration</dt>
                                                <dd className="font-medium text-neutral-900">{caseStudy.duration}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-neutral-500 mb-1">Team Size</dt>
                                                <dd className="font-medium text-neutral-900">{caseStudy.teamSize}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-neutral-500 mb-2">Services</dt>
                                                <dd className="flex flex-wrap gap-2">
                                                    {caseStudy.services.map((service, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-white text-neutral-700 text-sm border border-neutral-200 rounded-full"
                                                        >
                                                            {service}
                                                        </span>
                                                    ))}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </FadeUp>

                                {/* CTA Card */}
                                <FadeUp delay={0.2}>
                                    <div className="bg-primary rounded-2xl p-6 text-white">
                                        <h3 className="text-lg font-semibold mb-3">
                                            Want Similar Results?
                                        </h3>
                                        <p className="text-white/80 text-sm mb-6">
                                            Let us discuss how we can help transform your organization.
                                        </p>
                                        <Button
                                            asChild
                                            className="w-full bg-white text-primary hover:bg-neutral-100 rounded-full"
                                        >
                                            <Link href="/contact">
                                                Get in Touch
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </FadeUp>

                                {/* Related Case Studies */}
                                {relatedCaseStudies.length > 0 && (
                                    <FadeUp delay={0.3}>
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                                Related Case Studies
                                            </h3>
                                            <div className="space-y-4">
                                                {relatedCaseStudies.map((cs) => (
                                                    <RelatedCaseStudy key={cs.id} caseStudy={cs} />
                                                ))}
                                            </div>
                                        </div>
                                    </FadeUp>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title="Ready to Start"
                accentTitle="Your Transformation?"
                description="Schedule a consultation with our experts to discuss how we can help you achieve your business goals."
                primaryCTA={{
                    label: "Schedule Consultation",
                    href: "/contact",
                }}
                secondaryCTA={{
                    label: "View All Case Studies",
                    href: "/case-studies",
                }}
            />
        </main>
    );
}
