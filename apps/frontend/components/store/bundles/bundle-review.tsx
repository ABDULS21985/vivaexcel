"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingCart,
  Share2,
  Loader2,
  Check,
  Package,
} from "lucide-react";
import { cn, Button } from "@ktblog/ui/components";
import { useFormat } from "@/hooks/use-format";
import { useCheckoutBundle } from "@/hooks/use-custom-bundle";
import { useAuth } from "@/providers/auth-provider";
import { useRouter, Link } from "@/i18n/routing";
import type { DigitalProduct } from "@/types/digital-product";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface BundleReviewProps {
  bundleId: string;
  products: DigitalProduct[];
  totalRetailPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  shareToken?: string;
  onBack: () => void;
}

export function BundleReview({
  bundleId,
  products,
  totalRetailPrice,
  bundlePrice,
  savings,
  discountPercentage,
  shareToken,
  onBack,
}: BundleReviewProps) {
  const t = useTranslations("bundle");
  const { formatPrice } = useFormat();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const checkoutMutation = useCheckoutBundle();
  const [checkoutResult, setCheckoutResult] = useState<{
    couponCode: string;
  } | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/store/build-bundle`);
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync(bundleId);
      setCheckoutResult({ couponCode: result.couponCode });
      toast.success(t("checkoutSuccess"));
    } catch {
      toast.error(t("checkoutError"));
    }
  };

  const handleShare = async () => {
    const url = shareToken
      ? `${window.location.origin}/store/build-bundle?share=${shareToken}`
      : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("shareBundle"), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("linkCopied"));
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToBuilder")}
      </button>

      {/* Bundle Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5" />
            <h2 className="text-xl font-bold">{t("bundleSummary")}</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            {t("productsCount", { count: products.length })} &middot;{" "}
            {t("savingsPercent", { percent: discountPercentage })}
          </p>
        </div>

        {/* Products */}
        <div className="p-6 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {product.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {product.category?.name ?? product.type}
                </p>
              </div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="px-6 pb-6 space-y-2">
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{t("retailPrice")}</span>
              <span className="text-neutral-400 line-through">
                {formatPrice(totalRetailPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">
                {t("discount")} ({discountPercentage}%)
              </span>
              <span className="text-green-600 font-medium">
                -{formatPrice(savings)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-900 dark:text-white">
                {t("total")}
              </span>
              <span className="text-neutral-900 dark:text-white">
                {formatPrice(bundlePrice)}
              </span>
            </div>
          </div>

          {/* Savings Callout */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <p className="text-green-700 dark:text-green-300 font-bold text-lg">
              {t("youSave", { amount: formatPrice(savings) })}
            </p>
          </div>

          {/* Checkout result */}
          {checkoutResult && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {t("bundleAddedToCart")}
                </p>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                {t("couponCodeMsg")}:{" "}
                <code className="font-mono font-bold">
                  {checkoutResult.couponCode}
                </code>
              </p>
              <Button asChild className="w-full">
                <Link href="/checkout">{t("proceedToCheckout")}</Link>
              </Button>
            </div>
          )}

          {/* Actions */}
          {!checkoutResult && (
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin me-1.5" />
                ) : (
                  <ShoppingCart className="h-4 w-4 me-1.5" />
                )}
                {t("checkoutBundle")}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
