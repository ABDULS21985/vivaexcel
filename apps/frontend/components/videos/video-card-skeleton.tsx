"use client";

// =============================================================================
// Video Card Skeleton
// =============================================================================

export function VideoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
      <div className="aspect-video bg-[var(--surface-1)] animate-pulse" />
      <div className="flex gap-3 p-3">
        <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full bg-[var(--surface-2)] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-[var(--surface-2)] rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-[var(--surface-2)] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
