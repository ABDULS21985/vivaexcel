"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useBookmarkStatus, useToggleBookmark } from "@/hooks/use-bookmarks";
import { toast } from "sonner";

// =============================================================================
// Bookmark Button Component
// =============================================================================
// An animated bookmark/heart icon that toggles on click.
// Shows a login prompt if the user is not authenticated.
// Uses optimistic updates with React Query for instant feedback.

interface BookmarkButtonProps {
  postId: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Show label text next to icon */
  showLabel?: boolean;
  /** Visual variant */
  variant?: "default" | "outline" | "ghost";
}

export function BookmarkButton({
  postId,
  size = "md",
  className,
  showLabel = false,
  variant = "default",
}: BookmarkButtonProps) {
  const { isAuthenticated } = useAuth();
  const { data: statusData, isLoading: isCheckingStatus } =
    useBookmarkStatus(postId);
  const toggleBookmark = useToggleBookmark();
  const [isAnimating, setIsAnimating] = useState(false);

  const isBookmarked = statusData?.isBookmarked ?? false;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Sign in to bookmark articles", {
        description: "Create a free account to save your favorite articles.",
        action: {
          label: "Sign in",
          onClick: () => {
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?returnUrl=${returnUrl}`;
          },
        },
      });
      return;
    }

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      await toggleBookmark.mutateAsync({
        postId,
        isCurrentlyBookmarked: isBookmarked,
      });

      if (!isBookmarked) {
        toast.success("Article bookmarked", {
          description: "You can find it in your dashboard.",
        });
      } else {
        toast.success("Bookmark removed");
      }
    } catch {
      toast.error("Failed to update bookmark", {
        description: "Please try again.",
      });
    }
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isCheckingStatus || toggleBookmark.isPending}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg transition-all duration-200",
          "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isBookmarked && "text-[var(--primary)]",
          className
        )}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
        title={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
      >
        <Bookmark
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isBookmarked && "fill-current",
            isAnimating && "scale-125"
          )}
        />
        {showLabel && (
          <span className="text-sm font-medium">
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </span>
        )}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isCheckingStatus || toggleBookmark.isPending}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border transition-all duration-200",
          "px-4 py-2",
          isBookmarked
            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
      >
        <Bookmark
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isBookmarked && "fill-current",
            isAnimating && "scale-125"
          )}
        />
        {showLabel && (
          <span className="text-sm font-medium">
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </span>
        )}
      </button>
    );
  }

  // Default variant: circular icon button
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCheckingStatus || toggleBookmark.isPending}
      className={cn(
        sizeClasses[size],
        "rounded-full flex items-center justify-center transition-all duration-300",
        isBookmarked
          ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isAnimating && "scale-110",
        className
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
    >
      <Bookmark
        className={cn(
          iconSizes[size],
          "transition-all duration-300",
          isBookmarked && "fill-current"
        )}
      />
    </button>
  );
}
