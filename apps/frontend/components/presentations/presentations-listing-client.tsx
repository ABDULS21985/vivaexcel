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
  Star,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRightLeft,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import type {
  Presentation,
  PresentationQueryParams,
  Industry,
  PresentationType,
  AspectRatio,
} from "@/types/presentation";
import {
  Industry as IndustryEnum,
  PresentationType as PresentationTypeEnum,
  AspectRatio as AspectRatioEnum,
  INDUSTRY_LABELS,
  INDUSTRY_ICONS,
  PRESENTATION_TYPE_LABELS,
  ASPECT_RATIO_LABELS,
} from "@/types/presentation";
import { usePresentations } from "@/hooks/use-presentations";
import { PresentationCard } from "@/components/presentations/presentation-card";

// =============================================================================
// Types
// =============================================================================

interface PresentationsListingClientProps {
  initialPresentations: Presentation[];
  totalCount: number;
}

type SortOption =
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "most-slides";

// =============================================================================
// Constants
// =============================================================================

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "most-slides", label: "Most Slides" },
];

const RATING_OPTIONS = [
  { value: 4, label: "4+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 2, label: "2+ Stars" },
];

const ALL_INDUSTRIES = Object.values(IndustryEnum);
const ALL_TYPES = Object.values(PresentationTypeEnum);
const ALL_ASPECT_RATIOS = Object.values(AspectRatioEnum);

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
  selectedIndustry,
  onIndustryChange,
  selectedType,
  onTypeChange,
  selectedAspectRatio,
  onAspectRatioChange,
  minSlides,
  maxSlides,
  onMinSlidesChange,
  onMaxSlidesChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  selectedRating,
  onRatingChange,
  featureFilters,
  onFeatureToggle,
  onClearFilters,
  hasActiveFilters,
}: {
  selectedIndustry: string;
  onIndustryChange: (v: string) => void;
  selectedType: string;
  onTypeChange: (v: string) => void;
  selectedAspectRatio: string;
  onAspectRatioChange: (v: string) => void;
  minSlides: string;
  maxSlides: string;
  onMinSlidesChange: (v: string) => void;
  onMaxSlidesChange: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  selectedRating: number;
  onRatingChange: (r: number) => void;
  featureFilters: Record<string, boolean>;
  onFeatureToggle: (key: string) => void;
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

      {/* Industry Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Industry
        </h3>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          <button
            onClick={() => onIndustryChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedIndustry === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Industries
          </button>
          {ALL_INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => onIndustryChange(industry)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedIndustry === industry
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{INDUSTRY_ICONS[industry]}</span>
              {INDUSTRY_LABELS[industry]}
            </button>
          ))}
        </div>
      </div>

      {/* Presentation Type Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Presentation Type
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
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedType === type
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {PRESENTATION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Filter */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Aspect Ratio
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onAspectRatioChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedAspectRatio === ""
                ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Any Ratio
          </button>
          {ALL_ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              onClick={() => onAspectRatioChange(ratio)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedAspectRatio === ratio
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {ASPECT_RATIO_LABELS[ratio]}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Count Range */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Slide Count
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minSlides}
            onChange={(e) => onMinSlidesChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 focus:border-[#1E4DB7]"
            min="1"
          />
          <span className="text-neutral-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxSlides}
            onChange={(e) => onMaxSlidesChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/20 focus:border-[#1E4DB7]"
            min="1"
          />
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

      {/* Feature Filters */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Features
        </h3>
        <div className="space-y-2">
          {[
            {
              key: "hasAnimations",
              label: "Animations",
              icon: <Sparkles className="h-4 w-4" />,
            },
            {
              key: "hasTransitions",
              label: "Transitions",
              icon: <ArrowRightLeft className="h-4 w-4" />,
            },
            {
              key: "hasSpeakerNotes",
              label: "Speaker Notes",
              icon: <MessageSquareText className="h-4 w-4" />,
            },
            {
              key: "hasCharts",
              label: "Charts & Graphs",
              icon: <BarChart3 className="h-4 w-4" />,
            },
          ].map((feature) => (
            <label
              key={feature.key}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={featureFilters[feature.key] || false}
                onChange={() => onFeatureToggle(feature.key)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#1E4DB7] focus:ring-[#1E4DB7]/20"
              />
              <div className="text-neutral-500 dark:text-neutral-400">
                {feature.icon}
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {feature.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PresentationsListingClient({
  initialPresentations,
  totalCount,
}: PresentationsListingClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("");
  const [minSlides, setMinSlides] = useState("");
  const [maxSlides, setMaxSlides] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [featureFilters, setFeatureFilters] = useState<
    Record<string, boolean>
  >({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accumulated items for cursor-based load more
  const [accumulatedPresentations, setAccumulatedPresentations] = useState<
    Presentation[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  // Debounce
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const debouncedMinSlides = useDebounce(minSlides, 500);
  const debouncedMaxSlides = useDebounce(maxSlides, 500);

  // Determine if filtering is active
  const hasActiveFilters =
    selectedIndustry !== "" ||
    searchQuery.trim() !== "" ||
    selectedType !== "" ||
    selectedAspectRatio !== "" ||
    minSlides !== "" ||
    maxSlides !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    selectedRating > 0 ||
    Object.values(featureFilters).some(Boolean);

  const isFiltered = hasActiveFilters || sortOption !== "newest";

  // Build API filters
  const apiFilters: PresentationQueryParams | null = useMemo(() => {
    if (!isFiltered) return null;

    const filters: PresentationQueryParams = {
      limit: ITEMS_PER_PAGE,
    };

    if (selectedIndustry)
      filters.industry = selectedIndustry as Industry;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    if (selectedType)
      filters.presentationType = selectedType as PresentationType;
    if (selectedAspectRatio)
      filters.aspectRatio = selectedAspectRatio as AspectRatio;
    if (debouncedMinSlides) filters.minSlides = Number(debouncedMinSlides);
    if (debouncedMaxSlides) filters.maxSlides = Number(debouncedMaxSlides);
    if (debouncedMinPrice) filters.minPrice = Number(debouncedMinPrice);
    if (debouncedMaxPrice) filters.maxPrice = Number(debouncedMaxPrice);
    if (selectedRating > 0) filters.minRating = selectedRating;
    if (featureFilters.hasAnimations) filters.hasAnimations = true;
    if (featureFilters.hasTransitions) filters.hasTransitions = true;
    if (featureFilters.hasSpeakerNotes) filters.hasSpeakerNotes = true;
    if (featureFilters.hasCharts) filters.hasCharts = true;

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
      case "most-slides":
        filters.sortBy = "slideCount";
        filters.sortOrder = "DESC";
        break;
      default:
        filters.sortBy = "publishedAt";
        filters.sortOrder = "DESC";
        break;
    }

    return filters;
  }, [
    isFiltered,
    selectedIndustry,
    debouncedSearch,
    selectedType,
    selectedAspectRatio,
    debouncedMinSlides,
    debouncedMaxSlides,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
    featureFilters,
    sortOption,
  ]);

  // React Query
  const { data: apiData, isLoading: isQueryLoading } =
    usePresentations(apiFilters);

  // Reset accumulated when filters change
  useEffect(() => {
    if (apiData) {
      setAccumulatedPresentations(apiData.items);
      setNextCursor(apiData.meta?.nextCursor ?? undefined);
    }
  }, [apiData]);

  useEffect(() => {
    if (!isFiltered) {
      setAccumulatedPresentations([]);
      setNextCursor(undefined);
    }
  }, [isFiltered]);

  // Display products
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [
    selectedIndustry,
    debouncedSearch,
    sortOption,
    selectedType,
    selectedAspectRatio,
    debouncedMinSlides,
    debouncedMaxSlides,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
    featureFilters,
  ]);

  const serverPresentations = useMemo(() => {
    return [...initialPresentations].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [initialPresentations]);

  const displayPresentations = isFiltered
    ? accumulatedPresentations
    : serverPresentations.slice(0, visibleCount);

  const hasMore = isFiltered
    ? !!nextCursor
    : visibleCount < serverPresentations.length;

  const totalResults = isFiltered
    ? (apiData?.meta?.total ?? accumulatedPresentations.length)
    : serverPresentations.length;

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
        if (selectedIndustry) params.industry = selectedIndustry;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedType) params.presentationType = selectedType;
        if (selectedAspectRatio) params.aspectRatio = selectedAspectRatio;
        if (debouncedMinSlides) params.minSlides = Number(debouncedMinSlides);
        if (debouncedMaxSlides) params.maxSlides = Number(debouncedMaxSlides);
        if (debouncedMinPrice) params.minPrice = Number(debouncedMinPrice);
        if (debouncedMaxPrice) params.maxPrice = Number(debouncedMaxPrice);
        if (selectedRating > 0) params.minRating = selectedRating;
        if (featureFilters.hasAnimations) params.hasAnimations = true;
        if (featureFilters.hasTransitions) params.hasTransitions = true;
        if (featureFilters.hasSpeakerNotes) params.hasSpeakerNotes = true;
        if (featureFilters.hasCharts) params.hasCharts = true;

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
          case "most-slides":
            params.sortBy = "slideCount";
            params.sortOrder = "DESC";
            break;
          default:
            params.sortBy = "publishedAt";
            params.sortOrder = "DESC";
            break;
        }

        const res = await apiGet<any>("/presentations", params);
        const newItems: Presentation[] =
          res?.data?.items ?? res?.items ?? [];
        const newCursor =
          res?.meta?.nextCursor ??
          res?.data?.meta?.nextCursor ??
          undefined;

        setAccumulatedPresentations((prev) => [...prev, ...newItems]);
        setNextCursor(newCursor);
      } catch (error) {
        console.error(
          "[PresentationsListingClient] Load more failed:",
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
    selectedIndustry,
    debouncedSearch,
    selectedType,
    selectedAspectRatio,
    debouncedMinSlides,
    debouncedMaxSlides,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedRating,
    featureFilters,
    sortOption,
  ]);

  const handleClearFilters = useCallback(() => {
    setSelectedIndustry("");
    setSearchQuery("");
    setSortOption("newest");
    setSelectedType("");
    setSelectedAspectRatio("");
    setMinSlides("");
    setMaxSlides("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(0);
    setFeatureFilters({});
    setAccumulatedPresentations([]);
    setNextCursor(undefined);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const resetPagination = useCallback(() => {
    setAccumulatedPresentations([]);
    setNextCursor(undefined);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      resetPagination();
    },
    [resetPagination],
  );

  const handleFeatureToggle = useCallback(
    (key: string) => {
      setFeatureFilters((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      resetPagination();
    },
    [resetPagination],
  );

  // Filter sidebar content
  const filterContent = (
    <FilterContent
      selectedIndustry={selectedIndustry}
      onIndustryChange={(v) => {
        setSelectedIndustry(v);
        resetPagination();
      }}
      selectedType={selectedType}
      onTypeChange={(v) => {
        setSelectedType(v);
        resetPagination();
      }}
      selectedAspectRatio={selectedAspectRatio}
      onAspectRatioChange={(v) => {
        setSelectedAspectRatio(v);
        resetPagination();
      }}
      minSlides={minSlides}
      maxSlides={maxSlides}
      onMinSlidesChange={setMinSlides}
      onMaxSlidesChange={setMaxSlides}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      selectedRating={selectedRating}
      onRatingChange={(r) => {
        setSelectedRating(r);
        resetPagination();
      }}
      featureFilters={featureFilters}
      onFeatureToggle={handleFeatureToggle}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );

  return (
    <div ref={gridRef} className="w-full">
      {/* Top Bar: Search + Sort */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search presentation templates..."
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
                {totalResults === 1 ? "template" : "templates"} found
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

        {/* Presentations Grid */}
        <div className="flex-1 min-w-0">
          {isLoadingResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="h-10 w-10 text-[#1E4DB7] animate-spin mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading presentations...
              </p>
            </motion.div>
          ) : displayPresentations.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {displayPresentations.map((presentation, index) => (
                    <PresentationCard
                      key={presentation.id}
                      presentation={presentation}
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
                        <span>Load More Templates</span>
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 group-hover:bg-[#1E4DB7]/10 rounded-lg text-xs font-semibold transition-colors">
                          {Math.max(
                            0,
                            totalResults - displayPresentations.length,
                          )}{" "}
                          remaining
                        </span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Showing Count */}
              <div className="flex justify-center mt-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {displayPresentations.length} of {totalResults}{" "}
                  templates
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
                <Layers className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "We could not find any presentation templates matching your filters. Try adjusting your criteria or browse all templates."
                  : "No presentation templates are currently available. Check back soon for new additions."}
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

export default PresentationsListingClient;
