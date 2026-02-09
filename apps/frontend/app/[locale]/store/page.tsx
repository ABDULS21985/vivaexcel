import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ShoppingBag, Mail, Send } from "lucide-react";
import { StoreListingClient } from "@/components/store/store-listing-client";
import { fetchProducts, fetchProductCategories } from "@/lib/store-api";
import type { DigitalProduct, DigitalProductCategory } from "@/types/digital-product";
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

export default async function StorePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // -------------------------------------------------------------------------
  // Fetch data from the backend API (server-side)
  // -------------------------------------------------------------------------
  let products: DigitalProduct[] = [];
  let categories: DigitalProductCategory[] = [];
  let totalCount = 0;

  try {
    const [productsResponse, categoriesData] = await Promise.all([
      fetchProducts({ status: "published" as any, limit: 50 }),
      fetchProductCategories(),
    ]);

    products = productsResponse.items;
    categories = categoriesData.filter((c) => c.isActive !== false);
    totalCount = productsResponse.meta.total ?? products.length;
  } catch (error) {
    console.error("[StorePage] Failed to fetch store data:", error);
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Digital Products Store", url: "/store" },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
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
                  <ShoppingBag className="h-4 w-4 text-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    Digital Products Store
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                Premium{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                  Digital Products
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
                Discover professionally crafted templates, design systems,
                starter kits, and tools to accelerate your projects and boost
                your productivity.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {totalCount}
                  </p>
                  <p className="text-sm text-white/60">Products</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {categories.length}
                  </p>
                  <p className="text-sm text-white/60">Categories</p>
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

        {/* Main Store Content */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-neutral-50/30 to-white dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950">
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

        {/* Newsletter Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#1E4DB7] relative overflow-hidden">
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
                Get Notified About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                  New Products
                </span>
              </h2>

              <p className="text-lg md:text-xl text-white/80 mb-10 animate-fade-in-up">
                Subscribe to our newsletter and be the first to know when we
                release new digital products, templates, and exclusive
                discounts.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-fade-in-up">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F59A23]/20 to-[#E86A1D]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
