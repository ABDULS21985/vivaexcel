"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import type { Presentation, Industry } from "@/types/presentation";
import { INDUSTRY_LABELS, INDUSTRY_ICONS, INDUSTRY_COLORS } from "@/types/presentation";
import { PresentationCard } from "@/components/presentations/presentation-card";

// =============================================================================
// Types
// =============================================================================

interface IndustryPageClientProps {
  industry: Industry;
  label: string;
  color: string;
  presentations: Presentation[];
  featuredPresentations: Presentation[];
  relatedIndustries: Industry[];
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function IndustryPageClient({
  industry,
  label,
  color,
  presentations,
  featuredPresentations,
  relatedIndustries,
}: IndustryPageClientProps) {
  return (
    <>
      {/* Featured Presentations */}
      {featuredPresentations.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Featured {label} Templates
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    Our top picks for {label.toLowerCase()} professionals
                  </p>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featuredPresentations.map((presentation, index) => (
                  <PresentationCard
                    key={presentation.id}
                    presentation={presentation}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* All Presentations */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Main Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    All {label} Templates
                  </h2>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {presentations.length}{" "}
                    {presentations.length === 1 ? "template" : "templates"}
                  </span>
                </div>

                {presentations.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {presentations.map((presentation, index) => (
                      <PresentationCard
                        key={presentation.id}
                        presentation={presentation}
                        index={index}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <span className="text-4xl">
                        {INDUSTRY_ICONS[industry]}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                      No templates yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                      We are working on adding {label.toLowerCase()}{" "}
                      presentation templates. Check back soon!
                    </p>
                    <Link
                      href="/presentations"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      Browse All Templates
                    </Link>
                  </div>
                )}
              </div>

              {/* Related Industries Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                    Related Industries
                  </h3>
                  <div className="space-y-1.5">
                    {relatedIndustries.map((relIndustry) => {
                      const relLabel = INDUSTRY_LABELS[relIndustry];
                      const relIcon = INDUSTRY_ICONS[relIndustry];
                      const relColor = INDUSTRY_COLORS[relIndustry];

                      return (
                        <Link
                          key={relIndustry}
                          href={`/presentations/industry/${relIndustry}`}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <span className="text-base">{relIcon}</span>
                          <span className="flex-1">{relLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      href="/presentations"
                      className="flex items-center gap-2 text-sm font-medium text-[#D24726] hover:text-[#B73D20] transition-colors"
                    >
                      View All Industries
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default IndustryPageClient;
