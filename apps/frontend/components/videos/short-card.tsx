"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Play, Eye } from "lucide-react";
import type { VideoShort } from "@/types/video";

// =============================================================================
// Short Card
// =============================================================================

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return `${count}`;
}

export function ShortCard({ short }: { short: VideoShort }) {
  return (
    <Link
      href={`/videos/${short.slug}`}
      className="group relative flex-shrink-0 w-[180px] sm:w-[200px] rounded-xl overflow-hidden bg-[var(--surface-1)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden">
        <Image
          src={short.thumbnailUrl}
          alt={short.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="200px"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Play className="h-5 w-5 text-white ms-0.5" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-1.5">
            {short.title}
          </h3>
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <Eye className="h-3 w-3" />
            <span>{formatViewCount(short.viewCount)} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
