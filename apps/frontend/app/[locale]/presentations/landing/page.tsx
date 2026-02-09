import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  fetchPresentations,
  fetchFeaturedPresentations,
} from "@/lib/presentation-api";
import type { Presentation } from "@/types/presentation";
import {
  Industry,
  PresentationType,
  INDUSTRY_LABELS,
  INDUSTRY_ICONS,
  INDUSTRY_COLORS,
  PRESENTATION_TYPE_LABELS,
  PRESENTATION_TYPE_COLORS,
} from "@/types/presentation";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { LandingPageClient } from "./landing-page-client";

// =============================================================================
// Static Params
// =============================================================================

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: "Presentation Templates Marketplace | KTBlog",
  description:
    "Discover premium PowerPoint, Google Slides, and Keynote templates for every industry. Browse by industry, type, or theme. Professional quality, instant download.",
  keywords: [
    "presentation templates",
    "PowerPoint marketplace",
    "pitch deck templates",
    "business presentation",
    "Google Slides templates",
    "Keynote templates",
    "professional slides",
    "template marketplace",
  ],
  openGraph: {
    title: "Presentation Templates Marketplace | KTBlog",
    description:
      "Discover premium presentation templates for every industry. Professional quality, instant download.",
    url: "https://drkatangablog.com/presentations/landing",
    siteName: "KTBlog",
    type: "website",
    images: [
      {
        url: "https://drkatangablog.com/api/og?title=Presentation+Marketplace&type=default",
        width: 1200,
        height: 630,
        alt: "KTBlog Presentation Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Presentation Templates Marketplace | KTBlog",
    description:
      "Discover premium presentation templates for every industry.",
  },
};

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

// =============================================================================
// Page Component
// =============================================================================

export default async function PresentationsLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch all data in parallel
  let featured: Presentation[] = [];
  let newArrivals: Presentation[] = [];
  let popular: Presentation[] = [];
  let totalCount = 0;

  try {
    const [featuredResult, newArrivalsResult, popularResult, countResult] =
      await Promise.all([
        fetchFeaturedPresentations(8),
        fetchPresentations({
          limit: 8,
          sortBy: "publishedAt",
          sortOrder: "DESC",
        }),
        fetchPresentations({
          limit: 8,
          sortBy: "downloadCount",
          sortOrder: "DESC",
        }),
        fetchPresentations({ limit: 1 }),
      ]);

    featured = featuredResult;
    newArrivals = newArrivalsResult.items;
    popular = popularResult.items;
    totalCount = countResult.meta.total ?? 0;
  } catch (error) {
    console.error("[PresentationsLandingPage] Failed to fetch:", error);
  }

  // Build industry data
  const allIndustries = Object.values(Industry);
  const industryData = allIndustries.map((industry) => ({
    key: industry,
    label: INDUSTRY_LABELS[industry],
    icon: INDUSTRY_ICONS[industry],
    color: INDUSTRY_COLORS[industry],
  }));

  // Build type data
  const allTypes = Object.values(PresentationType);
  const typeData = allTypes.map((type) => ({
    key: type,
    label: PRESENTATION_TYPE_LABELS[type],
    color: PRESENTATION_TYPE_COLORS[type],
  }));

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Presentations", url: "/presentations" },
          { name: "Marketplace", url: "/presentations/landing" },
        ])}
      />

      <LandingPageClient
        featured={featured}
        newArrivals={newArrivals}
        popular={popular}
        totalCount={totalCount}
        industryData={industryData}
        typeData={typeData}
      />
    </>
  );
}
