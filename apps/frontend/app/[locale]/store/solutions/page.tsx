import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FileText, Mail, Send } from "lucide-react";
import { SolutionsListingClient } from "@/components/store/solutions/solutions-listing-client";
import {
  fetchSolutionDocuments,
  fetchDocumentBundles,
} from "@/lib/solution-document-api";
import type { SolutionDocument, DocumentBundle } from "@/types/solution-document";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";

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
  title: "Enterprise Architecture Documents | KTBlog",
  description:
    "Browse premium solution design documents, architecture blueprints, migration plans, and technical specifications. Enterprise-ready, professionally crafted, instant download.",
  keywords: [
    "solution design documents",
    "architecture blueprints",
    "technical specifications",
    "migration plans",
    "security assessments",
    "cloud architecture",
    "enterprise documentation",
    "SDD marketplace",
    "technical documents",
    "digital downloads",
  ],
  openGraph: {
    title: "Enterprise Architecture Documents | KTBlog",
    description:
      "Browse premium solution design documents, architecture blueprints, and technical specifications. Enterprise-ready, instant download.",
    url: "https://drkatangablog.com/store/solutions",
    siteName: "KTBlog",
    type: "website",
    images: [
      {
        url: "https://drkatangablog.com/api/og?title=Architecture+Documents&type=default",
        width: 1200,
        height: 630,
        alt: "KTBlog Architecture Documents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Architecture Documents | KTBlog",
    description:
      "Browse premium solution design documents, architecture blueprints, and technical specifications.",
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

export default async function SolutionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch data from the backend API (server-side)
  let documents: SolutionDocument[] = [];
  let totalCount = 0;

  try {
    const response = await fetchSolutionDocuments({
      limit: 50,
      sortBy: "updatedAt",
      sortOrder: "DESC",
    });
    documents = response.items;
    totalCount = response.meta.total ?? documents.length;
  } catch (error) {
    console.error("[SolutionsPage] Failed to fetch data:", error);
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Solution Documents", url: "/store/solutions" },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0D2B6B] overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  <FileText className="h-4 w-4 text-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    SDD Marketplace
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                Enterprise-Ready{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                  Architecture Documents
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
                Professionally crafted solution designs, architecture blueprints,
                migration plans, and technical specifications. Save weeks of work
                with production-ready documentation.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {totalCount}
                  </p>
                  <p className="text-sm text-white/60">Documents</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    13
                  </p>
                  <p className="text-sm text-white/60">Domains</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    Instant
                  </p>
                  <p className="text-sm text-white/60">Download</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-neutral-50/30 to-white dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                <div className="flex items-center gap-2 px-4 py-2 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 rounded-full">
                  <FileText className="h-4 w-4 text-[#1E4DB7]" />
                  <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                    Browse Documents
                  </span>
                </div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                Explore Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]">
                  Document Library
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                Browse {totalCount} premium solution documents across 13
                technology domains. Use the filters to find exactly what you need.
              </p>
            </div>

            {/* Store Listing */}
            <div className="max-w-7xl mx-auto">
              <SolutionsListingClient
                initialDocuments={documents}
                totalCount={totalCount}
              />
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#1E4DB7] relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-8 animate-fade-in-up">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-white" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                New Documents{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                  Every Month
                </span>
              </h2>

              <p className="text-lg md:text-xl text-white/80 mb-10 animate-fade-in-up">
                Subscribe to our newsletter and be the first to know when we
                release new architecture documents and exclusive bundles.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-fade-in-up">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F59A23]/20 to-[#FBBC04]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="relative w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#F59A23]/50 focus:bg-white/15 transition-all duration-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25 flex items-center justify-center gap-2"
                >
                  Subscribe
                  <Send className="h-5 w-5" />
                </button>
              </form>

              <p className="text-sm text-white/60 mt-6 animate-fade-in-up">
                Join 5,000+ architects and engineers. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
