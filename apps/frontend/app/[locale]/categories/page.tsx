import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Grid3X3,
  Package,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { fetchProductCategories, fetchProducts } from "@/lib/store-api";
import type { DigitalProductCategory } from "@/types/digital-product";
import { DIGITAL_PRODUCT_TYPE_COLORS } from "@/types/digital-product";
import { routing, Link } from "@/i18n/routing";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Product Categories | KTBlog Store",
    description:
      "Browse all product categories in the KTBlog Digital Products Store. Find PowerPoint templates, design systems, startup kits, solution templates, and more.",
    keywords: [
      "product categories",
      "digital products",
      "templates",
      "design systems",
      "startup kits",
    ],
    openGraph: {
      title: "Product Categories | KTBlog Store",
      description:
        "Browse all product categories in the KTBlog Digital Products Store.",
      url: "https://drkatangablog.com/categories",
      siteName: "KTBlog",
      type: "website",
      images: [
        {
          url: "https://drkatangablog.com/api/og?title=Product+Categories&type=default",
          width: 1200,
          height: 630,
          alt: "KTBlog Product Categories",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Product Categories | KTBlog Store",
      description:
        "Browse all product categories in the KTBlog Digital Products Store.",
    },
    alternates: {
      canonical: "https://drkatangablog.com/categories",
    },
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

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch categories and products count in parallel
  let categories: DigitalProductCategory[] = [];
  let totalProducts = 0;

  try {
    const [categoriesData, productsResponse] = await Promise.all([
      fetchProductCategories(),
      fetchProducts({ status: "published" as any, limit: 1 }),
    ]);

    categories = categoriesData.filter((c) => c.isActive !== false);
    totalProducts = productsResponse.meta.total ?? 0;
  } catch (error) {
    console.error("[CategoriesPage] Failed to fetch data:", error);
  }

  // Separate parent categories and subcategories
  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter((c) => c.parentId);

  const colors = Object.values(DIGITAL_PRODUCT_TYPE_COLORS);

  const categoryListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      url: `https://drkatangablog.com/store/category/${category.slug}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
        ])}
      />
      <JsonLd data={categoryListSchema} />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* =================================================================
            HERO SECTION
        ================================================================= */}
        <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B]" />

          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0 opacity-30 animate-gradient-shift"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, #6366F1 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, #F59A23 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />

          {/* Dot grid */}
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

          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F59A23]/15 rounded-full blur-3xl animate-float1" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float2" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  <Grid3X3 className="h-4 w-4 text-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    Product Categories
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-display text-white mb-6 animate-fade-in-up stagger-1">
                Browse by{" "}
                <span className="hero-gradient-text">Category</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lead text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
                Explore {categories.length} categories with {totalProducts}+
                premium digital products. Find the perfect templates, tools, and
                resources for your next project.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up stagger-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Layers className="h-5 w-5 text-[#F59A23]" />
                  <span className="text-sm font-medium">
                    {categories.length} Categories
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Package className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium">
                    {totalProducts}+ Products
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <ShoppingBag className="h-5 w-5 text-blue-300" />
                  <span className="text-sm font-medium">Instant Download</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            CATEGORIES GRID
        ================================================================= */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {categories.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Grid3X3 className="h-10 w-10 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  No categories yet
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                  Categories are being set up. Check back soon or browse all
                  products.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <>
                {/* Section Header */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                    <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                      All Categories
                    </span>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                    Find What You{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]">
                      Need
                    </span>
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                    Each category is packed with professionally crafted digital
                    products ready for instant download.
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {(parentCategories.length > 0
                    ? parentCategories
                    : categories
                  ).map((category, idx) => {
                    const color = colors[idx % colors.length];
                    const children = childCategories.filter(
                      (c) => c.parentId === category.id
                    );

                    return (
                      <Link
                        key={category.id}
                        href={`/store/category/${category.slug}`}
                        className="group block"
                      >
                        <div className="card-interactive relative h-full rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 hover:-translate-y-1">
                          {/* Color accent bar */}
                          <div
                            className="h-1.5 w-full"
                            style={{ backgroundColor: color }}
                          />

                          {/* Category image */}
                          {category.image ? (
                            <div className="relative h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                          ) : (
                            <div
                              className="relative h-40 flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                              }}
                            >
                              <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{
                                  backgroundColor: `${color}15`,
                                }}
                              >
                                <ShoppingBag
                                  className="h-8 w-8"
                                  style={{ color }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                              {category.name}
                            </h3>

                            {category.description && (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                                {category.description}
                              </p>
                            )}

                            {/* Subcategories */}
                            {children.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {children.slice(0, 3).map((child) => (
                                  <span
                                    key={child.id}
                                    className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                  >
                                    {child.name}
                                  </span>
                                ))}
                                {children.length > 3 && (
                                  <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                    +{children.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] dark:text-blue-400">
                              <span>Browse Products</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Subcategories Section (if parent/child structure exists) */}
                {parentCategories.length > 0 && childCategories.length > 0 && (
                  <div className="mt-16 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-px bg-[#1E4DB7]" />
                      <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                        Subcategories
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {childCategories.map((category, idx) => {
                        const color = colors[idx % colors.length];
                        const parent = parentCategories.find(
                          (p) => p.id === category.parentId
                        );
                        return (
                          <Link
                            key={category.id}
                            href={`/store/category/${category.slug}`}
                            className="group"
                          >
                            <div className="card-interactive p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                              <div
                                className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center"
                                style={{
                                  backgroundColor: `${color}15`,
                                }}
                              >
                                <ShoppingBag
                                  className="h-5 w-5"
                                  style={{ color }}
                                />
                              </div>
                              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-[#1E4DB7] transition-colors mb-1">
                                {category.name}
                              </h4>
                              {parent && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                  in {parent.name}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* =================================================================
            CTA — Browse All Products
        ================================================================= */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
                Browse our complete collection of digital products or use our
                search to find exactly what you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Browse All Products
                </Link>
                <Link
                  href="/store#store-products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#1E4DB7] dark:hover:border-blue-500 transition-all duration-300"
                >
                  Search Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
