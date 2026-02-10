"use client";

import { Sparkles, Award, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@ktblog/ui/components";
import type { ComparisonHighlights } from "@/types/comparison";
import type { DigitalProduct } from "@/types/digital-product";
import { useTranslations } from "next-intl";

interface ComparisonInsightProps {
  products: DigitalProduct[];
  highlights: ComparisonHighlights;
  aiInsight?: string;
}

export function ComparisonInsight({
  products,
  highlights,
  aiInsight,
}: ComparisonInsightProps) {
  const t = useTranslations("comparison");

  const getProductName = (productId: string | undefined) =>
    products.find((p) => p.id === productId)?.title ?? "";

  const badges = [
    {
      id: "bestValue",
      productId: highlights.bestValue,
      icon: DollarSign,
      label: t("bestValue"),
      color: "text-green-600 bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "bestRated",
      productId: highlights.bestRated,
      icon: Award,
      label: t("bestRated"),
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "mostPopular",
      productId: highlights.mostPopular,
      icon: TrendingUp,
      label: t("mostPopular"),
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
  ].filter((b) => b.productId);

  if (!aiInsight && badges.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          {t("aiInsight")}
        </h3>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                  badge.color,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{badge.label}:</span>
                <span className="font-bold">
                  {getProductName(badge.productId)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Narrative */}
      {aiInsight && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {aiInsight}
        </p>
      )}
    </div>
  );
}
