"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { cn } from "@ktblog/ui/lib/utils";

// =============================================================================
// Video Bookmark Button
// =============================================================================

export function VideoBookmarkButton({ videoId }: { videoId: string }) {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Sign in to save videos", {
        description: "Create a free account to save your favorite videos.",
      });
      return;
    }

    setIsBookmarked((prev) => !prev);
    toast.success(isBookmarked ? "Video removed from saved" : "Video saved");
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
        isBookmarked
          ? "bg-[var(--primary)] text-white shadow-md"
          : "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60",
      )}
      aria-label={isBookmarked ? "Remove from saved" : "Save video"}
    >
      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
    </button>
  );
}
