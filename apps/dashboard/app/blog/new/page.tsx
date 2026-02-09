"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BlogPostForm } from "@/components/forms/blog-post-form";
import { useToast } from "@/components/toast";

export default function NewBlogPostPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Creating post:", data);

            success("Post created", "Your blog post has been created successfully.");
            router.push("/blog");
        } catch {
            error("Error", "Failed to create blog post. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                <BlogPostForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
            </div>
        </div>
    );
}
