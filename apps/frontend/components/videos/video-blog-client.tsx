"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Video as VideoIcon } from "lucide-react";
import { useVideos, useVideoShorts, useVideoCategories } from "@/hooks/use-videos";
import { CategoryChips } from "./category-chips";
import { VideoGrid } from "./video-grid";
import { ShortsCarousel } from "./shorts-carousel";
import { VideoSidebar } from "./video-sidebar";
import { VideoSearchBar } from "./video-search-bar";

// =============================================================================
// Video Blog Client — Main Orchestrator
// =============================================================================

export function VideoBlogClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "trending">(
    "latest",
  );

  const { data: categories = [] } = useVideoCategories();
  const { data: videosData, isLoading: videosLoading } = useVideos({
    categorySlug: activeCategory,
    search: searchQuery,
    sortBy,
  });
  const { data: shortsData, isLoading: shortsLoading } = useVideoShorts();

  const videos = videosData?.videos ?? [];
  const shorts = shortsData?.shorts ?? [];

  // Trending videos for sidebar (top 5 by view count)
  const trendingVideos = useMemo(() => {
    const allVideos = videosData?.videos ?? [];
    return [...allVideos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }, [videosData]);

  const showShorts = activeCategory === "all" && !searchQuery;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-6 lg:py-8">
        {/* Page header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <VideoIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                Video Blog
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Tutorials, tips, and insights on Excel, data analytics, AI, and
                more
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category chips */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        {/* Main layout: Sidebar + Content */}
        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <VideoSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            trendingVideos={trendingVideos}
          />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Search + Sort */}
            <VideoSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Shorts section (only on "All" tab without search) */}
            {showShorts && (
              <ShortsCarousel shorts={shorts} isLoading={shortsLoading} />
            )}

            {/* Video heading */}
            {showShorts && (
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Videos
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
            )}

            {/* Results count */}
            {!videosLoading && (searchQuery || activeCategory !== "all") && (
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {videos.length} video{videos.length !== 1 && "s"} found
                {searchQuery && (
                  <span>
                    {" "}
                    for &ldquo;
                    <span className="text-[var(--foreground)] font-medium">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </span>
                )}
              </p>
            )}

            {/* Video grid */}
            <VideoGrid
              videos={videos}
              isLoading={videosLoading}
              hasSidebar
            />
          </main>
        </div>
      </div>
    </div>
  );
}
