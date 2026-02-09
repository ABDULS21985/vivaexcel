import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = ["en", "ar", "fr", "es", "pt"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// RTL locales
export const rtlLocales: Locale[] = ["ar"];

// Locale metadata for display
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Francais",
  es: "Espanol",
  pt: "Portugues",
};

// Locale flags (emoji or icon identifiers)
export const localeFlags: Record<Locale, string> = {
  en: "GB",
  ar: "SA",
  fr: "FR",
  es: "ES",
  pt: "PT",
};

// Check if locale is RTL
export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// Get direction for locale
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

// Validate locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Date formatting options per locale
export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  ar: {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
  },
  fr: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  es: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  pt: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
};

// Number formatting options per locale
export const numberFormats: Record<
  Locale,
  {
    currency: Intl.NumberFormatOptions;
    decimal: Intl.NumberFormatOptions;
    percent: Intl.NumberFormatOptions;
  }
> = {
  en: {
    currency: {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
    },
  },
  ar: {
    currency: {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
    },
  },
  fr: {
    currency: {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
    },
  },
  es: {
    currency: {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
    },
  },
  pt: {
    currency: {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
    },
  },
};

// Time zone defaults per locale (can be overridden)
export const defaultTimeZones: Record<Locale, string> = {
  en: "America/New_York",
  ar: "Asia/Riyadh",
  fr: "Europe/Paris",
  es: "Europe/Madrid",
  pt: "America/Sao_Paulo",
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: defaultTimeZones[locale],
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        medium: {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
          weekday: "long",
        },
      },
      number: {
        currency: numberFormats[locale].currency,
        decimal: numberFormats[locale].decimal,
        percent: numberFormats[locale].percent,
      },
    },
  };
});
