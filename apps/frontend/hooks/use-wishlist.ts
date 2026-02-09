"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// =============================================================================
// Types
// =============================================================================

export interface WishlistItem {
  id: string;
  slug: string;
  title: string;
  type: "product" | "template";
  featuredImage?: string;
  price: number;
  addedAt: number;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = "ktblog-wishlist";

// =============================================================================
// Helpers
// =============================================================================

function readFromStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WishlistItem[];
  } catch {
    return [];
  }
}

function writeToStorage(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Local wishlist backed by localStorage.
 * Hydration-safe: returns empty state during SSR, then loads from storage.
 */
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readFromStorage());
  }, []);

  // Persist to localStorage whenever items change (skip the initial empty state)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      return;
    }
    writeToStorage(items);
  }, [items, hydrated]);

  // Build a Set of ids for O(1) lookups
  const wishlistIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const isInWishlist = useCallback(
    (id: string): boolean => wishlistIds.has(id),
    [wishlistIds],
  );

  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        if (exists) {
          // Remove
          return prev.filter((i) => i.id !== item.id);
        }
        // Add to front
        return [{ ...item, addedAt: Date.now() }, ...prev];
      });
    },
    [],
  );

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }, []);

  const count = items.length;

  return {
    items,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearAll,
    count,
  };
}
