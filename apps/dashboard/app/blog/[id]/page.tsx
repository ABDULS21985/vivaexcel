"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BlogPostForm } from "@/components/forms/blog-post-form";
import { useToast } from "@/components/toast";
import { useBlogPost, useUpdatePost } from "@/hooks/use-blog";
import { Loader2 } from "lucide-react";

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { success, error } = useToast();

    // Fetch the post data from the backend
    const { data: post, isLoading: isLoadingPost, error: fetchError } = useBlogPost(params.id);
    const updatePostMutation = useUpdatePost();

    const handleSubmit = async (data: any) => {
        updatePostMutation.mutate(
            { id: params.id, data },
            {
                onSuccess: () => {
                    success("Post updated", "Your blog post has been updated successfully.");
                    router.push("/blog");
                },
                onError: (err) => {
                    error("Error", err.message || "Failed to update blog post. Please try again.");
                },
            },
        );
    };

    // Loading skeleton while fetching post
    if (isLoadingPost) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Post"
                    description="Loading post..."
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Blog", href: "/blog" },
                        { label: "Edit Post" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading post data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Post"
                    description="Failed to load post"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Blog", href: "/blog" },
                        { label: "Edit Post" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load post</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {fetchError.message || "An error occurred while fetching the post."}
                        </p>
                        <button
                            onClick={() => router.push("/blog")}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Back to Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Build initial data for the form from the fetched post
    const initialData = post
        ? {
            id: post.id,
            title: post.title,
            slug: post.slug,
            subtitle: post.subtitle ?? undefined,
            excerpt: post.excerpt ?? undefined,
            content: post.content ?? undefined,
            featuredImage: post.featuredImage ?? undefined,
            status: post.status,
            visibility: post.visibility ?? ("public" as const),
            categoryId: post.categoryId ?? undefined,
            authorId: post.authorId,
            featured: post.isFeatured ?? false,
            allowComments: post.allowComments,
            metaTitle: post.metaTitle ?? undefined,
            metaDescription: post.metaDescription ?? undefined,
            metaKeywords: post.metaKeywords,
            canonicalUrl: post.canonicalUrl ?? undefined,
            noIndex: post.noIndex,
            tags: post.tags,
        }
        : undefined;

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Post"
                description={`Editing "${post?.title ?? "Post"}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Blog", href: "/blog" },
                    { label: "Edit Post" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BlogPostForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={updatePostMutation.isPending}
                    mode="edit"
                />
            </div>
        </div>
    );
}
