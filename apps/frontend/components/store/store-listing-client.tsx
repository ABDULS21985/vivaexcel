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
  Star,
  ChevronDown,
  Tag,
} from "lucide-react";
import type {
  DigitalProduct,
  DigitalProductCategory,
  DigitalProductFilters,
} from "@/types/digital-product";
import {
  DigitalProductType,
  DIGITAL_PRODUCT_TYPE_LABELS,
} from "@/types/digital-product";
import { useDigitalProducts } from "@/hooks/use-digital-products";
import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";

// =============================================================================
// Types
// =============================================================================

interface StoreListingClientProps {
  initialProducts: DigitalProduct[];
  categories: DigitalProductCategory[];
  initialCategorySlug?: string;
}

type SortOption = "newest" | "popular" | "price-asc" | "price-desc" | "top-rated";
type ViewMode = "grid" | "list";

// =============================================================================
// Constants
// =============================================================================

const PRODUCTS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "top-rated", label: "Top Rated" },
];

const RATING_OPTIONS = [
  { value: 4, label: "4+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 2, label: "2+ Stars" },
  { value: 1, label: "1+ Stars" },
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
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

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
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
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
            className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === option.value
                    ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 max-h-[85vh] bg-white dark:bg-neutral-900 z-50 overflow-y-auto shadow-2xl lg:hidden rounded-t-3xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Filters
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
  selectedCategory,
  selectedType,
  minPrice,
  maxPrice,
  selectedRating,
  categories,
  onClearSearch,
  onClearCategory,
  onClearType,
  onClearPrice,
  onClearRating,
  onClearAll,
}: {
  searchQuery: string;
  selectedCategory: string;
  selectedType: string;
  minPrice: string;
  maxPrice: string;
  selectedRating: number;
  categories: DigitalProductCategory[];
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearType: () => void;
  onClearPrice: () => void;
  onClearRating: () => void;
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

  if (selectedCategory) {
    const categoryName =
      categories.find((c) => c.slug === selectedCategory)?.name ||
      selectedCategory;
    chips.push({
      key: "category",
      label: categoryName,
      onRemove: onClearCategory,
    });
  }

  if (selectedType) {
    const typeLabel =
      DIGITAL_PRODUCT_TYPE_LABELS[selectedType as DigitalProductType] ||
      selectedType;
    chips.push({
      key: "type",
      label: typeLabel,
      onRemove: onClearType,
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

  if (selectedRating > 0) {
    chips.push({
      key: "rating",
      label: `${selectedRating}+ Stars`,
      onRemove: onClearRating,
    });
  }

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 mb-6 flex-wrap"
    >
      <Tag className="h-4 w-4 text-neutral-400 flex-shrink-0" />
      {chips.map((chip) => (
        <motion.span
          key={chip.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4DB7] text-white text-xs font-medium rounded-full"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </motion.span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-[#1E4DB7] hover:text-[#143A8F] font-medium transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </motion.div>
  );
}

// =============================================================================
// Scroll To Top
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
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-[#1E4DB7] text-white rounded-full shadow-lg shadow-[#1E4DB7]/30 flex items-center justify-center hover:bg-[#143A8F] transition-colors"
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
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  selectedRating,
  onRatingChange,
  onClearFilters,
  hasActiveFilters,
}: {
  categories: DigitalProductCategory[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  selectedRating: number;
  onRatingChange: (r: number) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 text-sm text-[#1E4DB7] hover:text-[#143A8F] font-medium transition-colors"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Category
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Product Type
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onTypeChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedType === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Types
          </button>
          {Object.entries(DIGITAL_PRODUCT_TYPE_LABELS).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => onTypeChange(value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === value
                    ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 focus:border-[#1E4DB7]"
              min="0"
            />
          </div>
          <span className="text-neutral-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 focus:border-[#1E4DB7]"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onRatingChange(0)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedRating === 0
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Any Rating
          </button>
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRatingChange(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedRating === opt.value
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: opt.value }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function StoreListingClient({
  initialProducts,
  categories,
  initialCategorySlug,
}: StoreListingClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Local UI State
  // ---------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategorySlug || "",
  );
  const [selectedType, setSelectedType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accumulated products for cursor-based "load more"
  const [accumulatedProducts, setAccumulatedProducts] = useState<
    DigitalProduct[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  // Debounce search and price inputs
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // ---------------------------------------------------------------------------
  // Determine if we need to fetch from the backend
  // ---------------------------------------------------------------------------
  const isFiltered =
    selectedCategory !== "" ||
    debouncedSearch.trim() !== "" ||
    sortOption !== "newest" ||
    selectedType !== "" ||
    debouncedMinPrice !== "" ||
    debouncedMaxPrice !== "" ||
    selectedRating > 0;

  const hasActiveFilters =
    selectedCategory !== "" ||
    searchQuery.trim() !== "" ||
    selectedType !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    selectedRating > 0;

  // Build API filters
  const apiFilters: DigitalProductFilters | null = useMemo(() => {
    if (!isFiltered) return null;

    const filters: DigitalProductFilters = {
      limit: PRODUCTS_PER_PAGE,
      status: "published" as any,
    };

    if (selectedCategory) {
      filters.categorySlug = selectedCategory;
    }
    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch.trim();
    }
    if (selectedType) {
      filters.type = selectedType as DigitalProductType;
    }
    if (debouncedMinPrice) {
      filters.minPrice = Number(debouncedMinPrice);
    }
    if (debouncedMaxPrice) {
      filters.maxPrice = Number(debouncedMaxPrice);
    }
    if (selectedRating > 0) {
      filters.minRating = selectedRating;
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
        filters.sortBy = "publishedAt";
        filters.sortOrder = "DESC";
        break;
    }

    return filters;
  }, [
    isFiltered,
    selectedCategory,
    debouncedSearch,
    selectedType,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
    sortOption,
  ]);

  // React Query -- only fires when apiFilters is not null
  const { data: apiData, isLoading: isQueryLoading } =
    useDigitalProducts(apiFilters);

  // Reset accumulated products when filters change
  useEffect(() => {
    if (apiData) {
      setAccumulatedProducts(apiData.items);
      setNextCursor(apiData.meta?.nextCursor ?? undefined);
    }
  }, [apiData]);

  // Reset when switching back to unfiltered
  useEffect(() => {
    if (!isFiltered) {
      setAccumulatedProducts([]);
      setNextCursor(undefined);
    }
  }, [isFiltered]);

  // ---------------------------------------------------------------------------
  // Derive display products
  // ---------------------------------------------------------------------------
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [
    selectedCategory,
    debouncedSearch,
    sortOption,
    selectedType,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
  ]);

  const serverProducts = useMemo(() => {
    return [...initialProducts].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [initialProducts]);

  const displayProducts = isFiltered
    ? accumulatedProducts
    : serverProducts.slice(0, visibleCount);

  const hasMore = isFiltered
    ? !!nextCursor
    : visibleCount < serverProducts.length;

  const totalResults = isFiltered
    ? (apiData?.meta?.total ?? accumulatedProducts.length)
    : serverProducts.length;

  const isLoadingResults = isFiltered && isQueryLoading;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLoadMore = useCallback(async () => {
    if (isFiltered && nextCursor) {
      setLoadMoreLoading(true);
      try {
        const { apiGet } = await import("@/lib/api-client");
        const params: Record<
          string,
          string | number | boolean | undefined
        > = {
          cursor: nextCursor,
          limit: PRODUCTS_PER_PAGE,
          status: "published",
        };
        if (selectedCategory) params.categorySlug = selectedCategory;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedType) params.type = selectedType;
        if (debouncedMinPrice) params.minPrice = Number(debouncedMinPrice);
        if (debouncedMaxPrice) params.maxPrice = Number(debouncedMaxPrice);
        if (selectedRating > 0) params.minRating = selectedRating;

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
            params.sortBy = "publishedAt";
            params.sortOrder = "DESC";
            break;
        }

        const res = await apiGet<any>("/digital-products", params);
        const newItems: DigitalProduct[] =
          res?.data?.items ?? res?.items ?? [];
        const newCursor =
          res?.meta?.nextCursor ??
          res?.data?.meta?.nextCursor ??
          undefined;

        setAccumulatedProducts((prev) => [...prev, ...newItems]);
        setNextCursor(newCursor);
      } catch (error) {
        console.error("[StoreListingClient] Load more failed:", error);
      } finally {
        setLoadMoreLoading(false);
      }
    } else {
      setLoadMoreLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
        setLoadMoreLoading(false);
      }, 300);
    }
  }, [
    isFiltered,
    nextCursor,
    selectedCategory,
    debouncedSearch,
    selectedType,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
    sortOption,
  ]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortOption("newest");
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(0);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleCategoryChange = useCallback((slug: string) => {
    setSelectedCategory(slug);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleRatingChange = useCallback((rating: number) => {
    setSelectedRating(rating);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortOption(sort);
    setAccumulatedProducts([]);
    setNextCursor(undefined);
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, []);

  // ---------------------------------------------------------------------------
  // IntersectionObserver for infinite scroll
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingResults || loadMoreLoading) return;

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
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );

  return (
    <div ref={gridRef} className="w-full">
      {/* Top Bar: Search + Sort + View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 focus:border-[#1E4DB7] transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
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
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#1E4DB7] rounded-full" />
            )}
          </button>

          {/* Sort Dropdown */}
          <SortDropdown value={sortOption} onChange={handleSortChange} />

          {/* View Toggle */}
          <div className="hidden md:flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
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
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedRating={selectedRating}
            categories={categories}
            onClearSearch={() => handleSearchChange("")}
            onClearCategory={() => handleCategoryChange("")}
            onClearType={() => handleTypeChange("")}
            onClearPrice={() => {
              setMinPrice("");
              setMaxPrice("");
              setAccumulatedProducts([]);
              setNextCursor(undefined);
              setVisibleCount(PRODUCTS_PER_PAGE);
            }}
            onClearRating={() => handleRatingChange(0)}
            onClearAll={handleClearFilters}
          />
        )}
      </AnimatePresence>

      {/* Results count with aria-live for accessibility */}
      <div aria-live="polite" className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {isLoadingResults ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </span>
          ) : (
            `${totalResults} ${totalResults === 1 ? "product" : "products"} found`
          )}
        </span>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
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

        {/* Products Area */}
        <div className="flex-1 min-w-0">
          {isLoadingResults ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              {/* Product Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                <AnimatePresence mode="popLayout">
                  {displayProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Infinite Scroll Sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-12 py-8">
                  {loadMoreLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-[#1E4DB7]" />
                      <span className="text-sm font-medium">Loading more products...</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Showing Count */}
              <div className="flex justify-center mt-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {displayProducts.length} of {totalResults} products
                </p>
              </div>
            </>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Search className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "We could not find any products matching your filters. Try adjusting your search criteria or browse all products."
                  : "No products are currently available. Check back soon for new additions."}
              </p>
              {hasActiveFilters && (
                <motion.button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] text-white rounded-xl font-medium hover:bg-[#143A8F] transition-colors shadow-md shadow-[#1E4DB7]/20"
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

export default StoreListingClient;
