"use client";

import * as React from "react";
import { cn } from "@ktblog/ui/components";
import { Plus } from "lucide-react";
import { CalendarPostCard, type CalendarPost } from "./calendar-post-card";

type ViewMode = "month" | "week";

interface CalendarGridProps {
    currentDate: Date;
    viewMode: ViewMode;
    posts: CalendarPost[];
    onDateClick: (date: Date) => void;
    onPostDrop: (post: CalendarPost, newDate: Date) => void;
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getWeekDates(date: Date): Date[] {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
    currentDate,
    viewMode,
    posts,
    onDateClick,
    onPostDrop,
}: CalendarGridProps) {
    const [dragOverDate, setDragOverDate] = React.useState<string | null>(null);

    const getPostsForDate = (date: Date) => {
        return posts.filter((post) => {
            const postDate = new Date(post.scheduledAt);
            return isSameDay(postDate, date);
        });
    };

    const handleDragOver = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        setDragOverDate(dateStr);
    };

    const handleDragLeave = () => {
        setDragOverDate(null);
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        setDragOverDate(null);
        try {
            const postData = e.dataTransfer.getData("application/json");
            if (postData) {
                const post: CalendarPost = JSON.parse(postData);
                onPostDrop(post, date);
            }
        } catch {
            // Ignore invalid drag data
        }
    };

    const handleDragStart = (e: React.DragEvent, post: CalendarPost) => {
        e.dataTransfer.setData("application/json", JSON.stringify(post));
        e.dataTransfer.effectAllowed = "move";
    };

    if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {/* Week day headers */}
                <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-700">
                    {weekDates.map((date, i) => (
                        <div
                            key={i}
                            className={cn(
                                "px-3 py-3 text-center border-r last:border-r-0 border-zinc-200 dark:border-zinc-700",
                                isWeekend(date) && "bg-zinc-50 dark:bg-zinc-800/50"
                            )}
                        >
                            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                                {WEEKDAY_LABELS[date.getDay()]}
                            </div>
                            <div
                                className={cn(
                                    "mt-1 text-lg font-semibold",
                                    isToday(date)
                                        ? "text-white bg-primary rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                                        : "text-zinc-900 dark:text-white"
                                )}
                            >
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Week content area */}
                <div className="grid grid-cols-7 min-h-[500px]">
                    {weekDates.map((date, i) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const dayPosts = getPostsForDate(date);
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "border-r last:border-r-0 border-zinc-200 dark:border-zinc-700 p-2",
                                    isWeekend(date) && "bg-zinc-50/50 dark:bg-zinc-800/30",
                                    dragOverDate === dateStr && "bg-primary/10"
                                )}
                                onDragOver={(e) => handleDragOver(e, dateStr!)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, date)}
                            >
                                <div className="space-y-1.5">
                                    {dayPosts.map((post) => (
                                        <CalendarPostCard
                                            key={post.id}
                                            post={post}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => onDateClick(date)}
                                    className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-md text-xs text-zinc-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                    <span>Add</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Month view
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    // Build calendar grid cells
    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({
            date: new Date(year, month - 1, prevMonthDays - i),
            isCurrentMonth: false,
        });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            date: new Date(year, month, d),
            isCurrentMonth: true,
        });
    }

    // Next month leading days to fill the last row
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            cells.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }
    }

    const weeks: { date: Date; isCurrentMonth: boolean }[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-700">
                {WEEKDAY_LABELS.map((day) => (
                    <div
                        key={day}
                        className="px-3 py-2.5 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-r last:border-r-0 border-zinc-200 dark:border-zinc-700"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar rows */}
            {weeks.map((week, weekIdx) => (
                <div
                    key={weekIdx}
                    className="grid grid-cols-7 border-b last:border-b-0 border-zinc-200 dark:border-zinc-700"
                >
                    {week.map((cell, dayIdx) => {
                        const dateStr = cell.date.toISOString().split("T")[0];
                        const dayPosts = getPostsForDate(cell.date);
                        const today = isToday(cell.date);
                        const weekend = isWeekend(cell.date);

                        return (
                            <div
                                key={dayIdx}
                                className={cn(
                                    "min-h-[120px] border-r last:border-r-0 border-zinc-200 dark:border-zinc-700 p-1.5 transition-colors",
                                    !cell.isCurrentMonth && "bg-zinc-50/50 dark:bg-zinc-900/30",
                                    weekend && cell.isCurrentMonth && "bg-zinc-50/30 dark:bg-zinc-800/50",
                                    dragOverDate === dateStr && "bg-primary/10"
                                )}
                                onDragOver={(e) => handleDragOver(e, dateStr!)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, cell.date)}
                            >
                                {/* Date number */}
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={cn(
                                            "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                            today && "bg-primary text-white",
                                            !today && cell.isCurrentMonth && "text-zinc-900 dark:text-white",
                                            !today && !cell.isCurrentMonth && "text-zinc-400 dark:text-zinc-600"
                                        )}
                                    >
                                        {cell.date.getDate()}
                                    </span>
                                    {cell.isCurrentMonth && (
                                        <button
                                            onClick={() => onDateClick(cell.date)}
                                            className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100"
                                            title="Create post"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Post cards */}
                                <div className="space-y-1">
                                    {dayPosts.slice(0, 3).map((post) => (
                                        <CalendarPostCard
                                            key={post.id}
                                            post={post}
                                            compact
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                    {dayPosts.length > 3 && (
                                        <button
                                            onClick={() => onDateClick(cell.date)}
                                            className="text-[10px] text-primary hover:text-primary/80 font-medium pl-1"
                                        >
                                            +{dayPosts.length - 3} more
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default CalendarGrid;
