import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import {
  fetchDocumentsByDomain,
  fetchSolutionDocuments,
} from "@/lib/solution-document-api";
import {
  Domain,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_HEX_COLORS,
} from "@/types/solution-document";
import type { SolutionDocument } from "@/types/solution-document";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { DomainPageClient } from "./domain-page-client";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

const ALL_DOMAINS = Object.values(Domain);

function findDomainBySlug(slug: string): Domain | undefined {
  return ALL_DOMAINS.find((d) => d === slug);
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
  const domain = findDomainBySlug(slug);

  if (!domain) {
    return { title: "Domain Not Found | KTBlog" };
  }

  const label = DOMAIN_LABELS[domain];
  const domainUrl = `https://drkatangablog.com/store/solutions/domain/${slug}`;

  return {
    title: `${label} Solution Documents | KTBlog`,
    description: `Browse premium ${label.toLowerCase()} architecture documents, solution designs, and technical specifications. Enterprise-ready, professionally crafted.`,
    keywords: [
      `${label.toLowerCase()} architecture`,
      `${label.toLowerCase()} solution design`,
      `${label.toLowerCase()} documentation`,
      "architecture documents",
      "technical specifications",
      "ktblog",
    ],
    openGraph: {
      title: `${label} Solution Documents | KTBlog`,
      description: `Browse premium ${label.toLowerCase()} architecture documents. Enterprise-ready, professionally crafted.`,
      url: domainUrl,
      siteName: "KTBlog",
      type: "website",
      images: [
        {
          url: `https://drkatangablog.com/api/og?title=${encodeURIComponent(label + " Documents")}&type=default`,
          width: 1200,
          height: 630,
          alt: `${label} Solution Documents`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} Solution Documents | KTBlog`,
      description: `Browse premium ${label.toLowerCase()} architecture documents.`,
    },
    alternates: {
      canonical: domainUrl,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function DomainSolutionsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const domain = findDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const label = DOMAIN_LABELS[domain];
  const icon = DOMAIN_ICONS[domain];
  const color = DOMAIN_HEX_COLORS[domain];

  // Fetch documents for this domain
  let documents: SolutionDocument[] = [];
  let featuredDocuments: SolutionDocument[] = [];

  try {
    const [allResult, featuredResult] = await Promise.all([
      fetchDocumentsByDomain(domain, 24),
      fetchSolutionDocuments({
        domain,
        limit: 4,
        sortBy: "freshnessScore",
        sortOrder: "DESC",
      }),
    ]);
    documents = allResult;
    featuredDocuments = featuredResult.items;
  } catch (error) {
    console.error("[DomainSolutionsPage] Failed to fetch:", error);
  }

  // Related domains (exclude current)
  const relatedDomains = ALL_DOMAINS.filter((d) => d !== domain).slice(0, 6);

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Solutions", url: "/store/solutions" },
          { name: label, url: `/store/solutions/domain/${slug}` },
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
                {label}
              </span>
            </nav>
          </div>
        </section>

        {/* Domain Hero */}
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
                <span className="text-white/80">Solution Documents</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Professionally crafted architecture documents and solution designs
                for {label.toLowerCase()}. Enterprise-ready, instantly downloadable.
              </p>

              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {documents.length}
                  </p>
                  <p className="text-sm text-white/60">Documents</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {featuredDocuments.length}
                  </p>
                  <p className="text-sm text-white/60">Featured</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client-side interactive content */}
        <DomainPageClient
          domain={domain}
          label={label}
          color={color}
          documents={documents}
          featuredDocuments={featuredDocuments}
          relatedDomains={relatedDomains}
        />
      </div>
    </>
  );
}
