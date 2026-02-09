"use client";

import { useState, useEffect, useCallback } from "react";

// =============================================================================
// Types
// =============================================================================

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  type: "product" | "template";
  featuredImage?: string;
  price: number;
  viewedAt: number;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = "ktblog-recently-viewed";

// =============================================================================
// Helpers
// =============================================================================

function readFromStorage(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

function writeToStorage(items: RecentlyViewedItem[]): void {
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
 * Track recently viewed products and templates in localStorage.
 * Deduplicates by id (moves to front if already exists) and caps at maxItems.
 * Hydration-safe: returns empty state during SSR.
 */
export function useRecentlyViewed(maxItems = 12) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

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

  const addItem = useCallback(
    (item: Omit<RecentlyViewedItem, "viewedAt">) => {
      setItems((prev) => {
        // Remove existing entry with the same id
        const filtered = prev.filter((i) => i.id !== item.id);
        // Prepend the new/updated item
        const updated: RecentlyViewedItem[] = [
          { ...item, viewedAt: Date.now() },
          ...filtered,
        ];
        // Cap at maxItems
        return updated.slice(0, maxItems);
      });
    },
    [maxItems],
  );

  const removeItem = useCallback((id: string) => {
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

  return { items, addItem, removeItem, clearAll };
}
