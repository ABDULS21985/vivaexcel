"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Monitor,
  Package,
  Check,
} from "lucide-react";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface ProductDescriptionTabsProps {
  product: DigitalProduct;
}

type TabId = "overview" | "features" | "compatibility" | "included";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// =============================================================================
// Constants
// =============================================================================

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: <BookOpen className="h-4 w-4" /> },
  { id: "features", label: "Features", icon: <Sparkles className="h-4 w-4" /> },
  {
    id: "compatibility",
    label: "Compatibility",
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: "included",
    label: "What's Included",
    icon: <Package className="h-4 w-4" />,
  },
];

// =============================================================================
// Helpers
// =============================================================================

function getFeatures(product: DigitalProduct): string[] {
  const meta = product.metadata || {};
  if (Array.isArray(meta.features)) {
    return meta.features as string[];
  }
  // Try to extract features from description
  if (product.description) {
    const bulletRegex = /[•\-\*]\s*(.+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = bulletRegex.exec(product.description)) !== null) {
      matches.push(match[1].trim());
    }
    if (matches.length > 0) return matches;
  }
  return [];
}

function getCompatibility(product: DigitalProduct): string[] {
  const meta = product.metadata || {};
  if (Array.isArray(meta.compatibility)) {
    return meta.compatibility as string[];
  }
  if (typeof meta.compatibility === "string") {
    return [meta.compatibility];
  }
  // Default compatibility based on product type
  const defaultCompat: Record<string, string[]> = {
    powerpoint: [
      "Microsoft PowerPoint 2016+",
      "Google Slides",
      "Keynote (with conversion)",
    ],
    document: [
      "Microsoft Word 2016+",
      "Google Docs",
      "LibreOffice Writer",
    ],
    web_template: [
      "Modern browsers (Chrome, Firefox, Safari, Edge)",
      "Node.js 18+",
    ],
    startup_kit: [
      "Cross-platform compatible",
      "Editable source files included",
    ],
    solution_template: [
      "Microsoft Office 2016+",
      "Google Workspace",
    ],
    design_system: [
      "Figma",
      "Adobe XD",
      "Sketch (with conversion)",
    ],
    code_template: [
      "VS Code",
      "Node.js 18+",
      "Modern browsers",
    ],
  };
  return defaultCompat[product.type] || ["Cross-platform compatible"];
}

function getIncludedItems(product: DigitalProduct): string[] {
  const meta = product.metadata || {};
  if (Array.isArray(meta.includedItems)) {
    return meta.includedItems as string[];
  }
  if (Array.isArray(meta.whatsIncluded)) {
    return meta.whatsIncluded as string[];
  }
  // Build default included items
  const items: string[] = [];
  if (meta.slideCount) {
    items.push(`${meta.slideCount} professionally designed slides`);
  }
  if (meta.pageCount) {
    items.push(`${meta.pageCount} pages of content`);
  }
  if (meta.format) {
    items.push(`Source files in ${meta.format} format`);
  }
  if (meta.fileSize) {
    items.push(`Download size: ${meta.fileSize}`);
  }
  if (items.length === 0) {
    items.push("Complete source files");
    items.push("Documentation & setup guide");
    items.push("Free updates");
  }
  return items;
}

// =============================================================================
// Component
// =============================================================================

export function ProductDescriptionTabs({
  product,
}: ProductDescriptionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const features = getFeatures(product);
  const compatibility = getCompatibility(product);
  const includedItems = getIncludedItems(product);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-[#1E4DB7] dark:text-blue-400"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4DB7] dark:bg-blue-400"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-8">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {product.description ? (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:text-neutral-900 dark:prose-headings:text-white
                    prose-p:text-neutral-600 dark:prose-p:text-neutral-400
                    prose-a:text-[#1E4DB7] dark:prose-a:text-blue-400
                    prose-strong:text-neutral-900 dark:prose-strong:text-white
                    prose-li:text-neutral-600 dark:prose-li:text-neutral-400
                    prose-img:rounded-xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No detailed description available for this product.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "features" && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {features.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Feature details will be available soon.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "compatibility" && (
            <motion.div
              key="compatibility"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  This product is compatible with the following platforms
                  and software:
                </p>
                <div className="grid gap-3">
                  {compatibility.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Monitor className="h-3.5 w-3.5 text-[#1E4DB7] dark:text-blue-400" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "included" && (
            <motion.div
              key="included"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Here is everything you get when you purchase this product:
                </p>
                <div className="grid gap-3">
                  {includedItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F59A23]/10 dark:bg-[#F59A23]/20 flex items-center justify-center flex-shrink-0">
                        <Package className="h-3.5 w-3.5 text-[#F59A23]" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Guarantee Note */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[#1E4DB7]/5 to-[#F59A23]/5 dark:from-[#1E4DB7]/10 dark:to-[#F59A23]/10 rounded-2xl border border-[#1E4DB7]/10 dark:border-[#1E4DB7]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E4DB7]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#1E4DB7]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        Quality Guarantee
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        All our digital products are professionally designed
                        and tested. If you encounter any issues, our support
                        team is here to help.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProductDescriptionTabs;
