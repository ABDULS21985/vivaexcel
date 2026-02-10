import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Presentation,
  Zap,
  Shield,
  Download,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import { PresentationsHeroClient } from "@/components/store/presentations-hero-client";
import { PresentationsListingClient } from "@/components/store/presentations-listing-client";
import { StoreNewsletter } from "@/components/store/store-newsletter";
import { ProductCard } from "@/components/store/product-card";
import {
  fetchProducts,
  fetchProductCategories,
  fetchFeaturedProducts,
} from "@/lib/store-api";
import type {
  DigitalProduct,
  DigitalProductCategory,
} from "@/types/digital-product";
import { DigitalProductType } from "@/types/digital-product";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { Link } from "@/i18n/routing";

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
  title: "Professional Presentation Templates | KTBlog Store",
  description:
    "Browse premium PowerPoint, Google Slides, and Keynote presentation templates. Stunning designs for business, education, technology, and more. Instant download.",
  keywords: [
    "presentation templates",
    "PowerPoint templates",
    "Google Slides templates",
    "Keynote templates",
    "business presentations",
    "pitch deck",
    "slide deck",
    "professional slides",
    "presentation design",
  ],
  openGraph: {
    title: "Professional Presentation Templates | KTBlog Store",
    description:
      "Browse premium presentation templates designed by professionals. Ready to present, instant download.",
    url: "https://drkatangablog.com/store/presentations",
    siteName: "KTBlog",
    type: "website",
    images: [
      {
        url: "https://drkatangablog.com/api/og?title=Presentation+Templates&type=default",
        width: 1200,
        height: 630,
        alt: "KTBlog Presentation Templates Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Presentation Templates | KTBlog Store",
    description:
      "Browse premium PowerPoint, Google Slides, and Keynote presentation templates.",
  },
};

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

// =============================================================================
// Industry Category Data
// =============================================================================

const INDUSTRY_CATEGORIES = [
  {
    name: "Technology",
    emoji: "\u{1F4BB}",
    slug: "technology",
    color: "#1E4DB7",
    description: "Tech pitches & product launches",
  },
  {
    name: "Finance",
    emoji: "\u{1F4C8}",
    slug: "finance",
    color: "#143A8F",
    description: "Financial reports & investor decks",
  },
  {
    name: "Healthcare",
    emoji: "\u{1FA7A}",
    slug: "healthcare",
    color: "#E86A1D",
    description: "Medical & wellness presentations",
  },
  {
    name: "Education",
    emoji: "\u{1F393}",
    slug: "education",
    color: "#F59A23",
    description: "Lectures, courses & training",
  },
  {
    name: "Startup",
    emoji: "\u{1F680}",
    slug: "startup",
    color: "#7C3AED",
    description: "Pitch decks & fundraising",
  },
  {
    name: "Marketing",
    emoji: "\u{1F4E3}",
    slug: "marketing",
    color: "#3B6DE0",
    description: "Campaigns & brand strategy",
  },
];

// =============================================================================
// Page Component
// =============================================================================

export default async function PresentationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ---------------------------------------------------------------------------
  // Fetch all data in parallel (server-side)
  // ---------------------------------------------------------------------------
  let products: DigitalProduct[] = [];
  let categories: DigitalProductCategory[] = [];
  let featuredProducts: DigitalProduct[] = [];
  let totalCount = 0;
  let totalDownloads = 0;
  let avgRating = 4.8;

  try {
    const [productsResponse, categoriesData, allFeatured] = await Promise.all([
      fetchProducts({
        type: DigitalProductType.POWERPOINT,
        status: "published" as any,
        limit: 50,
      }),
      fetchProductCategories(),
      fetchFeaturedProducts(12),
    ]);

    products = productsResponse.items;
    categories = categoriesData.filter((c) => c.isActive !== false);
    // Filter featured products to only presentations
    featuredProducts = allFeatured.filter(
      (p) => p.type === DigitalProductType.POWERPOINT,
    );
    totalCount = productsResponse.meta.total ?? products.length;

    // Calculate aggregate stats
    totalDownloads = products.reduce((sum, p) => sum + p.downloadCount, 0);
    const ratings = products.filter((p) => p.averageRating > 0);
    if (ratings.length > 0) {
      avgRating =
        ratings.reduce((sum, p) => sum + p.averageRating, 0) / ratings.length;
    }
  } catch (error) {
    console.error(
      "[PresentationsPage] Failed to fetch store data:",
      error,
    );
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Presentations", url: "/store/presentations" },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* =================================================================
            HERO SECTION -- Animated Slide Deck Mockup
        ================================================================= */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Gradient mesh background -- PowerPoint red to brand blue */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D24726] via-[#1E4DB7] to-[#143A8F]" />

          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0 opacity-30 animate-gradient-shift"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, #D24726 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #F59A23 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #143A8F 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />

          {/* Dot grid pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Floating decorative orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F59A23]/15 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delay-2" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#D24726]/15 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#3B6DE0]/10 rounded-full blur-3xl animate-float" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Text Content */}
                <div className="text-center lg:text-left">
                  {/* Badge */}
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                      <Presentation className="h-4 w-4 text-[#F59A23]" />
                      <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                        Presentation Templates
                      </span>
                    </div>
                  </div>

                  {/* Display Title */}
                  <h1 className="text-display text-white mb-6 animate-fade-in-up stagger-1">
                    Professional{" "}
                    <span className="hero-gradient-text">
                      Presentation Templates
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg md:text-xl text-white/75 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up stagger-2">
                    Stunning slide decks for every occasion. Designed by
                    professionals, ready to present.
                  </p>

                  {/* Interactive Hero Client (Search + Counters + Industry Pills) */}
                  <PresentationsHeroClient
                    totalTemplates={totalCount}
                    totalDownloads={totalDownloads}
                    averageRating={Math.round(avgRating * 10) / 10}
                  />

                  {/* Trust Badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 mt-10 animate-fade-in-up stagger-5">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Download className="h-4 w-4 text-blue-400" />
                      <span>Instant Download</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Premium Quality</span>
                    </div>
                  </div>
                </div>

                {/* Right: 3D Slide Deck Visualization */}
                <div className="hidden lg:flex items-center justify-center animate-fade-in-up stagger-3">
                  <div
                    className="relative w-full max-w-lg"
                    style={{ perspective: "1200px" }}
                  >
                    {/* Slide 3 (back) */}
                    <div
                      className="absolute inset-x-4 top-8 aspect-[16/10] rounded-2xl bg-gradient-to-br from-[#143A8F] to-[#1E4DB7] shadow-2xl border border-white/10 overflow-hidden"
                      style={{
                        transform:
                          "rotateY(-8deg) rotateX(4deg) translateZ(-60px)",
                        transformOrigin: "center center",
                      }}
                    >
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/20" />
                          <div className="h-3 w-24 rounded-full bg-white/20" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 rounded-full bg-white/15" />
                          <div className="h-4 w-1/2 rounded-full bg-white/10" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-12 rounded-lg bg-white/10" />
                          <div className="h-12 rounded-lg bg-white/10" />
                          <div className="h-12 rounded-lg bg-white/10" />
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 (middle) */}
                    <div
                      className="absolute inset-x-2 top-4 aspect-[16/10] rounded-2xl bg-gradient-to-br from-[#1E4DB7] to-[#3B6DE0] shadow-2xl border border-white/15 overflow-hidden"
                      style={{
                        transform:
                          "rotateY(-5deg) rotateX(2deg) translateZ(-30px)",
                        transformOrigin: "center center",
                      }}
                    >
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-20 rounded-full bg-white/25" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-6 w-4/5 rounded-full bg-white/20" />
                          <div className="h-3 w-full rounded-full bg-white/10" />
                          <div className="h-3 w-3/4 rounded-full bg-white/10" />
                        </div>
                        <div className="flex gap-3">
                          <div className="h-10 flex-1 rounded-xl bg-[#F59A23]/30" />
                          <div className="h-10 flex-1 rounded-xl bg-white/10" />
                        </div>
                      </div>
                    </div>

                    {/* Slide 1 (front) */}
                    <div
                      className="relative aspect-[16/10] rounded-2xl bg-gradient-to-br from-white to-neutral-100 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-white/30 overflow-hidden animate-float"
                      style={{
                        transform: "rotateY(-2deg) rotateX(1deg)",
                        transformOrigin: "center center",
                      }}
                    >
                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                        {/* Slide header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D24726] to-[#E86A1D] flex items-center justify-center">
                              <Presentation className="h-4 w-4 text-white" />
                            </div>
                            <div className="h-2.5 w-16 rounded-full bg-neutral-200" />
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#D24726]" />
                            <div className="w-2 h-2 rounded-full bg-neutral-200" />
                            <div className="w-2 h-2 rounded-full bg-neutral-200" />
                          </div>
                        </div>

                        {/* Slide content */}
                        <div className="space-y-3">
                          <div className="h-5 w-3/4 rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#3B6DE0] opacity-80" />
                          <div className="h-3 w-full rounded-full bg-neutral-200" />
                          <div className="h-3 w-5/6 rounded-full bg-neutral-200" />
                          <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
                        </div>

                        {/* Slide chart area */}
                        <div className="flex items-end gap-2 h-16">
                          <div className="flex-1 h-8 rounded-t-lg bg-[#1E4DB7]/20" />
                          <div className="flex-1 h-12 rounded-t-lg bg-[#1E4DB7]/40" />
                          <div className="flex-1 h-16 rounded-t-lg bg-gradient-to-t from-[#1E4DB7] to-[#3B6DE0] opacity-60" />
                          <div className="flex-1 h-10 rounded-t-lg bg-[#F59A23]/40" />
                          <div className="flex-1 h-14 rounded-t-lg bg-[#D24726]/30" />
                        </div>
                      </div>

                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Decorative shadow */}
                    <div className="absolute -bottom-4 inset-x-8 h-8 bg-black/20 rounded-full blur-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            INDUSTRY CATEGORIES SECTION -- Horizontal Scroll Cards
        ================================================================= */}
        <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-px bg-[#D24726]" />
                  <span className="text-[11px] font-bold tracking-wider text-[#D24726] uppercase">
                    Browse by Industry
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  Presentations for Every Industry
                </h2>
              </div>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              {INDUSTRY_CATEGORIES.map((industry) => (
                <Link
                  key={industry.slug}
                  href={`/store/presentations?category=${industry.slug}`}
                  className="group flex-shrink-0 w-52 md:w-60"
                >
                  <div
                    className="card-interactive relative h-36 md:h-40 rounded-2xl overflow-hidden transition-all duration-300 hover-lift"
                    style={{
                      background: `linear-gradient(135deg, ${industry.color}20 0%, ${industry.color}08 100%)`,
                    }}
                  >
                    {/* Gradient accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: industry.color }}
                    />

                    {/* Large emoji background */}
                    <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 select-none">
                      {industry.emoji}
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-5">
                      <span className="text-3xl">{industry.emoji}</span>
                      <div>
                        <h3
                          className="text-sm font-bold text-neutral-900 dark:text-white mb-1 group-hover:transition-colors"
                          style={{
                            color: undefined,
                          }}
                        >
                          <span className="group-hover:text-[var(--industry-hover)]"
                            style={{ "--industry-hover": industry.color } as React.CSSProperties}
                          >
                            {industry.name}
                          </span>
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {industry.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            FEATURED PRESENTATIONS SECTION
        ================================================================= */}
        {featuredProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-px bg-[#F59A23]" />
                    <span className="text-[11px] font-bold tracking-wider text-[#F59A23] uppercase">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      Staff Picks
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Featured Presentations
                  </h2>
                </div>
                <Link
                  href="/store/presentations"
                  className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Horizontal scroll of featured product cards */}
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {featuredProducts.slice(0, 6).map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[300px] md:w-[340px]"
                  >
                    <ProductCard product={product} index={idx} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================
            MAIN LISTING SECTION -- Full Product Grid with Filters
        ================================================================= */}
        <section
          id="presentation-products"
          className="py-16 md:py-24 bg-gradient-to-b from-white via-neutral-50/30 to-white dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950"
        >
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#1E4DB7]">
                  Template Collection
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                Browse {totalCount} premium presentation templates across
                multiple categories. Use the filters to find exactly what you
                need.
              </p>
            </div>

            {/* Presentation Listing */}
            <div className="max-w-7xl mx-auto">
              <PresentationsListingClient
                initialProducts={products}
                categories={categories}
              />
            </div>
          </div>
        </section>

        {/* =================================================================
            NEWSLETTER CTA -- Presentation themed
        ================================================================= */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D24726] via-[#1E4DB7] to-[#143A8F]" />

          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delay-2" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Presentation className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-white/80 uppercase">
                  Stay Updated
                </span>
                <Sparkles className="h-4 w-4 text-[#F59A23]" />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Notified About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                  New Templates
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto">
                Subscribe and be the first to know when we release new
                presentation templates and exclusive discounts.
              </p>

              {/* CTA Button */}
              <Link
                href="/store"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25"
              >
                Browse All Products
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Trust line */}
              <p className="text-sm text-white/40 mt-6">
                Join 5,000+ professionals. Premium quality guaranteed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
