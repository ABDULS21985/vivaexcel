"use client";

import { Bookmark } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToggleBookmark } from "@/hooks/use-videos";
import { toast } from "sonner";
import { cn } from "@ktblog/ui/lib/utils";

export function VideoBookmarkButton({ videoId }: { videoId: string }) {
  const { isAuthenticated } = useAuth();
  const toggleBookmark = useToggleBookmark();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Sign in to save videos", {
        description: "Create a free account to save your favorite videos.",
      });
      return;
    }

    toggleBookmark.mutate(videoId, {
      onSuccess: (res: any) => {
        const bookmarked = res?.data?.bookmarked;
        toast.success(bookmarked ? "Video saved" : "Video removed from saved");
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggleBookmark.isPending}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
        "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60",
        toggleBookmark.isPending && "opacity-50",
      )}
      aria-label="Save video"
    >
      <Bookmark className="h-4 w-4" />
    </button>
  );
}
