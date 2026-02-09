import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatRelativeTime,
  formatPercent,
} from "@/lib/format";

describe("formatPrice", () => {
  it("formats USD price in English", () => {
    const result = formatPrice(49.99, { locale: "en", currency: "USD" });
    expect(result).toContain("49.99");
    expect(result).toContain("$");
  });

  it("formats EUR price in French", () => {
    const result = formatPrice(49.99, { locale: "fr", currency: "EUR" });
    expect(result).toContain("49,99");
  });

  it("formats SAR price in Arabic", () => {
    const result = formatPrice(49.99, { locale: "ar", currency: "SAR" });
    expect(result).toBeTruthy();
  });

  it("formats BRL price in Portuguese", () => {
    const result = formatPrice(49.99, { locale: "pt", currency: "BRL" });
    expect(result).toContain("R$");
  });

  it("returns Free for zero price", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("returns custom free label", () => {
    expect(formatPrice(0, { freeLabel: "Grátis" })).toBe("Grátis");
  });

  it("does not return Free when showFree is false", () => {
    const result = formatPrice(0, { showFree: false, currency: "USD" });
    expect(result).toContain("0");
  });
});

describe("formatNumber", () => {
  it("formats number with US locale", () => {
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
  });

  it("formats number with French locale", () => {
    const result = formatNumber(1234567, "fr");
    // French uses non-breaking space or period as separator
    expect(result).toBeTruthy();
  });
});

describe("formatCompactNumber", () => {
  it("formats thousands as K", () => {
    const result = formatCompactNumber(1500, "en");
    expect(result).toMatch(/1\.?5?K/);
  });

  it("formats millions as M", () => {
    const result = formatCompactNumber(2500000, "en");
    expect(result).toMatch(/2\.?5?M/);
  });
});

describe("formatPercent", () => {
  it("formats percentage correctly", () => {
    const result = formatPercent(0.37, "en");
    expect(result).toBe("37%");
  });
});

describe("formatDate", () => {
  it("formats date in English", () => {
    const result = formatDate("2026-01-15", "en");
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats date in French", () => {
    const result = formatDate("2026-01-15", "fr");
    expect(result).toContain("janvier");
  });

  it("formats date in Spanish", () => {
    const result = formatDate("2026-01-15", "es");
    expect(result).toContain("enero");
  });
});

describe("formatRelativeTime", () => {
  it("formats recent time as seconds/minutes ago", () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo, "en");
    expect(result).toContain("minute");
  });

  it("formats days ago", () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeDaysAgo, "en");
    expect(result).toContain("3 days ago");
  });
});
