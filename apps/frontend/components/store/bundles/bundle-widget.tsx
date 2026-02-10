"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Plus, Package, ArrowRight } from "lucide-react";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import { useCreateBundle } from "@/hooks/use-custom-bundle";
import { useRouter } from "@/i18n/routing";
import { apiGet } from "@/lib/api-client";
import { getBundleDiscountPercent } from "@/types/custom-bundle";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface BundleWidgetProps {
  productId: string;
  currentProduct: DigitalProduct;
}

interface RelatedProductsResponse {
  items: DigitalProduct[];
}

// =============================================================================
// Component
// =============================================================================

export function BundleWidget({ productId, currentProduct }: BundleWidgetProps) {
  const t = useTranslations("bundle");
  const router = useRouter();
  const { currency, convertPrice } = useCurrency();
  const { formatPrice } = useFormat();
  const createBundle = useCreateBundle();

  // ---------------------------------------------------------------------------
  // Fetch related/popular products in the same category
  // ---------------------------------------------------------------------------

  const categorySlug = currentProduct.category?.slug;

  const { data: relatedData } = useQuery({
    queryKey: ["products", "related", productId, categorySlug],
    queryFn: () =>
      apiGet<RelatedProductsResponse>("/digital-products", {
        categorySlug: categorySlug || undefined,
        limit: 6,
        sortBy: "downloadCount",
        sortOrder: "DESC",
      }).then((res) => (res as any)?.data ?? res),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Filter out the current product and take up to 3
  const suggestions = useMemo(() => {
    const items = relatedData?.items ?? (relatedData as unknown as DigitalProduct[]) ?? [];
    return items
      .filter((p: DigitalProduct) => p.id !== productId)
      .slice(0, 3);
  }, [relatedData, productId]);

  // ---------------------------------------------------------------------------
  // Selection state (current product is always included)
  // ---------------------------------------------------------------------------

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // All bundle products: current + selected suggestions
  const bundleProducts = useMemo(() => {
    const selected = suggestions.filter((p) => selectedIds.has(p.id));
    return [currentProduct, ...selected];
  }, [currentProduct, suggestions, selectedIds]);

  // ---------------------------------------------------------------------------
  // Pricing
  // ---------------------------------------------------------------------------

  const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const discountPercent = getBundleDiscountPercent(bundleProducts.length);
  const bundlePrice = totalPrice * (1 - discountPercent / 100);
  const savings = totalPrice - bundlePrice;
  const hasDiscount = discountPercent > 0;

  // ---------------------------------------------------------------------------
  // Build Bundle action
  // ---------------------------------------------------------------------------

  const handleBuildBundle = () => {
    const ids = bundleProducts.map((p) => p.id).join(",");
    router.push(`/store/build-bundle?ids=${ids}`);
  };

  // ---------------------------------------------------------------------------
  // Don't show widget if no suggestions
  // ---------------------------------------------------------------------------

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-neutral-900 dark:text-white">
          {t("buildBundle")}
        </h3>
        {hasDiscount && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[10px] ms-auto">
            {t("savePercent", { percent: discountPercent })}
          </Badge>
        )}
      </div>

      {/* Product Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Current Product (always selected) */}
        <div className="shrink-0 w-20">
          <div className="relative h-16 w-16 mx-auto rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 ring-2 ring-indigo-500">
            {currentProduct.featuredImage ? (
              <Image
                src={currentProduct.featuredImage}
                alt={currentProduct.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-6 w-6 text-neutral-400" />
              </div>
            )}
          </div>
          <p className="text-[10px] text-center text-neutral-600 dark:text-neutral-400 mt-1 truncate">
            {currentProduct.title}
          </p>
        </div>

        {/* Suggestion items with plus icons between */}
        {suggestions.map((product) => {
          const isSelected = selectedIds.has(product.id);
          return (
            <div key={product.id} className="contents">
              {/* Plus icon */}
              <Plus className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />

              {/* Product card */}
              <button
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  "shrink-0 w-20 text-center rounded-xl p-1 transition-all duration-200",
                  isSelected
                    ? "bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500"
                    : "hover:bg-white/60 dark:hover:bg-neutral-800/40 ring-2 ring-transparent",
                )}
              >
                <div className="relative h-16 w-16 mx-auto rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-neutral-400" />
                    </div>
                  )}

                  {/* Checkbox overlay */}
                  <div
                    className={cn(
                      "absolute top-1 end-1 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-neutral-300 dark:border-neutral-500 bg-white/80 dark:bg-neutral-800/80",
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="h-2.5 w-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                  {product.title}
                </p>
                <p className="text-[10px] font-medium text-neutral-900 dark:text-neutral-200">
                  {formatPrice(convertPrice(product.price), currency)}
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Pricing Footer */}
      <div className="mt-3 pt-3 border-t border-indigo-200/50 dark:border-indigo-800/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("bundlePrice")}:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {formatPrice(convertPrice(bundlePrice), currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(convertPrice(totalPrice), currency)}
                </span>
              )}
            </div>
          </div>

          {hasDiscount && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs">
              {t("youSave", {
                amount: formatPrice(convertPrice(savings), currency),
              })}
            </Badge>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleBuildBundle}
          disabled={bundleProducts.length < 2 || createBundle.isPending}
        >
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t("buildBundle")}
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </motion.div>
  );
}

export default BundleWidget;
