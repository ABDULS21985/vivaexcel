"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import {
  ShoppingCart,
  Zap,
  Check,
  FileText,
  GitBranch,
  Layers,
  Tag,
  CheckCircle,
  FileEdit,
  ListChecks,
  Calculator,
  Download,
} from "lucide-react";
import type { SolutionDocument } from "@/types/solution-document";
import {
  DOCUMENT_TYPE_LABELS,
  DOMAIN_LABELS,
  DOMAIN_HEX_COLORS,
  MATURITY_LEVEL_LABELS,
  MATURITY_LEVEL_COLORS,
  TEMPLATE_FORMAT_LABELS,
  DIAGRAM_TOOL_LABELS,
} from "@/types/solution-document";
import {
  formatPrice,
  getDiscountPercentage,
  formatPageCount,
  formatWordCount,
  calculateReadingTime,
} from "@/lib/solution-document-utils";
import { FreshnessIndicator } from "./freshness-indicator";
import { ComplianceBadges } from "./compliance-badges";
import { TechStackBadges } from "./tech-stack-badges";

// =============================================================================
// Types
// =============================================================================

interface SolutionInfoProps {
  document: SolutionDocument;
}

// =============================================================================
// Component
// =============================================================================

export function SolutionInfo({ document }: SolutionInfoProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(document.id);
      setShowAddedFeedback(true);
      openCart();
      setTimeout(() => setShowAddedFeedback(false), 2000);
    } catch {
      // Error handled silently
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, document.id, openCart]);

  const handleBuyNow = useCallback(async () => {
    setIsBuyingNow(true);
    try {
      await addToCart(document.id);
      router.push("/checkout");
    } catch {
      // Error handled silently
    } finally {
      setIsBuyingNow(false);
    }
  }, [addToCart, document.id, router]);

  const typeLabel =
    DOCUMENT_TYPE_LABELS[document.documentType] || "Document";
  const domainLabel = DOMAIN_LABELS[document.domain] || "General";
  const domainColor = DOMAIN_HEX_COLORS[document.domain] || "#6B7280";
  const maturityLabel =
    MATURITY_LEVEL_LABELS[document.maturityLevel] || "Starter";
  const maturityColor = MATURITY_LEVEL_COLORS[document.maturityLevel] || "";
  const discount = document.compareAtPrice
    ? getDiscountPercentage(document.price, document.compareAtPrice)
    : 0;

  return (
    <div className="space-y-6">
      {/* Type + Domain Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg"
          style={{ backgroundColor: domainColor }}
        >
          <Tag className="h-3 w-3" />
          {typeLabel}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg"
          style={{
            backgroundColor: `${domainColor}15`,
            color: domainColor,
          }}
        >
          {domainLabel}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg ${maturityColor}`}
        >
          {maturityLabel}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
        {document.title}
      </h1>

      {/* Version + Freshness */}
      <div className="flex items-center gap-4 flex-wrap">
        {document.version && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Version {document.version}
          </span>
        )}
        <FreshnessIndicator
          score={document.freshnessScore}
          lastUpdated={document.lastUpdated}
          variant="bar"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            {formatPrice(document.price)}
          </span>
          {document.compareAtPrice &&
            document.compareAtPrice > document.price && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(document.compareAtPrice)}
              </span>
            )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg">
              Save {discount}%
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          whileHover={{ scale: isAddingToCart ? 1 : 1.02 }}
          whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
          className="relative flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isAddingToCart ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </motion.span>
            ) : showAddedFeedback ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          whileHover={{ scale: isBuyingNow ? 1 : 1.02 }}
          whileTap={{ scale: isBuyingNow ? 1 : 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#F59A23]/25 hover:shadow-xl hover:shadow-[#F59A23]/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isBuyingNow ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Buy Now
            </>
          )}
        </motion.button>
      </div>

      {/* Document Details Grid */}
      <div className="space-y-3">
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Document Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="text-[#1E4DB7] dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Pages
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {document.pageCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="text-[#1E4DB7] dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Words
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {formatWordCount(document.wordCount)}
                </p>
              </div>
            </div>

            {document.diagramCount > 0 && (
              <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="text-[#1E4DB7] dark:text-blue-400">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Diagrams
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {document.diagramCount}
                    {document.hasEditableDiagrams && (
                      <span className="text-[10px] text-green-600 dark:text-green-400 ml-1">
                        (editable)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="text-[#1E4DB7] dark:text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Formats
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {document.templateFormat
                    .map(
                      (f) => TEMPLATE_FORMAT_LABELS[f] || f.toUpperCase(),
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Reading Time */}
          {document.wordCount > 0 && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Estimated reading time:{" "}
              <span className="font-medium">
                {calculateReadingTime(document.wordCount)} min
              </span>
            </p>
          )}
        </div>
      </div>

      {/* What's Included */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          What&apos;s Included
        </h3>
        <div className="space-y-2">
          <IncludesItem
            icon={<Download className="h-4 w-4" />}
            label="Full Document"
            included={true}
          />
          <IncludesItem
            icon={<FileEdit className="h-4 w-4" />}
            label="Editable Templates"
            included={document.includes.editableTemplates}
          />
          <IncludesItem
            icon={<GitBranch className="h-4 w-4" />}
            label="Diagram Source Files"
            included={document.includes.diagramFiles}
          />
          <IncludesItem
            icon={<ListChecks className="h-4 w-4" />}
            label="Implementation Checklist"
            included={document.includes.implementationChecklist}
          />
          <IncludesItem
            icon={<Calculator className="h-4 w-4" />}
            label="Cost Estimator"
            included={document.includes.costEstimator}
          />
        </div>
      </div>

      {/* Diagram Tool */}
      {document.diagramTool && document.diagramTool !== "none" && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Diagram Tool
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {DIAGRAM_TOOL_LABELS[document.diagramTool] || document.diagramTool}
          </p>
        </div>
      )}

      {/* Cloud Platform */}
      {document.cloudPlatform && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Cloud Platform
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {document.cloudPlatform}
          </p>
        </div>
      )}

      {/* Technology Stack */}
      {document.technologyStack.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <TechStackBadges technologies={document.technologyStack} />
        </div>
      )}

      {/* Compliance */}
      {document.complianceFrameworks.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <ComplianceBadges frameworks={document.complianceFrameworks} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helper Sub-Component
// =============================================================================

function IncludesItem({
  icon,
  label,
  included,
}: {
  icon: React.ReactNode;
  label: string;
  included: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
        included
          ? "bg-green-50 dark:bg-green-900/10"
          : "bg-neutral-50 dark:bg-neutral-800/30 opacity-50"
      }`}
    >
      <div
        className={
          included
            ? "text-green-600 dark:text-green-400"
            : "text-neutral-400 dark:text-neutral-600"
        }
      >
        {icon}
      </div>
      <span
        className={`text-sm ${
          included
            ? "text-green-700 dark:text-green-300 font-medium"
            : "text-neutral-500 dark:text-neutral-500 line-through"
        }`}
      >
        {label}
      </span>
      {included && (
        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 ml-auto" />
      )}
    </div>
  );
}

export default SolutionInfo;
