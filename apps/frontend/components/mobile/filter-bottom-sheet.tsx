"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import {
  X,
  ChevronDown,
  Star,
  RotateCcw,
  Check,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

export interface FilterState {
  categories: string[];
  priceRange: [number, number] | null;
  rating: number | null;
  sortBy: string;
  fileFormats: string[];
  types: string[];
}

export interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  resultCount?: number;
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  index: number;
  children: React.ReactNode;
}

// =============================================================================
// Constants
// =============================================================================

const SPRING_CONFIG = { type: "spring" as const, damping: 30, stiffness: 300 };

const SNAP_POINTS = {
  CLOSED: 100, // translateY percentage
  HALF: 50, // 50vh visible
  FULL: 5, // 95vh visible (5% from top)
};

const CLOSE_THRESHOLD = 75; // if dragged below 75% => close

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low-high", label: "Price: Low\u2192High" },
  { value: "price-high-low", label: "Price: High\u2192Low" },
  { value: "top-rated", label: "Top Rated" },
  { value: "most-downloaded", label: "Most Downloaded" },
];

const CATEGORY_OPTIONS = [
  { value: "excel-templates", label: "Excel Templates", count: 124 },
  { value: "google-sheets", label: "Google Sheets", count: 87 },
  { value: "powerpoint", label: "PowerPoint", count: 56 },
  { value: "word-templates", label: "Word Templates", count: 43 },
  { value: "dashboards", label: "Dashboards", count: 38 },
  { value: "financial-models", label: "Financial Models", count: 29 },
  { value: "data-analysis", label: "Data Analysis", count: 22 },
  { value: "project-management", label: "Project Management", count: 18 },
  { value: "hr-templates", label: "HR Templates", count: 15 },
  { value: "marketing", label: "Marketing", count: 12 },
];

const PRICE_PRESETS = [
  { label: "Free", min: 0, max: 0 },
  { label: "Under $10", min: 0, max: 10 },
  { label: "$10\u2013$25", min: 10, max: 25 },
  { label: "$25\u2013$50", min: 25, max: 50 },
  { label: "$50+", min: 50, max: 500 },
  { label: "Any", min: 0, max: 500 },
];

const RATING_OPTIONS = [
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 0, label: "Any" },
];

const FILE_FORMAT_OPTIONS = [
  { value: ".xlsx", label: ".xlsx" },
  { value: ".xls", label: ".xls" },
  { value: ".gsheet", label: ".gsheet" },
  { value: ".pptx", label: ".pptx" },
  { value: ".pdf", label: ".pdf" },
  { value: ".csv", label: ".csv" },
];

const TYPE_OPTIONS = [
  { value: "template", label: "Template" },
  { value: "tool", label: "Tool" },
  { value: "course", label: "Course" },
  { value: "bundle", label: "Bundle" },
  { value: "add-on", label: "Add-on" },
];

// =============================================================================
// Animation Variants
// =============================================================================

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

// =============================================================================
// Collapsible Section
// =============================================================================

