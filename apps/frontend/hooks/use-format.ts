"use client";

import { useLocale } from "next-intl";
import {
  formatPrice as _formatPrice,
  formatNumber as _formatNumber,
  formatCompactNumber as _formatCompactNumber,
  formatPercent as _formatPercent,
  formatDate as _formatDate,
  formatDateTime as _formatDateTime,
  formatRelativeTime as _formatRelativeTime,
} from "@/lib/format";

/**
 * React hook providing locale-aware formatting functions.
 * Automatically uses the current locale from next-intl.
 */
export function useFormat() {
  const locale = useLocale();

  return {
    formatPrice: (price: number, currency?: string, freeLabel?: string) =>
      _formatPrice(price, { locale, currency, freeLabel }),

    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      _formatNumber(value, locale, options),

    formatCompactNumber: (count: number) =>
      _formatCompactNumber(count, locale),

    formatPercent: (value: number, fractionDigits?: number) =>
      _formatPercent(value, locale, fractionDigits),

    formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
      _formatDate(date, locale, options),

    formatDateTime: (date: string | Date) => _formatDateTime(date, locale),

    formatRelativeTime: (date: string | Date) =>
      _formatRelativeTime(date, locale),

    locale,
  };
}
