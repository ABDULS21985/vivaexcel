import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

describe("Accessibility: Price formatting includes currency symbol", () => {
  it("USD prices include $ symbol for screen readers", () => {
    const result = formatPrice(49.99, { locale: "en", currency: "USD" });
    expect(result).toMatch(/\$/);
  });

  it("EUR prices include € symbol", () => {
    const result = formatPrice(49.99, { locale: "fr", currency: "EUR" });
    expect(result).toMatch(/€/);
  });

  it("GBP prices include £ symbol", () => {
    const result = formatPrice(49.99, { locale: "en", currency: "GBP" });
    expect(result).toMatch(/£/);
  });
});