function CollapsibleSection({
  title,
  defaultOpen = true,
  index,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="border-b border-neutral-100 dark:border-neutral-800 pb-4 last:border-b-0"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// Star Rating Display
// =============================================================================

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-neutral-300 dark:text-neutral-600"
          }`}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Dual Thumb Range Slider
// =============================================================================

function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (minVal: number, maxVal: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max],
  );

  const leftPercent = getPercent(valueMin);
  const rightPercent = getPercent(valueMax);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), valueMax - 1);
      onChange(val, valueMax);
    },
    [valueMax, onChange],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), valueMin + 1);
      onChange(valueMin, val);
    },
    [valueMin, onChange],
  );

  return (
    <div className="relative pt-2 pb-4">
      {/* Track background */}
      <div
        ref={trackRef}
        className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700"
      >
        {/* Filled track */}
        <div
          className="absolute h-full rounded-full bg-[#1E4DB7]"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        />
      </div>

      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={handleMinChange}
        className="pointer-events-none absolute top-1.5 left-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1E4DB7] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1E4DB7] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        aria-label="Minimum price"
      />

      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={handleMaxChange}
        className="pointer-events-none absolute top-1.5 left-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1E4DB7] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1E4DB7] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        aria-label="Maximum price"
      />
    </div>
  );
}

// =============================================================================
// Active Filter Count
// =============================================================================

function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (filters.priceRange !== null) count++;
  if (filters.rating !== null && filters.rating > 0) count++;
  if (filters.sortBy && filters.sortBy !== "newest") count++;
  if (filters.fileFormats.length > 0) count++;
  if (filters.types.length > 0) count++;
  return count;
}

// =============================================================================
// Main Component: FilterBottomSheet
// =============================================================================

export function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  resultCount,
}: FilterBottomSheetProps) {
  // ---------------------------------------------------------------------------
  // Local draft state (edit locally, apply on confirm)
  // ---------------------------------------------------------------------------
  const [draft, setDraft] = useState<FilterState>(filters);
  const [snapPoint, setSnapPoint] = useState<"half" | "full">("half");

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const dragY = useMotionValue(0);

  // Sync draft with incoming filters whenever sheet opens
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
      setSnapPoint("half");
      controls.start({ y: "50vh" });
    }
  }, [isOpen, filters, controls]);

  // ---------------------------------------------------------------------------
  // Body scroll lock
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Keyboard handling (Escape to close, focus trap)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-focus the sheet when it opens
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const timer = setTimeout(() => {
        sheetRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Drag handling
  // ---------------------------------------------------------------------------
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const currentY = info.point.y;
      const windowHeight = window.innerHeight;
      const currentPercent = (currentY / windowHeight) * 100;

      // Fast downward swipe => close
      if (velocity > 500) {
        controls.start({ y: "100vh" }).then(onClose);
        return;
      }

      // Fast upward swipe => full open
      if (velocity < -500) {
        setSnapPoint("full");
        controls.start({ y: "5vh" });
        return;
      }

      // Below close threshold => close
      if (currentPercent > CLOSE_THRESHOLD) {
        controls.start({ y: "100vh" }).then(onClose);
        return;
      }

      // Snap to nearest point based on position
      const distToFull = Math.abs(currentPercent - SNAP_POINTS.FULL);
      const distToHalf = Math.abs(currentPercent - SNAP_POINTS.HALF);

      if (distToFull < distToHalf) {
        setSnapPoint("full");
        controls.start({ y: "5vh" });
      } else {
        setSnapPoint("half");
        controls.start({ y: "50vh" });
      }
    },
    [controls, onClose],
  );

  // Backdrop opacity mapped to drag position
  const backdropOpacity = useTransform(
    dragY,
    [0, window?.innerHeight ?? 800],
    [1, 0],
  );

  // ---------------------------------------------------------------------------
  // Draft updaters
  // ---------------------------------------------------------------------------
  const toggleCategory = useCallback((cat: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }, []);

  const setSortBy = useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, sortBy: value }));
  }, []);

  const setPriceRange = useCallback((min: number, max: number) => {
    setDraft((prev) => ({ ...prev, priceRange: [min, max] }));
  }, []);

  const setPricePreset = useCallback((min: number, max: number) => {
    if (min === 0 && max === 500) {
      setDraft((prev) => ({ ...prev, priceRange: null }));
    } else {
      setDraft((prev) => ({ ...prev, priceRange: [min, max] }));
    }
  }, []);

  const setRating = useCallback((value: number) => {
    setDraft((prev) => ({
      ...prev,
      rating: value === 0 ? null : value,
    }));
  }, []);

  const toggleFileFormat = useCallback((format: string) => {
    setDraft((prev) => ({
      ...prev,
      fileFormats: prev.fileFormats.includes(format)
        ? prev.fileFormats.filter((f) => f !== format)
        : [...prev.fileFormats, format],
    }));
  }, []);

  const toggleType = useCallback((type: string) => {
    setDraft((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleApply = useCallback(() => {
    onApplyFilters(draft);
    controls.start({ y: "100vh" }).then(onClose);
  }, [draft, onApplyFilters, controls, onClose]);

  const handleReset = useCallback(() => {
    const resetState: FilterState = {
      categories: [],
      priceRange: null,
      rating: null,
      sortBy: "newest",
      fileFormats: [],
      types: [],
    };
    setDraft(resetState);
    onResetFilters();
  }, [onResetFilters]);

  const handleExpandToFull = useCallback(() => {
    setSnapPoint("full");
    controls.start({ y: "5vh" });
  }, [controls]);

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const activeCount = useMemo(() => countActiveFilters(draft), [draft]);

  const priceRangeText = useMemo(() => {
    if (!draft.priceRange) return "Any price";
    const [min, max] = draft.priceRange;
    if (min === 0 && max === 0) return "Free";
    if (min === 0 && max < 500) return `Under $${max}`;
    if (min > 0 && max >= 500) return `$${min}+`;
    return `$${min} \u2013 $${max}`;
  }, [draft.priceRange]);

  const currentPriceMin = draft.priceRange?.[0] ?? 0;
  const currentPriceMax = draft.priceRange?.[1] ?? 500;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            style={{ opacity: backdropOpacity }}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl lg:hidden outline-none"
            style={{
              top: 0,
              y: dragY,
            }}
            initial={{ y: "100vh" }}
            animate={controls}
            exit={{ y: "100vh" }}
            transition={SPRING_CONFIG}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {/* ----------------------------------------------------------------- */}
            {/* Drag Handle */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0">
              <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-neutral-600" />
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Header */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Filters
                </h2>
                {activeCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1E4DB7] px-1.5 text-[11px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Scrollable Filter Content */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-4"
              dir="auto"
            >
              {/* ============================================================= */}
              {/* Sort By */}
              {/* ============================================================= */}
              <CollapsibleSection title="Sort By" defaultOpen index={0}>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((option) => {
                    const isActive = draft.sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortBy(option.value)}
                        className={`relative flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1E4DB7] text-white shadow-md shadow-[#1E4DB7]/20"
                            : "bg-gray-100 text-neutral-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-neutral-300 dark:hover:bg-gray-700"
                        }`}
                        aria-pressed={isActive}
                      >
                        {isActive && (
                          <Check className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* ============================================================= */}
              {/* Categories */}
              {/* ============================================================= */}
              <CollapsibleSection title="Categories" defaultOpen index={1}>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto overscroll-contain pr-1">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isActive = draft.categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1E4DB7] text-white shadow-sm shadow-[#1E4DB7]/20"
                            : "bg-gray-100 text-neutral-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-neutral-300 dark:hover:bg-gray-700"
                        }`}
                        aria-pressed={isActive}
                      >
                        {cat.label}
                        <span
                          className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* ============================================================= */}
              {/* Expanded sections: only visible in full mode */}
              {/* ============================================================= */}
              {snapPoint === "half" && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleExpandToFull}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 hover:border-[#1E4DB7] hover:text-[#1E4DB7] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-[#1E4DB7] dark:hover:text-[#1E4DB7] transition-colors"
                >
                  <ChevronDown className="h-4 w-4 rotate-180" />
                  Show all filters
                </motion.button>
              )}

              <AnimatePresence>
                {snapPoint === "full" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {/* ======================================================= */}
                    {/* Price Range */}
                    {/* ======================================================= */}
                    <CollapsibleSection title="Price Range" defaultOpen index={2}>
                      <div className="space-y-4">
                        {/* Preset chips */}
                        <div className="flex flex-wrap gap-2">
                          {PRICE_PRESETS.map((preset) => {
                            const isActive =
                              (preset.min === 0 &&
                                preset.max === 500 &&
                                draft.priceRange === null) ||
                              (draft.priceRange !== null &&
                                draft.priceRange[0] === preset.min &&
                                draft.priceRange[1] === preset.max);
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() =>
                                  setPricePreset(preset.min, preset.max)
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                  isActive
                                    ? "bg-[#F59A23] text-white shadow-sm shadow-[#F59A23]/20"
                                    : "bg-gray-100 text-neutral-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-neutral-400 dark:hover:bg-gray-700"
                                }`}
                                aria-pressed={isActive}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Dual range slider */}
                        <DualRangeSlider
                          min={0}
                          max={500}
                          valueMin={currentPriceMin}
                          valueMax={currentPriceMax}
                          onChange={setPriceRange}
                        />

                        {/* Selected range text */}
                        <p className="text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {priceRangeText}
                        </p>
                      </div>
                    </CollapsibleSection>

                    {/* ======================================================= */}
                    {/* Rating */}
                    {/* ======================================================= */}
                    <CollapsibleSection
                      title="Minimum Rating"
                      defaultOpen
                      index={3}
                    >
                      <div className="space-y-2">
                        {RATING_OPTIONS.map((option) => {
                          const isActive =
                            (option.value === 0 && draft.rating === null) ||
                            draft.rating === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setRating(option.value)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                                isActive
                                  ? "bg-[#1E4DB7]/10 ring-1 ring-[#1E4DB7]/30"
                                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              }`}
                              aria-pressed={isActive}
                            >
                              {option.value > 0 ? (
                                <>
                                  <StarRating count={option.value} />
                                  <span
                                    className={`text-sm ${
                                      isActive
                                        ? "font-semibold text-[#1E4DB7] dark:text-blue-400"
                                        : "text-neutral-600 dark:text-neutral-400"
                                    }`}
                                  >
                                    &amp; up
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={`text-sm ${
                                    isActive
                                      ? "font-semibold text-[#1E4DB7] dark:text-blue-400"
                                      : "text-neutral-600 dark:text-neutral-400"
                                  }`}
                                >
                                  Any Rating
                                </span>
                              )}
                              {isActive && (
                                <Check className="ml-auto h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    {/* ======================================================= */}
                    {/* File Format */}
                    {/* ======================================================= */}
                    <CollapsibleSection
                      title="File Format"
                      defaultOpen
                      index={4}
                    >
                      <div className="flex flex-wrap gap-2">
                        {FILE_FORMAT_OPTIONS.map((format) => {
                          const isActive = draft.fileFormats.includes(
                            format.value,
                          );
                          return (
                            <button
                              key={format.value}
                              type="button"
                              onClick={() => toggleFileFormat(format.value)}
                              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                                isActive
                                  ? "bg-[#1E4DB7] text-white shadow-sm shadow-[#1E4DB7]/20"
                                  : "bg-gray-100 text-neutral-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-neutral-300 dark:hover:bg-gray-700"
                              }`}
                              aria-pressed={isActive}
                            >
                              {format.label}
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    {/* ======================================================= */}
                    {/* Type */}
                    {/* ======================================================= */}
                    <CollapsibleSection title="Type" defaultOpen index={5}>
                      <div className="flex flex-wrap gap-2">
                        {TYPE_OPTIONS.map((type) => {
                          const isActive = draft.types.includes(type.value);
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => toggleType(type.value)}
                              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                                isActive
                                  ? "bg-[#1E4DB7] text-white shadow-sm shadow-[#1E4DB7]/20"
                                  : "bg-gray-100 text-neutral-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-neutral-300 dark:hover:bg-gray-700"
                              }`}
                              aria-pressed={isActive}
                            >
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Sticky Bottom Actions */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex-shrink-0 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 safe-area-inset-bottom">
              <div className="flex items-center justify-between gap-3">
                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Reset all filters"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset All</span>
                </button>

                {/* Result count */}
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {resultCount !== undefined
                    ? `${resultCount} ${resultCount === 1 ? "product" : "products"}`
                    : ""}
                </span>

                {/* Apply */}
                <motion.button
                  type="button"
                  onClick={handleApply}
                  className="rounded-xl bg-[#1E4DB7] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1E4DB7]/25 hover:bg-[#143A8F] transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FilterBottomSheet;
