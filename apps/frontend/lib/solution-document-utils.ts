// =============================================================================
// Solution Document Utility Functions
// =============================================================================

import {
  DocumentType,
  Domain,
  MaturityLevel,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_COLORS,
  DOMAIN_HEX_COLORS,
  MATURITY_LEVEL_LABELS,
  MATURITY_LEVEL_COLORS,
  COMPLIANCE_LABELS,
} from "@/types/solution-document";

// -----------------------------------------------------------------------------
// Document Type Helpers
// -----------------------------------------------------------------------------

/**
 * Get the emoji icon for a document type.
 */
export function getDocumentTypeIcon(type: DocumentType): string {
  return DOCUMENT_TYPE_ICONS[type] || "📋";
}

/**
 * Get the human-readable label for a document type.
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type] || "Document";
}

// -----------------------------------------------------------------------------
// Domain Helpers
// -----------------------------------------------------------------------------

/**
 * Get the emoji icon for a domain.
 */
export function getDomainIcon(domain: Domain): string {
  return DOMAIN_ICONS[domain] || "📁";
}

/**
 * Get the Tailwind background color class for a domain.
 */
export function getDomainColor(domain: Domain): string {
  return DOMAIN_COLORS[domain] || "bg-neutral-500";
}

/**
 * Get the hex color for a domain.
 */
export function getDomainHexColor(domain: Domain): string {
  return DOMAIN_HEX_COLORS[domain] || "#6B7280";
}

/**
 * Get the human-readable label for a domain.
 */
export function getDomainLabel(domain: Domain): string {
  return DOMAIN_LABELS[domain] || "General";
}

// -----------------------------------------------------------------------------
// Maturity Level Helpers
// -----------------------------------------------------------------------------

/**
 * Get the Tailwind badge color classes for a maturity level.
 */
export function getMaturityBadgeColor(level: MaturityLevel): string {
  return (
    MATURITY_LEVEL_COLORS[level] ||
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
  );
}

/**
 * Get the human-readable label for a maturity level.
 */
export function getMaturityLabel(level: MaturityLevel): string {
  return MATURITY_LEVEL_LABELS[level] || "Starter";
}

// -----------------------------------------------------------------------------
// Compliance Helpers
// -----------------------------------------------------------------------------

/**
 * Get the Tailwind badge color classes for a compliance framework.
 */
export function getComplianceBadgeColor(framework: string): string {
  const key = framework.toLowerCase().replace(/[\s_]/g, "");
  const entry = COMPLIANCE_LABELS[key];
  return (
    entry?.color ||
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
  );
}

/**
 * Get the display label for a compliance framework.
 */
export function getComplianceLabel(framework: string): string {
  const key = framework.toLowerCase().replace(/[\s_]/g, "");
  return COMPLIANCE_LABELS[key]?.label || framework.toUpperCase();
}

/**
 * Get the description for a compliance framework.
 */
export function getComplianceDescription(framework: string): string {
  const key = framework.toLowerCase().replace(/[\s_]/g, "");
  return COMPLIANCE_LABELS[key]?.description || "";
}

// -----------------------------------------------------------------------------
// Page Count / Word Count Formatting
// -----------------------------------------------------------------------------

/**
 * Format a page count for display.
 */
export function formatPageCount(count: number): string {
  if (count === 1) return "1 page";
  return `${count} pages`;
}

/**
 * Format a word count for display.
 */
export function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K words`;
  }
  return `${count} words`;
}

// -----------------------------------------------------------------------------
// Freshness Helpers
// -----------------------------------------------------------------------------

/**
 * Get a human-readable label for a freshness score (0-100).
 */
export function getFreshnessLabel(score: number): string {
  if (score >= 90) return "Fresh";
  if (score >= 70) return "Current";
  if (score >= 50) return "Review Needed";
  return "Outdated";
}

/**
 * Get a Tailwind color class string for a freshness score.
 */
export function getFreshnessColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 50) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Get a Tailwind background color class for a freshness score.
 */
export function getFreshnessBgColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-yellow-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

// -----------------------------------------------------------------------------
// Reading Time
// -----------------------------------------------------------------------------

/**
 * Calculate estimated reading time in minutes from a word count.
 * Assumes an average reading speed of 200 words per minute for technical docs.
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// -----------------------------------------------------------------------------
// Price Formatting
// -----------------------------------------------------------------------------

/**
 * Format a price for display.
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate discount percentage.
 */
export function getDiscountPercentage(
  price: number,
  compareAtPrice: number,
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
