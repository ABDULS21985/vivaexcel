"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Zap } from "lucide-react";
import {
  Framework,
  FRAMEWORK_LABELS,
  FRAMEWORK_COLORS,
} from "@/types/web-template";

// =============================================================================
// Types
// =============================================================================

interface TemplatesHeroClientProps {
  totalTemplates: number;
  totalFrameworks: number;
  totalCategories: number;
}

// =============================================================================
// Animated Counter (IntersectionObserver + rAF easeOutCubic)
// =============================================================================

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
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
            setCount(Math.floor(eased * target));
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

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// =============================================================================
// Main Hero Client
// =============================================================================

export function TemplatesHeroClient({
  totalTemplates,
  totalFrameworks,
  totalCategories,
}: TemplatesHeroClientProps) {
  const [searchValue, setSearchValue] = useState("");

  const scrollToProducts = useCallback(() => {
    document
      .getElementById("template-products")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    scrollToProducts();
    window.dispatchEvent(
      new CustomEvent("template-search", { detail: searchValue }),
    );
  }

  function handleFrameworkClick(framework: string) {
    scrollToProducts();
    window.dispatchEvent(
      new CustomEvent("template-filter-framework", { detail: framework }),
    );
  }

  // Top framework entries (limit to first 8 for pills)
  const frameworkEntries = Object.entries(FRAMEWORK_LABELS).slice(0, 8) as [
    Framework,
    string,
  ][];

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
            <AnimatedCounter target={totalFrameworks} suffix="+" />
          </p>
          <p className="text-sm text-white/60">Frameworks</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-bold text-white md:text-4xl">
            <AnimatedCounter target={totalCategories} />
          </p>
          <p className="text-sm text-white/60">Categories</p>
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
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F59A23]/20 to-[#1E4DB7]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/15">
            <Search className="ml-5 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search templates, starter kits, boilerplates..."
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

      {/* Framework Quick-Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 pb-2">
          <span className="mr-2 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-white/50">
            <Zap className="mr-1 inline h-3 w-3" />
            Quick Filter:
          </span>
          {frameworkEntries.map(([key, label]) => {
            const color = FRAMEWORK_COLORS[key] || "#6B7280";
            return (
              <button
                key={key}
                onClick={() => handleFrameworkClick(key)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/20"
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
      </motion.div>
    </div>
  );
}
