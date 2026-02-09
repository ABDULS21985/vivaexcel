"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Loader2,
  ChevronUp,
  SlidersHorizontal,
  ChevronDown,
  FileText,
} from "lucide-react";
import type {
  SolutionDocument,
  SolutionDocumentQueryParams,
  Domain,
  DocumentType,
  MaturityLevel,
} from "@/types/solution-document";
import {
  Domain as DomainEnum,
  DocumentType as DocumentTypeEnum,
  MaturityLevel as MaturityLevelEnum,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  MATURITY_LEVEL_LABELS,
} from "@/types/solution-document";
import { useSolutionDocuments } from "@/hooks/use-solution-documents";
import { DocumentCard } from "./document-card";

// =============================================================================
// Types
// =============================================================================

interface SolutionsListingClientProps {
  initialDocuments: SolutionDocument[];
  totalCount: number;
}

type SortOption =
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "freshness";

// =============================================================================
// Constants
// =============================================================================

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "freshness", label: "Freshness Score" },
];

const ALL_DOMAINS = Object.values(DomainEnum);
const ALL_TYPES = Object.values(DocumentTypeEnum);
const ALL_MATURITY_LEVELS = Object.values(MaturityLevelEnum);

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
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
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
// Mobile Filter Panel
// =============================================================================

