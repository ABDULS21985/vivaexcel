"use client";

import { cn } from "@ktblog/ui/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface PostCardSkeletonProps {
  /** Show the image placeholder area */
  showMedia?: boolean;
  className?: string;
}

// =============================================================================
// Shimmer Block Sub-Component
// =============================================================================

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-[var(--surface-2)]", className)}
    />
  );
}

// =============================================================================
// PostCardSkeleton Component
// =============================================================================

export function PostCardSkeleton({
  showMedia = false,
  className,
}: PostCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--card)] border-b border-[var(--border)] px-4 py-3",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading post"
    >
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <Shimmer className="h-10 w-10 flex-shrink-0 rounded-full" />

        <div className="min-w-0 flex-1 space-y-3">
          {/* Author row placeholder */}
          <div className="flex items-center gap-2">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-8" />
          </div>

          {/* Content lines placeholder */}
          <div className="space-y-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>

          {/* Optional media placeholder */}
          {showMedia && (
            <Shimmer className="h-48 w-full rounded-xl" />
          )}

          {/* Engagement bar placeholder */}
          <div className="flex items-center justify-between pt-1">
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Multiple Skeletons Helper
// =============================================================================

export interface PostCardSkeletonListProps {
  count?: number;
  showMediaOnFirst?: boolean;
  className?: string;
}

export function PostCardSkeletonList({
  count = 5,
  showMediaOnFirst = true,
  className,
}: PostCardSkeletonListProps) {
  return (
    <div className={className} role="status" aria-label="Loading feed">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton
          key={index}
          showMedia={showMediaOnFirst && index === 0}
        />
      ))}
    </div>
  );
}
