"use client";

import { Search, SlidersHorizontal } from "lucide-react";

// =============================================================================
// Video Search Bar
// =============================================================================

interface VideoSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "latest" | "popular" | "trending";
  onSortChange: (sort: "latest" | "popular" | "trending") => void;
}

export function VideoSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: VideoSearchBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search videos..."
          className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200"
        />
      </div>

      {/* Sort dropdown */}
      <div className="relative">
        <SlidersHorizontal className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as "latest" | "popular" | "trending")
          }
          className="appearance-none ps-10 pe-8 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 cursor-pointer"
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Viewed</option>
          <option value="trending">Trending</option>
        </select>
      </div>
    </div>
  );
}
