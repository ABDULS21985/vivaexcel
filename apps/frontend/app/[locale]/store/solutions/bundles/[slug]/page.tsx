import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { fetchDocumentBundle } from "@/lib/solution-document-api";
import type { DocumentBundle } from "@/types/solution-document";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { BundleDetailClient } from "./bundle-detail-client";

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
  const bundle = await fetchDocumentBundle(slug);

  if (!bundle) {
    return {
      title: "Bundle Not Found | KTBlog",
    };
  }

  const bundleUrl = `https://drkatangablog.com/store/solutions/bundles/${slug}`;

  return {
    title: `${bundle.name} | KTBlog Document Bundles`,
    description:
      bundle.description?.slice(0, 160) ||
      `Save ${bundle.savingsPercentage}% with the ${bundle.name} bundle. Includes ${bundle.documents.length} architecture documents.`,
    openGraph: {
      title: bundle.name,
      description:
        bundle.description?.slice(0, 160) ||
        `Save ${bundle.savingsPercentage}% with this bundle.`,
      url: bundleUrl,
      images: bundle.featuredImage
        ? [
            {
              url: bundle.featuredImage,
              width: 1200,
              height: 630,
              alt: bundle.name,
            },
          ]
        : [
            {
              url: `https://drkatangablog.com/api/og?title=${encodeURIComponent(bundle.name)}&type=default`,
              width: 1200,
              height: 630,
              alt: bundle.name,
            },
          ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.name,
      description:
        bundle.description?.slice(0, 160) ||
        `Save ${bundle.savingsPercentage}% with this bundle.`,
    },
    alternates: {
      canonical: bundleUrl,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function BundleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const bundle = await fetchDocumentBundle(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Solutions", url: "/store/solutions" },
          {
            name: bundle.name,
            url: `/store/solutions/bundles/${slug}`,
          },
        ])}
      />

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
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {bundle.name}
              </span>
            </nav>
          </div>
        </section>

        {/* Client Content */}
        <BundleDetailClient bundle={bundle} />
      </div>
    </>
  );
}
