"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Plus, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { apiGet } from "@/lib/api-client";
import {
  useCreateBundle,
  useUpdateBundle,
  useCustomBundle,
  useSharedBundle,
} from "@/hooks/use-custom-bundle";
import { BundleSidebar } from "./bundle-sidebar";
import { BundleReview } from "./bundle-review";
import { useFormat } from "@/hooks/use-format";
import type { DigitalProduct, DigitalProductsResponse } from "@/types/digital-product";
import { useTranslations } from "next-intl";

type Step = "build" | "review";

export function BundleBuilderClient() {
  const t = useTranslations("bundle");
  const searchParams = useSearchParams();
  const { formatPrice } = useFormat();

  const shareToken = searchParams.get("share") ?? undefined;
  const initialIds = searchParams.get("ids")?.split(",").filter(Boolean);

  const [step, setStep] = useState<Step>("build");
  const [bundleId, setBundleId] = useState<string | undefined>();

  // Product grid state
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [gridLoading, setGridLoading] = useState(true);

  // Hooks
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();
  const { data: bundle, isLoading: bundleLoading } = useCustomBundle(bundleId);
  const { data: sharedBundle } = useSharedBundle(shareToken);

  // Load product grid
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiGet<DigitalProductsResponse>("/digital-products", {
          limit: 24,
          sortBy: "popular",
          status: "published",
        });
        setProducts((res as any)?.data?.items ?? (res as any)?.items ?? []);
      } catch {
        setProducts([]);
      }
      setGridLoading(false);
    }
    loadProducts();
  }, []);

  // Initialize from shared bundle or initial IDs
  useEffect(() => {
    if (sharedBundle && !bundleId) {
      // Create a new bundle from the shared one
      createBundle.mutate(
        { productIds: sharedBundle.productIds },
        {
          onSuccess: (data) => setBundleId(data.id),
        },
      );
    }
  }, [sharedBundle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialIds && initialIds.length >= 2 && !bundleId && !shareToken) {
      createBundle.mutate(
        { productIds: initialIds },
        {
          onSuccess: (data) => setBundleId(data.id),
        },
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToBundle = useCallback(
    async (productId: string) => {
      if (!bundleId) {
        // Create new bundle with this product + first grid product
        createBundle.mutate(
          { productIds: [productId] },
          {
            onSuccess: (data) => setBundleId(data.id),
          },
        );
        return;
      }
      updateBundle.mutate({
        id: bundleId,
        action: "add",
        productId,
      });
    },
    [bundleId, createBundle, updateBundle],
  );

  const handleRemoveFromBundle = useCallback(
    (productId: string) => {
      if (!bundleId) return;
      updateBundle.mutate({
        id: bundleId,
        action: "remove",
        productId,
      });
    },
    [bundleId, updateBundle],
  );

  const isInBundle = useCallback(
    (productId: string) => bundle?.productIds.includes(productId) ?? false,
    [bundle],
  );

  const bundleProducts = bundle?.products ?? [];
  const totalRetail = Number(bundle?.totalRetailPrice ?? 0);
  const bundlePrice = Number(bundle?.bundlePrice ?? 0);
  const savings = Number(bundle?.savings ?? 0);
  const discountPct = Number(bundle?.discountPercentage ?? 0);

  if (step === "review" && bundle) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
          <BundleReview
            bundleId={bundle.id}
            products={bundleProducts}
            totalRetailPrice={totalRetail}
            bundlePrice={bundlePrice}
            savings={savings}
            discountPercentage={discountPct}
            shareToken={bundle.shareToken}
            onBack={() => setStep("build")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/store">{t("store")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("buildBundle")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("buildBundle")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("buildBundleDescription")}
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex gap-6">
          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {gridLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-[260px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product, i) => {
                  const inBundle = isInBundle(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={cn(
                        "relative bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all",
                        inBundle
                          ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
                      )}
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.title}
                            width={300}
                            height={225}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1 mb-1">
                          {product.title}
                        </h3>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                          {formatPrice(product.price)}
                        </p>
                        <Button
                          size="sm"
                          variant={inBundle ? "outline" : "default"}
                          className="w-full"
                          onClick={() =>
                            inBundle
                              ? handleRemoveFromBundle(product.id)
                              : handleAddToBundle(product.id)
                          }
                        >
                          {inBundle ? (
                            <>
                              <Check className="h-3.5 w-3.5 me-1" />
                              {t("inBundle")}
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 me-1" />
                              {t("addToBundle")}
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <BundleSidebar
            products={bundleProducts}
            onRemoveProduct={handleRemoveFromBundle}
            onCheckout={() => setStep("review")}
            className="hidden lg:flex w-80 sticky top-24 self-start max-h-[calc(100vh-8rem)]"
          />
        </div>

        {/* Mobile floating bar */}
        {bundleProducts.length > 0 && (
          <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
            <BundleSidebar
              products={bundleProducts}
              onRemoveProduct={handleRemoveFromBundle}
              onCheckout={() => setStep("review")}
              className="rounded-t-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
