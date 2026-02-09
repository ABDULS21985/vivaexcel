// =============================================================================
// Review Utility Functions
// =============================================================================
// Pure utility functions for formatting and computing review-related data.
// No side effects, no API calls — these are safe to use in both server and
// client components.

// =============================================================================
// Rating Formatting
// =============================================================================

/**
 * Format a numeric rating to one decimal place.
 *
 * @example formatRating(4.666) => "4.7"
 * @example formatRating(5)     => "5.0"
 */
export function formatRating(rating: number): string {
  return Math.min(5, Math.max(0, rating)).toFixed(1);
}

// =============================================================================
// Star Breakdown
// =============================================================================

/**
 * Decompose a rating (0-5) into full stars, an optional half star, and empty
 * stars so the caller can render the correct icon sequence.
 *
 * @example getStarCounts(4.7) => { full: 4, half: true, empty: 0 }
 * @example getStarCounts(3.2) => { full: 3, half: false, empty: 2 }
 */
export function getStarCounts(rating: number): {
  full: number;
  half: boolean;
  empty: number;
} {
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const decimal = clamped - full;
  const half = decimal >= 0.25 && decimal < 0.75;
  const roundedUp = decimal >= 0.75 ? 1 : 0;

  const totalFull = full + roundedUp;
  const empty = 5 - totalFull - (half ? 1 : 0);

  return { full: totalFull, half, empty };
}

// =============================================================================
// Relative Time
// =============================================================================

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;
const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_WEEK = 604_800;
const SECONDS_PER_MONTH = 2_592_000; // ~30 days
const SECONDS_PER_YEAR = 31_536_000; // 365 days

/**
 * Return a human-readable relative time string.
 *
 * @example getRelativeTime("2024-01-15T10:00:00Z") => "2 hours ago"
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Guard against future dates
  if (diffMs < 0) return "just now";

  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < SECONDS_PER_MINUTE) return "just now";
  if (diffSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(diffSeconds / SECONDS_PER_MINUTE);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffSeconds < SECONDS_PER_DAY) {
    const hours = Math.floor(diffSeconds / SECONDS_PER_HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffSeconds < SECONDS_PER_WEEK) {
    const days = Math.floor(diffSeconds / SECONDS_PER_DAY);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (diffSeconds < SECONDS_PER_MONTH) {
    const weeks = Math.floor(diffSeconds / SECONDS_PER_WEEK);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diffSeconds < SECONDS_PER_YEAR) {
    const months = Math.floor(diffSeconds / SECONDS_PER_MONTH);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  const years = Math.floor(diffSeconds / SECONDS_PER_YEAR);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

// =============================================================================
// Rating Label
// =============================================================================

/**
 * Map a numeric rating to a human-readable quality label.
 */
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating >= 2.5) return "Good";
  if (rating >= 1.5) return "Fair";
  return "Poor";
}

// =============================================================================
// Verified Badge
// =============================================================================

/**
 * Return Tailwind utility classes for the verified purchase badge.
 */
export function getVerifiedBadgeColor(isVerified: boolean): string {
  if (isVerified) {
    return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  }
  return "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
}
