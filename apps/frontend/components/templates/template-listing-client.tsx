"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Loader2,
  ChevronUp,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronDown,
  Tag,
} from "lucide-react";
import {
  useWebTemplates,
  useTemplateCategories,
} from "@/hooks/use-web-templates";
import type {
  WebTemplate,
  WebTemplateFilters,
  TemplateCategory,
} from "@/types/web-template";
import {
  TemplateType,
  Framework,
  TEMPLATE_TYPE_LABELS,
  FRAMEWORK_LABELS,
  FRAMEWORK_COLORS,
  TEMPLATE_FEATURES,
} from "@/types/web-template";
import { TemplateCard } from "./template-card";

// =============================================================================
// Types
// =============================================================================

interface TemplateListingClientProps {
  initialTemplates?: WebTemplate[];
  initialTotal?: number;
  categories?: TemplateCategory[];
}

type SortOption =
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "top-rated";
type ViewMode = "grid" | "list";

// =============================================================================
// Constants
// =============================================================================

const TEMPLATES_PER_PAGE = 24;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "top-rated", label: "Top Rated" },
];

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// =============================================================================
// Debounce Hook
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// Skeleton Card
// =============================================================================

function TemplateCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-700" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
          <div className="h-6 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sort Dropdown
// =============================================================================

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {currentLabel}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                    : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Mobile Filter Bottom Sheet
// =============================================================================

function MobileFilterSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 lg:hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            </div>
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 pb-4 dark:border-neutral-700">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Filters
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-5 pb-safe">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Active Filter Chips
// =============================================================================

