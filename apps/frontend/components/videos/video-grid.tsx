"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import type { Video } from "@/types/video";
import { VideoCard } from "./video-card";
import { VideoCardSkeleton } from "./video-card-skeleton";

// =============================================================================
// Video Grid
// =============================================================================

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  hasSidebar?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export function VideoGrid({ videos, isLoading, hasSidebar }: VideoGridProps) {
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          hasSidebar
            ? "lg:grid-cols-2 xl:grid-cols-3"
            : "lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
        } gap-x-4 gap-y-6`}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-1)] flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          No videos found
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          Try adjusting your search or filter criteria to find what you&apos;re
          looking for.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        hasSidebar
          ? "lg:grid-cols-2 xl:grid-cols-3"
          : "lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
      } gap-x-4 gap-y-6`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </motion.div>
  );
}
