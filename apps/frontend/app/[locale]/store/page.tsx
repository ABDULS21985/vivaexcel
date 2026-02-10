import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import {
  ShoppingBag,
  Zap,
  Shield,
  Download,
  Sparkles,
  ArrowRight,
  Package,
  BarChart3,
} from "lucide-react";
import { StoreListingClient } from "@/components/store/store-listing-client";
import { StoreHeroClient } from "@/components/store/store-hero-client";
import { ProductCard } from "@/components/store/product-card";
import { SubscriberPopularSection } from "@/components/store/subscriber-popular-section";

const SocialProofStrip = dynamic(() => import("@/components/store/social-proof-strip").then(m => ({ default: m.SocialProofStrip })));
const StoreNewsletter = dynamic(() => import("@/components/store/store-newsletter").then(m => ({ default: m.StoreNewsletter })));
const PersonalizedRow = dynamic(() => import("@/components/store/recommendations/personalized-row").then(m => ({ default: m.PersonalizedRow })));
const ForYouSection = dynamic(() => import("@/components/store/recommendations/for-you-section").then(m => ({ default: m.ForYouSection })));
const SmartSearchBar = dynamic(() => import("@/components/search/smart-search-bar").then(m => ({ default: m.SmartSearchBar })));
import {
  fetchProducts,
  fetchProductCategories,
  fetchFeaturedProducts,
  fetchBestsellerProducts,
} from "@/lib/store-api";
import type {
  DigitalProduct,
  DigitalProductCategory,
} from "@/types/digital-product";
import { DIGITAL_PRODUCT_TYPE_COLORS } from "@/types/digital-product";
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

