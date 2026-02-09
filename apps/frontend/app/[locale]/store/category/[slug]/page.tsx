import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  ShoppingBag,
} from "lucide-react";
import {
  fetchProducts,
  fetchProductCategories,
  fetchProductCategoryBySlug,
} from "@/lib/store-api";
import type {
  DigitalProduct,
  DigitalProductCategory,
} from "@/types/digital-product";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { StoreListingClient } from "@/components/store/store-listing-client";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchProductCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | KTBlog Store" };
  }

  const title = category.metaTitle || `${category.name} Products`;
  const description =
    category.metaDescription ||
    category.description ||
    `Browse ${category.name} digital products on KTBlog Store.`;

  return {
    title: `${title} | KTBlog Store`,
    description,
    openGraph: {
      title: `${title} | KTBlog Store`,
      description,
      url: `https://drkatangablog.com/store/category/${slug}`,
      type: "website",
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KTBlog Store`,
      description,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function StoreCategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [allCategories, productsResponse, category] = await Promise.all([
    fetchProductCategories(),
    fetchProducts({
      categorySlug: slug,
      status: "published" as any,
      limit: 50,
    }),
    fetchProductCategoryBySlug(slug),
  ]);

  if (!category) {
    notFound();
  }

  const products = productsResponse.items;
  const activeCategories = allCategories.filter((c) => c.isActive !== false);

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: category.name, url: `/store/category/${slug}` },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#1E4DB7]/5 via-white to-[#F59A23]/5 dark:from-[#1E4DB7]/10 dark:via-neutral-950 dark:to-[#F59A23]/5">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1E4DB7]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59A23]/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8">
              <Link
                href="/"
                className="hover:text-[#1E4DB7] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                href="/store"
                className="hover:text-[#1E4DB7] transition-colors"
              >
                Store
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-neutral-900 dark:text-white">
                {category.name}
              </span>
            </nav>

            {/* Back Link */}
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-[#1E4DB7] mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">
                Back to all products
              </span>
            </Link>

            <div className="max-w-3xl">
              {/* Category Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-[#1E4DB7]" />
                </div>
                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider text-white bg-[#1E4DB7]">
                  {category.name}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                {category.name}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]">
                  Products
                </span>
              </h1>

              {/* Description */}
              {category.description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {category.description}
                </p>
              )}

              {/* Product Count */}
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-900 dark:text-white">
                  {products.length}
                </span>{" "}
                {products.length === 1 ? "product" : "products"} in this
                category
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <FolderOpen className="h-10 w-10 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  No products yet
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                  We are working on new products for this category. Check
                  back soon or explore other categories.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                <StoreListingClient
                  initialProducts={products}
                  categories={activeCategories}
                  initialCategorySlug={slug}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
