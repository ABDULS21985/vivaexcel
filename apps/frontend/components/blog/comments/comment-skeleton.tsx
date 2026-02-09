"use client";

import { cn } from "@ktblog/ui/lib/utils";

interface CommentSkeletonProps {
  count?: number;
  showReplies?: boolean;
}

function SingleCommentSkeleton({ depth = 0 }: { depth?: number }) {
  return (
    <div
      className={cn(
        "animate-pulse",
        depth > 0 && "ml-8 md:ml-12 pl-4 border-l-2 border-neutral-100 dark:border-neutral-800"
      )}
    >
      <div className="flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Header: name + date */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>

          {/* Content lines */}
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <div className="h-3 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-10 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton({ count = 3, showReplies = true }: CommentSkeletonProps) {
  return (
    <div className="space-y-8" role="status" aria-label="Loading comments">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-6">
          <SingleCommentSkeleton depth={0} />
          {showReplies && index === 0 && (
            <>
              <SingleCommentSkeleton depth={1} />
              <SingleCommentSkeleton depth={1} />
            </>
          )}
          {showReplies && index === 1 && (
            <SingleCommentSkeleton depth={1} />
          )}
        </div>
      ))}
      <span className="sr-only">Loading comments...</span>
    </div>
  );
}
