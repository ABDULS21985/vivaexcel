import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  fetchSolutionDocument,
  fetchRelatedDocuments,
  fetchDocumentBundles,
} from "@/lib/solution-document-api";
import type { SolutionDocument, DocumentBundle } from "@/types/solution-document";
import {
  DOCUMENT_TYPE_LABELS,
  DOMAIN_LABELS,
} from "@/types/solution-document";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { SolutionDetailClient } from "./solution-detail-client";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
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
  const { slug } = await params;
  const document = await fetchSolutionDocument(slug);

  if (!document) {
    return {
      title: "Document Not Found | KTBlog",
    };
  }

  const typeLabel =
    DOCUMENT_TYPE_LABELS[document.documentType] || "Document";
  const documentUrl = `https://drkatangablog.com/store/solutions/${slug}`;

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: document.title,
    category: typeLabel,
    type: "post",
  }).toString()}`;

  return {
    title: `${document.seoTitle || document.title} | KTBlog Solutions`,
    description:
      document.seoDescription ||
      document.shortDescription ||
      document.description?.slice(0, 160) ||
      "",
    keywords: [
      ...(document.aiSuggestedTags ?? []),
      "solution design document",
      typeLabel.toLowerCase(),
      "architecture document",
      "ktblog",
    ],
    openGraph: {
      title: document.title,
      description:
        document.seoDescription ||
        document.shortDescription ||
        document.description?.slice(0, 160) ||
        "",
      url: documentUrl,
      images: [
        {
          url: document.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: document.title,
          type: "image/png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: document.title,
      description:
        document.seoDescription ||
        document.shortDescription ||
        document.description?.slice(0, 160) ||
        "",
      images: [
        {
          url: document.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: document.title,
        },
      ],
    },
    alternates: {
      canonical: documentUrl,
    },
  };
}

// =============================================================================
// Structured Data
// =============================================================================

function generateProductSchema(document: SolutionDocument) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
  const documentUrl = `${BASE_URL}/store/solutions/${document.slug || document.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${documentUrl}#product`,
    name: document.title,
    description: document.shortDescription || document.description,
    image: document.featuredImage || undefined,
    url: documentUrl,
    sku: document.id,
    brand: {
      "@type": "Organization",
      name: "KTBlog",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: document.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: documentUrl,
      ...(document.compareAtPrice &&
      document.compareAtPrice > document.price
        ? {
            priceValidUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0],
          }
        : {}),
    },
    category:
      DOCUMENT_TYPE_LABELS[document.documentType] || "Document",
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function SolutionDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const document = await fetchSolutionDocument(slug);

  if (!document) {
    notFound();
  }

  const [relatedDocuments, bundles] = await Promise.all([
    fetchRelatedDocuments(document, 4),
    fetchDocumentBundles(),
  ]);

  // Filter bundles that include this document
  const relevantBundles = bundles.filter((b) =>
    b.documents.some((d) => d.id === document.id),
  );

  const typeLabel =
    DOCUMENT_TYPE_LABELS[document.documentType] || "Document";
  const domainLabel =
    DOMAIN_LABELS[document.domain] || "General";

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Solutions", url: "/store/solutions" },
          {
            name: domainLabel,
            url: `/store/solutions/domain/${document.domain}`,
          },
          {
            name: document.title,
            url: `/store/solutions/${document.slug || document.id}`,
          },
        ])}
      />
      <JsonLd data={generateProductSchema(document)} />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Breadcrumbs */}
        <section className="border-b border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 overflow-x-auto">
              <Link
                href="/"
                className="hover:text-[#1E4DB7] transition-colors whitespace-nowrap"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link
                href="/store/solutions"
                className="hover:text-[#1E4DB7] transition-colors whitespace-nowrap"
              >
                Solutions
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link
                href={`/store/solutions/domain/${document.domain}`}
                className="hover:text-[#1E4DB7] transition-colors whitespace-nowrap"
              >
                {domainLabel}
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {document.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Main Content -- delegated to client component for interactivity */}
        <SolutionDetailClient
          document={document}
          relatedDocuments={relatedDocuments}
          bundles={relevantBundles}
        />

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#1E4DB7]" />
                <span className="text-sm font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  Need Help?
                </span>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#1E4DB7]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                Have{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                  Questions?
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
                Not sure if this document fits your architecture needs? Our team
                can help you choose the right solution for your project.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1E4DB7]/25"
                >
                  Contact Us
                </Link>
                <Link
                  href="/store/solutions"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl transition-all duration-300"
                >
                  Browse More Documents
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
