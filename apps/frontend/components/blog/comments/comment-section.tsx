"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { apiClient } from "@/lib/api-client";
import { CommentForm } from "./comment-form";
import { CommentItem, type Comment } from "./comment-item";
import { CommentSkeleton } from "./comment-skeleton";

// =============================================================================
// Types
// =============================================================================

interface CommentSectionProps {
  postId: string;
  slug: string;
}

interface CommentsApiResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// CommentSection
// =============================================================================

export function CommentSection({ postId, slug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Fetch comments
  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (pageNum === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const response = await apiClient<CommentsApiResponse>(
          `/blog/comments?postId=${postId}&page=${pageNum}&pageSize=${PAGE_SIZE}`,
          { method: "GET" }
        );

        if (append) {
          setComments((prev) => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }

        setTotalCount(response.total);
        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err) {
        setError("Failed to load comments. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [postId]
  );

  // Initial load
  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Refresh after new comment
  const handleCommentSubmitted = useCallback(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Load more
  const handleLoadMore = () => {
    fetchComments(page + 1, true);
  };

  return (
    <section
      className="w-full py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900/50"
      aria-labelledby="comments-heading"
      id="comments"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#1E4DB7]" />
              <span className="text-sm font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                Discussion
              </span>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#1E4DB7]" />
            </div>

            <h2
              id="comments-heading"
              className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3"
            >
              Join the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                Discussion
              </span>
            </h2>

            {!isLoading && (
              <p className="text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {totalCount === 0
                  ? "Be the first to share your thoughts"
                  : `${totalCount} comment${totalCount !== 1 ? "s" : ""}`}
              </p>
            )}
          </motion.div>

          {/* Comment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-6 md:p-8 mb-10"
          >
            <CommentForm
              postId={postId}
              onSubmitted={handleCommentSubmitted}
            />
          </motion.div>

          {/* Comments List */}
          <div className="space-y-0">
            {/* Loading state */}
            {isLoading && <CommentSkeleton count={3} showReplies />}

            {/* Error state */}
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchComments(1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1E4DB7] hover:bg-[#1E4DB7]/5 rounded-xl transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </motion.div>
            )}

            {/* Empty state */}
            {!isLoading && !error && comments.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  No comments yet
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Be the first to share your insights about this article.
                </p>
              </motion.div>
            )}

            {/* Comments */}
            {!isLoading && !error && comments.length > 0 && (
              <div className="space-y-8">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className={cn(
                      "bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 p-5 md:p-6",
                      "shadow-sm hover:shadow-md transition-shadow duration-300"
                    )}
                  >
                    <CommentItem
                      comment={comment}
                      postId={postId}
                      onReplySubmitted={handleCommentSubmitted}
                    />
                  </motion.div>
                ))}

                {/* Load more button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className={cn(
                        "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 text-sm",
                        isLoadingMore
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-wait"
                          : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#1E4DB7] hover:text-[#1E4DB7] dark:hover:text-blue-400 hover:shadow-md"
                      )}
                      aria-busy={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          Load more comments
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