function MobileFilterPanel({
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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-neutral-900 z-50 overflow-y-auto shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
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
            <div className="p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Scroll To Top Button
// =============================================================================

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 800);
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
  selectedDomain,
  onDomainChange,
  selectedType,
  onTypeChange,
  selectedMaturity,
  onMaturityChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  hasEditableDiagrams,
  onEditableDiagramsToggle,
  onClearFilters,
  hasActiveFilters,
}: {
  selectedDomain: string;
  onDomainChange: (v: string) => void;
  selectedType: string;
  onTypeChange: (v: string) => void;
  selectedMaturity: string;
  onMaturityChange: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  hasEditableDiagrams: boolean;
  onEditableDiagramsToggle: () => void;
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

      {/* Domain Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Domain
        </h3>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          <button
            onClick={() => onDomainChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedDomain === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Domains
          </button>
          {ALL_DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => onDomainChange(domain)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedDomain === domain
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{DOMAIN_ICONS[domain]}</span>
              {DOMAIN_LABELS[domain]}
            </button>
          ))}
        </div>
      </div>

      {/* Document Type Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Document Type
        </h3>
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
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
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedType === type
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{DOCUMENT_TYPE_ICONS[type]}</span>
              {DOCUMENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Maturity Level Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Maturity Level
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onMaturityChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedMaturity === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Levels
          </button>
          {ALL_MATURITY_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => onMaturityChange(level)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedMaturity === level
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {MATURITY_LEVEL_LABELS[level]}
            </button>
          ))}
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

      {/* Editable Diagrams Toggle */}
      <div>
        <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <input
            type="checkbox"
            checked={hasEditableDiagrams}
            onChange={onEditableDiagramsToggle}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#1E4DB7] focus:ring-[#1E4DB7]/20"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Editable Diagrams Only
          </span>
        </label>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function SolutionsListingClient({
  initialDocuments,
  totalCount,
}: SolutionsListingClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMaturity, setSelectedMaturity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [hasEditableDiagrams, setHasEditableDiagrams] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accumulated items for cursor-based load more
  const [accumulatedDocuments, setAccumulatedDocuments] = useState<
    SolutionDocument[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  // Debounce
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // Determine if filtering is active
  const hasActiveFilters =
    selectedDomain !== "" ||
    searchQuery.trim() !== "" ||
    selectedType !== "" ||
    selectedMaturity !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    hasEditableDiagrams;

  const isFiltered = hasActiveFilters || sortOption !== "newest";

  // Build API filters
  const apiFilters: SolutionDocumentQueryParams | null = useMemo(() => {
    if (!isFiltered) return null;

    const filters: SolutionDocumentQueryParams = {
      limit: ITEMS_PER_PAGE,
    };

    if (selectedDomain) filters.domain = selectedDomain as Domain;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    if (selectedType) filters.documentType = selectedType as DocumentType;
    if (selectedMaturity) filters.maturityLevel = selectedMaturity as MaturityLevel;
    if (debouncedMinPrice) filters.minPrice = Number(debouncedMinPrice);
    if (debouncedMaxPrice) filters.maxPrice = Number(debouncedMaxPrice);
    if (hasEditableDiagrams) filters.hasEditableDiagrams = true;

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
      case "freshness":
        filters.sortBy = "freshnessScore";
        filters.sortOrder = "DESC";
        break;
      default:
        filters.sortBy = "updatedAt";
        filters.sortOrder = "DESC";
        break;
    }

    return filters;
  }, [
    isFiltered,
    selectedDomain,
    debouncedSearch,
    selectedType,
    selectedMaturity,
    debouncedMinPrice,
    debouncedMaxPrice,
    hasEditableDiagrams,
    sortOption,
  ]);

  // React Query
  const { data: apiData, isLoading: isQueryLoading } =
    useSolutionDocuments(apiFilters);

  // Reset accumulated when filters change
  useEffect(() => {
    if (apiData) {
      setAccumulatedDocuments(apiData.items);
      setNextCursor(apiData.meta?.nextCursor ?? undefined);
    }
  }, [apiData]);

  useEffect(() => {
    if (!isFiltered) {
      setAccumulatedDocuments([]);
      setNextCursor(undefined);
    }
  }, [isFiltered]);

  // Display documents
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [
    selectedDomain,
    debouncedSearch,
    sortOption,
    selectedType,
    selectedMaturity,
    debouncedMinPrice,
    debouncedMaxPrice,
    hasEditableDiagrams,
  ]);

  const serverDocuments = useMemo(() => {
    return [...initialDocuments].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [initialDocuments]);

  const displayDocuments = isFiltered
    ? accumulatedDocuments
    : serverDocuments.slice(0, visibleCount);

  const hasMore = isFiltered
    ? !!nextCursor
    : visibleCount < serverDocuments.length;

  const totalResults = isFiltered
    ? (apiData?.meta?.total ?? accumulatedDocuments.length)
    : serverDocuments.length;

  const isLoadingResults = isFiltered && isQueryLoading;

  // Handlers
  const handleLoadMore = useCallback(async () => {
    if (isFiltered && nextCursor) {
      setLoadMoreLoading(true);
      try {
        const { apiGet } = await import("@/lib/api-client");
        const params: Record<string, string | number | boolean | undefined> = {
          cursor: nextCursor,
          limit: ITEMS_PER_PAGE,
        };
        if (selectedDomain) params.domain = selectedDomain;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedType) params.documentType = selectedType;
        if (selectedMaturity) params.maturityLevel = selectedMaturity;
        if (debouncedMinPrice) params.minPrice = Number(debouncedMinPrice);
        if (debouncedMaxPrice) params.maxPrice = Number(debouncedMaxPrice);
        if (hasEditableDiagrams) params.hasEditableDiagrams = true;

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
          case "freshness":
            params.sortBy = "freshnessScore";
            params.sortOrder = "DESC";
            break;
          default:
            params.sortBy = "updatedAt";
            params.sortOrder = "DESC";
            break;
        }

        const res = await apiGet<any>("/solution-documents", params);
        const newItems: SolutionDocument[] =
          res?.data?.items ?? res?.items ?? [];
        const newCursor =
          res?.meta?.nextCursor ??
          res?.data?.meta?.nextCursor ??
          undefined;

        setAccumulatedDocuments((prev) => [...prev, ...newItems]);
        setNextCursor(newCursor);
      } catch (error) {
        console.error(
          "[SolutionsListingClient] Load more failed:",
          error,
        );
      } finally {
        setLoadMoreLoading(false);
      }
    } else {
      setLoadMoreLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        setLoadMoreLoading(false);
      }, 300);
    }
  }, [
    isFiltered,
    nextCursor,
    selectedDomain,
    debouncedSearch,
    selectedType,
    selectedMaturity,
    debouncedMinPrice,
    debouncedMaxPrice,
    hasEditableDiagrams,
    sortOption,
  ]);

  const resetPagination = useCallback(() => {
    setAccumulatedDocuments([]);
    setNextCursor(undefined);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedDomain("");
    setSearchQuery("");
    setSortOption("newest");
    setSelectedType("");
    setSelectedMaturity("");
    setMinPrice("");
    setMaxPrice("");
    setHasEditableDiagrams(false);
    resetPagination();
  }, [resetPagination]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      resetPagination();
    },
    [resetPagination],
  );

  // Filter sidebar content
  const filterContent = (
    <FilterContent
      selectedDomain={selectedDomain}
      onDomainChange={(v) => {
        setSelectedDomain(v);
        resetPagination();
      }}
      selectedType={selectedType}
      onTypeChange={(v) => {
        setSelectedType(v);
        resetPagination();
      }}
      selectedMaturity={selectedMaturity}
      onMaturityChange={(v) => {
        setSelectedMaturity(v);
        resetPagination();
      }}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      hasEditableDiagrams={hasEditableDiagrams}
      onEditableDiagramsToggle={() => {
        setHasEditableDiagrams(!hasEditableDiagrams);
        resetPagination();
      }}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );

  return (
    <div ref={gridRef} className="w-full">
      {/* Top Bar: Search + Sort */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search solution documents..."
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

          <SortDropdown
            value={sortOption}
            onChange={(v) => {
              setSortOption(v);
              resetPagination();
            }}
          />
        </div>
      </div>

      {/* Results Count + Active Filters */}
      {(hasActiveFilters || isLoadingResults) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-6 flex-wrap"
        >
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {isLoadingResults ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                {totalResults}{" "}
                {totalResults === 1 ? "document" : "documents"} found
              </>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-sm text-[#1E4DB7] hover:text-[#143A8F] font-medium transition-colors"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
            {filterContent}
          </div>
        </aside>

        {/* Mobile Filter Panel */}
        <MobileFilterPanel
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        >
          {filterContent}
        </MobileFilterPanel>

        {/* Documents Grid */}
        <div className="flex-1 min-w-0">
          {isLoadingResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="h-10 w-10 text-[#1E4DB7] animate-spin mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading documents...
              </p>
            </motion.div>
          ) : displayDocuments.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {displayDocuments.map((doc, index) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-12"
                >
                  <motion.button
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:border-[#1E4DB7] hover:text-[#1E4DB7] hover:shadow-lg hover:shadow-[#1E4DB7]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loadMoreLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Documents</span>
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 group-hover:bg-[#1E4DB7]/10 rounded-lg text-xs font-semibold transition-colors">
                          {Math.max(
                            0,
                            totalResults - displayDocuments.length,
                          )}{" "}
                          remaining
                        </span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              <div className="flex justify-center mt-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {displayDocuments.length} of {totalResults}{" "}
                  documents
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <FileText className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "We could not find any solution documents matching your filters. Try adjusting your criteria or browse all documents."
                  : "No solution documents are currently available. Check back soon for new additions."}
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

      <ScrollToTopButton />
    </div>
  );
}

export default SolutionsListingClient;
