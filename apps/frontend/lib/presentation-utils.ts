// =============================================================================
// Presentation Utility Functions
// =============================================================================

import {
  Industry,
  PresentationType,
  AspectRatio,
  INDUSTRY_LABELS,
  INDUSTRY_ICONS,
  INDUSTRY_COLORS,
  PRESENTATION_TYPE_LABELS,
  ASPECT_RATIO_LABELS,
} from "@/types/presentation";

// -----------------------------------------------------------------------------
// Slide Count Formatting
// -----------------------------------------------------------------------------

/**
 * Format a slide count as a human-readable string.
 */
export function formatSlideCount(count: number): string {
  if (count === 1) return "1 slide";
  return `${count} slides`;
}

/**
 * Get category label for a slide count range.
 */
export function getSlideCountCategory(
  count: number,
): "compact" | "standard" | "comprehensive" {
  if (count <= 10) return "compact";
  if (count <= 30) return "standard";
  return "comprehensive";
}

// -----------------------------------------------------------------------------
// File Size Formatting
// -----------------------------------------------------------------------------

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i >= 2 ? 1 : 0)} ${units[i]}`;
}

// -----------------------------------------------------------------------------
// Industry Helpers
// -----------------------------------------------------------------------------

/**
 * Get the emoji icon for an industry.
 */
export function getIndustryIcon(industry: Industry): string {
  return INDUSTRY_ICONS[industry] || "📋";
}

/**
 * Get the Tailwind-compatible color for an industry badge.
 */
export function getIndustryColor(industry: Industry): string {
  return INDUSTRY_COLORS[industry] || "#6B7280";
}

/**
 * Get the human-readable label for an industry.
 */
export function getIndustryLabel(industry: Industry): string {
  return INDUSTRY_LABELS[industry] || "General";
}

// -----------------------------------------------------------------------------
// Presentation Type Helpers
// -----------------------------------------------------------------------------

/**
 * Get the human-readable label for a presentation type.
 */
export function getPresentationTypeLabel(type: PresentationType): string {
  return PRESENTATION_TYPE_LABELS[type] || "General";
}

// -----------------------------------------------------------------------------
// Software / Compatibility Helpers
// -----------------------------------------------------------------------------

interface SoftwareInfo {
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
}

const SOFTWARE_MAP: Record<string, SoftwareInfo> = {
  powerpoint: {
    name: "Microsoft PowerPoint",
    shortName: "PowerPoint",
    color: "#D24726",
    bgColor: "#D24726",
  },
  "google slides": {
    name: "Google Slides",
    shortName: "Google Slides",
    color: "#FBBC04",
    bgColor: "#FBBC04",
  },
  keynote: {
    name: "Apple Keynote",
    shortName: "Keynote",
    color: "#0071E3",
    bgColor: "#0071E3",
  },
  libreoffice: {
    name: "LibreOffice Impress",
    shortName: "LibreOffice",
    color: "#18A303",
    bgColor: "#18A303",
  },
  canva: {
    name: "Canva",
    shortName: "Canva",
    color: "#7B2FF2",
    bgColor: "#7B2FF2",
  },
};

/**
 * Get software display info for a compatibility string.
 */
export function getSoftwareInfo(software: string): SoftwareInfo {
  const key = software.toLowerCase().trim();
  return (
    SOFTWARE_MAP[key] || {
      name: software,
      shortName: software,
      color: "#6B7280",
      bgColor: "#6B7280",
    }
  );
}

/**
 * Get software icon letter for a compatibility string.
 * Used as fallback when actual icon components are not available.
 */
export function getSoftwareIconLetter(software: string): string {
  const key = software.toLowerCase().trim();
  if (key.includes("powerpoint")) return "P";
  if (key.includes("google")) return "G";
  if (key.includes("keynote")) return "K";
  if (key.includes("libreoffice")) return "L";
  if (key.includes("canva")) return "C";
  return software.charAt(0).toUpperCase();
}

// -----------------------------------------------------------------------------
// Aspect Ratio Helpers
// -----------------------------------------------------------------------------

/**
 * Get the human-readable label for an aspect ratio.
 */
export function getAspectRatioDisplay(ratio: AspectRatio): string {
  return ASPECT_RATIO_LABELS[ratio] || ratio;
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

/**
 * Format a download count for display.
 */
export function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Render star rating as a numeric rating label.
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
