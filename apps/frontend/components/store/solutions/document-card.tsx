"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  Layers,
  ShoppingCart,
  Eye,
  GitBranch,
  CheckCircle,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/providers/cart-provider";
import type { SolutionDocument } from "@/types/solution-document";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  DOMAIN_LABELS,
  DOMAIN_HEX_COLORS,
  MATURITY_LEVEL_LABELS,
  MATURITY_LEVEL_COLORS,
} from "@/types/solution-document";
import {
  formatPrice,
  getDiscountPercentage,
  formatPageCount,
  getFreshnessLabel,
  getFreshnessColor,
} from "@/lib/solution-document-utils";

// =============================================================================
// Types
// =============================================================================

interface DocumentCardProps {
  document: SolutionDocument;
  index?: number;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function DocumentCard({
  document,
  index = 0,
  className = "",
}: DocumentCardProps) {
  const { addToCart, openCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const typeLabel =
    DOCUMENT_TYPE_LABELS[document.documentType] || "Document";
  const typeIcon = DOCUMENT_TYPE_ICONS[document.documentType] || "📋";
  const domainLabel = DOMAIN_LABELS[document.domain] || "General";
  const domainColor = DOMAIN_HEX_COLORS[document.domain] || "#6B7280";
  const maturityLabel = MATURITY_LEVEL_LABELS[document.maturityLevel] || "Starter";
  const maturityColor = MATURITY_LEVEL_COLORS[document.maturityLevel] || "";
  const discount = document.compareAtPrice
    ? getDiscountPercentage(document.price, document.compareAtPrice)
    : 0;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAddingToCart(true);
      try {
        await addToCart(document.id);
        openCart();
      } catch {
        // Error handled silently
      } finally {
        setIsAddingToCart(false);
      }
    },
    [addToCart, document.id, openCart],
  );

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`group ${className}`}
    >
      <Link
        href={`/store/solutions/${document.slug || document.id}`}
        className="block h-full"
      >
        <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500">
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{ backgroundColor: `${domainColor}20` }}
          />

          {/* Image Section */}
          <div className="relative h-48 md:h-52 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {document.featuredImage ? (
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={document.featuredImage}
                  alt={document.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            ) : (
              /* Document Mockup Fallback */
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">{typeIcon}</span>
                  <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {typeLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Hover overlay with Quick Preview & Add to Cart */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </span>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-70"
                >
                  {isAddingToCart ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  )}
                  Add to Cart
                </motion.button>
              </div>
            </div>

            {/* DocumentType Badge (top-left) */}
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                <span>{typeIcon}</span>
                {typeLabel}
              </span>
            </div>

            {/* Domain Tag (top-right) */}
            <div className="absolute top-3 right-3 z-10">
              <span
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white"
                style={{ backgroundColor: `${domainColor}CC` }}
              >
                {domainLabel}
              </span>
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="relative p-5 md:p-6">
            {/* Title */}
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {document.title}
            </h3>

            {/* Short Description */}
            {document.shortDescription && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                {document.shortDescription}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-3 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {formatPageCount(document.pageCount)}
              </span>
              {document.diagramCount > 0 && (
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  {document.diagramCount} diagrams
                </span>
              )}
              {document.templateFormat.length > 0 && (
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {document.templateFormat.length} formats
                </span>
              )}
            </div>

            {/* Technology Stack Badges */}
            {document.technologyStack.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {document.technologyStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-medium rounded-md"
                  >
                    {tech}
                  </span>
                ))}
                {document.technologyStack.length > 3 && (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                    +{document.technologyStack.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Compliance Badges */}
            {document.complianceFrameworks.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {document.complianceFrameworks.slice(0, 3).map((fw) => (
                  <span
                    key={fw}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold rounded"
                  >
                    <CheckCircle className="h-2.5 w-2.5" />
                    {fw.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Maturity + Freshness Row */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${maturityColor}`}
              >
                {maturityLabel}
              </span>
              <span
                className={`text-[10px] font-semibold ${getFreshnessColor(document.freshnessScore)}`}
              >
                {getFreshnessLabel(document.freshnessScore)}
              </span>
            </div>

            {/* Footer: Price */}
            <div className="flex items-end justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                  {formatPrice(document.price)}
                </span>
                {document.compareAtPrice &&
                  document.compareAtPrice > document.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(document.compareAtPrice)}
                    </span>
                  )}
              </div>

              {/* Version Badge */}
              {document.version && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  v{document.version}
                </span>
              )}
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            style={{
              background: `linear-gradient(90deg, ${domainColor} 0%, #F59A23 100%)`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default DocumentCard;
