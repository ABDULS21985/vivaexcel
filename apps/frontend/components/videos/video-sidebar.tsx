"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  Compass,
  Table,
  Brain,
  BarChart3,
  FileSpreadsheet,
  Presentation,
  Shield,
  Link as LinkIcon,
  GraduationCap,
  Mic,
  Radio,
  TrendingUp,
  Eye,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import type { Video, VideoCategory } from "@/types/video";

// =============================================================================
// Icon Map
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Table,
  Brain,
  BarChart3,
  FileSpreadsheet,
  Presentation,
  Shield,
  Link: LinkIcon,
  GraduationCap,
  Mic,
  Radio,
};

// =============================================================================
// Helpers
// =============================================================================

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return `${count}`;
}

// =============================================================================
// Video Sidebar
// =============================================================================

interface VideoSidebarProps {
  categories: VideoCategory[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  trendingVideos: Video[];
}

export function VideoSidebar({
  categories,
  activeCategory,
  onCategoryChange,
  trendingVideos,
}: VideoSidebarProps) {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide pe-2">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 px-3">
            Categories
          </h3>
          <nav className="space-y-0.5">
            {categories
              .filter((c) => c.slug !== "all")
              .map((category) => {
                const Icon = iconMap[category.icon];
                const isActive = activeCategory === category.slug;

                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.slug)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface-1)] hover:text-[var(--foreground)]",
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]",
                        )}
                      />
                    )}
                    <span className="truncate">{category.name}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border)]" />

        {/* Trending */}
        {trendingVideos.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 px-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Now
            </h3>
            <div className="space-y-1">
              {trendingVideos.slice(0, 5).map((video, index) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.slug}`}
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-1)] transition-colors group"
                >
                  <span className="text-lg font-bold text-[var(--muted-foreground)] w-5 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--muted-foreground)]">
                      <Eye className="h-3 w-3" />
                      {formatViewCount(video.viewCount)} views
                    </div>
                  </div>
                  <div className="w-16 h-10 rounded-md overflow-hidden shrink-0 mt-0.5">
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      width={64}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
