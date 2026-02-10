"use client";

// =============================================================================
// For You Section
// =============================================================================
// A full-width section with tabs ("For You", "Trending", "New Arrivals") that
// displays recommendation rows sourced from the AI-powered recommendation engine.

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { useForYouFeed, useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { useAuth } from "@/providers/auth-provider";
import { ProductRecommendationCard } from "./product-recommendation-card";

// =============================================================================
// Types
// =============================================================================

type TabKey = "for-you" | "trending" | "new-arrivals";

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

interface ForYouSectionProps {
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const TABS: Tab[] = [
  { key: "for-you", label: "For You", icon: Sparkles },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "new-arrivals", label: "New Arrivals", icon: Zap },
];

// =============================================================================
// Animation Variants
// =============================================================================

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// =============================================================================
// Tab Content Components
// =============================================================================

function ForYouGrid() {
  const { data: products, isLoading } = useForYouFeed(12);

  if (isLoading) return <SkeletonGrid />;
  if (!products || products.length === 0) return <EmptyState />;

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      role="list"
      aria-label="Personalized recommendations"
    >
      {products.map((product, i) => (
        <div key={product.id} role="listitem">
          <ProductRecommendationCard product={product} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

function TrendingGrid() {
  const { data: products, isLoading } = useAIRecommendations("trending", 12);

  if (isLoading) return <SkeletonGrid />;
  if (!products || products.length === 0) return <EmptyState />;

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      role="list"
      aria-label="Trending products"
    >
      {products.map((product, i) => (
        <div key={product.id} role="listitem">
          <ProductRecommendationCard product={product} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

function NewArrivalsGrid() {
  const { data: products, isLoading } = useAIRecommendations("new-arrivals", 12);

  if (isLoading) return <SkeletonGrid />;
  if (!products || products.length === 0) return <EmptyState />;

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      role="list"
      aria-label="New arrivals"
    >
      {products.map((product, i) => (
        <div key={product.id} role="listitem">
          <ProductRecommendationCard product={product} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-md overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-2.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="h-4 w-14 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No recommendations available right now. Browse the store to help us
        personalise your experience.
      </p>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ForYouSection({ className = "" }: ForYouSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("for-you");
  const { isAuthenticated } = useAuth();

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
  }, []);

  // Only show "For You" tab when authenticated
  const visibleTabs = isAuthenticated
    ? TABS
    : TABS.filter((t) => t.key !== "for-you");

  // Default to trending for unauthenticated users
  const resolvedTab =
    !isAuthenticated && activeTab === "for-you" ? "trending" : activeTab;

  return (
    <section className={`py-10 ${className}`} aria-label="Product recommendations">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#1E4DB7]/10 to-[#F59A23]/10">
            <Sparkles className="h-5 w-5 text-[#1E4DB7]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Discover Products
          </h2>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
          role="tablist"
          aria-label="Recommendation categories"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={[
                  "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {resolvedTab === "for-you" && (
          <div
            key="for-you"
            id="tabpanel-for-you"
            role="tabpanel"
            aria-label="For You"
          >
            <ForYouGrid />
          </div>
        )}
        {resolvedTab === "trending" && (
          <div
            key="trending"
            id="tabpanel-trending"
            role="tabpanel"
            aria-label="Trending"
          >
            <TrendingGrid />
          </div>
        )}
        {resolvedTab === "new-arrivals" && (
          <div
            key="new-arrivals"
            id="tabpanel-new-arrivals"
            role="tabpanel"
            aria-label="New Arrivals"
          >
            <NewArrivalsGrid />
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default ForYouSection;
