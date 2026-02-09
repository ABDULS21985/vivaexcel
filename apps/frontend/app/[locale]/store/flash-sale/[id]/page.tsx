"use client";

import { use, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import {
  FlashSaleCountdown,
  ProductPricingDisplay,
  PromotionBadge,
} from "@/components/store/promotions";
import { useFlashSale } from "@/hooks/use-promotions";
import type { FlashSaleProduct } from "@/hooks/use-promotions";

// =============================================================================
// Flash Sale Landing Page
// =============================================================================
// Displays a single flash sale with countdown, description, and product grid.

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function FlashSaleSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="w-48 h-5 bg-white/20 rounded mb-8" />
          <Skeleton className="w-full max-w-lg h-12 bg-white/20 rounded-lg mb-4" />
          <Skeleton className="w-full max-w-md h-6 bg-white/20 rounded mb-8" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-[60px] h-[70px] bg-white/20 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[320px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Expired / Not Found State
// -----------------------------------------------------------------------------

function FlashSaleExpiredOrNotFound({
  isExpired = false,
}: {
  isExpired?: boolean;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
        {isExpired ? "Flash Sale Has Ended" : "Flash Sale Not Found"}
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm">
        {isExpired
          ? "This flash sale has expired. Check out our other deals for great savings."
          : "The flash sale you are looking for does not exist or may have been removed."}
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/store/deals">View All Deals</Link>
        </Button>
        <Button asChild>
          <Link href="/store">Browse Store</Link>
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Product Card (for sale products)
// -----------------------------------------------------------------------------

interface SaleProductCardProps {
  product: FlashSaleProduct;
  saleId: string;
  index: number;
}

function SaleProductCard({ product, saleId, index }: SaleProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
    >
      {/* Promotion badge */}
      <PromotionBadge
        type="flash-sale"
        value={product.discountPercent}
      />

      {/* Product image */}
      <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <Link
          href={`/store/${product.slug}`}
          className="block mb-2"
        >
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <ProductPricingDisplay
          pricing={{
            originalPrice: product.originalPrice,
            salePrice: product.salePrice,
            discountPercent: product.discountPercent,
            currency: product.currency,
            promotionType: "flash-sale",
          }}
          size="sm"
        />
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------

export default function FlashSalePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [hasExpired, setHasExpired] = useState(false);

  const { data: sale, isLoading, isError } = useFlashSale(id);

  const handleExpired = useCallback(() => {
    setHasExpired(true);
  }, []);

  // Loading
  if (isLoading) {
    return <FlashSaleSkeleton />;
  }

  // Not found
  if (isError || !sale) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <FlashSaleExpiredOrNotFound />
      </div>
    );
  }

  // Check if sale is expired
  const isExpired =
    hasExpired || new Date(sale.endsAt).getTime() < Date.now();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <FlashSaleExpiredOrNotFound isExpired />
      </div>
    );
  }

  const products = sale.products ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section with Countdown */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: sale.bannerColor
            ? `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}cc)`
            : "linear-gradient(135deg, #dc2626, #ea580c)",
        }}
      >
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 max-w-6xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/60 hover:text-white">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/store"
                    className="text-white/60 hover:text-white"
                  >
                    Store
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/store/deals"
                    className="text-white/60 hover:text-white"
                  >
                    Deals
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  {sale.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back link */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </button>

          {/* Flash sale badge */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" />
            </motion.div>
            <span className="text-sm font-bold uppercase tracking-wider text-white/90">
              Flash Sale
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white">
              {sale.discountPercent}% OFF
            </span>
          </div>

          {/* Sale name */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            {sale.name}
          </h1>

          {/* Sale description */}
          {sale.description && (
            <p className="text-lg text-white/70 max-w-2xl mb-8">
              {sale.description}
            </p>
          )}

          {/* Master Countdown Timer - Large */}
          <div className="inline-block">
            <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              Sale ends in
            </p>
            <FlashSaleCountdown
              endsAt={sale.endsAt}
              size="lg"
              onExpired={handleExpired}
            />
          </div>

          {/* Product count */}
          {products.length > 0 && (
            <p className="mt-6 text-white/60 text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""} on
              sale
            </p>
          )}
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Products On Sale
            </h2>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {products.length} item{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Products loading...
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Sale products will be listed here shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <SaleProductCard
                  key={product.id}
                  product={product}
                  saleId={sale.id}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 border-t border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>
                Sale ends{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(sale.endsAt))}
              </span>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/store/deals">All Deals</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/store">Browse Store</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
