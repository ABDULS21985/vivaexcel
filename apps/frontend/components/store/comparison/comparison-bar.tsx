"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { useComparison } from "@/providers/comparison-provider";
import { cn } from "@ktblog/ui/components";

const MAX_SLOTS = 4;

export function ComparisonBar() {
  const t = useTranslations("comparison");
  const {
    comparedIds,
    comparedProducts,
    removeFromCompare,
    clearComparison,
  } = useComparison();

  const emptySlots = MAX_SLOTS - comparedProducts.length;
  const compareUrl = `/store/compare?ids=${comparedIds.join(",")}`;
  const canCompare = comparedIds.length >= 2;

  return (
    <AnimatePresence>
      {comparedIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-50"
        >
          <div
            className={cn(
              "mx-auto max-w-3xl rounded-t-2xl shadow-2xl",
              "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl",
              "border border-b-0 border-neutral-200 dark:border-neutral-700",
              "p-4",
            )}
          >
            <div className="flex items-center gap-4">
              {/* Product slots */}
              <div className="flex flex-1 items-center gap-3 overflow-x-auto">
                {comparedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-neutral-50 px-2 py-1.5 dark:bg-neutral-800"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                    <span className="max-w-[80px] truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {product.title}
                    </span>
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600"
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {comparedIds.length}/{MAX_SLOTS}
                </span>

                <button
                  onClick={clearComparison}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("clearAll")}
                </button>

                <Link
                  href={compareUrl}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700",
                    !canCompare && "pointer-events-none opacity-50",
                  )}
                >
                  <GitCompareArrows className="h-4 w-4" />
                  {t("compareNow")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
