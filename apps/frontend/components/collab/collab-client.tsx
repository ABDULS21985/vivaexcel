"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  useCollabFeed,
  useTrendingTopics,
  useLiveEvents,
  useNewsItems,
} from "@/hooks/use-collab";
import type { CollabPost, FeedTab } from "@/types/collab";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";
import { FeedTabs } from "./feed-tabs";
import { TrendingSidebar } from "./trending-sidebar";
import { CollabNavSidebar } from "./collab-nav-sidebar";

// =============================================================================
// Collab Client — Main Orchestrator
// =============================================================================

export function CollabClient() {
  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [localPosts, setLocalPosts] = useState<CollabPost[]>([]);
  const composerRef = useRef<HTMLDivElement>(null);

  const { data: feedData, isLoading: feedLoading } = useCollabFeed({
    tab: activeTab,
  });
  const { data: trending = [] } = useTrendingTopics();
  const { data: liveEvents = [] } = useLiveEvents();
  const { data: news = [] } = useNewsItems();

  const fetchedPosts = feedData?.posts ?? [];
  const allPosts = [...localPosts, ...fetchedPosts];

  const handleNewPost = useCallback((content: string) => {
    const newPost: CollabPost = {
      id: `local-${Date.now()}`,
      author: {
        id: "current-user",
        name: "You",
        username: "you",
        avatar: "https://picsum.photos/seed/currentuser/80/80",
        isVerified: false,
        followerCount: 0,
        followingCount: 0,
      },
      content,
      likeCount: 0,
      repostCount: 0,
      commentCount: 0,
      viewCount: 0,
      bookmarkCount: 0,
      publishedAt: new Date().toISOString(),
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      tags: content
        .match(/#\w+/g)
        ?.map((t) => t.slice(1).toLowerCase()) ?? [],
    };
    setLocalPosts((prev) => [newPost, ...prev]);
  }, []);

  const handlePostClick = useCallback(() => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const textarea = composerRef.current?.querySelector("textarea");
    if (textarea) {
      setTimeout(() => textarea.focus(), 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-[1280px] flex">
        {/* Left sidebar — Navigation */}
        <CollabNavSidebar activeTab="home" onPostClick={handlePostClick} />

        {/* Center — Main feed */}
        <main className="flex-1 min-w-0 border-x border-[var(--border)] min-h-screen max-w-[600px]">
          {/* Tabs */}
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Post Composer */}
          <div ref={composerRef}>
            <PostComposer onSubmit={handleNewPost} />
          </div>

          {/* Feed */}
          <div>
            {feedLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : allPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <p className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  No posts yet
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Be the first to start a conversation in this topic.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {allPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* Right sidebar — Trending & news */}
        <TrendingSidebar
          trending={trending}
          liveEvents={liveEvents}
          news={news}
        />
      </div>
    </div>
  );
}
