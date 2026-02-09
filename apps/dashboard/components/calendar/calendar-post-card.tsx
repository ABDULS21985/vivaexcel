"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@ktblog/ui/components";
import { User } from "lucide-react";

export type PostStatus = "published" | "scheduled" | "draft" | "archived";

export interface CalendarPost {
    id: string;
    title: string;
    status: PostStatus;
    category: string;
    author: string;
    authorAvatar?: string;
    scheduledAt: string;
    excerpt?: string;
}

const statusColors: Record<PostStatus, { dot: string; bg: string; text: string }> = {
    published: {
        dot: "bg-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-700 dark:text-emerald-300",
    },
    scheduled: {
        dot: "bg-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
    },
    draft: {
        dot: "bg-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
    },
    archived: {
        dot: "bg-zinc-400",
        bg: "bg-zinc-50 dark:bg-zinc-700/30 border-zinc-200 dark:border-zinc-600",
        text: "text-zinc-600 dark:text-zinc-400",
    },
};

interface CalendarPostCardProps {
    post: CalendarPost;
    compact?: boolean;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, post: CalendarPost) => void;
}

export function CalendarPostCard({
    post,
    compact = false,
    draggable = true,
    onDragStart,
}: CalendarPostCardProps) {
    const colors = statusColors[post.status];

    return (
        <Link href={`/blog/${post.id}`}>
            <div
                draggable={draggable}
                onDragStart={(e) => onDragStart?.(e, post)}
                className={cn(
                    "group relative rounded-md border px-2 py-1.5 cursor-pointer transition-all hover:shadow-md",
                    colors.bg,
                    "hover:scale-[1.02]"
                )}
                title={`${post.title} - ${post.status}`}
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.dot)} />
                    <span className={cn("text-xs font-medium truncate", colors.text)}>
                        {post.title}
                    </span>
                </div>

                {!compact && (
                    <div className="flex items-center gap-1.5 mt-1 ml-3.5">
                        <div className="h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                            {post.authorAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={post.authorAvatar}
                                    alt={post.author}
                                    className="h-4 w-4 rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-2.5 w-2.5 text-zinc-500 dark:text-zinc-400" />
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                            {post.author}
                        </span>
                    </div>
                )}

                {/* Hover preview tooltip */}
                <div className="absolute left-full top-0 ml-2 z-50 hidden group-hover:block">
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 w-56">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-2">
                            {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
                            <span className="text-xs capitalize text-zinc-600 dark:text-zinc-400">
                                {post.status}
                            </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                            <p>Category: {post.category}</p>
                            <p>Author: {post.author}</p>
                            {post.excerpt && (
                                <p className="line-clamp-2 mt-1 text-zinc-400 dark:text-zinc-500">
                                    {post.excerpt}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default CalendarPostCard;
