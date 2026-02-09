"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BlogPostForm } from "@/components/forms/blog-post-form";
import { useToast } from "@/components/toast";
import { useCreatePost } from "@/hooks/use-blog";

export default function NewBlogPostPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const createPostMutation = useCreatePost();

    const handleSubmit = async (data: any) => {
        createPostMutation.mutate(data, {
            onSuccess: () => {
                success("Post created", "Your blog post has been created successfully.");
                router.push("/blog");
            },
            onError: (err) => {
                error("Error", err.message || "Failed to create blog post. Please try again.");
            },
        });
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Create New Post"
                description="Write and publish a new blog post"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Blog", href: "/blog" },
                    { label: "New Post" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BlogPostForm onSubmit={handleSubmit} isLoading={createPostMutation.isPending} mode="create" />
            </div>
        </div>
    );
}
