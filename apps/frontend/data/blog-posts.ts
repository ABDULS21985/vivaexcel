// =============================================================================
// Sample Blog Posts Data
// =============================================================================
// Static sample data for the KTBlog platform

import type { BlogPost, BlogCategory, BlogPostStatus } from "@/types/blog";

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------

export const blogCategories: BlogCategory[] = [
  {
    id: "cat-1",
    name: "Technology",
    slug: "technology",
    color: "#1E4DB7",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Design",
    slug: "design",
    color: "#8B5CF6",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Productivity",
    slug: "productivity",
    color: "#10B981",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    color: "#F59E0B",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Web Development",
    slug: "web-development",
    color: "#EF4444",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "cat-6",
    name: "Career Growth",
    slug: "career-growth",
    color: "#06B6D4",
    sortOrder: 6,
    isActive: true,
  },
];

// -----------------------------------------------------------------------------
// Helper to find a category by id
// -----------------------------------------------------------------------------

function getCategoryById(id: string): BlogCategory | undefined {
  return blogCategories.find((c) => c.id === id);
}

// -----------------------------------------------------------------------------
// Sample Blog Posts (12 posts)
// -----------------------------------------------------------------------------

export const sampleBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    authorId: "author-1",
    categoryId: "cat-4",
    title: "The Rise of Generative AI: How It Will Reshape Every Industry",
    slug: "rise-of-generative-ai-reshape-industry",
    excerpt:
      "Generative AI is no longer a futuristic concept. From healthcare to finance, discover how this transformative technology is redefining the way businesses operate and innovate.",
    content:
      "Generative AI has rapidly evolved from a research curiosity into a powerful tool that is reshaping industries worldwide. In this article, we explore the key trends driving adoption, practical use cases across sectors, and what organizations need to know to stay ahead of the curve.\n\n## Understanding Generative AI\n\nAt its core, generative AI refers to algorithms that can create new content — text, images, code, music, and more — based on patterns learned from existing data.\n\n## Industry Applications\n\nFrom automating customer service to accelerating drug discovery, generative AI is finding its place in virtually every sector.",
    featuredImage: "/images/blog/post-1.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-01-15T09:00:00Z",
    viewsCount: 12450,
    readingTime: 8,
    author: {
      id: "author-1",
      name: "Sarah Chen",
      avatar: "/images/authors/sarah-chen.jpg",
      bio: "AI researcher and tech writer with 10+ years of experience in machine learning.",
      role: "Senior AI Editor",
    },
    category: getCategoryById("cat-4"),
    tags: [
      { id: "tag-1", name: "Artificial Intelligence", slug: "artificial-intelligence" },
      { id: "tag-2", name: "Machine Learning", slug: "machine-learning" },
      { id: "tag-3", name: "Innovation", slug: "innovation" },
    ],
  },
  {
    id: "post-2",
    authorId: "author-2",
    categoryId: "cat-5",
    title: "Next.js 16 Deep Dive: Server Components and Beyond",
    slug: "nextjs-16-deep-dive-server-components",
    excerpt:
      "Next.js 16 brings groundbreaking features including enhanced server components, improved streaming, and a revamped build system. Here is everything you need to know.",
    content:
      "Next.js 16 represents a significant leap forward for React developers. With improved server components, partial prerendering, and a redesigned build pipeline, this release sets a new standard for modern web development.",
    featuredImage: "/images/blog/post-2.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-01-22T10:30:00Z",
    viewsCount: 9870,
    readingTime: 12,
    author: {
      id: "author-2",
      name: "Marcus Rodriguez",
      avatar: "/images/authors/marcus-rodriguez.jpg",
      bio: "Full-stack developer and open-source contributor focused on React and Next.js.",
      role: "Lead Developer",
    },
    category: getCategoryById("cat-5"),
    tags: [
      { id: "tag-4", name: "Next.js", slug: "nextjs" },
      { id: "tag-5", name: "React", slug: "react" },
      { id: "tag-6", name: "Server Components", slug: "server-components" },
    ],
  },
  {
    id: "post-3",
    authorId: "author-3",
    categoryId: "cat-2",
    title: "Design Systems That Scale: Lessons from Leading Tech Companies",
    slug: "design-systems-that-scale-lessons",
    excerpt:
      "Building a design system is one thing — making it scale across teams and products is another. Learn battle-tested strategies from companies that got it right.",
    content:
      "A well-crafted design system is the backbone of consistent user experiences at scale. In this article, we examine the principles, tools, and governance models that help leading tech companies maintain cohesive design across dozens of products.",
    featuredImage: "/images/blog/post-3.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-01-28T08:00:00Z",
    viewsCount: 7320,
    readingTime: 10,
    author: {
      id: "author-3",
      name: "Amara Osei",
      avatar: "/images/authors/amara-osei.jpg",
      bio: "Design lead passionate about accessible, scalable design systems.",
      role: "Principal Designer",
    },
    category: getCategoryById("cat-2"),
    tags: [
      { id: "tag-7", name: "Design Systems", slug: "design-systems" },
      { id: "tag-8", name: "UI/UX", slug: "ui-ux" },
      { id: "tag-9", name: "Scalability", slug: "scalability" },
    ],
  },
  {
    id: "post-4",
    authorId: "author-4",
    categoryId: "cat-3",
    title: "The 5-Hour Rule: Why Successful People Spend Time Learning",
    slug: "5-hour-rule-successful-people-learning",
    excerpt:
      "Bill Gates, Warren Buffett, and Elon Musk all follow the 5-hour rule. Discover how dedicating just one hour a day to deliberate learning can transform your career.",
    content:
      "The concept is simple: spend at least five hours per week on deliberate learning. This article breaks down the science behind continuous learning, practical frameworks for implementation, and real-world examples of how top performers apply this principle.",
    featuredImage: "/images/blog/post-4.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-01T07:00:00Z",
    viewsCount: 15200,
    readingTime: 6,
    author: {
      id: "author-4",
      name: "David Park",
      avatar: "/images/authors/david-park.jpg",
      bio: "Productivity consultant and bestselling author on personal development.",
      role: "Contributing Writer",
    },
    category: getCategoryById("cat-3"),
    tags: [
      { id: "tag-10", name: "Productivity", slug: "productivity" },
      { id: "tag-11", name: "Learning", slug: "learning" },
      { id: "tag-12", name: "Personal Growth", slug: "personal-growth" },
    ],
  },
  {
    id: "post-5",
    authorId: "author-1",
    categoryId: "cat-1",
    title: "Edge Computing in 2026: The Infrastructure Revolution",
    slug: "edge-computing-2026-infrastructure-revolution",
    excerpt:
      "As latency requirements shrink and IoT devices multiply, edge computing is becoming the backbone of modern infrastructure. Here is what is changing and why it matters.",
    content:
      "Edge computing is fundamentally changing how we think about data processing and application architecture. This comprehensive guide covers the latest developments in edge infrastructure, 5G integration, and real-world deployment strategies.",
    featuredImage: "/images/blog/post-5.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-03T11:00:00Z",
    viewsCount: 6540,
    readingTime: 9,
    author: {
      id: "author-1",
      name: "Sarah Chen",
      avatar: "/images/authors/sarah-chen.jpg",
      bio: "AI researcher and tech writer with 10+ years of experience in machine learning.",
      role: "Senior AI Editor",
    },
    category: getCategoryById("cat-1"),
    tags: [
      { id: "tag-13", name: "Edge Computing", slug: "edge-computing" },
      { id: "tag-14", name: "Infrastructure", slug: "infrastructure" },
      { id: "tag-15", name: "IoT", slug: "iot" },
    ],
  },
  {
    id: "post-6",
    authorId: "author-5",
    categoryId: "cat-6",
    title: "From Junior to Staff Engineer: A Realistic Career Roadmap",
    slug: "junior-to-staff-engineer-career-roadmap",
    excerpt:
      "Navigating the path from junior developer to staff engineer requires more than technical skills. Learn the habits, mindset shifts, and strategic moves that accelerate growth.",
    content:
      "The journey from junior to staff engineer is rarely linear. This article maps out the key milestones, skills to develop at each level, and common pitfalls to avoid along the way.",
    featuredImage: "/images/blog/post-6.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-04T14:00:00Z",
    viewsCount: 11300,
    readingTime: 11,
    author: {
      id: "author-5",
      name: "Elena Volkov",
      avatar: "/images/authors/elena-volkov.jpg",
      bio: "Staff engineer at a Fortune 500 company, mentor, and career coach.",
      role: "Career Columnist",
    },
    category: getCategoryById("cat-6"),
    tags: [
      { id: "tag-16", name: "Career", slug: "career" },
      { id: "tag-17", name: "Engineering", slug: "engineering" },
      { id: "tag-18", name: "Leadership", slug: "leadership" },
    ],
  },
  {
    id: "post-7",
    authorId: "author-2",
    categoryId: "cat-5",
    title: "Tailwind CSS 4: What Changed and How to Migrate",
    slug: "tailwind-css-4-changes-migration-guide",
    excerpt:
      "Tailwind CSS 4 introduces a brand-new engine, CSS-first configuration, and lightning-fast build times. Here is your complete guide to upgrading your projects.",
    content:
      "Tailwind CSS 4 is a complete rewrite that brings dramatically faster builds, a CSS-native configuration approach, and automatic content detection. This guide walks you through the migration process step by step.",
    featuredImage: "/images/blog/post-7.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-05T09:30:00Z",
    viewsCount: 8760,
    readingTime: 7,
    author: {
      id: "author-2",
      name: "Marcus Rodriguez",
      avatar: "/images/authors/marcus-rodriguez.jpg",
      bio: "Full-stack developer and open-source contributor focused on React and Next.js.",
      role: "Lead Developer",
    },
    category: getCategoryById("cat-5"),
    tags: [
      { id: "tag-19", name: "Tailwind CSS", slug: "tailwind-css" },
      { id: "tag-20", name: "CSS", slug: "css" },
      { id: "tag-21", name: "Migration", slug: "migration" },
    ],
  },
  {
    id: "post-8",
    authorId: "author-3",
    categoryId: "cat-2",
    title: "The Psychology of Color in Digital Product Design",
    slug: "psychology-of-color-digital-product-design",
    excerpt:
      "Color is more than aesthetics — it drives user behavior. Explore the science behind color psychology and how to apply it to create more effective digital products.",
    content:
      "Understanding color psychology is essential for any designer working on digital products. This article covers the emotional associations of different colors, cultural considerations, accessibility implications, and practical frameworks for building effective color palettes.",
    featuredImage: "/images/blog/post-8.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-05T16:00:00Z",
    viewsCount: 5430,
    readingTime: 8,
    author: {
      id: "author-3",
      name: "Amara Osei",
      avatar: "/images/authors/amara-osei.jpg",
      bio: "Design lead passionate about accessible, scalable design systems.",
      role: "Principal Designer",
    },
    category: getCategoryById("cat-2"),
    tags: [
      { id: "tag-22", name: "Color Theory", slug: "color-theory" },
      { id: "tag-23", name: "Psychology", slug: "psychology" },
      { id: "tag-8", name: "UI/UX", slug: "ui-ux" },
    ],
  },
  {
    id: "post-9",
    authorId: "author-4",
    categoryId: "cat-3",
    title: "Deep Work in a Distracted World: Practical Strategies",
    slug: "deep-work-distracted-world-strategies",
    excerpt:
      "In an age of constant notifications and open offices, deep work is harder — and more valuable — than ever. Here are proven strategies to reclaim your focus.",
    content:
      "Cal Newport's concept of deep work has become a cornerstone of modern productivity philosophy. This article provides practical, actionable strategies for creating deep work habits in environments that seem designed to prevent them.",
    featuredImage: "/images/blog/post-9.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-06T08:00:00Z",
    viewsCount: 9100,
    readingTime: 7,
    author: {
      id: "author-4",
      name: "David Park",
      avatar: "/images/authors/david-park.jpg",
      bio: "Productivity consultant and bestselling author on personal development.",
      role: "Contributing Writer",
    },
    category: getCategoryById("cat-3"),
    tags: [
      { id: "tag-24", name: "Deep Work", slug: "deep-work" },
      { id: "tag-25", name: "Focus", slug: "focus" },
      { id: "tag-10", name: "Productivity", slug: "productivity" },
    ],
  },
  {
    id: "post-10",
    authorId: "author-1",
    categoryId: "cat-4",
    title: "Building RAG Applications: A Comprehensive Technical Guide",
    slug: "building-rag-applications-technical-guide",
    excerpt:
      "Retrieval-Augmented Generation is revolutionizing how we build AI applications. This technical deep dive covers architecture patterns, vector databases, and production best practices.",
    content:
      "RAG (Retrieval-Augmented Generation) combines the power of large language models with domain-specific knowledge retrieval. This guide provides a comprehensive technical walkthrough of building production-grade RAG applications.",
    featuredImage: "/images/blog/post-10.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-07T10:00:00Z",
    viewsCount: 7650,
    readingTime: 15,
    author: {
      id: "author-1",
      name: "Sarah Chen",
      avatar: "/images/authors/sarah-chen.jpg",
      bio: "AI researcher and tech writer with 10+ years of experience in machine learning.",
      role: "Senior AI Editor",
    },
    category: getCategoryById("cat-4"),
    tags: [
      { id: "tag-26", name: "RAG", slug: "rag" },
      { id: "tag-27", name: "LLM", slug: "llm" },
      { id: "tag-1", name: "Artificial Intelligence", slug: "artificial-intelligence" },
    ],
  },
  {
    id: "post-11",
    authorId: "author-5",
    categoryId: "cat-6",
    title: "Negotiating Your Tech Salary: Data-Driven Strategies for 2026",
    slug: "negotiating-tech-salary-strategies-2026",
    excerpt:
      "Armed with the right data and techniques, you can significantly increase your compensation. Here is a systematic approach to salary negotiation in the tech industry.",
    content:
      "Salary negotiation is a skill that can be learned and refined. Using market data, this article provides a step-by-step framework for negotiating total compensation packages, including base salary, equity, bonuses, and benefits.",
    featuredImage: "/images/blog/post-11.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-08T12:00:00Z",
    viewsCount: 13400,
    readingTime: 9,
    author: {
      id: "author-5",
      name: "Elena Volkov",
      avatar: "/images/authors/elena-volkov.jpg",
      bio: "Staff engineer at a Fortune 500 company, mentor, and career coach.",
      role: "Career Columnist",
    },
    category: getCategoryById("cat-6"),
    tags: [
      { id: "tag-28", name: "Salary", slug: "salary" },
      { id: "tag-29", name: "Negotiation", slug: "negotiation" },
      { id: "tag-16", name: "Career", slug: "career" },
    ],
  },
  {
    id: "post-12",
    authorId: "author-2",
    categoryId: "cat-1",
    title: "WebAssembly Beyond the Browser: The Future of Portable Computing",
    slug: "webassembly-beyond-browser-portable-computing",
    excerpt:
      "WebAssembly is breaking free from the browser. From server-side applications to IoT devices, WASM is becoming the universal runtime for portable, secure computing.",
    content:
      "WebAssembly was initially designed to bring near-native performance to web browsers. But its potential extends far beyond. This article explores the expanding ecosystem of WASM runtimes, edge computing use cases, and the WASI standard that is making WebAssembly truly portable.",
    featuredImage: "/images/blog/post-12.jpg",
    status: "published" as BlogPostStatus,
    publishedAt: "2026-02-09T06:00:00Z",
    viewsCount: 4890,
    readingTime: 10,
    author: {
      id: "author-2",
      name: "Marcus Rodriguez",
      avatar: "/images/authors/marcus-rodriguez.jpg",
      bio: "Full-stack developer and open-source contributor focused on React and Next.js.",
      role: "Lead Developer",
    },
    category: getCategoryById("cat-1"),
    tags: [
      { id: "tag-30", name: "WebAssembly", slug: "webassembly" },
      { id: "tag-31", name: "WASM", slug: "wasm" },
      { id: "tag-32", name: "Runtime", slug: "runtime" },
    ],
  },
];

// -----------------------------------------------------------------------------
// Helper functions for querying blog data
// -----------------------------------------------------------------------------

export function getFeaturedPost(): BlogPost {
  return sampleBlogPosts[0];
}

export function getLatestPosts(count: number = 6): BlogPost[] {
  return [...sampleBlogPosts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt || "").getTime() -
        new Date(a.publishedAt || "").getTime()
    )
    .slice(0, count);
}

export function getTrendingPosts(count: number = 5): BlogPost[] {
  return [...sampleBlogPosts]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, count);
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  const category = blogCategories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return sampleBlogPosts.filter((p) => p.categoryId === category.id);
}

export function getCategoriesWithCounts(): (BlogCategory & { postCount: number })[] {
  return blogCategories.map((category) => ({
    ...category,
    postCount: sampleBlogPosts.filter((p) => p.categoryId === category.id).length,
  }));
}
