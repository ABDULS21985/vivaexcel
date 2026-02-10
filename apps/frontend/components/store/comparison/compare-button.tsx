"use client";

import { GitCompareArrows } from "lucide-react";
import { useComparison } from "@/providers/comparison-provider";
import { cn } from "@ktblog/ui/components";
import type { DigitalProduct } from "@/types/digital-product";
import { useTranslations } from "next-intl";

interface CompareButtonProps {
  product: DigitalProduct;
  className?: string;
}

export function CompareButton({ product, className }: CompareButtonProps) {
  const t = useTranslations("comparison");
  const { addToCompare, removeFromCompare, isInComparison, canAddMore } =
    useComparison();

  const isCompared = isInComparison(product.id);
  const disabled = !isCompared && !canAddMore;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else if (canAddMore) {
      addToCompare(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={isCompared ? t("removeFromCompare") : t("addToCompare")}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        isCompared
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600",
        disabled && !isCompared && "opacity-40 cursor-not-allowed",
        className,
      )}
    >
      <GitCompareArrows className="h-3.5 w-3.5" />
    </button>
  );
}
