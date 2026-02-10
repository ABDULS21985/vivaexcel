"use client";

// =============================================================================
// Smart Search Bar
// =============================================================================
// Primary enhanced search bar component for the VivaExcel marketplace.
// Features: glassmorphism styling, debounced autocomplete, AI badge for
// natural language queries, voice search integration, keyboard navigation
// (arrow up/down, Enter, Escape), and an accessible ARIA combobox pattern.

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@ktblog/ui/components";
import { useAutocomplete } from "@/hooks/use-smart-search";
import { AutocompleteDropdown } from "./autocomplete-dropdown";
import { VoiceSearchButton } from "./voice-search";
import type { AutocompleteItem } from "./types";

// =============================================================================
// Constants
// =============================================================================

const LOCAL_STORAGE_KEY = "vivaexcel_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_MS = 300;
const AI_BADGE_THRESHOLD = 3;

// =============================================================================
// Types
// =============================================================================

interface SmartSearchBarProps {
  /** Pre-filled search value */
  defaultValue?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Custom search handler (overrides default navigation) */
  onSearch?: (query: string) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function saveRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: string[] = stored ? JSON.parse(stored) : [];
    const filtered = existing.filter(
      (s) => s.toLowerCase() !== query.toLowerCase(),
    );
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Quota exceeded or unavailable
  }
}

// =============================================================================
// Component
// =============================================================================

export function SmartSearchBar({
  defaultValue = "",
  placeholder = "Search products, templates, and more...",
  className,
  onSearch,
}: SmartSearchBarProps) {
  const router = useRouter();
  const instanceId = useId();
  const listboxId = `smart-search-listbox-${instanceId}`;

  // State
  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---- Debounce ----
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // ---- Fetch autocomplete suggestions ----
  const { data: suggestions = [], isLoading: isLoadingAutocomplete } =
    useAutocomplete(debouncedQuery);

  // ---- Reset selectedIndex when suggestions change ----
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // ---- Click outside to close ----
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Perform search ----
  const handleSubmit = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) return;

      saveRecentSearch(q);
      setIsOpen(false);

      if (onSearch) {
        onSearch(q);
      } else {
        router.push(`/store?q=${encodeURIComponent(q)}`);
      }
    },
    [query, onSearch, router],
  );

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = suggestions.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setIsOpen(true);
          setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            const item = suggestions[selectedIndex];
            if (item.type === "product" && item.slug) {
              saveRecentSearch(item.text);
              router.push(`/store/${item.slug}`);
            } else {
              handleSubmit(item.text);
            }
          } else {
            handleSubmit();
          }
          setIsOpen(false);
          break;
        }
        case "Escape": {
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        }
        default:
          break;
      }
    },
    [suggestions, selectedIndex, handleSubmit, router],
  );

  // ---- Select item from dropdown ----
  const handleSelectItem = useCallback(
    (item: AutocompleteItem) => {
      if (item.type === "product" && item.slug) {
        saveRecentSearch(item.text);
        router.push(`/store/${item.slug}`);
      } else {
        setQuery(item.text);
        handleSubmit(item.text);
      }
      setIsOpen(false);
    },
    [handleSubmit, router],
  );

  // ---- See all results ----
  const handleSeeAll = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // ---- Voice search result ----
  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setQuery(transcript);
      // Auto-search after voice input
      setTimeout(() => {
        handleSubmit(transcript);
      }, 300);
    },
    [handleSubmit],
  );

  // ---- Clear input ----
  const handleClear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // ---- Input change ----
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (value.length >= 2) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    },
    [],
  );

  // ---- Focus ----
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.length >= 2 || query.length === 0) {
      setIsOpen(true);
    }
  }, [query]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // ---- Determine if AI badge should show ----
  const showAiBadge = query.length > AI_BADGE_THRESHOLD;

  // ---- Determine if dropdown should be open ----
  const dropdownOpen =
    isOpen && (suggestions.length > 0 || query.length === 0);

  // ---- Active descendant for ARIA ----
  const activeDescendant =
    selectedIndex >= 0
      ? `${listboxId}-option-${selectedIndex}`
      : undefined;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search input container */}
      <div
        className={cn(
          "relative flex items-center gap-2",
          "h-12 md:h-14 px-4",
          "rounded-2xl",
          "bg-white/90 dark:bg-slate-900/90",
          "backdrop-blur-xl",
          "border",
          isFocused
            ? "border-[#1E4DB7]/40 dark:border-[#1E4DB7]/50 ring-2 ring-[#1E4DB7]/15 dark:ring-[#1E4DB7]/20"
            : "border-slate-200 dark:border-slate-700",
          "shadow-sm hover:shadow-md",
          "transition-all duration-200",
          "font-[var(--font-aptos)]",
        )}
      >
        {/* Search icon */}
        <Search
          size={20}
          className={cn(
            "shrink-0 transition-colors duration-200",
            isFocused
              ? "text-[#1E4DB7] dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500",
          )}
          aria-hidden="true"
        />

        {/* AI badge */}
        <AnimatePresence>
          {showAiBadge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "inline-flex items-center gap-1",
                "px-2 py-0.5 rounded-full shrink-0",
                "bg-gradient-to-r from-[#1E4DB7]/10 to-purple-500/10",
                "dark:from-[#1E4DB7]/20 dark:to-purple-500/20",
                "border border-[#1E4DB7]/20 dark:border-[#1E4DB7]/30",
              )}
            >
              <Sparkles
                size={12}
                className="text-[#1E4DB7] dark:text-blue-400"
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold text-[#1E4DB7] dark:text-blue-300">
                AI
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "flex-1 min-w-0 bg-transparent",
            "text-sm md:text-base",
            "text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "outline-none",
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-label="Search products"
          aria-haspopup="listbox"
        />

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoadingAutocomplete && debouncedQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="shrink-0"
              aria-hidden="true"
            >
              <div className="w-4 h-4 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E4DB7] dark:border-t-blue-400 rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear button */}
        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className={cn(
                "shrink-0 flex items-center justify-center",
                "w-7 h-7 rounded-full",
                "text-slate-400 hover:text-slate-600",
                "dark:text-slate-500 dark:hover:text-slate-300",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "transition-colors duration-150",
                "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]",
              )}
              aria-label="Clear search"
            >
              <X size={16} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Voice search button */}
        <VoiceSearchButton onResult={handleVoiceResult} />

        {/* Submit button (visual search icon button for desktop) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSubmit()}
          disabled={!query.trim()}
          className={cn(
            "hidden md:flex shrink-0 items-center justify-center",
            "w-9 h-9 rounded-xl",
            "bg-[#1E4DB7] hover:bg-[#143A8F]",
            "disabled:bg-slate-200 dark:disabled:bg-slate-800",
            "disabled:cursor-not-allowed",
            "text-white disabled:text-slate-400 dark:disabled:text-slate-600",
            "transition-colors duration-200",
            "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-2",
          )}
          aria-label="Search"
        >
          <Search size={16} aria-hidden="true" />
        </motion.button>
      </div>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <AutocompleteDropdown
            items={suggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSelectItem}
            onSeeAll={handleSeeAll}
            query={query}
            listboxId={listboxId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
