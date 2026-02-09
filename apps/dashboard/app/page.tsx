"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import {
    FileText,
    Send,
    Eye,
    Users,
    DollarSign,
    ArrowRight,
    Plus,
    Globe,
    Mail,
    MessageCircle,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

// Generate subscriber growth data
function generateSubscriberGrowthData() {
    const data = [];
    const now = new Date();
    let total = 380;
    for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 2);
        total += Math.floor(Math.random() * 15 + 3);
        data.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: total,
        });
    }
    return data;
}

const subscriberGrowthData = generateSubscriberGrowthData();

const recentPosts = [
    { id: "1", title: "React Best Practices for 2024", status: "published", views: 4520, date: "2024-03-15" },
    { id: "2", title: "TypeScript Tips You Need to Know", status: "published", views: 3800, date: "2024-03-14" },
    { id: "3", title: "Complete Next.js 15 Guide", status: "draft", views: 0, date: "2024-03-13" },
    { id: "4", title: "Mastering CSS Grid Layout", status: "published", views: 2900, date: "2024-03-12" },
    { id: "5", title: "Node.js Security Essentials", status: "published", views: 2650, date: "2024-03-11" },
    { id: "6", title: "Docker for Beginners", status: "published", views: 2400, date: "2024-03-10" },
    { id: "7", title: "GraphQL vs REST: A Comparison", status: "draft", views: 0, date: "2024-03-09" },
    { id: "8", title: "CI/CD Pipeline Setup Guide", status: "published", views: 1200, date: "2024-03-08" },
    { id: "9", title: "AWS Cloud Architecture Patterns", status: "published", views: 1800, date: "2024-03-07" },
    { id: "10", title: "Testing Strategies for Modern Apps", status: "published", views: 1500, date: "2024-03-06" },
];

const recentComments = [
    { id: "1", author: "Sarah Connor", content: "This is a fantastic article! Really helped me understand the topic.", post: "React Best Practices", date: "2024-03-15" },
    { id: "2", author: "John Matrix", content: "Could you elaborate on the performance optimizations section?", post: "TypeScript Tips", date: "2024-03-15" },
    { id: "3", author: "Alice Wonderland", content: "Thanks for the detailed explanation. The code examples were helpful.", post: "CSS Grid Layout", date: "2024-03-14" },
    { id: "4", author: "Bob Builder", content: "Would love to see a follow-up post on advanced patterns.", post: "React Best Practices", date: "2024-03-13" },
    { id: "5", author: "Grace Hopper", content: "The security tips in this post are spot on.", post: "Node.js Security", date: "2024-03-12" },
];

const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function DashboardHome() {
    const totalPosts = recentPosts.length;
    const publishedPosts = recentPosts.filter((p) => p.status === "published").length;
    const draftPosts = recentPosts.filter((p) => p.status === "draft").length;

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your KTBlog."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    <StatsCard
                        title="Total Posts"
                        value={totalPosts.toString()}
                        icon={<FileText className="h-5 w-5" />}
                        trend={{ value: 12, label: "vs last month" }}
                        variant="primary"
                    />
                    <StatsCard
                        title="Published"
                        value={publishedPosts.toString()}
                        icon={<Send className="h-5 w-5" />}
                        trend={{ value: 8, label: "vs last month" }}
                        variant="success"
                    />
                    <StatsCard
                        title="Drafts"
                        value={draftPosts.toString()}
                        icon={<FileText className="h-5 w-5" />}
                        variant="warning"
                    />
                    <StatsCard
                        title="Total Views"
                        value="45.2K"
                        icon={<Eye className="h-5 w-5" />}
                        trend={{ value: 18, label: "vs last month" }}
                        variant="default"
                    />
                    <StatsCard
                        title="Subscribers"
                        value="463"
                        icon={<Users className="h-5 w-5" />}
                        trend={{ value: 15, label: "vs last month" }}
                        variant="primary"
                    />
                    <StatsCard
                        title="MRR"
                        value="$2,847"
                        icon={<DollarSign className="h-5 w-5" />}
                        trend={{ value: 22, label: "vs last month" }}
                        variant="success"
                    />
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/blog/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Post
                        </Button>
                    </Link>
                    <a href="https://drkatangablog.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <Globe className="h-4 w-4 mr-2" />
                            View Site
                        </Button>
                    </a>
                    <Link href="/newsletter">
                        <Button variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Newsletter
                        </Button>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Posts Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Recent Posts
                            </h2>
                            <Link
                                href="/blog"
                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {recentPosts.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-3.5">
                                                <Link
                                                    href={`/blog/${post.id}`}
                                                    className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors"
                                                >
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span
                                                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[post.status]}`}
                                                >
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                                                {post.views > 0
                                                    ? post.views.toLocaleString()
                                                    : "--"}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                {new Date(post.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Comments */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Recent Comments
                            </h2>
                            <Link
                                href="/comments"
                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {recentComments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <MessageCircle className="h-3 w-3 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {comment.author}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            {new Date(comment.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 ml-8">
                                        {comment.content}
                                    </p>
                                    <p className="text-xs text-primary font-medium mt-1 ml-8">
                                        on {comment.post}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subscriber Growth Chart */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <AnalyticsChart
                        data={subscriberGrowthData}
                        title="Subscriber Growth"
                        color="#10B981"
                        height={250}
                    />
                </div>
            </div>
        </div>
    );
}
