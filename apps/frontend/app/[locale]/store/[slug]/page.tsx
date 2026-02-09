import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "@/lib/store-api";
import type { DigitalProduct } from "@/types/digital-product";
import { DIGITAL_PRODUCT_TYPE_LABELS } from "@/types/digital-product";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductInfo } from "@/components/store/product-info";
import { ProductDescriptionTabs } from "./product-description-tabs";
import { RelatedProducts } from "@/components/store/related-products";
import { FloatingElements } from "@/components/store/floating-elements";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function generateDefaultFAQs(product: DigitalProduct) {
  const faqs = [
    {
      question: `What do I get when I purchase ${product.title}?`,
      answer:
        "You'll receive instant access to download all included files immediately after purchase.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      question: "Do I get free updates?",
      answer:
        "Yes, all future updates to this product are included free of charge with your purchase.",
    },
  ];

  // Add type-specific FAQs
  if (product.type === "powerpoint") {
    faqs.push({
      question: "Can I edit the slides?",
      answer:
        "Absolutely! All slides are fully editable in Microsoft PowerPoint 2016 or later, Google Slides, and Keynote.",
    });
  } else if (
    product.type === "web_template" ||
    product.type === "code_template"
  ) {
    faqs.push({
      question: "Is the template responsive?",
      answer:
        "Yes, the template is fully responsive and works on all modern browsers and devices.",
    });
  } else if (product.type === "document") {
    faqs.push({
      question: "Can I customize the content?",
      answer:
        "Yes, all documents are fully editable in Microsoft Word, Google Docs, or compatible editors.",
    });
  }

  return faqs;
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
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | KTBlog",
    };
  }

  const productUrl = `https://drkatangablog.com/store/${slug}`;
  const typeLabel = DIGITAL_PRODUCT_TYPE_LABELS[product.type] || "Product";

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: product.title,
    author: product.creator?.name ?? "KTBlog",
    category: product.category?.name ?? typeLabel,
    price:
      product.price > 0
        ? formatPrice(product.price, product.currency)
        : "Free",
    rating:
      product.averageRating > 0 ? product.averageRating.toFixed(1) : "",
    date: product.publishedAt
      ? new Date(product.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    type: "product",
  }).toString()}`;

  return {
    title: `${product.seoTitle || product.title} | KTBlog Store`,
    description:
      product.seoDescription ||
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      "",
    keywords: [
      ...(product.seoKeywords ?? []),
      ...(product.category?.name ? [product.category.name.toLowerCase()] : []),
      ...(product.tags?.map((tag) => tag.name.toLowerCase()) ?? []),
      "digital product",
      typeLabel.toLowerCase(),
      "ktblog",
    ],
    openGraph: {
      title: product.title,
      description:
        product.seoDescription ||
        product.shortDescription ||
        product.description?.slice(0, 160) ||
        "",
      url: productUrl,
      images: [
        {
          url: product.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
          type: "image/png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description:
        product.seoDescription ||
        product.shortDescription ||
        product.description?.slice(0, 160) ||
        "",
      images: [
        {
          url: product.featuredImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

// =============================================================================
// Structured Data
// =============================================================================

function generateProductSchema(product: DigitalProduct) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
  const productUrl = `${BASE_URL}/store/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description: product.shortDescription || product.description,
    image: product.featuredImage || undefined,
    url: productUrl,
    sku: product.id,
    brand: {
      "@type": "Organization",
      name: "KTBlog",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "USD",
      availability: "https://schema.org/InStock",
      url: productUrl,
      ...(product.compareAtPrice && product.compareAtPrice > product.price
        ? {
            priceValidUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0],
          }
        : {}),
    },
    ...(product.averageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.totalReviews || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    category: product.category?.name || undefined,
    ...(product.creator
      ? {
          author: {
            "@type": "Person",
            name: product.creator.name,
          },
        }
      : {}),
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product, 4);

  const typeLabel = DIGITAL_PRODUCT_TYPE_LABELS[product.type] || "Product";

  // Generate default FAQs based on product type
  const faqs = generateDefaultFAQs(product);

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  url: `/store/category/${product.category.slug}`,
                },
              ]
            : []),
          { name: product.title, url: `/store/${product.slug}` },
        ])}
      />
      <JsonLd data={generateProductSchema(product)} />
      <JsonLd data={generateFAQSchema(faqs)} />

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
                href="/store"
                className="hover:text-[#1E4DB7] transition-colors whitespace-nowrap"
              >
                Store
              </Link>
              {product.category && (
                <>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  <Link
                    href={`/store/category/${product.category.slug}`}
                    className="hover:text-[#1E4DB7] transition-colors whitespace-nowrap"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {product.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Main Product Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Gallery - scrolls normally (no sticky) */}
                <div>
                  <ProductGallery product={product} />
                </div>

                {/* Product Info - component handles sticky internally */}
                <div>
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description Tabs */}
        <section className="py-12 md:py-16 border-t border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <ProductDescriptionTabs product={product} />
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-neutral-100 dark:border-neutral-800">
            <RelatedProducts products={relatedProducts} />
          </section>
        )}

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
                Not sure if this product is right for you? Our team is ready
                to help you find the perfect solution for your needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1E4DB7]/25"
                >
                  Contact Us
                </Link>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl transition-all duration-300"
                >
                  Browse More Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Elements (client component) */}
      <FloatingElements
        product={{
          title: product.title,
          price: product.price,
          currency: product.currency,
          featuredImage: product.featuredImage,
          id: product.id,
        }}
      />
    </>
  );
}
