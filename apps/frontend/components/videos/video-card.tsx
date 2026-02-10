"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Play, BadgeCheck, Crown } from "lucide-react";
import type { Video } from "@/types/video";
import { VideoBookmarkButton } from "./video-bookmark-button";

// =============================================================================
// Helpers
// =============================================================================

function formatDuration(seconds: number): string {
  if (seconds === 0) return "";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0)
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1)
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

// =============================================================================
// Card Variants
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

// =============================================================================
// Video Card
// =============================================================================

export function VideoCard({ video }: { video: Video }) {
  return (
    <motion.div variants={cardVariants} className="group">
      <Link href={`/videos/${video.slug}`} className="block">
        <div className="rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-lg transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-[var(--surface-1)]">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Duration badge */}
            {video.duration > 0 && (
              <div className="absolute bottom-2 end-2 px-1.5 py-0.5 bg-black/80 rounded text-[11px] font-medium text-white tabular-nums">
                {formatDuration(video.duration)}
              </div>
            )}

            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                <Play className="h-6 w-6 text-white ms-0.5" />
              </div>
            </div>

            {/* Bookmark button */}
            <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <VideoBookmarkButton videoId={video.id} />
            </div>

            {/* LIVE badge */}
            {video.isLive && (
              <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}

            {/* Premium badge */}
            {video.isPremium && !video.isLive && (
              <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                <Crown className="h-3 w-3" />
                Premium
              </div>
            )}

            {/* Progress bar on hover (decorative) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-white/10 transition-colors duration-300">
              <div className="h-full bg-red-500 w-0 group-hover:w-1/3 transition-all duration-[2s] ease-linear" />
            </div>
          </div>

          {/* Info section */}
          <div className="flex gap-3 p-3">
            {/* Channel avatar */}
            <div className="shrink-0 mt-0.5">
              <Image
                src={video.channel.avatar}
                alt={video.channel.name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 leading-snug mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <span className="hover:text-[var(--foreground)] transition-colors">
                  {video.channel.name}
                </span>
                {video.channel.isVerified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                )}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {formatViewCount(video.viewCount)}
                <span className="mx-1">&middot;</span>
                {video.isLive ? (
                  <span className="text-red-500 font-medium">Streaming now</span>
                ) : (
                  timeAgo(video.publishedAt)
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
