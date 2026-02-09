import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Presentation } from "lucide-react";
import {
  fetchPresentationsByIndustry,
  fetchPresentations,
} from "@/lib/presentation-api";
import {
  Industry,
  INDUSTRY_LABELS,
  INDUSTRY_ICONS,
  INDUSTRY_COLORS,
} from "@/types/presentation";
import type { Presentation as PresentationType } from "@/types/presentation";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { IndustryPageClient } from "./industry-page-client";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

const ALL_INDUSTRIES = Object.values(Industry);

function findIndustryBySlug(slug: string): Industry | undefined {
  return ALL_INDUSTRIES.find((i) => i === slug);
}

// =============================================================================
// Static Params (on-demand ISR)
// =============================================================================

export async function generateStaticParams() {
  return [];
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = findIndustryBySlug(slug);

  if (!industry) {
    return { title: "Industry Not Found | KTBlog" };
  }

  const label = INDUSTRY_LABELS[industry];
  const industryUrl = `https://drkatangablog.com/presentations/industry/${slug}`;

  return {
    title: `${label} Presentation Templates | KTBlog`,
    description: `Browse premium ${label.toLowerCase()} presentation templates. Professional PowerPoint, Google Slides, and Keynote templates for ${label.toLowerCase()} professionals.`,
    keywords: [
      `${label.toLowerCase()} presentations`,
      `${label.toLowerCase()} PowerPoint templates`,
      `${label.toLowerCase()} pitch deck`,
      "presentation templates",
      "professional slides",
      "ktblog",
    ],
    openGraph: {
      title: `${label} Presentation Templates | KTBlog`,
      description: `Browse premium ${label.toLowerCase()} presentation templates. Professional quality, fully editable.`,
      url: industryUrl,
      siteName: "KTBlog",
      type: "website",
      images: [
        {
          url: `https://drkatangablog.com/api/og?title=${encodeURIComponent(label + " Templates")}&type=default`,
          width: 1200,
          height: 630,
          alt: `${label} Presentation Templates`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} Presentation Templates | KTBlog`,
      description: `Browse premium ${label.toLowerCase()} presentation templates.`,
    },
    alternates: {
      canonical: industryUrl,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function IndustryPresentationsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const industry = findIndustryBySlug(slug);

  if (!industry) {
    notFound();
  }

  const label = INDUSTRY_LABELS[industry];
  const icon = INDUSTRY_ICONS[industry];
  const color = INDUSTRY_COLORS[industry];

  // Fetch presentations for this industry
  let presentations: PresentationType[] = [];
  let featuredPresentations: PresentationType[] = [];

  try {
    const [allResult, featuredResult] = await Promise.all([
      fetchPresentationsByIndustry(industry, 24),
      fetchPresentations({
        industry,
        isFeatured: true,
        limit: 4,
        sortBy: "downloadCount",
        sortOrder: "DESC",
      }),
    ]);
    presentations = allResult;
    featuredPresentations = featuredResult.items;
  } catch (error) {
    console.error("[IndustryPresentationsPage] Failed to fetch:", error);
  }

  // Related industries (exclude current)
  const relatedIndustries = ALL_INDUSTRIES.filter((i) => i !== industry).slice(
    0,
    6,
  );

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Presentations", url: "/presentations" },
          { name: label, url: `/presentations/industry/${slug}` },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Breadcrumbs */}
        <section className="border-b border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 overflow-x-auto">
              <Link
                href="/"
                className="hover:text-[#D24726] transition-colors whitespace-nowrap"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link
                href="/presentations"
                className="hover:text-[#D24726] transition-colors whitespace-nowrap"
              >
                Presentations
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {label}
              </span>
            </nav>
          </div>
        </section>

        {/* Industry Hero */}
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 50%, ${color}99 100%)`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-4xl">{icon}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {label}{" "}
                <span className="text-white/80">Presentation Templates</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Professionally designed presentation templates tailored for{" "}
                {label.toLowerCase()} professionals. Fully editable, instantly
                downloadable.
              </p>

              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {presentations.length}
                  </p>
                  <p className="text-sm text-white/60">Templates</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {featuredPresentations.length}
                  </p>
                  <p className="text-sm text-white/60">Featured</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client-side interactive content */}
        <IndustryPageClient
          industry={industry}
          label={label}
          color={color}
          presentations={presentations}
          featuredPresentations={featuredPresentations}
          relatedIndustries={relatedIndustries}
        />
      </div>
    </>
  );
}
