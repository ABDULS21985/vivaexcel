"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, GitCommit, Tag } from "lucide-react";
import type {
  SolutionDocument,
  DocumentBundle,
  DocumentUpdate,
} from "@/types/solution-document";
import { DocumentMockup } from "@/components/store/solutions/document-mockup";
import { SolutionInfo } from "@/components/store/solutions/solution-info";
import { TableOfContentsPreview } from "@/components/store/solutions/table-of-contents-preview";
import { DocumentCard } from "@/components/store/solutions/document-card";
import { BundleComparison } from "@/components/store/solutions/bundle-comparison";

const DocumentViewer = dynamic(
  () => import("@/components/store/viewers/document-viewer"),
  { ssr: false },
);

// =============================================================================
// Types
// =============================================================================

interface SolutionDetailClientProps {
  document: SolutionDocument;
  relatedDocuments: SolutionDocument[];
  bundles: DocumentBundle[];
}

// =============================================================================
// Component
// =============================================================================

export function SolutionDetailClient({
  document,
  relatedDocuments,
  bundles,
}: SolutionDetailClientProps) {
  // Extract page preview images from metadata (populated by preview generation system)
  const pageImages = useMemo(() => {
    const meta = document.metadata as Record<string, unknown> | undefined;
    if (meta?.previewImages && Array.isArray(meta.previewImages)) {
      return meta.previewImages as string[];
    }
    return [];
  }, [document.metadata]);

  const hasDocumentViewer = pageImages.length > 0;

  // Map solution TOC to DocumentViewer TOC format (they match)
  const tocItems = document.tableOfContents;

  return (
    <>
      {/* Interactive Document Viewer (full width, when page images are available) */}
      {hasDocumentViewer && (
        <section className="py-8 md:py-12 border-b border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <DocumentViewer
                product={{
                  id: document.id,
                  title: document.title,
                  type: "document" as any,
                  previews: [],
                } as any}
                pageImages={pageImages}
                totalPages={document.pageCount || pageImages.length}
                freePreviewPages={5}
                tableOfContents={tocItems}
                documentInfo={{
                  pageCount: document.pageCount,
                  format: document.templateFormat?.[0] || "PDF",
                  fileSize: (document.metadata as Record<string, unknown>)?.fileSize as string | undefined,
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Product Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Document Mockup / Image (shown when no DocumentViewer) */}
              {!hasDocumentViewer && (
                <div className="flex items-start justify-center">
                  {document.featuredImage ? (
                    <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={document.featuredImage}
                        alt={document.title}
                        width={640}
                        height={480}
                        className="w-full h-auto object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <DocumentMockup
                      title={document.title}
                      documentType={document.documentType}
                      domain={document.domain}
                      className="py-8"
                    />
                  )}
                </div>
              )}

              {/* Product Info Sidebar */}
              <div className={hasDocumentViewer ? "lg:col-span-2" : ""}>
                <SolutionInfo document={document} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description & TOC Section */}
      <section className="py-12 md:py-16 border-t border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Full Description */}
            {document.description && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  Description
                </h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {document.description.split("\n").map((paragraph, idx) =>
                    paragraph.trim() ? (
                      <p key={idx}>{paragraph}</p>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* AI-Generated Description */}
            {document.aiGeneratedDescription && (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  AI-Generated Summary
                </h3>
                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                  {document.aiGeneratedDescription}
                </p>
              </div>
            )}

            {/* Table of Contents Preview */}
            {document.tableOfContents.length > 0 && (
              <TableOfContentsPreview items={document.tableOfContents} />
            )}

            {/* Version History */}
            {document.updates && document.updates.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                  Version History
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-700" />

                  <div className="space-y-6">
                    {document.updates.map((update, idx) => (
                      <VersionEntry
                        key={update.id}
                        update={update}
                        isLatest={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bundle Suggestions */}
      {bundles.length > 0 && (
        <section className="py-12 md:py-16 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Also Available in Bundles
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Save more when you buy this document as part of a bundle
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                  <BundleComparison key={bundle.id} bundle={bundle} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Documents */}
      {relatedDocuments.length > 0 && (
        <section className="border-t border-neutral-100 dark:border-neutral-800 py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Related Documents
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    More documents you might need
                  </p>
                </div>
                <Link
                  href={`/store/solutions/domain/${document.domain}`}
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
                {relatedDocuments.map((related, index) => (
                  <DocumentCard
                    key={related.id}
                    document={related}
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

// =============================================================================
// Version Entry Sub-Component
// =============================================================================

function VersionEntry({
  update,
  isLatest,
}: {
  update: DocumentUpdate;
  isLatest: boolean;
}) {
  const date = new Date(update.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div
        className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 ${
          isLatest
            ? "bg-[#1E4DB7] border-[#1E4DB7] shadow-md shadow-[#1E4DB7]/30"
            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"
        }`}
      />

      <div
        className={`p-4 rounded-xl border ${
          isLatest
            ? "bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 border-[#1E4DB7]/20"
            : "bg-white dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg ${
              isLatest
                ? "bg-[#1E4DB7] text-white"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <GitCommit className="h-3 w-3" />
            v{update.version}
          </span>
          {isLatest && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Latest
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {update.releaseNotes}
        </p>
      </div>
    </div>
  );
}

export default SolutionDetailClient;
