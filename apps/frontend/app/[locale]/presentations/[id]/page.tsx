import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  fetchPresentationBySlug,
  fetchRelatedPresentations,
  fetchPresentationSlides,
} from "@/lib/presentation-api";
import type { Presentation } from "@/types/presentation";
import {
  PRESENTATION_TYPE_LABELS,
  INDUSTRY_LABELS,
} from "@/types/presentation";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { PresentationDetailClient } from "./presentation-detail-client";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

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
  const { id } = await params;
  const presentation = await fetchPresentationBySlug(id);

  if (!presentation) {
    return {
      title: "Presentation Not Found | KTBlog",
    };
  }

  const typeLabel =
    PRESENTATION_TYPE_LABELS[presentation.presentationType] || "Presentation";
  const presentationUrl = `https://drkatangablog.com/presentations/${id}`;

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: presentation.title,
    author: presentation.creator?.name ?? "KTBlog",
    category: typeLabel,
    date: presentation.publishedAt
      ? new Date(presentation.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    type: "post",
  }).toString()}`;

  return {
    title: `${presentation.seoTitle || presentation.title} | KTBlog Presentations`,
    description:
      presentation.seoDescription ||
      presentation.shortDescription ||
      presentation.description?.slice(0, 160) ||
      "",
    keywords: [
      ...(presentation.seoKeywords ?? []),
      ...(presentation.tags?.map((tag) => tag.name.toLowerCase()) ?? []),
      "presentation template",
      typeLabel.toLowerCase(),
      "PowerPoint template",
      "ktblog",
    ],
    openGraph: {
      title: presentation.title,
      description:
        presentation.seoDescription ||
        presentation.shortDescription ||
        presentation.description?.slice(0, 160) ||
        "",
      url: presentationUrl,
      images: [
        {
          url: presentation.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: presentation.title,
          type: "image/png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: presentation.title,
      description:
        presentation.seoDescription ||
        presentation.shortDescription ||
        presentation.description?.slice(0, 160) ||
        "",
      images: [
        {
          url: presentation.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: presentation.title,
        },
      ],
    },
    alternates: {
      canonical: presentationUrl,
    },
  };
}

// =============================================================================
// Structured Data
// =============================================================================

function generatePresentationSchema(presentation: Presentation) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
  const presentationUrl = `${BASE_URL}/presentations/${presentation.slug || presentation.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${presentationUrl}#product`,
    name: presentation.title,
    description: presentation.shortDescription || presentation.description,
    image: presentation.featuredImage || undefined,
    url: presentationUrl,
    sku: presentation.id,
    brand: {
      "@type": "Organization",
      name: "KTBlog",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: presentation.price,
      priceCurrency: presentation.currency || "USD",
      availability: "https://schema.org/InStock",
      url: presentationUrl,
      ...(presentation.compareAtPrice &&
      presentation.compareAtPrice > presentation.price
        ? {
            priceValidUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0],
          }
        : {}),
    },
    ...(presentation.averageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: presentation.averageRating,
            reviewCount: presentation.totalReviews || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    category:
      PRESENTATION_TYPE_LABELS[presentation.presentationType] || "Presentation",
    ...(presentation.creator
      ? {
          author: {
            "@type": "Person",
            name: presentation.creator.name,
          },
        }
      : {}),
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function PresentationDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const presentation = await fetchPresentationBySlug(id);

  if (!presentation) {
    notFound();
  }

  const [relatedPresentations, slides] = await Promise.all([
    fetchRelatedPresentations(presentation, 4),
    fetchPresentationSlides(presentation.id),
  ]);

  const typeLabel =
    PRESENTATION_TYPE_LABELS[presentation.presentationType] || "Presentation";
  const industryLabel =
    INDUSTRY_LABELS[presentation.industry] || "General";

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Presentations", url: "/presentations" },
          {
            name: industryLabel,
            url: `/presentations/industry/${presentation.industry}`,
          },
          {
            name: presentation.title,
            url: `/presentations/${presentation.slug || presentation.id}`,
          },
        ])}
      />
      <JsonLd data={generatePresentationSchema(presentation)} />

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
              <Link
                href={`/presentations/industry/${presentation.industry}`}
                className="hover:text-[#D24726] transition-colors whitespace-nowrap"
              >
                {industryLabel}
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {presentation.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Main Content -- delegated to client component for interactivity */}
        <PresentationDetailClient
          presentation={presentation}
          slides={slides}
          relatedPresentations={relatedPresentations}
        />

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#D24726]" />
                <span className="text-sm font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  Need Help?
                </span>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#D24726]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                Have{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#F59A23]">
                  Questions?
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
                Not sure if this template is right for you? Our team is ready to
                help you find the perfect presentation for your needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D24726] to-[#B73D20] hover:from-[#B73D20] hover:to-[#D24726] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D24726]/25"
                >
                  Contact Us
                </Link>
                <Link
                  href="/presentations"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl transition-all duration-300"
                >
                  Browse More Templates
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