function ActiveFilterChips({
  searchQuery,
  selectedType,
  selectedFramework,
  selectedFeatures,
  minPrice,
  maxPrice,
  onClearSearch,
  onClearType,
  onClearFramework,
  onClearFeature,
  onClearPrice,
  onClearAll,
}: {
  searchQuery: string;
  selectedType: string;
  selectedFramework: string;
  selectedFeatures: string[];
  minPrice: string;
  maxPrice: string;
  onClearSearch: () => void;
  onClearType: () => void;
  onClearFramework: () => void;
  onClearFeature: (feature: string) => void;
  onClearPrice: () => void;
  onClearAll: () => void;
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (searchQuery.trim()) {
    chips.push({
      key: "search",
      label: `"${searchQuery.trim()}"`,
      onRemove: onClearSearch,
    });
  }

  if (selectedType) {
    const typeLabel =
      TEMPLATE_TYPE_LABELS[selectedType as TemplateType] || selectedType;
    chips.push({
      key: "type",
      label: typeLabel,
      onRemove: onClearType,
    });
  }

  if (selectedFramework) {
    const fwLabel =
      FRAMEWORK_LABELS[selectedFramework as Framework] || selectedFramework;
    chips.push({
      key: "framework",
      label: fwLabel,
      onRemove: onClearFramework,
    });
  }

  for (const feature of selectedFeatures) {
    chips.push({
      key: `feature-${feature}`,
      label: feature,
      onRemove: () => onClearFeature(feature),
    });
  }

  if (minPrice || maxPrice) {
    const priceLabel =
      minPrice && maxPrice
        ? `$${minPrice} - $${maxPrice}`
        : minPrice
          ? `From $${minPrice}`
          : `Up to $${maxPrice}`;
    chips.push({
      key: "price",
      label: priceLabel,
      onRemove: onClearPrice,
    });
  }

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      <Tag className="h-4 w-4 flex-shrink-0 text-neutral-400" />
      {chips.map((chip) => (
        <motion.span
          key={chip.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1E4DB7] px-3 py-1.5 text-xs font-medium text-white"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </motion.span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="ml-1 text-xs font-medium text-[#1E4DB7] transition-colors hover:text-[#143A8F]"
        >
          Clear all
        </button>
      )}
    </motion.div>
  );
}

// =============================================================================
// Scroll To Top Button
// =============================================================================

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E4DB7] text-white shadow-lg shadow-[#1E4DB7]/30 transition-colors hover:bg-[#143A8F]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Filter Sidebar Content
// =============================================================================

function FilterContent({
  categories,
  selectedType,
  onTypeChange,
  selectedFramework,
  onFrameworkChange,
  selectedFeatures,
  onFeatureToggle,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
  hasActiveFilters,
}: {
  categories: TemplateCategory[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedFramework: string;
  onFrameworkChange: (fw: string) => void;
  selectedFeatures: string[];
  onFeatureToggle: (feature: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 text-sm font-medium text-[#1E4DB7] transition-colors hover:text-[#143A8F]"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}

      {/* Template Type Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Template Type
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onTypeChange("")}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selectedType === ""
                ? "bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            All Types
          </button>
          {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => onTypeChange(value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedType === value
                  ? "bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Framework Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Framework
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onFrameworkChange("")}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selectedFramework === ""
                ? "bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            All Frameworks
          </button>
          {Object.entries(FRAMEWORK_LABELS).map(([value, label]) => {
            const color = FRAMEWORK_COLORS[value as Framework] || "#6B7280";
            return (
              <button
                key={value}
                onClick={() => onFrameworkChange(value)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedFramework === value
                    ? "bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_FEATURES.map((feature) => (
            <button
              key={feature}
              onClick={() => onFeatureToggle(feature)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                selectedFeatures.includes(feature)
                  ? "border-[#1E4DB7] bg-[#1E4DB7]/10 font-semibold text-[#1E4DB7] dark:text-blue-400"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-7 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1E4DB7] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              min="0"
            />
          </div>
          <span className="text-neutral-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-7 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1E4DB7] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TemplateListingClient({
  initialTemplates = [],
  initialTotal = 0,
  categories: serverCategories = [],
}: TemplateListingClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Local UI State
  // ---------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accumulated templates for cursor-based "load more"
  const [accumulatedTemplates, setAccumulatedTemplates] = useState<
    WebTemplate[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  // Debounce search and price inputs
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // Fetch categories from hook (falls back to server data)
  const { data: hookCategories } = useTemplateCategories();
  const categories = hookCategories ?? serverCategories;

  // ---------------------------------------------------------------------------
  // Determine if we need to fetch from the backend
  // ---------------------------------------------------------------------------
  const isFiltered =
    debouncedSearch.trim() !== "" ||
    sortOption !== "newest" ||
    selectedType !== "" ||
    selectedFramework !== "" ||
    selectedFeatures.length > 0 ||
    debouncedMinPrice !== "" ||
    debouncedMaxPrice !== "";

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedType !== "" ||
    selectedFramework !== "" ||
    selectedFeatures.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "";

  // Build API filters
  const apiFilters: WebTemplateFilters | null = useMemo(() => {
    if (!isFiltered) return null;

    const filters: WebTemplateFilters = {
      limit: TEMPLATES_PER_PAGE,
    };

    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch.trim();
    }
    if (selectedType) {
      filters.templateType = selectedType as TemplateType;
    }
    if (selectedFramework) {
      filters.framework = selectedFramework as Framework;
    }
    if (selectedFeatures.length > 0) {
      filters.features = selectedFeatures;
    }
    if (debouncedMinPrice) {
      filters.minPrice = Number(debouncedMinPrice);
    }
    if (debouncedMaxPrice) {
      filters.maxPrice = Number(debouncedMaxPrice);
    }

    // Map sort options to backend parameters
    switch (sortOption) {
      case "popular":
        filters.sortBy = "downloadCount";
        filters.sortOrder = "DESC";
        break;
      case "price-asc":
        filters.sortBy = "price";
        filters.sortOrder = "ASC";
        break;
      case "price-desc":
        filters.sortBy = "price";
        filters.sortOrder = "DESC";
        break;
      case "top-rated":
        filters.sortBy = "averageRating";
        filters.sortOrder = "DESC";
        break;
      default:
        // "newest"
        filters.sortBy = "createdAt";
        filters.sortOrder = "DESC";
        break;
    }

    return filters;
  }, [
    isFiltered,
    debouncedSearch,
    selectedType,
    selectedFramework,
    selectedFeatures,
    debouncedMinPrice,
    debouncedMaxPrice,
    sortOption,
  ]);

  // React Query -- only fires when apiFilters is not null
  const { data: apiData, isLoading: isQueryLoading } =
    useWebTemplates(apiFilters);

  // Reset accumulated templates when API data changes
  useEffect(() => {
    if (apiData) {
      setAccumulatedTemplates(apiData.items);
      setNextCursor(apiData.meta?.nextCursor ?? undefined);
    }
  }, [apiData]);

  // Reset when switching back to unfiltered
  useEffect(() => {
    if (!isFiltered) {
      setAccumulatedTemplates([]);
      setNextCursor(undefined);
    }
  }, [isFiltered]);

  // ---------------------------------------------------------------------------
  // Derive display templates
  // ---------------------------------------------------------------------------
  const [visibleCount, setVisibleCount] = useState(TEMPLATES_PER_PAGE);

  useEffect(() => {
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, [
    debouncedSearch,
    sortOption,
    selectedType,
    selectedFramework,
    selectedFeatures,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  const serverTemplates = useMemo(() => {
    return [...initialTemplates].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [initialTemplates]);

  const displayTemplates = isFiltered
    ? accumulatedTemplates
    : serverTemplates.slice(0, visibleCount);

  const hasMore = isFiltered
    ? !!nextCursor
    : visibleCount < serverTemplates.length;

  const totalResults = isFiltered
    ? (apiData?.meta?.total ?? accumulatedTemplates.length)
    : initialTotal;

  const isLoadingResults = isFiltered && isQueryLoading;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLoadMore = useCallback(async () => {
    if (isFiltered && nextCursor) {
      setLoadMoreLoading(true);
      try {
        const { apiGet } = await import("@/lib/api-client");
        const params: Record<string, string | number | boolean | undefined> = {
          cursor: nextCursor,
          limit: TEMPLATES_PER_PAGE,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedType) params.templateType = selectedType;
        if (selectedFramework) params.framework = selectedFramework;
        if (selectedFeatures.length > 0)
          params.features = selectedFeatures.join(",");
        if (debouncedMinPrice) params.minPrice = Number(debouncedMinPrice);
        if (debouncedMaxPrice) params.maxPrice = Number(debouncedMaxPrice);

        switch (sortOption) {
          case "popular":
            params.sortBy = "downloadCount";
            params.sortOrder = "DESC";
            break;
          case "price-asc":
            params.sortBy = "price";
            params.sortOrder = "ASC";
            break;
          case "price-desc":
            params.sortBy = "price";
            params.sortOrder = "DESC";
            break;
          case "top-rated":
            params.sortBy = "averageRating";
            params.sortOrder = "DESC";
            break;
          default:
            params.sortBy = "createdAt";
            params.sortOrder = "DESC";
            break;
        }

        const res = await apiGet<any>("/templates", params);
        const newItems: WebTemplate[] =
          res?.data?.items ?? res?.items ?? [];
        const newCursor =
          res?.meta?.nextCursor ??
          res?.data?.meta?.nextCursor ??
          undefined;

        setAccumulatedTemplates((prev) => [...prev, ...newItems]);
        setNextCursor(newCursor);
      } catch (error) {
        console.error("[TemplateListingClient] Load more failed:", error);
      } finally {
        setLoadMoreLoading(false);
      }
    } else {
      setLoadMoreLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + TEMPLATES_PER_PAGE);
        setLoadMoreLoading(false);
      }, 300);
    }
  }, [
    isFiltered,
    nextCursor,
    debouncedSearch,
    selectedType,
    selectedFramework,
    selectedFeatures,
    debouncedMinPrice,
    debouncedMaxPrice,
    sortOption,
  ]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSortOption("newest");
    setSelectedType("");
    setSelectedFramework("");
    setSelectedFeatures([]);
    setMinPrice("");
    setMaxPrice("");
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  const handleFrameworkChange = useCallback((fw: string) => {
    setSelectedFramework(fw);
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  const handleFeatureToggle = useCallback((feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortOption(sort);
    setAccumulatedTemplates([]);
    setNextCursor(undefined);
    setVisibleCount(TEMPLATES_PER_PAGE);
  }, []);

  // ---------------------------------------------------------------------------
  // Listen for hero search & framework pill custom events
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onHeroSearch = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") {
        handleSearchChange(detail);
      }
    };
    const onHeroFramework = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") {
        handleFrameworkChange(detail);
      }
    };

    window.addEventListener("template-search", onHeroSearch);
    window.addEventListener("template-filter-framework", onHeroFramework);
    return () => {
      window.removeEventListener("template-search", onHeroSearch);
      window.removeEventListener("template-filter-framework", onHeroFramework);
    };
  }, [handleSearchChange, handleFrameworkChange]);

  // ---------------------------------------------------------------------------
  // IntersectionObserver for infinite scroll
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      !sentinelRef.current ||
      !hasMore ||
      isLoadingResults ||
      loadMoreLoading
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingResults, loadMoreLoading, handleLoadMore]);

  // ---------------------------------------------------------------------------
  // Filter sidebar content (shared between desktop sidebar & mobile sheet)
  // ---------------------------------------------------------------------------
  const filterContent = (
    <FilterContent
      categories={categories}
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      selectedFramework={selectedFramework}
      onFrameworkChange={handleFrameworkChange}
      selectedFeatures={selectedFeatures}
      onFeatureToggle={handleFeatureToggle}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );

  return (
    <div ref={gridRef} className="w-full">
      {/* Top Bar: Search + Sort + View Toggle */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-[#1E4DB7] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 lg:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#1E4DB7]" />
            )}
          </button>

          {/* Sort Dropdown */}
          <SortDropdown value={sortOption} onChange={handleSortChange} />

          {/* View Toggle */}
          <div className="hidden items-center overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 md:flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#1E4DB7] text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${
                viewMode === "list"
                  ? "bg-[#1E4DB7] text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <ActiveFilterChips
            searchQuery={searchQuery}
            selectedType={selectedType}
            selectedFramework={selectedFramework}
            selectedFeatures={selectedFeatures}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onClearSearch={() => handleSearchChange("")}
            onClearType={() => handleTypeChange("")}
            onClearFramework={() => handleFrameworkChange("")}
            onClearFeature={(feature) => handleFeatureToggle(feature)}
            onClearPrice={() => {
              setMinPrice("");
              setMaxPrice("");
              setAccumulatedTemplates([]);
              setNextCursor(undefined);
              setVisibleCount(TEMPLATES_PER_PAGE);
            }}
            onClearAll={handleClearFilters}
          />
        )}
      </AnimatePresence>

      {/* Results count with aria-live for accessibility */}
      <div
        aria-live="polite"
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {isLoadingResults ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </span>
          ) : (
            `${totalResults} ${totalResults === 1 ? "template" : "templates"} found`
          )}
        </span>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {filterContent}
          </div>
        </aside>

        {/* Mobile Filter Bottom Sheet */}
        <MobileFilterSheet
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        >
          {filterContent}
        </MobileFilterSheet>

        {/* Templates Area */}
        <div className="min-w-0 flex-1">
          {isLoadingResults ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : displayTemplates.length > 0 ? (
            <>
              {/* Template Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    : "flex flex-col gap-4"
                }
              >
                <AnimatePresence mode="popLayout">
                  {displayTemplates.map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Infinite Scroll Sentinel */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="mt-12 flex justify-center py-8"
                >
                  {loadMoreLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-[#1E4DB7]" />
                      <span className="text-sm font-medium">
                        Loading more templates...
                      </span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Showing Count */}
              <div className="mt-8 flex justify-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {displayTemplates.length} of {totalResults} templates
                </p>
              </div>
            </>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Search className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                No templates found
              </h3>
              <p className="mx-auto mb-6 max-w-md text-neutral-600 dark:text-neutral-400">
                {hasActiveFilters
                  ? "We could not find any templates matching your filters. Try adjusting your search criteria or browse all templates."
                  : "No templates are currently available. Check back soon for new additions."}
              </p>
              {hasActiveFilters && (
                <motion.button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1E4DB7] px-6 py-3 font-medium text-white shadow-md shadow-[#1E4DB7]/20 transition-colors hover:bg-[#143A8F]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll To Top */}
      <ScrollToTopButton />
    </div>
  );
}

export default TemplateListingClient;
