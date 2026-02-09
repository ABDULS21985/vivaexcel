"use client";

import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { BlogPost } from "@/types/blog";

// ============================================
// TYPES
// ============================================

export interface PostCardProps {
  post: BlogPost;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================
// AUTHOR AVATAR
// ============================================

function AuthorAvatar({ name }: { name: string }) {
  const initials = getInitials(name);
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-orange-400 to-red-500",
    "from-emerald-400 to-teal-600",
    "from-purple-500 to-pink-500",
    "from-amber-400 to-red-500",
    "from-cyan-400 to-indigo-600",
  ];
  const gradient = gradients[name.length % gradients.length];

  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-neutral-800 relative overflow-hidden flex-shrink-0`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      <span className="relative drop-shadow-sm">{initials}</span>
    </div>
  );
}

// ============================================
// POST CARD COMPONENT
// ============================================

export function PostCard({ post, className = "" }: PostCardProps) {
  const categoryColor = post.category?.color || "#1E4DB7";
  const formattedDate = post.publishedAt ? formatDate(post.publishedAt) : "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
            <span className="text-neutral-300 dark:text-neutral-600 text-5xl font-bold">
              {post.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        {post.category && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white shadow-md"
              style={{
                backgroundColor: categoryColor,
                boxShadow: `0 4px 12px ${categoryColor}40`,
              }}
            >
              {post.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-primary leading-tight">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Footer — pushed to bottom */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {/* Author */}
          {post.author ? (
            <div className="flex items-center gap-2">
              <AuthorAvatar name={post.author.name} />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {post.author.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <User className="h-3.5 w-3.5" />
              <span>KTBlog</span>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime}m
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{
          background: `linear-gradient(90deg, ${categoryColor} 0%, ${categoryColor}80 100%)`,
        }}
      />
    </Link>
  );
}
