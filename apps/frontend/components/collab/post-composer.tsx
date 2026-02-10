"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Film,
  BarChart3,
  Smile,
  Calendar,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

// =============================================================================
// Constants
// =============================================================================

const MAX_CHARS = 280;
const CHAR_WARNING_THRESHOLD = 200;

// =============================================================================
// Types
// =============================================================================

export interface PostComposerProps {
  onSubmit?: (content: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
}

// =============================================================================
// PostComposer Component
// =============================================================================

export function PostComposer({
  onSubmit,
  placeholder = "What's happening?",
  className,
}: PostComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showCharCounter = charCount > CHAR_WARNING_THRESHOLD;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  // Auto-resize textarea to fit content
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!canPost) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(content.trim());
      setContent("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      toast.success("Post published!");
    } catch {
      toast.error("Failed to publish post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canPost, content, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Avatar display
  const avatarUrl = user?.avatar;
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Guest";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "bg-[var(--card)] border-b border-[var(--border)] px-4 py-3",
        className
      )}
    >
      <div className="flex gap-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
              {initials}
            </div>
          )}
        </div>

        {/* Composer area */}
        <div className="min-w-0 flex-1">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isAuthenticated ? placeholder : "Log in to post..."
            }
            disabled={!isAuthenticated}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent py-2 text-lg leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none",
              "min-h-[52px] md:min-h-[64px]"
            )}
            aria-label="Compose a post"
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            {/* Tool icons */}
            <div className="-ml-2 flex items-center gap-0.5">
              <ToolbarButton icon={<ImageIcon className="h-5 w-5" />} label="Add image" />
              <ToolbarButton icon={<Film className="h-5 w-5" />} label="Add GIF" />
              <ToolbarButton icon={<BarChart3 className="h-5 w-5" />} label="Create poll" />
              <ToolbarButton icon={<Smile className="h-5 w-5" />} label="Add emoji" />
              <ToolbarButton
                icon={<Calendar className="h-5 w-5" />}
                label="Schedule"
                className="hidden sm:flex"
              />
            </div>

            {/* Right side: counter + post button */}
            <div className="flex items-center gap-3">
              {/* Character counter */}
              {showCharCounter && (
                <div className="flex items-center gap-2">
                  <div className="relative h-5 w-5">
                    <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke={
                          isOverLimit
                            ? "#ef4444"
                            : charCount > MAX_CHARS - 20
                              ? "#f59e0b"
                              : "var(--primary)"
                        }
                        strokeWidth="2"
                        strokeDasharray={`${(Math.min(charCount, MAX_CHARS) / MAX_CHARS) * 50.27} 50.27`}
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    </svg>
                  </div>
                  {charCount > MAX_CHARS - 20 && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOverLimit
                          ? "text-red-500"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {MAX_CHARS - charCount}
                    </span>
                  )}
                </div>
              )}

              {/* Post button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canPost}
                className={cn(
                  "rounded-full bg-[var(--primary)] px-5 py-1.5 text-sm font-bold text-white transition-opacity",
                  canPost
                    ? "opacity-100 hover:opacity-90"
                    : "cursor-not-allowed opacity-50"
                )}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ToolbarButton Sub-Component
// =============================================================================

function ToolbarButton({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10",
        className
      )}
      onClick={() => toast.info(`${label} coming soon`)}
    >
      {icon}
    </button>
  );
}
