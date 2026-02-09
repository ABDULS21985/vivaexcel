import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Presentation, Mail, Send } from "lucide-react";
import { PresentationsListingClient } from "@/components/presentations/presentations-listing-client";
import { fetchPresentations } from "@/lib/presentation-api";
import type { Presentation as PresentationType } from "@/types/presentation";
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
  title: "Premium Presentation Templates | KTBlog",
  description:
    "Browse premium PowerPoint templates, pitch decks, business plans, and presentation designs across every industry. Professional quality, fully editable, instant download.",
  keywords: [
    "presentation templates",
    "PowerPoint templates",
    "pitch deck templates",
    "business plan presentation",
    "Google Slides templates",
    "Keynote templates",
    "professional presentations",
    "slide templates",
    "corporate presentations",
    "digital downloads",
  ],
  openGraph: {
    title: "Premium Presentation Templates | KTBlog",
    description:
      "Browse premium PowerPoint templates, pitch decks, business plans, and presentation designs. Professional quality, fully editable.",
    url: "https://drkatangablog.com/presentations",
    siteName: "KTBlog",
    type: "website",
    images: [
      {
        url: "https://drkatangablog.com/api/og?title=Presentation+Templates&type=default",
        width: 1200,
        height: 630,
        alt: "KTBlog Presentation Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Presentation Templates | KTBlog",
    description:
      "Browse premium PowerPoint templates, pitch decks, and professional presentation designs.",
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

export default async function PresentationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch data from the backend API (server-side)
  let presentations: PresentationType[] = [];
  let totalCount = 0;

  try {
    const response = await fetchPresentations({
      limit: 50,
      sortBy: "publishedAt",
      sortOrder: "DESC",
    });
    presentations = response.items;
    totalCount = response.meta.total ?? presentations.length;
  } catch (error) {
    console.error("[PresentationsPage] Failed to fetch data:", error);
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Presentation Templates", url: "/presentations" },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#D24726] via-[#B73D20] to-[#8F2E17] overflow-hidden">
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
                  <Presentation className="h-4 w-4 text-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    Presentation Marketplace
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                Premium{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                  Presentation Templates
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
                Discover professionally designed PowerPoint, Google Slides, and
                Keynote templates for every industry. Fully editable, beautifully
                crafted, instant download.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {totalCount}
                  </p>
                  <p className="text-sm text-white/60">Templates</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    16
                  </p>
                  <p className="text-sm text-white/60">Industries</p>
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
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D24726] to-transparent" />
                <div className="flex items-center gap-2 px-4 py-2 bg-[#D24726]/5 dark:bg-[#D24726]/10 rounded-full">
                  <Presentation className="h-4 w-4 text-[#D24726]" />
                  <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                    Browse Templates
                  </span>
                </div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D24726] to-transparent" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                Explore Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#B73D20]">
                  Template Collection
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                Browse {totalCount} premium presentation templates across 16
                industries. Use the filters to find exactly what you need.
              </p>
            </div>

            {/* Store Listing */}
            <div className="max-w-7xl mx-auto">
              <PresentationsListingClient
                initialPresentations={presentations}
                totalCount={totalCount}
              />
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[#D24726] via-[#B73D20] to-[#D24726] relative overflow-hidden">
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
                New Templates{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                  Every Week
                </span>
              </h2>

              <p className="text-lg md:text-xl text-white/80 mb-10 animate-fade-in-up">
                Subscribe to our newsletter and be the first to know when we
                release new presentation templates and exclusive discounts.
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
                Join 5,000+ professionals. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
