"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Presentation, SlidePreview } from "@/types/presentation";
import { SlideGallery } from "@/components/presentations/slide-gallery";
import { PresentationInfo } from "@/components/presentations/presentation-info";
import { ColorSchemeDisplay } from "@/components/presentations/color-scheme-display";
import { PresentationCard } from "@/components/presentations/presentation-card";
import { Type } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface PresentationDetailClientProps {
  presentation: Presentation;
  slides: SlidePreview[];
  relatedPresentations: Presentation[];
}

// =============================================================================
// Component
// =============================================================================

export function PresentationDetailClient({
  presentation,
  slides,
  relatedPresentations,
}: PresentationDetailClientProps) {
  return (
    <>
      {/* Main Product Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Slide Gallery */}
              <div>
                <SlideGallery slides={slides} />
              </div>

              {/* Product Info Sidebar */}
              <div>
                <PresentationInfo presentation={presentation} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Details Section */}
      <section className="py-12 md:py-16 border-t border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Full Description */}
            {presentation.description && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  Description
                </h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {presentation.description.split("\n").map((paragraph, idx) =>
                    paragraph.trim() ? (
                      <p key={idx}>{paragraph}</p>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Color Schemes */}
            {presentation.colorSchemes.length > 0 && (
              <div>
                <ColorSchemeDisplay
                  colorSchemes={presentation.colorSchemes}
                />
              </div>
            )}

            {/* Font Families */}
            {presentation.fontFamilies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Type className="h-4 w-4 text-[#D24726] dark:text-orange-400" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Font Families
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {presentation.fontFamilies.map((font) => (
                    <span
                      key={font}
                      className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {font}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Presentations */}
      {relatedPresentations.length > 0 && (
        <section className="border-t border-neutral-100 dark:border-neutral-800 py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Related Templates
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    More templates you might like
                  </p>
                </div>
                <Link
                  href={`/presentations?industry=${presentation.industry}`}
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
                >
                  View All
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {relatedPresentations.map((related, index) => (
                  <PresentationCard
                    key={related.id}
                    presentation={related}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default PresentationDetailClient;
