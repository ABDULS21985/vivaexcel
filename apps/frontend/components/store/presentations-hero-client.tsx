"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface PresentationsHeroClientProps {
  totalTemplates: number;
  totalDownloads: number;
  averageRating: number;
}

interface IndustryPill {
  label: string;
  emoji: string;
  slug: string;
  gradient: string;
}

// =============================================================================
// Constants
// =============================================================================

const INDUSTRIES: IndustryPill[] = [
  {
    label: "Technology",
    emoji: "\u{1F4BB}",
    slug: "technology",
    gradient: "from-[#1E4DB7] to-[#6366F1]",
  },
  {
    label: "Finance",
    emoji: "\u{1F4C8}",
    slug: "finance",
    gradient: "from-[#059669] to-[#10B981]",
  },
  {
    label: "Healthcare",
    emoji: "\u{1FA7A}",
    slug: "healthcare",
    gradient: "from-[#EC4899] to-[#F472B6]",
  },
  {
    label: "Education",
    emoji: "\u{1F393}",
    slug: "education",
    gradient: "from-[#F59A23] to-[#FBBF24]",
  },
  {
    label: "Startup",
    emoji: "\u{1F680}",
    slug: "startup",
    gradient: "from-[#7C3AED] to-[#A78BFA]",
  },
  {
    label: "Marketing",
    emoji: "\u{1F4E3}",
    slug: "marketing",
    gradient: "from-[#06B6D4] to-[#22D3EE]",
  },
];

// =============================================================================
// Animated Counter
// =============================================================================

function AnimatedCounter({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();

          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  const displayValue =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

// =============================================================================
// Component
// =============================================================================

export function PresentationsHeroClient({
  totalTemplates,
  totalDownloads,
  averageRating,
}: PresentationsHeroClientProps) {
  const [searchValue, setSearchValue] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    document
      .getElementById("presentation-products")
      ?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(
      new CustomEvent("presentation-search", { detail: searchValue }),
    );
  }

  function handleCategoryClick(slug: string) {
    document
      .getElementById("presentation-products")
      ?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(
      new CustomEvent("presentation-filter-category", { detail: slug }),
    );
  }

  return (
    <div className="space-y-8">
      {/* Animated Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
      >
        <div className="text-center">
          <p className="text-3xl font-bold text-white md:text-4xl">
            <AnimatedCounter target={totalTemplates} suffix="+" />
          </p>
          <p className="text-sm text-white/60">Templates</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-bold text-white md:text-4xl">
            <AnimatedCounter target={totalDownloads} suffix="+" />
          </p>
          <p className="text-sm text-white/60">Downloads</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-bold text-white md:text-4xl">
            <AnimatedCounter target={averageRating} suffix="" decimals={1} />
          </p>
          <p className="text-sm text-white/60">Avg. Rating</p>
        </div>
      </motion.div>

      {/* Glassmorphism Search Bar */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mx-auto max-w-2xl"
      >
        <div className="group relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D24726]/20 to-[#1E4DB7]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/15">
            <Search className="ml-5 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search presentation templates..."
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-white/50 focus:outline-none md:text-base"
            />
            <button
              type="submit"
              className="m-1.5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F59A23] to-[#E86A1D] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:from-[#E86A1D] hover:to-[#F59A23] hover:shadow-lg hover:shadow-[#F59A23]/25"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.form>

      {/* Industry Quick-Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
      >
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          Industries:
        </span>
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.slug}
            onClick={() => handleCategoryClick(industry.slug)}
            className="group/pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/20"
          >
            <span className="text-base">{industry.emoji}</span>
            <span>{industry.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

export default PresentationsHeroClient;
