"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Comparison Provider
// =============================================================================
// Manages client-side comparison state with localStorage persistence.
// Products can be added/removed from any product card in the store.
// The comparison bar auto-shows when products are selected.

const MAX_COMPARE = 4;
const STORAGE_KEY = "ktblog_comparison";
const PRODUCTS_STORAGE_KEY = "ktblog_comparison_products";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ComparisonContextValue {
  comparedIds: string[];
  comparedProducts: DigitalProduct[];
  isBarVisible: boolean;
  canAddMore: boolean;
  addToCompare: (product: DigitalProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(
  undefined,
);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function loadStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadStoredProducts(): DigitalProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[], products: DigitalProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Storage full or unavailable
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PRODUCTS_STORAGE_KEY);
}

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

interface ComparisonProviderProps {
  children: ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<DigitalProduct[]>(
    [],
  );

  // Load from localStorage on mount
  useEffect(() => {
    const ids = loadStoredIds();
    const products = loadStoredProducts();
    // Only keep products that match stored IDs
    const validProducts = products.filter((p) => ids.includes(p.id));
    setComparedIds(ids);
    setComparedProducts(validProducts);
  }, []);

  const addToCompare = useCallback(
    (product: DigitalProduct) => {
      setComparedIds((prev) => {
        if (prev.includes(product.id) || prev.length >= MAX_COMPARE)
          return prev;
        const newIds = [...prev, product.id];
        setComparedProducts((prevProducts) => {
          const newProducts = [...prevProducts, product];
          saveToStorage(newIds, newProducts);
          return newProducts;
        });
        return newIds;
      });
    },
    [],
  );

  const removeFromCompare = useCallback((productId: string) => {
    setComparedIds((prev) => {
      const newIds = prev.filter((id) => id !== productId);
      setComparedProducts((prevProducts) => {
        const newProducts = prevProducts.filter((p) => p.id !== productId);
        saveToStorage(newIds, newProducts);
        return newProducts;
      });
      return newIds;
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparedIds([]);
    setComparedProducts([]);
    clearStorage();
  }, []);

  const isInComparison = useCallback(
    (productId: string) => comparedIds.includes(productId),
    [comparedIds],
  );

  const value = useMemo<ComparisonContextValue>(
    () => ({
      comparedIds,
      comparedProducts,
      isBarVisible: comparedIds.length > 0,
      canAddMore: comparedIds.length < MAX_COMPARE,
      addToCompare,
      removeFromCompare,
      clearComparison,
      isInComparison,
    }),
    [
      comparedIds,
      comparedProducts,
      addToCompare,
      removeFromCompare,
      clearComparison,
      isInComparison,
    ],
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useComparison(): ComparisonContextValue {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
