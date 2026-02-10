"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { VideoShort } from "@/types/video";
import { ShortCard } from "./short-card";

// =============================================================================
// Shorts Carousel
// =============================================================================

interface ShortsCarouselProps {
  shorts: VideoShort[];
  isLoading: boolean;
}

export function ShortsCarousel({ shorts, isLoading }: ShortsCarouselProps) {
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
    return () => el.removeEventListener("scroll", checkScroll);
  }, [shorts]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-red-500" />
          <div className="h-5 w-20 bg-[var(--surface-2)] rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[180px] sm:w-[200px] aspect-[9/16] rounded-xl bg-[var(--surface-1)] animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (shorts.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Shorts
          </h2>
        </div>
        <Link
          href="/videos?filter=shorts"
          className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative group/shorts">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] shadow-lg flex items-center justify-center hover:bg-[var(--card)] transition-all opacity-0 group-hover/shorts:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] shadow-lg flex items-center justify-center hover:bg-[var(--card)] transition-all opacity-0 group-hover/shorts:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        >
          {shorts.map((short) => (
            <ShortCard key={short.id} short={short} />
          ))}
        </div>
      </div>
    </section>
  );
}
