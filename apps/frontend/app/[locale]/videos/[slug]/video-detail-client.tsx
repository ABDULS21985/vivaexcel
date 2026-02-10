"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  ThumbsUp,
  Share2,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Eye,
  Calendar,
  Crown,
  Send,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import {
  useVideoDetail,
  useVideoComments,
  useVideos,
  useToggleLike,
  useToggleBookmark,
  useAddVideoComment,
} from "@/hooks/use-videos";
import { useAuth } from "@/providers/auth-provider";
import { VideoBookmarkButton } from "@/components/videos/video-bookmark-button";
import { toast } from "sonner";

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
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export function VideoDetailClient({ slug }: { slug: string }) {
  const { data: video, isLoading } = useVideoDetail(slug);
  const { data: comments = [] } = useVideoComments(slug);
  const { data: relatedData } = useVideos({
    categorySlug: video?.category?.slug,
    pageSize: 8,
  });
  const toggleLike = useToggleLike();
  const addComment = useAddVideoComment(slug);
  const { isAuthenticated } = useAuth();

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayToggle = useCallback(() => {
    if (!videoRef.current) {
      setIsPlaying(true);
      return;
    }
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
    setIsMuted((prev) => !prev);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const relatedVideos = (relatedData?.videos ?? []).filter(
    (v) => v.slug !== slug,
  ).slice(0, 8);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="aspect-video bg-[var(--surface-1)] rounded-xl animate-pulse" />
            <div className="mt-4 h-8 bg-[var(--surface-1)] rounded animate-pulse w-3/4" />
            <div className="mt-2 h-4 bg-[var(--surface-1)] rounded animate-pulse w-1/2" />
          </div>
          <div className="hidden lg:block w-[400px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <div className="w-40 h-24 bg-[var(--surface-1)] rounded animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-[var(--surface-1)] rounded animate-pulse mb-2" />
                  <div className="h-3 bg-[var(--surface-1)] rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Video not found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          The video you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/videos"
          className="mt-4 inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-lg"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  function handleLike() {
    if (!isAuthenticated) {
      toast.info("Sign in to like videos");
      return;
    }
    toggleLike.mutate(video!.id);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: video!.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      toast.info("Sign in to comment");
      return;
    }
    addComment.mutate(
      { content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment added");
        },
      },
    );
  }

  const description = video.description || "";
  const isLongDescription = description.length > 200;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Video player area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video bg-black rounded-xl overflow-hidden group"
              onClick={handlePlayToggle}
            >
              {isPlaying && video.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={video.videoUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    autoPlay
                    muted={isMuted}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  {/* Controls overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Pause className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  {/* Bottom controls */}
                  <div className="absolute bottom-0 inset-x-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={handlePlayToggle} className="text-white hover:opacity-80">
                      <Pause className="h-5 w-5" />
                    </button>
                    <button onClick={handleMuteToggle} className="text-white hover:opacity-80">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <div className="flex-1" />
                    <button onClick={handleFullscreen} className="text-white hover:opacity-80">
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                      <Play className="h-10 w-10 text-white ms-1" />
                    </div>
                  </div>
                  {video.duration > 0 && (
                    <div className="absolute bottom-3 end-3 px-2 py-1 bg-black/80 rounded text-xs font-medium text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </>
              )}
              {video.isLive && (
                <div className="absolute top-3 start-3 flex items-center gap-1 px-2.5 py-1 bg-red-600 rounded text-xs font-bold text-white uppercase">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
              )}
              {video.isPremium && !video.isLive && (
                <div className="absolute top-3 start-3 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded text-xs font-bold text-white uppercase">
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl md:text-2xl font-bold text-[var(--foreground)] leading-tight"
            >
              {video.title}
            </motion.h1>

            {/* Stats + Actions */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViewCount(video.viewCount)} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(video.publishedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors text-sm font-medium"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {formatViewCount(video.likeCount)}
                </button>
                <VideoBookmarkButton videoId={video.id} />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors text-sm font-medium"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Channel info */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)]">
              <Image
                src={video.channel.avatar}
                alt={video.channel.name}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-[var(--foreground)]">
                    {video.channel.name}
                  </span>
                  {video.channel.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-[var(--primary)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatViewCount(video.channel.subscriberCount)} subscribers
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-3 rounded-xl bg-[var(--surface-1)]">
              <p className="text-sm text-[var(--foreground)] whitespace-pre-line">
                {isLongDescription && !showFullDescription
                  ? description.slice(0, 200) + "..."
                  : description}
              </p>
              {isLongDescription && (
                <button
                  onClick={() => setShowFullDescription((p) => !p)}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  {showFullDescription ? (
                    <>Show less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Show more <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Comments section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {video.commentCount} Comments
              </h2>

              {/* Add comment form */}
              <form onSubmit={handleSubmitComment} className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? "Add a comment..."
                      : "Sign in to comment"
                  }
                  disabled={!isAuthenticated}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  Comment
                </button>
              </form>

              {/* Comments list */}
              <div className="mt-4 space-y-4">
                {(comments as any[]).map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)] shrink-0">
                      {comment.user?.firstName?.[0] || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {comment.user?.firstName || "User"}{" "}
                          {comment.user?.lastName || ""}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar: Up Next */}
          <aside className="hidden lg:block w-[400px] shrink-0">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
              Up Next
            </h3>
            <div className="space-y-3">
              {relatedVideos.map((rv) => (
                <Link key={rv.id} href={`/videos/${rv.slug}`} className="flex gap-2 group/related">
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-[var(--surface-1)] shrink-0">
                    <Image
                      src={rv.thumbnailUrl}
                      alt={rv.title}
                      fill
                      className="object-cover group-hover/related:scale-105 transition-transform duration-300"
                      sizes="160px"
                    />
                    {rv.duration > 0 && (
                      <div className="absolute bottom-1 end-1 px-1 py-0.5 bg-black/80 rounded text-[10px] text-white">
                        {formatDuration(rv.duration)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[var(--foreground)] line-clamp-2 leading-snug">
                      {rv.title}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      {rv.channel.name}
                      {rv.channel.isVerified && (
                        <BadgeCheck className="h-3 w-3 text-[var(--primary)]" />
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatViewCount(rv.viewCount)} views &middot;{" "}
                      {timeAgo(rv.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
