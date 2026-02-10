"use client";

// =============================================================================
// Autocomplete Dropdown
// =============================================================================
// Glassmorphism dropdown panel that appears below the SmartSearchBar.
// Displays autocomplete suggestions grouped by type: Products, Categories,
// Suggestions, and Recent searches. Supports keyboard navigation via
// selectedIndex and accessible ARIA attributes.

import { useMemo, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  FolderOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@ktblog/ui/components";
import type { AutocompleteItem } from "./types";

// =============================================================================
// Constants
// =============================================================================

const LOCAL_STORAGE_KEY = "vivaexcel_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const MAX_PRODUCT_ITEMS = 4;
const MAX_CATEGORY_ITEMS = 3;
const MAX_SUGGESTION_ITEMS = 3;

// =============================================================================
// Types
// =============================================================================

interface AutocompleteDropdownProps {
  /** Items returned from the autocomplete API */
  items: AutocompleteItem[];
  /** Currently selected index via keyboard navigation (-1 = none) */
  selectedIndex: number;
  /** Callback when an item is selected */
  onSelect: (item: AutocompleteItem) => void;
  /** Callback for "See all results" */
  onSeeAll: () => void;
  /** Current search query for text highlighting */
  query: string;
  /** Unique ID for ARIA integration with the input */
  listboxId?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

// =============================================================================
// Helper: Recent Searches
// =============================================================================

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_RECENT_SEARCHES);
      }
    }
  } catch {
    // Silently ignore
  }
  return [];
}

function removeRecentSearch(query: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const updated = parsed.filter(
          (s: string) => s.toLowerCase() !== query.toLowerCase(),
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    }
  } catch {
    // Silently ignore
  }
  return [];
}

// =============================================================================
// Helper: Highlight matching text
// =============================================================================

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query || query.length < 2) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex < 0) {
    return <>{text}</>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <span className="font-semibold text-[#1E4DB7] dark:text-blue-400">
        {match}
      </span>
      {after}
    </>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-3 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {title}
      </span>
    </div>
  );
}

