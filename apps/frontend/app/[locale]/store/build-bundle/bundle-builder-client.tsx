"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Check,
  Package,
  ShoppingCart,
  Share2,
} from "lucide-react";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { Link, useRouter } from "@/i18n/routing";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useCreateBundle, useCheckoutBundle } from "@/hooks/use-custom-bundle";
import {
  getBundleDiscountPercent,
  BUNDLE_TIERS,
} from "@/types/custom-bundle";
import { apiGet } from "@/lib/api-client";
import type { DigitalProduct } from "@/types/digital-product";
import { BundleSidebar } from "@/components/store/bundles/bundle-sidebar";

// =============================================================================
// Types
// =============================================================================

type Step = "select" | "review";

// =============================================================================
// Component
// =============================================================================

export default function BundleBuilderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("bundle");
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const initialIds = useMemo(() => {
    const idsParam = searchParams.get("ids");
    return idsParam ? idsParam.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [step, setStep] = useState<Step>("select");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["digital-products", "bundle-builder"],
    queryFn: () =>
      apiGet<{ items: DigitalProduct[] }>("/digital-products", {
        limit: 20,
        status: "published",
      }).then(
        (res) => (res as any)?.data?.items ?? (res as any)?.items ?? [],
      ),
    staleTime: 60 * 1000,
  });

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const createBundle = useCreateBundle();
  const checkoutBundle = useCheckoutBundle();

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------

  const selectedProducts = useMemo(
    () => products.filter((p: DigitalProduct) => selectedIds.includes(p.id)),
    [products, selectedIds],
  );

  const totalRetailPrice = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.price, 0),
    [selectedProducts],
  );

  const discount = getBundleDiscountPercent(selectedProducts.length);
  const savings = totalRetailPrice * (discount / 100);
  const bundlePrice = totalRetailPrice - savings;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p: DigitalProduct) =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const toggleProduct = useCallback((productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleReviewBundle = useCallback(() => {
    setStep("review");
  }, []);

  const handleBackToSelection = useCallback(() => {
    setStep("select");
  }, []);

  const handleCheckout = useCallback(async () => {
    if (selectedIds.length < 2) return;

    try {
      const bundle = await createBundle.mutateAsync({
        productIds: selectedIds,
      });
      const result = await checkoutBundle.mutateAsync(bundle.id);
      if (result.couponCode) {
        router.push(`/checkout?coupon=${result.couponCode}` as any);
      } else {
        router.push("/checkout" as any);
      }
    } catch (error) {
      console.error("[BundleBuilder] Checkout failed:", error);
    }
  }, [selectedIds, createBundle, checkoutBundle, router]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("ids", selectedIds.join(","));
    return url.toString();
  }, [selectedIds]);

  const isCheckingOut = createBundle.isPending || checkoutBundle.isPending;

  // ---------------------------------------------------------------------------
  // Render: Step 2 - Review & Checkout
  // ---------------------------------------------------------------------------

  if (step === "review") {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-3xl">
          {/* Back to selection */}
          <button
            onClick={handleBackToSelection}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToSelection")}
          </button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {t("reviewTitle")}
              </h1>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("reviewSubtitle", { count: selectedProducts.length })}
            </p>
          </motion.div>

          {/* Product breakdown table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-6"
          >
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="font-semibold text-neutral-900 dark:text-white">
                {t("priceBreakdown")}
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {selectedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {product.title}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 shrink-0">
                    {formatPrice(product.price)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Price summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6 space-y-3"
          >
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{t("retailPrice")}</span>
              <span className="text-neutral-400 line-through">
                {formatPrice(totalRetailPrice)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  {t("bundleDiscount")} ({discount}%)
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -{formatPrice(savings)}
                </span>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between">
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {t("bundlePrice")}
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {formatPrice(bundlePrice)}
              </span>
            </div>
            {savings > 0 && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-2 text-center">
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {t("youSave", {
                    amount: formatPrice(savings),
                    percent: discount,
                  })}
                </span>
              </div>
            )}
          </motion.div>

          {/* Checkout CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Button
              className="w-full h-12 text-base"
              disabled={isCheckingOut || selectedProducts.length < 2}
              onClick={handleCheckout}
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {t("processing")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {t("checkoutBundle")}
                </span>
              )}
            </Button>
          </motion.div>

          {/* Share Bundle */}
          {selectedIds.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {t("shareBundle")}
                </h3>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {t("shareDescription")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs bg-white dark:bg-neutral-800"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                  }}
                >
                  {t("copyLink")}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Step 1 - Select Products
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Back to Store */}
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToStore")}
        </Link>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {t("title")}
            </h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("subtitle")}
          </p>

          {/* Tier badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {BUNDLE_TIERS.map((tier) => (
              <Badge
                key={tier.minProducts}
                variant={
                  selectedProducts.length >= tier.minProducts
                    ? "default"
                    : "outline"
                }
                className="text-xs"
              >
                {tier.minProducts}+ {t("items")}: {tier.discountPercent}%{" "}
                {t("off")}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Search bar */}
        <div className="mb-6">
          <Input
            placeholder={t("searchProducts")}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="max-w-md"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Grid - Left Column */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  {t("noProducts")}
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {filteredProducts.map((product: DigitalProduct) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className={`group relative bg-white dark:bg-neutral-900 rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/20"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                          </div>
                        )}

                        {/* Overlay button */}
                        <button
                          onClick={() => toggleProduct(product.id)}
                          className={`absolute top-3 end-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-lg ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              {t("added")}
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              {t("addToBundle")}
                            </>
                          )}
                        </button>

                        {/* Selected checkmark badge */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 start-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                          >
                            <Check className="h-3.5 w-3.5 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right Column (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <BundleSidebar
                products={selectedProducts}
                onRemove={removeProduct}
                onCheckout={handleReviewBundle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
          <BundleSidebar
            products={selectedProducts}
            onRemove={removeProduct}
            onCheckout={handleReviewBundle}
            className="rounded-t-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