const FILTER_PARAMS = ["category", "sort", "search", "page", "type", "tag", "minPrice", "maxPrice", "rating"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const hasFilters = FILTER_PARAMS.some((param) => resolvedSearchParams[param] !== undefined);

  return {
    title: "Digital Products Store | KTBlog",
    description:
      "Browse premium digital products including PowerPoint templates, design systems, startup kits, solution templates, and more. Professional quality, instant download.",
    keywords: [
      "digital products",
      "templates",
      "PowerPoint templates",
      "design system",
      "startup kit",
      "web templates",
      "code templates",
      "solution templates",
      "digital downloads",
    ],
    openGraph: {
      title: "Digital Products Store | KTBlog",
      description:
        "Browse premium digital products including PowerPoint templates, design systems, startup kits, and more.",
      url: "https://drkatangablog.com/store",
      siteName: "KTBlog",
      type: "website",
      images: [
        {
          url: "https://drkatangablog.com/api/og?title=Digital+Products+Store&type=default",
          width: 1200,
          height: 630,
          alt: "KTBlog Digital Products Store",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Digital Products Store | KTBlog",
      description:
        "Browse premium digital products including templates, design systems, and starter kits.",
    },
    alternates: {
      canonical: "https://drkatangablog.com/store",
    },
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

// =============================================================================
// Page Component
// =============================================================================

export default async function StorePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ---------------------------------------------------------------------------
  // Fetch all data in parallel (server-side)
  // ---------------------------------------------------------------------------
  let products: DigitalProduct[] = [];
  let categories: DigitalProductCategory[] = [];
  let featuredProducts: DigitalProduct[] = [];
  let bestsellerProducts: DigitalProduct[] = [];
  let totalCount = 0;

  try {
    const [productsResponse, categoriesData, featured, bestsellers] =
      await Promise.all([
        fetchProducts({ status: "published" as any, limit: 50 }),
        fetchProductCategories(),
        fetchFeaturedProducts(8),
        fetchBestsellerProducts(8),
      ]);

    products = productsResponse.items;
    categories = categoriesData.filter((c) => c.isActive !== false);
    featuredProducts = featured;
    bestsellerProducts = bestsellers;
    totalCount = productsResponse.meta.total ?? products.length;
  } catch (error) {
    console.error("[StorePage] Failed to fetch store data:", error);
  }

  // Derive "New This Week" products (most recent by publishedAt)
  const newProducts = [...products]
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 8);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.title,
      url: `https://drkatangablog.com/store/${product.slug}`,
      ...(product.featuredImage && { image: product.featuredImage }),
    })),
  };

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Digital Products Store", url: "/store" },
        ])}
      />
      <JsonLd data={itemListSchema} />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* =================================================================
            HERO SECTION — Animated Gradient Mesh + Display Typography
        ================================================================= */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B]" />

          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0 opacity-30 animate-gradient-shift"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, #6366F1 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #F59A23 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #1E4DB7 0%, transparent 50%)",
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
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F59A23]/15 rounded-full blur-3xl animate-float1" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float2" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#6366F1]/15 rounded-full blur-3xl animate-float3" />
            <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#F59A23]/10 rounded-full blur-3xl animate-float-delay-1" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  <ShoppingBag className="h-4 w-4 text-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    Digital Products Store
                  </span>
                </div>
              </div>

              {/* Display Title */}
              <h1 className="text-display text-white mb-6 animate-fade-in-up stagger-1">
                Premium{" "}
                <span className="hero-gradient-text">
                  Digital Products
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lead text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
                Discover professionally crafted templates, design systems,
                starter kits, and tools to accelerate your projects and boost
                your productivity.
              </p>

              {/* Interactive Hero Client (Search + Counters + Category Pills) */}
              <StoreHeroClient
                totalProducts={totalCount}
                totalCategories={categories.length}
                categories={categories.map((c) => ({
                  name: c.name,
                  slug: c.slug,
                }))}
              />

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-10 animate-fade-in-up stagger-5">
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
          </div>
        </section>

        {/* =================================================================
            SOCIAL PROOF STRIP — Recent Purchases Marquee
        ================================================================= */}
        <SocialProofStrip />

        {/* =================================================================
            AI SMART SEARCH — Enhanced Search with Autocomplete
        ================================================================= */}
        <section className="py-8 md:py-12 bg-white dark:bg-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <SmartSearchBar placeholder="Search products with AI — try 'affordable Excel templates' or 'best design kits'..." />
            </div>
          </div>
        </section>

        {/* =================================================================
            PERSONALIZED RECOMMENDATIONS — AI-Powered "For You" Row
        ================================================================= */}
        <section className="bg-white dark:bg-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <PersonalizedRow />
          </div>
        </section>

        {/* =================================================================
            CATEGORY SHOWCASE — Horizontal Scroll Cards
        ================================================================= */}
        {categories.length > 0 && (
          <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-px bg-[#1E4DB7]" />
                    <span className="overline text-[#1E4DB7]">
                      Categories
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Browse by Category
                  </h2>
                </div>
                <Link
                  href="/categories"
                  className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Horizontal Scroll */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {categories.map((category, idx) => {
                  const colors = Object.values(DIGITAL_PRODUCT_TYPE_COLORS);
                  const color = colors[idx % colors.length];
                  return (
                    <Link
                      key={category.id}
                      href={`/store?category=${category.slug}`}
                      className="group flex-shrink-0 w-48 md:w-56"
                    >
                      <div
                        className="card-interactive relative h-32 md:h-36 rounded-2xl overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                        }}
                      >
                        {/* Gradient accent bar */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: color }}
                        />

                        {/* Category image */}
                        {category.image && (
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                            <img
                              src={category.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-end p-4">
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>

                        {/* Hover arrow */}
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <ArrowRight
                            className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================
            CURATED COLLECTIONS — Featured & Bestseller Products
        ================================================================= */}
        {featuredProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-px bg-[#F59A23]" />
                    <span className="overline text-[#F59A23]">
                      Staff Picks
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Featured Products
                  </h2>
                </div>
                <Link
                  href="/store"
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

        {/* Bestsellers Row */}
        {bestsellerProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-px bg-emerald-500" />
                    <span className="overline text-emerald-600 dark:text-emerald-400">
                      Most Popular
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Bestselling Products
                  </h2>
                </div>
                <Link
                  href="/store"
                  className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {bestsellerProducts.slice(0, 6).map((product, idx) => (
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

        {/* New This Week Row */}
        {newProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-px bg-[#1E4DB7]" />
                    <span className="overline text-[#1E4DB7]">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      Fresh Arrivals
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    New This Week
                  </h2>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {newProducts.slice(0, 6).map((product, idx) => (
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
            SMART SHOPPING — Bundle Builder & Compare Products
        ================================================================= */}
        <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-px bg-indigo-500" />
                  <span className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                    Smart Shopping
                  </span>
                  <div className="w-8 h-px bg-indigo-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  Save More, Shop Smarter
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bundle Builder Card */}
                <Link
                  href="/store/build-bundle"
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/30 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                        Save up to 25%
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      Build Your Bundle &amp; Save
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Select multiple products and unlock tiered discounts.
                      The more you add, the more you save!
                    </p>
                    {/* Tier preview */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { count: "2+", pct: "10%" },
                        { count: "3+", pct: "15%" },
                        { count: "4+", pct: "20%" },
                        { count: "5+", pct: "25%" },
                      ].map((tier) => (
                        <span
                          key={tier.count}
                          className="text-[11px] px-2 py-1 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                        >
                          {tier.count} items: {tier.pct} off
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all">
                      Start Building
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>

                {/* Compare Products Card */}
                <Link
                  href="/store/compare"
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                        AI-Powered
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      Compare Products
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Compare up to 4 products side by side with AI-powered
                      insights to find the perfect fit for your needs.
                    </p>
                    {/* Feature highlights */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        "Side-by-Side View",
                        "AI Insights",
                        "Feature Matrix",
                        "Best Value Pick",
                      ].map((feature) => (
                        <span
                          key={feature}
                          className="text-[11px] px-2 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:gap-3 transition-all">
                      Compare Now
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Subscriber Popular / Subscribe CTA */}
        <SubscriberPopularSection products={products} />

        {/* =================================================================
            DISCOVER PRODUCTS — AI Recommendations with Tabs
        ================================================================= */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <ForYouSection />
          </div>
        </section>

        {/* =================================================================
            MAIN STORE CONTENT — Full Product Grid with Filters
        ================================================================= */}
        <section
          id="store-products"
          className="py-16 md:py-24 bg-gradient-to-b from-white via-neutral-50/30 to-white dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                <div className="flex items-center gap-2 px-4 py-2 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 rounded-full">
                  <ShoppingBag className="h-4 w-4 text-[#1E4DB7]" />
                  <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                    Browse Products
                  </span>
                </div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                Explore Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]">
                  Product Catalog
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                Browse {totalCount} premium digital products across{" "}
                {categories.length} categories. Use the filters to find
                exactly what you need.
              </p>
            </div>

            {/* Store Listing */}
            <div className="max-w-7xl mx-auto">
              <StoreListingClient
                initialProducts={products}
                categories={categories}
              />
            </div>
          </div>
        </section>

        {/* =================================================================
            NEWSLETTER CTA — Glassmorphism
        ================================================================= */}
        <StoreNewsletter />
      </div>
    </>
  );
}
