"use client";

import { useState } from "react";
import { Check, X, Star } from "lucide-react";
import { cn } from "@ktblog/ui/components";
import { useCurrency } from "@/providers/currency-provider";
import { useFormat } from "@/hooks/use-format";
import type {
  ComparisonAttribute,
  ComparisonHighlights,
} from "@/types/comparison";
import type { DigitalProduct } from "@/types/digital-product";
import { useTranslations } from "next-intl";

interface ComparisonTableProps {
  products: DigitalProduct[];
  attributes: ComparisonAttribute[];
  highlights: ComparisonHighlights;
}

export function ComparisonTable({
  products,
  attributes,
  highlights,
}: ComparisonTableProps) {
  const t = useTranslations("comparison");
  const { formatPrice } = useFormat();
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const filteredAttributes = differencesOnly
    ? attributes.filter((attr) => {
        const uniqueValues = new Set(
          attr.values.map((v) => JSON.stringify(v)),
        );
        return uniqueValues.size > 1;
      })
    : attributes;

  const getBestIndex = (attr: ComparisonAttribute): number => {
    if (attr.type === "price") {
      // Lowest is best for price
      const numValues = attr.values.map((v) =>
        typeof v === "number" ? v : Infinity,
      );
      return numValues.indexOf(Math.min(...numValues));
    }
    if (attr.type === "rating" || attr.type === "number") {
      // Highest is best
      const numValues = attr.values.map((v) =>
        typeof v === "number" ? v : -Infinity,
      );
      return numValues.indexOf(Math.max(...numValues));
    }
    return -1;
  };

  const renderValue = (
    attr: ComparisonAttribute,
    value: string | number | boolean | null,
    isBest: boolean,
  ) => {
    if (value === null || value === undefined) {
      return (
        <span className="text-neutral-300 dark:text-neutral-600">—</span>
      );
    }

    if (attr.type === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      );
    }

    if (attr.type === "price") {
      return (
        <span
          className={cn(
            "font-semibold",
            isBest
              ? "text-green-600 dark:text-green-400"
              : "text-neutral-900 dark:text-white",
          )}
        >
          {formatPrice(Number(value))}
        </span>
      );
    }

    if (attr.type === "rating") {
      return (
        <span
          className={cn(
            "flex items-center gap-1 font-semibold",
            isBest
              ? "text-amber-600 dark:text-amber-400"
              : "text-neutral-900 dark:text-white",
          )}
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          {Number(value).toFixed(1)}
        </span>
      );
    }

    if (attr.type === "number") {
      return (
        <span
          className={cn(
            "font-medium",
            isBest
              ? "text-blue-600 dark:text-blue-400"
              : "text-neutral-900 dark:text-white",
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      );
    }

    return (
      <span className="text-neutral-700 dark:text-neutral-300">
        {String(value)}
      </span>
    );
  };

  return (
    <div>
      {/* Differences Only Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setDifferencesOnly(!differencesOnly)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            differencesOnly
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700",
          )}
        >
          {t("differencesOnly")}
        </button>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
        {filteredAttributes.map((attr, rowIdx) => {
          const bestIdx = getBestIndex(attr);

          return (
            <div
              key={attr.key}
              className={cn(
                "grid items-center gap-4 px-4 py-3",
                rowIdx % 2 === 0
                  ? "bg-white dark:bg-neutral-900"
                  : "bg-neutral-50 dark:bg-neutral-900/50",
              )}
              style={{
                gridTemplateColumns: `140px repeat(${products.length}, 1fr)`,
              }}
            >
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {attr.name}
              </div>
              {attr.values.map((value, colIdx) => (
                <div
                  key={colIdx}
                  className="flex items-center justify-center"
                >
                  {renderValue(attr, value, colIdx === bestIdx)}
                </div>
              ))}
            </div>
          );
        })}

        {filteredAttributes.length === 0 && (
          <div className="p-8 text-center text-neutral-400">
            {t("noAttributeDifferences")}
          </div>
        )}
      </div>
    </div>
  );
}
