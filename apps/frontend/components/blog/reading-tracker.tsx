"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTrackRead } from "@/hooks/use-reading-history";

// =============================================================================
// Reading Tracker Component
// =============================================================================
// Invisible component that tracks reading progress for authenticated users.
// When the user scrolls past the configured threshold (default 80%) of the
// article, it marks the post as "read" via the API. Only fires once per post.

interface ReadingTrackerProps {
  /** The post ID to track */
  postId: string;
  /** Scroll threshold (0-1) at which to mark as read. Default: 0.8 */
  threshold?: number;
}

export function ReadingTracker({
  postId,
  threshold = 0.8,
}: ReadingTrackerProps) {
  const { isAuthenticated } = useAuth();
  const trackRead = useTrackRead();
  const hasTracked = useRef(false);

  const handleScroll = useCallback(() => {
    if (hasTracked.current) return;
    if (!isAuthenticated) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;

    // Calculate how far the user has scrolled
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return;

    const scrollProgress = scrollTop / scrollableHeight;

    if (scrollProgress >= threshold) {
      hasTracked.current = true;
      const progressPercent = Math.round(scrollProgress * 100);

      trackRead.mutate({
        postId,
        progress: Math.min(progressPercent, 100),
      });
    }
  }, [isAuthenticated, postId, threshold, trackRead]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Reset tracking state when postId changes
    hasTracked.current = false;

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthenticated, handleScroll]);

  // This component renders nothing
  return null;
}
