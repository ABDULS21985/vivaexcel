"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Compass,
  Table,
  Brain,
  BarChart3,
  FileSpreadsheet,
  Presentation,
  Shield,
  Link as LinkIcon,
  GraduationCap,
  Mic,
  Radio,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import type { VideoCategory } from "@/types/video";

// =============================================================================
// Icon Map
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Table,
  Brain,
  BarChart3,
  FileSpreadsheet,
  Presentation,
  Shield,
  Link: LinkIcon,
  GraduationCap,
  Mic,
  Radio,
};

// =============================================================================
// Category Chips
// =============================================================================

interface CategoryChipsProps {
  categories: VideoCategory[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export function CategoryChips({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative group/chips">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-md flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors hidden sm:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--foreground)]" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-md flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors hidden sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-[var(--foreground)]" />
        </button>
      )}

      {/* Chips container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 sm:px-10"
      >
        {categories.map((category) => {
          const Icon = iconMap[category.icon];
          const isActive = activeCategory === category.slug;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                isActive
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-[var(--background)]"
                      : "text-[var(--muted-foreground)]",
                  )}
                />
              )}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
