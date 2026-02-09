"use client";

// =============================================================================
// Mobile Collapsible Sections
// =============================================================================
// Accordion-style collapsible sections for product detail pages on mobile.
// Supports single-open (accordion) and multi-open modes, smooth height
// animation via framer-motion, RTL support, and customizable default sections.

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  FileText,
  Package,
  Star,
  HelpCircle,
  Shield,
} from "lucide-react";
import { useLocale } from "next-intl";
import { isRtlLocale, type Locale } from "@/i18n/routing";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface CollapsibleSection {
  /** Unique identifier for the section */
  id: string;
  /** Display title */
  title: string;
  /** Icon element rendered before the title */
  icon: React.ReactNode;
  /** Section content (any React node) */
  content: React.ReactNode;
  /** Whether this section starts expanded */
  defaultOpen?: boolean;
  /** Optional badge (e.g. review count) shown next to the title */
  badge?: React.ReactNode;
}

export interface MobileCollapsibleSectionsProps {
  /** Array of section definitions */
  sections: CollapsibleSection[];
  /** Allow multiple sections to be open simultaneously (default: false) */
  allowMultiple?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/** Transition configuration for the content height animation */
const CONTENT_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/** Transition for the chevron rotation */
const CHEVRON_TRANSITION = {
  duration: 0.25,
  ease: "easeInOut" as const,
};

// =============================================================================
// Default Section Presets
// =============================================================================

/**
 * Creates a standard set of product detail sections. Consumers can pass their
 * own content nodes for each section.
 */
export function createDefaultProductSections({
  description,
  whatsIncluded,
  reviews,
  faq,
  licenseInfo,
  reviewCount,
}: {
  description?: React.ReactNode;
  whatsIncluded?: React.ReactNode;
  reviews?: React.ReactNode;
  faq?: React.ReactNode;
  licenseInfo?: React.ReactNode;
  reviewCount?: number;
}): CollapsibleSection[] {
  const sections: CollapsibleSection[] = [];

  if (description) {
    sections.push({
      id: "description",
      title: "Description",
      icon: <FileText className="h-5 w-5" />,
      content: description,
      defaultOpen: true,
    });
  }

  if (whatsIncluded) {
    sections.push({
      id: "whats-included",
      title: "What's Included",
      icon: <Package className="h-5 w-5" />,
      content: whatsIncluded,
    });
  }

  if (reviews) {
    sections.push({
      id: "reviews",
      title: "Reviews",
      icon: <Star className="h-5 w-5" />,
      content: reviews,
      badge:
        reviewCount !== undefined && reviewCount > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-blue-500/20 dark:text-blue-400 text-[11px] font-bold tabular-nums">
            {reviewCount > 999 ? "999+" : reviewCount}
          </span>
        ) : undefined,
    });
  }

  if (faq) {
    sections.push({
      id: "faq",
      title: "FAQ",
      icon: <HelpCircle className="h-5 w-5" />,
      content: faq,
    });
  }

  if (licenseInfo) {
    sections.push({
      id: "license-info",
      title: "License Info",
      icon: <Shield className="h-5 w-5" />,
      content: licenseInfo,
    });
  }

  return sections;
}

// =============================================================================
// Sub-components
// =============================================================================

/** Individual accordion section header + collapsible content */
function AccordionSection({
  section,
  isOpen,
  onToggle,
  isRtl,
  isLast,
}: {
  section: CollapsibleSection;
  isOpen: boolean;
  onToggle: () => void;
  isRtl: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        !isLast &&
          "border-b border-neutral-100 dark:border-neutral-800",
      )}
    >
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 min-h-[56px] px-4 py-3",
          "text-left transition-colors duration-200",
          "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-inset",
        )}
        aria-expanded={isOpen}
        aria-controls={`section-content-${section.id}`}
      >
        {/* Icon */}
        <span
          className={cn(
            "flex-shrink-0 transition-colors duration-200",
            isOpen
              ? "text-[#1E4DB7] dark:text-blue-400"
              : "text-neutral-400 dark:text-neutral-500",
          )}
        >
          {section.icon}
        </span>

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-sm transition-all duration-200",
            isOpen
              ? "text-[#1E4DB7] dark:text-blue-400 font-semibold"
              : "text-neutral-700 dark:text-neutral-300 font-medium",
          )}
        >
          {section.title}
        </span>

        {/* Optional badge */}
        {section.badge && (
          <span className="flex-shrink-0">{section.badge}</span>
        )}

        {/* Chevron indicator */}
        <motion.span
          animate={{ rotate: isOpen ? (isRtl ? -90 : 90) : 0 }}
          transition={CHEVRON_TRANSITION}
          className={cn(
            "flex-shrink-0 transition-colors duration-200",
            isOpen
              ? "text-[#1E4DB7] dark:text-blue-400"
              : "text-neutral-400 dark:text-neutral-500",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.span>
      </button>

      {/* ================================================================= */}
      {/* Content                                                           */}
      {/* ================================================================= */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`content-${section.id}`}
            id={`section-content-${section.id}`}
            role="region"
            aria-labelledby={`section-header-${section.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={CONTENT_TRANSITION}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {section.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function MobileCollapsibleSections({
  sections,
  allowMultiple = false,
}: MobileCollapsibleSectionsProps) {
  const locale = useLocale() as Locale;
  const isRtl = isRtlLocale(locale);

  // Compute initial open state from section defaults
  const initialOpenIds = useMemo(() => {
    const openIds = new Set<string>();
    for (const section of sections) {
      if (section.defaultOpen) {
        openIds.add(section.id);
      }
    }
    return openIds;
  }, [sections]);

  const [openSections, setOpenSections] = useState<Set<string>>(initialOpenIds);

  // ---------------------------------------------------------------------------
  // Toggle handler
  // ---------------------------------------------------------------------------

  const handleToggle = useCallback(
    (sectionId: string) => {
      setOpenSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          // Always allow closing
          next.delete(sectionId);
        } else {
          if (allowMultiple) {
            // Multi-open: just add
            next.add(sectionId);
          } else {
            // Accordion: close all others, open this one
            next.clear();
            next.add(sectionId);
          }
        }
        return next;
      });
    },
    [allowMultiple],
  );

  // ---------------------------------------------------------------------------
  // Bail out if no sections
  // ---------------------------------------------------------------------------

  if (sections.length === 0) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        // Only render on mobile
        "block lg:hidden",
        // Card styling
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-neutral-900",
        "border border-neutral-200 dark:border-neutral-800",
        "shadow-sm",
      )}
      role="region"
      aria-label="Product details"
    >
      {sections.map((section, index) => (
        <AccordionSection
          key={section.id}
          section={section}
          isOpen={openSections.has(section.id)}
          onToggle={() => handleToggle(section.id)}
          isRtl={isRtl}
          isLast={index === sections.length - 1}
        />
      ))}
    </div>
  );
}

export default MobileCollapsibleSections;
