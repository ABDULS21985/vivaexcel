"use client";

import { usePosts } from "@/hooks/use-posts";
import { Link } from "@/i18n/routing";
import { Skeleton } from "@ktblog/ui/components";
import Image from "next/image";
import { motion } from "framer-motion";
import { Compass, ArrowRight, BookOpen, Bookmark } from "lucide-react";

export function RecommendationsSection() {
  const { data, isLoading, error, refetch } = usePosts({ limit: 8 });
  const posts = data?.items ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-8"
      aria-label="Recommended For You"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recommended For You
          </h2>
        </div>
        <Link
          href="/blogs"
          className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 bg-[var(--card)] border border-t-0 border-[var(--border)] rounded-b-xl">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Failed to load recommendations
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        /* Empty */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 text-center">
          <Compass className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3" />
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            No recommendations available yet. Check back soon!
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
          >
            Browse Articles
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* Cards: horizontal scroll on mobile, 3-col grid on desktop */
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 scrollbar-thin scrollbar-thumb-[var(--border)]">
          {posts.slice(0, 6).map((post) => (
            <article
              key={post.id}
              className="group relative flex-shrink-0 w-72 sm:w-80 lg:w-auto snap-start bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {/* Image */}
              <div className="h-36 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] flex items-center justify-center">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt=""
                    width={320}
                    height={144}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]/30" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {post.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                    {post.category.name}
                  </span>
                )}
                <h3 className="text-sm font-medium text-[var(--foreground)] mt-2 line-clamp-2">
                  <Link href={`/blogs/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {post.readingTime && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                    {post.readingTime} min read
                  </p>
                )}
              </div>

              {/* Bookmark icon (decorative) */}
              <button
                type="button"
                aria-label={`Bookmark ${post.title}`}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
