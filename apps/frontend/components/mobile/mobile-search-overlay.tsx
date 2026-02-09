"use client";

// =============================================================================
// Mobile Search Overlay
// =============================================================================
// Full-screen search overlay triggered from MobileTopBar. Features: auto-focus,
// recent searches (localStorage), trending items, category quick links,
// live debounced suggestions, spring animations, focus trap, and RTL support.

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Code,
  FileSpreadsheet,
  Presentation,
  Layout,
  BookOpen,
  Palette,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { isRtlLocale, type Locale } from "@/i18n/routing";
import { useFocusTrap } from "@/components/ui/accessibility/focus-trap";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

interface MobileSearchOverlayProps {
  /** Whether the overlay is open */
  isOpen: boolean;
  /** Callback to close the overlay */
  onClose: () => void;
}

interface CategoryItem {
  key: string;
  label: string;
  icon: LucideIcon;
  query: string;
  color: string;
}

// =============================================================================
// Constants
// =============================================================================

const LOCAL_STORAGE_KEY = "vivaexcel_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_MS = 250;

/** Trending search terms (hardcoded for now) */
const TRENDING_SEARCHES = [
  "Excel dashboard templates",
  "Financial model",
  "Project management tracker",
  "Sales pipeline spreadsheet",
  "KPI report template",
];

