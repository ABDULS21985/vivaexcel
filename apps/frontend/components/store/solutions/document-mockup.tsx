"use client";

import { motion } from "framer-motion";
import {
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_TYPE_LABELS,
  DOMAIN_LABELS,
  DOMAIN_HEX_COLORS,
} from "@/types/solution-document";
import type { DocumentType, Domain } from "@/types/solution-document";

// =============================================================================
// Types
// =============================================================================

interface DocumentMockupProps {
  title: string;
  documentType: DocumentType;
  domain: Domain;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function DocumentMockup({
  title,
  documentType,
  domain,
  className = "",
}: DocumentMockupProps) {
  const typeIcon = DOCUMENT_TYPE_ICONS[documentType] || "📋";
  const typeLabel = DOCUMENT_TYPE_LABELS[documentType] || "Document";
  const domainLabel = DOMAIN_LABELS[domain] || "General";
  const domainColor = DOMAIN_HEX_COLORS[domain] || "#6B7280";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        initial={{ rotateY: -5, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* Outer Shadow / "Spine" */}
        <div
          className="absolute -left-1 top-2 bottom-2 w-3 rounded-l-sm"
          style={{
            background: `linear-gradient(to right, ${domainColor}40, ${domainColor}20)`,
            transform: "translateZ(-10px)",
          }}
        />

        {/* Main Document Face */}
        <div
          className="relative w-64 md:w-80 rounded-xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-700"
          style={{
            transform: "rotateY(-3deg)",
            transformStyle: "preserve-3d",
            boxShadow: `
              0 20px 60px -15px rgba(0, 0, 0, 0.15),
              0 10px 30px -10px rgba(0, 0, 0, 0.1),
              -5px 5px 20px -5px ${domainColor}20
            `,
          }}
        >
          {/* Cover */}
          <div
            className="p-8 pb-12"
            style={{
              background: `linear-gradient(135deg, ${domainColor} 0%, ${domainColor}BB 50%, ${domainColor}88 100%)`,
            }}
          >
            {/* Top badge bar */}
            <div className="flex items-center justify-between mb-8">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                {typeLabel}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                {domainLabel}
              </span>
            </div>

            {/* Type Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl">{typeIcon}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white text-center leading-tight line-clamp-3">
              {title}
            </h3>
          </div>

          {/* Bottom "pages" effect */}
          <div className="bg-white dark:bg-neutral-800 p-4">
            <div className="space-y-2">
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-full" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-4/5" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-3/5" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-2/3" />
            </div>
          </div>
        </div>

        {/* Background page shadows */}
        <div
          className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
          style={{
            transform: "translateZ(-4px) translateX(3px) translateY(3px)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
          style={{
            transform: "translateZ(-8px) translateX(6px) translateY(6px)",
            opacity: 0.3,
          }}
        />
      </motion.div>
    </div>
  );
}

export default DocumentMockup;
