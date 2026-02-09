"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BlogPostForm } from "@/components/forms/blog-post-form";
import { useToast } from "@/components/toast";

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    // Mock initial data
    const initialData = {
        id: params.id,
        title: "The Future of Digital Trust",
        slug: "future-of-digital-trust",
        excerpt: "Exploring how blockchain and digital identity are shaping the future of trust on the internet.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        status: "published" as const,
        categoryId: "technology",
        authorId: "user-1",
        featured: true,
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Updating post:", data);

            success("Post updated", "Your blog post has been updated successfully.");
            router.push("/blog");
        } catch {
            error("Error", "Failed to update blog post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Post"
                description={`Editing "${initialData.title}"`}
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
                    isLoading={isLoading}
                    mode="edit"
                />
            </div>
        </div>
    );
}