/** Category quick links with icons */
const CATEGORIES: CategoryItem[] = [
  { key: "code", label: "Code Templates", icon: Code, query: "code templates", color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" },
  { key: "spreadsheet", label: "Spreadsheets", icon: FileSpreadsheet, query: "spreadsheets", color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" },
  { key: "presentation", label: "Presentations", icon: Presentation, query: "presentations", color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400" },
  { key: "web", label: "Web Templates", icon: Layout, query: "web templates", color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400" },
  { key: "ebook", label: "E-Books", icon: BookOpen, query: "ebooks", color: "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400" },
  { key: "design", label: "Design Assets", icon: Palette, query: "design assets", color: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400" },
];

/** Mock product data for live suggestion filtering */
const MOCK_SUGGESTIONS = [
  "Excel Budget Planner 2025",
  "Financial Dashboard Pro",
  "Project Tracker Template",
  "Sales Pipeline Manager",
  "KPI Dashboard Excel",
  "Invoice Generator Template",
  "Gantt Chart Template",
  "HR Employee Tracker",
  "Monthly Budget Spreadsheet",
  "Marketing Calendar Template",
  "Inventory Management Excel",
  "Business Plan Template",
  "Startup Financial Model",
  "Real Estate Investment Tracker",
  "Portfolio Performance Dashboard",
  "Wedding Budget Planner",
  "Meal Prep Planner Spreadsheet",
  "Social Media Analytics Template",
  "E-commerce Product Catalog",
  "Client CRM Spreadsheet",
];

/** Overlay slide-up animation variants */
const OVERLAY_VARIANTS = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

/** Spring transition for the overlay */
const OVERLAY_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/** Stagger children animation */
const STAGGER_CONTAINER = {
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.15,
    },
  },
};

const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Manages recent searches in localStorage.
 */
function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch {
      // Silently ignore parse errors
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase(),
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Quota exceeded or unavailable
      }
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter(
        (s) => s.toLowerCase() !== query.toLowerCase(),
      );
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return { searches, addSearch, removeSearch, clearAll };
}

/**
 * Debounced value hook.
 */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// =============================================================================
// Sub-components
// =============================================================================

/** Search input with icon and cancel */
function SearchInput({
  value,
  onChange,
  onSubmit,
  onClose,
  inputRef,
  isRtl,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isRtl: boolean;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "flex flex-1 items-center gap-2.5",
          "h-12 px-4 rounded-2xl",
          "bg-gray-100 dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "focus-within:border-[#1E4DB7] dark:focus-within:border-blue-400",
          "focus-within:ring-2 focus-within:ring-[#1E4DB7]/20 dark:focus-within:ring-blue-400/20",
          "transition-all duration-200",
        )}
      >
        <Search
          size={20}
          className="text-gray-400 dark:text-gray-500 shrink-0"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search templates, spreadsheets..."
          className={cn(
            "flex-1 bg-transparent",
            "text-base text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "outline-none",
            "font-[var(--font-aptos)]",
            isRtl && "text-right font-[var(--font-noto-arabic)]",
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Search"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className={cn(
          "shrink-0 text-sm font-medium",
          "text-[#1E4DB7] dark:text-blue-400",
          "hover:text-[#143A8F] dark:hover:text-blue-300",
          "transition-colors duration-200",
          "outline-none focus-visible:underline",
          "py-2 px-1",
        )}
      >
        Cancel
      </button>
    </div>
  );
}

/** Recent search chip */
function RecentChip({
  label,
  onSelect,
  onRemove,
}: {
  label: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      variants={STAGGER_ITEM}
      className={cn(
        "inline-flex items-center gap-1.5",
        "h-8 px-3 rounded-full",
        "bg-gray-100 dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "text-sm text-gray-700 dark:text-gray-300",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "transition-colors duration-150",
        "group cursor-pointer",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="outline-none focus-visible:underline truncate max-w-[150px]"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "flex items-center justify-center",
          "w-4 h-4 rounded-full",
          "opacity-60 group-hover:opacity-100",
          "hover:bg-gray-300 dark:hover:bg-gray-600",
          "transition-all duration-150",
          "outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
        )}
        aria-label={`Remove "${label}" from recent searches`}
      >
        <X size={10} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/** Trending search item */
function TrendingItem({
  label,
  index,
  onSelect,
}: {
  label: string;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      variants={STAGGER_ITEM}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 w-full",
        "px-4 py-2.5 rounded-xl",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "group",
      )}
    >
      <TrendingUp
        size={16}
        className="text-[#F59A23] shrink-0"
        aria-hidden="true"
      />
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 text-left truncate">
        {label}
      </span>
      <ArrowUpRight
        size={14}
        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        aria-hidden="true"
      />
    </motion.button>
  );
}

/** Category card in the grid */
function CategoryCard({
  category,
  onSelect,
}: {
  category: CategoryItem;
  onSelect: () => void;
}) {
  const Icon = category.icon;

  return (
    <motion.button
      variants={STAGGER_ITEM}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-2 p-3",
        "rounded-2xl",
        "bg-gray-50 dark:bg-gray-800/50",
        "border border-gray-100 dark:border-gray-700/50",
        "hover:border-gray-200 dark:hover:border-gray-600",
        "hover:shadow-sm",
        "transition-all duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "group",
      )}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          "w-10 h-10 rounded-xl",
          category.color,
          "transition-transform duration-200",
          "group-hover:scale-110",
        )}
      >
        <Icon size={20} aria-hidden="true" />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
        {category.label}
      </span>
    </motion.button>
  );
}

