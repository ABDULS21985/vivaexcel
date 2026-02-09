"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import type { SolutionDocument, Domain } from "@/types/solution-document";
import {
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_HEX_COLORS,
} from "@/types/solution-document";
import { DocumentCard } from "@/components/store/solutions/document-card";

// =============================================================================
// Types
// =============================================================================

interface DomainPageClientProps {
  domain: Domain;
  label: string;
  color: string;
  documents: SolutionDocument[];
  featuredDocuments: SolutionDocument[];
  relatedDomains: Domain[];
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

export function DomainPageClient({
  domain,
  label,
  color,
  documents,
  featuredDocuments,
  relatedDomains,
}: DomainPageClientProps) {
  return (
    <>
      {/* Featured Documents */}
      {featuredDocuments.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Featured{" "}
                    <span style={{ color }}>
                      {label}
                    </span>{" "}
                    Documents
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    Top-rated documents in this domain
                  </p>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featuredDocuments.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* All Documents */}
      <section className="py-16 md:py-20 border-t border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  All {label} Documents
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {documents.length} documents available
                </p>
              </div>
              <Link
                href="/store/solutions"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
              >
                Browse All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {documents.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {documents.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No documents available for this domain yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Domains */}
      {relatedDomains.length > 0 && (
        <section className="py-16 md:py-20 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                Explore Other Domains
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedDomains.map((relDomain) => {
                  const relLabel = DOMAIN_LABELS[relDomain];
                  const relIcon = DOMAIN_ICONS[relDomain];
                  const relColor = DOMAIN_HEX_COLORS[relDomain];

                  return (
                    <Link
                      key={relDomain}
                      href={`/store/solutions/domain/${relDomain}`}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 hover:shadow-lg"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${relColor}15` }}
                        >
                          <span className="text-2xl">{relIcon}</span>
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 text-center group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                          {relLabel}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default DomainPageClient;
