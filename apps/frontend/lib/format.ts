/**
 * Locale-aware formatting utilities for prices, numbers, dates, and relative time.
 * Replaces the ~24 duplicated formatPrice functions across the codebase.
 */

// Locale-to-Intl locale mapping
const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-BR",
};

/**
 * Format a price with locale-aware currency display.
 */
export function formatPrice(
  price: number,
  options: {
    locale?: string;
    currency?: string;
    showFree?: boolean;
    freeLabel?: string;
  } = {}
): string {
  const {
    locale = "en",
    currency = "USD",
    showFree = true,
    freeLabel = "Free",
  } = options;

  if (price === 0 && showFree) return freeLabel;

  const intlLocale = LOCALE_MAP[locale] || locale;
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(
  value: number,
  locale: string = "en",
  options?: Intl.NumberFormatOptions
): string {
  const intlLocale = LOCALE_MAP[locale] || locale;
  return new Intl.NumberFormat(intlLocale, options).format(value);
}

/**
 * Format a number in compact notation (e.g. 1.2K, 3.4M).
 */
export function formatCompactNumber(
  count: number,
  locale: string = "en"
): string {
  const intlLocale = LOCALE_MAP[locale] || locale;
  return new Intl.NumberFormat(intlLocale, { notation: "compact" }).format(
    count
  );
}

/**
 * Format a percentage value.
 */
export function formatPercent(
  value: number,
  locale: string = "en",
  fractionDigits: number = 0
): string {
  const intlLocale = LOCALE_MAP[locale] || locale;
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Format a date with locale-aware display.
 */
export function formatDate(
  date: string | Date,
  locale: string = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  const intlLocale = LOCALE_MAP[locale] || locale;
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    intlLocale,
    options || {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(d);
}

/**
 * Format a date with time.
 */
export function formatDateTime(
  date: string | Date,
  locale: string = "en"
): string {
  return formatDate(date, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a relative time string (e.g. "3 days ago", "in 2 hours").
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = "en"
): string {
  const intlLocale = LOCALE_MAP[locale] || locale;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) return rtf.format(-diffSeconds, "second");
  if (Math.abs(diffMinutes) < 60) return rtf.format(-diffMinutes, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(-diffHours, "hour");
  if (Math.abs(diffDays) < 7) return rtf.format(-diffDays, "day");
  if (Math.abs(diffDays) < 30)
    return rtf.format(-Math.floor(diffDays / 7), "week");
  if (Math.abs(diffDays) < 365)
    return rtf.format(-Math.floor(diffDays / 30), "month");
  return rtf.format(-Math.floor(diffDays / 365), "year");
}

/**
 * Get the Intl locale string for a given app locale.
 */
export function getIntlLocale(locale: string): string {
  return LOCALE_MAP[locale] || locale;
}