/** Suggestion item shown during typing */
function SuggestionItem({
  text,
  query,
  onSelect,
}: {
  text: string;
  query: string;
  onSelect: () => void;
}) {
  // Highlight the matching portion
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  let rendered: React.ReactNode;
  if (matchIndex >= 0 && query.length > 0) {
    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + query.length);
    const after = text.slice(matchIndex + query.length);
    rendered = (
      <>
        {before}
        <span className="font-semibold text-[#1E4DB7] dark:text-blue-400">{match}</span>
        {after}
      </>
    );
  } else {
    rendered = text;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 w-full",
        "px-4 py-3 rounded-xl",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "text-left",
      )}
    >
      <Search
        size={16}
        className="text-gray-400 shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
        {rendered}
      </span>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const isRtl = isRtlLocale(locale);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searches: recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearches();

  // Focus trap for accessibility
  const { containerRef } = useFocusTrap(isOpen, {
    autoFocus: false,
    restoreFocus: true,
    onEscape: onClose,
  });

  // Auto-focus the input when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow the animation to start before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Reset query when closing
      setQuery("");
    }
  }, [isOpen]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Filter suggestions based on debounced query
  const suggestions = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const lower = debouncedQuery.toLowerCase();
    return MOCK_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(lower),
    ).slice(0, 8);
  }, [debouncedQuery]);

  // Whether to show suggestions vs. the default content
  const showSuggestions = query.length >= 2 && suggestions.length > 0;

  // Navigate to store search
  const performSearch = useCallback(
    (searchQuery?: string) => {
      const term = (searchQuery ?? query).trim();
      if (!term) return;
      addSearch(term);
      router.push(`/store?search=${encodeURIComponent(term)}`);
      onClose();
    },
    [query, addSearch, router, onClose],
  );

  // Handle submit from search input
  const handleSubmit = useCallback(() => {
    performSearch();
  }, [performSearch]);

  // Select a recent, trending, or suggestion item
  const handleSelectItem = useCallback(
    (term: string) => {
      setQuery(term);
      performSearch(term);
    },
    [performSearch],
  );

  // Select a category
  const handleSelectCategory = useCallback(
    (categoryQuery: string) => {
      performSearch(categoryQuery);
    },
    [performSearch],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          key="mobile-search-overlay"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={OVERLAY_SPRING}
          className={cn(
            "fixed inset-0 z-50",
            "flex flex-col",
            "bg-white dark:bg-gray-900",
            // Cover safe areas
            "pt-[env(safe-area-inset-top,0px)]",
            "pb-[env(safe-area-inset-bottom,0px)]",
            "lg:hidden",
          )}
          dir={isRtl ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Search input */}
          <SearchInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            onClose={onClose}
            inputRef={inputRef}
            isRtl={isRtl}
          />

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700/60" aria-hidden="true" />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {showSuggestions ? (
              /* ------ Live Suggestions ------ */
              <div className="py-2">
                <div className="px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Suggestions
                  </span>
                </div>
                {suggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion}
                    text={suggestion}
                    query={query}
                    onSelect={() => handleSelectItem(suggestion)}
                  />
                ))}
              </div>
            ) : (
              /* ------ Default content: Recent, Trending, Categories ------ */
              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="visible"
                className="py-4 space-y-6"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <section className="px-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Recent Searches
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={clearAll}
                        className={cn(
                          "text-xs text-gray-400 hover:text-gray-600",
                          "dark:hover:text-gray-300",
                          "transition-colors duration-150",
                          "outline-none focus-visible:underline",
                        )}
                      >
                        Clear all
                      </button>
                    </div>
                    <motion.div
                      variants={STAGGER_CONTAINER}
                      className="flex flex-wrap gap-2"
                    >
                      {recentSearches.map((search) => (
                        <RecentChip
                          key={search}
                          label={search}
                          onSelect={() => handleSelectItem(search)}
                          onRemove={() => removeSearch(search)}
                        />
                      ))}
                    </motion.div>
                  </section>
                )}

                {/* Trending Searches */}
                <section>
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Trending
                    </h3>
                  </div>
                  <motion.div variants={STAGGER_CONTAINER}>
                    {TRENDING_SEARCHES.map((term, index) => (
                      <TrendingItem
                        key={term}
                        label={term}
                        index={index}
                        onSelect={() => handleSelectItem(term)}
                      />
                    ))}
                  </motion.div>
                </section>

                {/* Category Quick Links */}
                <section className="px-4">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Browse Categories
                  </h3>
                  <motion.div
                    variants={STAGGER_CONTAINER}
                    className="grid grid-cols-3 gap-2.5"
                  >
                    {CATEGORIES.map((category) => (
                      <CategoryCard
                        key={category.key}
                        category={category}
                        onSelect={() => handleSelectCategory(category.query)}
                      />
                    ))}
                  </motion.div>
                </section>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileSearchOverlay;