function ProductItem({
  item,
  isSelected,
  index,
  query,
  onSelect,
  listboxId,
}: {
  item: AutocompleteItem;
  isSelected: boolean;
  index: number;
  query: string;
  onSelect: () => void;
  listboxId?: string;
}) {
  return (
    <motion.li
      variants={itemVariants}
      id={listboxId ? `${listboxId}-option-${index}` : undefined}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 cursor-pointer",
        "transition-colors duration-100",
        isSelected
          ? "bg-slate-100 dark:bg-slate-800"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
      )}
    >
      {/* Product thumbnail */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-700/50">
        {item.featuredImage ? (
          <Image
            src={item.featuredImage}
            alt={item.text}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Package
              size={16}
              className="text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Text and price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
          <HighlightedText text={item.text} query={query} />
        </p>
        {item.price !== undefined && (
          <p className="text-xs text-[#F59A23] font-medium mt-0.5">
            ${item.price.toFixed(2)}
          </p>
        )}
      </div>

      {/* Type badge */}
      <span
        className={cn(
          "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full",
          "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-blue-300",
        )}
      >
        Product
      </span>
    </motion.li>
  );
}

function CategoryItem({
  item,
  isSelected,
  index,
  query,
  onSelect,
  listboxId,
}: {
  item: AutocompleteItem;
  isSelected: boolean;
  index: number;
  query: string;
  onSelect: () => void;
  listboxId?: string;
}) {
  return (
    <motion.li
      variants={itemVariants}
      id={listboxId ? `${listboxId}-option-${index}` : undefined}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 cursor-pointer",
        "transition-colors duration-100",
        isSelected
          ? "bg-slate-100 dark:bg-slate-800"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 shrink-0">
        <FolderOpen
          size={16}
          className="text-[#F59A23]"
          aria-hidden="true"
        />
      </div>
      <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">
        <HighlightedText text={item.text} query={query} />
      </span>
      <span
        className={cn(
          "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full",
          "bg-amber-50 text-[#E86A1D] dark:bg-amber-950/50 dark:text-amber-400",
        )}
      >
        Category
      </span>
    </motion.li>
  );
}

function SuggestionItem({
  item,
  isSelected,
  index,
  query,
  onSelect,
  listboxId,
}: {
  item: AutocompleteItem;
  isSelected: boolean;
  index: number;
  query: string;
  onSelect: () => void;
  listboxId?: string;
}) {
  return (
    <motion.li
      variants={itemVariants}
      id={listboxId ? `${listboxId}-option-${index}` : undefined}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 cursor-pointer",
        "transition-colors duration-100",
        isSelected
          ? "bg-slate-100 dark:bg-slate-800"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
        <TrendingUp
          size={16}
          className="text-emerald-500"
          aria-hidden="true"
        />
      </div>
      <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">
        <HighlightedText text={item.text} query={query} />
      </span>
    </motion.li>
  );
}

function RecentItem({
  text,
  isSelected,
  index,
  query,
  onSelect,
  onRemove,
  listboxId,
}: {
  text: string;
  isSelected: boolean;
  index: number;
  query: string;
  onSelect: () => void;
  onRemove: () => void;
  listboxId?: string;
}) {
  return (
    <motion.li
      variants={itemVariants}
      id={listboxId ? `${listboxId}-option-${index}` : undefined}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 cursor-pointer group",
        "transition-colors duration-100",
        isSelected
          ? "bg-slate-100 dark:bg-slate-800"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
        <Clock
          size={16}
          className="text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
      </div>
      <span className="flex-1 text-sm text-slate-500 dark:text-slate-400 truncate">
        <HighlightedText text={text} query={query} />
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "shrink-0 flex items-center justify-center",
          "w-6 h-6 rounded-full",
          "opacity-0 group-hover:opacity-100",
          "hover:bg-slate-200 dark:hover:bg-slate-700",
          "transition-all duration-150",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]",
        )}
        aria-label={`Remove "${text}" from recent searches`}
      >
        <X size={12} className="text-slate-400" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function AutocompleteDropdown({
  items,
  selectedIndex,
  onSelect,
  onSeeAll,
  query,
  listboxId = "smart-search-listbox",
}: AutocompleteDropdownProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Group items by type
  const grouped = useMemo(() => {
    const products: AutocompleteItem[] = [];
    const categories: AutocompleteItem[] = [];
    const suggestions: AutocompleteItem[] = [];

    for (const item of items) {
      switch (item.type) {
        case "product":
          if (products.length < MAX_PRODUCT_ITEMS) products.push(item);
          break;
        case "category":
          if (categories.length < MAX_CATEGORY_ITEMS) categories.push(item);
          break;
        case "suggestion":
          if (suggestions.length < MAX_SUGGESTION_ITEMS) suggestions.push(item);
          break;
        // "recent" type from API is grouped with API suggestions
        default:
          if (suggestions.length < MAX_SUGGESTION_ITEMS) suggestions.push(item);
          break;
      }
    }

    return { products, categories, suggestions };
  }, [items]);

  // Show recent searches only when query is short and no API items
  const showRecent = items.length === 0 && recentSearches.length > 0;

  // Build flat list for index tracking
  const flatItems = useMemo(() => {
    const flat: Array<{ item: AutocompleteItem; section: string }> = [];

    // Recent items (as AutocompleteItem-like)
    if (showRecent) {
      recentSearches.forEach((text) => {
        flat.push({
          item: { text, type: "recent" },
          section: "recent",
        });
      });
    }

    grouped.products.forEach((item) =>
      flat.push({ item, section: "product" }),
    );
    grouped.categories.forEach((item) =>
      flat.push({ item, section: "category" }),
    );
    grouped.suggestions.forEach((item) =>
      flat.push({ item, section: "suggestion" }),
    );

    return flat;
  }, [grouped, showRecent, recentSearches]);

  const handleRemoveRecent = useCallback((text: string) => {
    const updated = removeRecentSearch(text);
    setRecentSearches(updated);
  }, []);

  // Track running index
  let runningIndex = 0;

  const hasContent =
    flatItems.length > 0 ||
    grouped.products.length > 0 ||
    grouped.categories.length > 0 ||
    grouped.suggestions.length > 0;

  if (!hasContent && !showRecent) return null;

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "absolute left-0 right-0 top-full mt-2 z-50",
        "bg-white/95 dark:bg-slate-900/95",
        "backdrop-blur-2xl",
        "rounded-2xl",
        "shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/30",
        "border border-white/20 dark:border-slate-700/30",
        "overflow-hidden",
        "max-h-[70vh] overflow-y-auto",
      )}
      role="listbox"
      id={listboxId}
      aria-label="Search suggestions"
    >
      {/* Recent Searches */}
      {showRecent && (
        <div>
          <SectionHeader title="Recent Searches" />
          <ul>
            {recentSearches.map((text) => {
              const idx = runningIndex++;
              return (
                <RecentItem
                  key={`recent-${text}`}
                  text={text}
                  isSelected={selectedIndex === idx}
                  index={idx}
                  query={query}
                  onSelect={() =>
                    onSelect({ text, type: "recent" })
                  }
                  onRemove={() => handleRemoveRecent(text)}
                  listboxId={listboxId}
                />
              );
            })}
          </ul>
        </div>
      )}

      {/* Products */}
      {grouped.products.length > 0 && (
        <div>
          <SectionHeader title="Products" />
          <ul>
            {grouped.products.map((item) => {
              const idx = runningIndex++;
              return (
                <ProductItem
                  key={`product-${item.productId || item.text}`}
                  item={item}
                  isSelected={selectedIndex === idx}
                  index={idx}
                  query={query}
                  onSelect={() => onSelect(item)}
                  listboxId={listboxId}
                />
              );
            })}
          </ul>
        </div>
      )}

      {/* Categories */}
      {grouped.categories.length > 0 && (
        <div>
          <SectionHeader title="Categories" />
          <ul>
            {grouped.categories.map((item) => {
              const idx = runningIndex++;
              return (
                <CategoryItem
                  key={`category-${item.text}`}
                  item={item}
                  isSelected={selectedIndex === idx}
                  index={idx}
                  query={query}
                  onSelect={() => onSelect(item)}
                  listboxId={listboxId}
                />
              );
            })}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {grouped.suggestions.length > 0 && (
        <div>
          <SectionHeader title="Suggestions" />
          <ul>
            {grouped.suggestions.map((item) => {
              const idx = runningIndex++;
              return (
                <SuggestionItem
                  key={`suggestion-${item.text}`}
                  item={item}
                  isSelected={selectedIndex === idx}
                  index={idx}
                  query={query}
                  onSelect={() => onSelect(item)}
                  listboxId={listboxId}
                />
              );
            })}
          </ul>
        </div>
      )}

      {/* Divider + See All Results */}
      {query.length >= 2 && (
        <div className="border-t border-slate-200/60 dark:border-slate-700/40">
          <button
            type="button"
            onClick={onSeeAll}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "flex items-center justify-center gap-2 w-full",
              "px-4 py-3",
              "text-sm font-medium",
              "text-[#1E4DB7] dark:text-blue-400",
              "hover:bg-slate-50 dark:hover:bg-slate-800/50",
              "transition-colors duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E4DB7]",
            )}
          >
            See all results for &ldquo;{query}&rdquo;
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
