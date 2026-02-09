"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

export type SupportedCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  | "SAR"
  | "BRL"
  | "QAR"
  | "NGN";

export const CURRENCY_INFO: Record<
  SupportedCurrency,
  { symbol: string; name: string; flag: string }
> = {
  USD: { symbol: "$", name: "US Dollar", flag: "US" },
  EUR: { symbol: "€", name: "Euro", flag: "EU" },
  GBP: { symbol: "£", name: "British Pound", flag: "GB" },
  SAR: { symbol: "﷼", name: "Saudi Riyal", flag: "SA" },
  BRL: { symbol: "R$", name: "Brazilian Real", flag: "BR" },
  QAR: { symbol: "﷼", name: "Qatari Riyal", flag: "QA" },
  NGN: { symbol: "₦", name: "Nigerian Naira", flag: "NG" },
};

const LOCALE_DEFAULT_CURRENCY: Record<string, SupportedCurrency> = {
  en: "USD",
  ar: "SAR",
  fr: "EUR",
  es: "EUR",
  pt: "BRL",
};

// Static exchange rates relative to USD (display-only; Stripe handles actual charges)
const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  BRL: 4.95,
  QAR: 3.64,
  NGN: 1550,
};

const STORAGE_KEY = "preferred-currency";

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  convertPrice: (priceInUSD: number) => number;
  availableCurrencies: SupportedCurrency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const defaultCurrency = LOCALE_DEFAULT_CURRENCY[locale] || "USD";

  const [currency, setCurrencyState] = useState<SupportedCurrency>(defaultCurrency);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in EXCHANGE_RATES) {
      setCurrencyState(saved as SupportedCurrency);
    }
  }, []);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const convertPrice = useCallback(
    (priceInUSD: number) => {
      const rate = EXCHANGE_RATES[currency] || 1;
      return Math.round(priceInUSD * rate * 100) / 100;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        availableCurrencies: Object.keys(EXCHANGE_RATES) as SupportedCurrency[],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
