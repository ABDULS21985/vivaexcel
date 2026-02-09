"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    ChevronRight,
    ChevronDown,
    Twitter,
    Linkedin,
    Facebook,
    Link2,
    ArrowRight,
    ArrowLeft,
    Mail,
    Home,
    Check,
    Clock,
    Hash,
    Printer,
    List,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import type { BlogPostWithRelations } from "@/data/blog";
import { CodeBlock } from "./code-block";
import { BlogImage } from "./blog-image";
import { LightboxGalleryProvider } from "@/components/ui/lightbox";

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function CartoonAvatar({
    name,
    size = "md",
}: {
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
}) {
    const initials = getInitials(name);
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
    };
    const gradients = [
        "from-blue-500 via-blue-600 to-indigo-600",
        "from-orange-400 via-orange-500 to-red-500",
        "from-emerald-400 via-emerald-500 to-teal-600",
        "from-purple-500 via-purple-600 to-pink-500",
        "from-amber-400 via-orange-500 to-red-500",
    ];
    const gradient = gradients[name.length % gradients.length];
    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-neutral-800 relative overflow-hidden`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
            <span className="relative drop-shadow-sm">{initials}</span>
        </div>
    );
}

function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

// =============================================================================
// Types
// =============================================================================

interface BlogArticleClientProps {
    post: BlogPostWithRelations;
    relatedPosts: BlogPostWithRelations[];
    adjacentPosts?: {
        previous?: { slug: string; title: string } | null;
        next?: { slug: string; title: string } | null;
    };
}

interface Heading {
    id: string;
    text: string;
    level: number;
}

// =============================================================================
// Breadcrumbs
// =============================================================================

function Breadcrumbs({
    category,
    title,
}: {
    category?: { name: string; slug: string } | null;
    title: string;
}) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8 overflow-x-auto scrollbar-hide"
        >
            <Link
                href="/"
                className="flex items-center gap-1.5 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            <Link
                href="/blogs"
                className="hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
                Blog
            </Link>
            {category && (
                <>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
                    <Link
                        href={`/blogs/category/${category.slug}`}
                        className="hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                    >
                        {category.name}
                    </Link>
                </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[200px] md:max-w-[400px]">
                {title}
            </span>
        </nav>
    );
}

// =============================================================================
// Mobile TOC
// =============================================================================

function MobileTOC({
    headings,
    activeId,
    onHeadingClick,
}: {
    headings: Heading[];
    activeId: string;
    onHeadingClick: (id: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (headings.length < 3) return null;

    const currentIndex = headings.findIndex((h) => h.id === activeId);
    const currentHeading = headings[currentIndex];

    return (
        <div className="lg:hidden mb-8">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#1E4DB7]/10 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <List className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                                Table of Contents
                            </span>
                            {currentHeading && (
                                <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate block">
                                    {currentHeading.text}
                                </span>
                            )}
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                    </motion.div>
                </button>

                {/* Progress Bar */}
                <div className="h-0.5 bg-neutral-100 dark:bg-neutral-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
                        style={{
                            width: `${((currentIndex + 1) / headings.length) * 100}%`,
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Expandable List */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <nav className="p-4 pt-2 max-h-[50vh] overflow-y-auto">
                                <ul className="space-y-1">
                                    {headings.map((heading, index) => (
                                        <li key={heading.id}>
                                            <button
                                                onClick={() => {
                                                    onHeadingClick(heading.id);
                                                    setIsOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left text-sm py-2.5 px-4 rounded-lg transition-all duration-200",
                                                    activeId === heading.id
                                                        ? "text-[#1E4DB7] dark:text-blue-400 font-medium bg-[#1E4DB7]/5 dark:bg-blue-500/10"
                                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                )}
                                                style={{
                                                    paddingLeft: `${(heading.level - 2) * 16 + 16}px`,
                                                }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {activeId === heading.id && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E4DB7] dark:bg-blue-400 flex-shrink-0" />
                                                    )}
                                                    <span className="line-clamp-2 leading-snug">
                                                        {heading.text}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// =============================================================================
// Enhanced Markdown Content Renderer
// =============================================================================

function EnhancedMarkdownContent({ content }: { content: string }) {
    const processContent = (text: string) => {
        const parts = text.split(/(```[\s\S]*?```)/);
        let isFirstParagraph = true;

        return parts.map((part, index) => {
            // Handle fenced code blocks
            if (part.startsWith("```")) {
                const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
                if (match) {
                    const language = match[1] || "text";
                    const code = match[2].trim();
                    return (
                        <CodeBlock
                            key={index}
                            code={code}
                            language={language}
                            showLineNumbers={code.split("\n").length > 3}
                        />
                    );
                }
            }

            // Process regular markdown
            const lines = part.split("\n");
            return lines.map((line, lineIndex) => {
                const key = `${index}-${lineIndex}`;

                // Empty line
                if (!line.trim()) {
                    return null;
                }

                // Markdown images: ![alt](src)
                const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
                if (imageMatch) {
                    const alt = imageMatch[1] || "image";
                    const src = imageMatch[2];
                    return (
                        <BlogImage
                            key={key}
                            src={src}
                            alt={alt}
                            caption={alt !== "image" ? alt : undefined}
                        />
                    );
                }

                // H4 headers
                if (line.startsWith("#### ")) {
                    const text = line.slice(5);
                    const id = generateId(text);
                    return (
                        <h4
                            key={key}
                            id={id}
                            className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white mt-10 mb-3 scroll-mt-28"
                        >
                            {text}
                        </h4>
                    );
                }

                // H3 headers
                if (line.startsWith("### ")) {
                    const text = line.slice(4);
                    const id = generateId(text);
                    return (
                        <h3
                            key={key}
                            id={id}
                            className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mt-12 mb-4 scroll-mt-28 group"
                        >
                            <span className="bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                                {text}
                            </span>
                        </h3>
                    );
                }

                // H2 headers
                if (line.startsWith("## ")) {
                    const text = line.slice(3);
                    const id = generateId(text);
                    return (
                        <h2
                            key={key}
                            id={id}
                            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mt-16 mb-6 scroll-mt-28 pb-3 border-b border-neutral-200 dark:border-neutral-700/50"
                        >
                            {text}
                        </h2>
                    );
                }

                // Blockquotes
                if (line.startsWith("> ")) {
                    return (
                        <blockquote
                            key={key}
                            className="relative my-8 pl-6 py-4 border-l-4 border-[#F59A23] bg-gradient-to-r from-[#F59A23]/5 dark:from-[#F59A23]/10 to-transparent rounded-r-lg"
                        >
                            <div className="absolute -left-3 -top-3 text-4xl text-[#F59A23]/30 font-serif">
                                &ldquo;
                            </div>
                            <p className="text-lg italic text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {processInlineMarkdown(line.slice(2))}
                            </p>
                        </blockquote>
                    );
                }

                // Unordered lists with bold items
                if (line.startsWith("- **")) {
                    const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                    if (match) {
                        return (
                            <li key={key} className="flex items-start gap-4 my-3 ml-1">
                                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#F59A23] mt-2.5 flex-shrink-0" />
                                <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                    <strong className="text-neutral-900 dark:text-white font-semibold">
                                        {match[1]}
                                    </strong>
                                    {match[2] && `: ${match[2]}`}
                                </span>
                            </li>
                        );
                    }
                }
                if (line.startsWith("- ")) {
                    return (
                        <li key={key} className="flex items-start gap-4 my-3 ml-1">
                            <span className="w-2 h-2 rounded-full bg-[#1E4DB7] dark:bg-blue-400 mt-2.5 flex-shrink-0" />
                            <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {processInlineMarkdown(line.slice(2))}
                            </span>
                        </li>
                    );
                }

                // Numbered lists with bold items
                const numberedMatch = line.match(
                    /^(\d+)\.\s+\*\*(.+?)\*\*:?\s*(.*)/
                );
                if (numberedMatch) {
                    return (
                        <li key={key} className="flex items-start gap-4 my-4 ml-1">
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] text-white text-sm flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                                {numberedMatch[1]}
                            </span>
                            <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5">
                                <strong className="text-neutral-900 dark:text-white font-semibold">
                                    {numberedMatch[2]}
                                </strong>
                                {numberedMatch[3] &&
                                    `: ${numberedMatch[3]}`}
                            </span>
                        </li>
                    );
                }

                const simpleNumberedMatch = line.match(/^(\d+)\.\s+(.*)/);
                if (simpleNumberedMatch) {
                    return (
                        <li key={key} className="flex items-start gap-4 my-4 ml-1">
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] text-white text-sm flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                                {simpleNumberedMatch[1]}
                            </span>
                            <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5">
                                {processInlineMarkdown(simpleNumberedMatch[2])}
                            </span>
                        </li>
                    );
                }

                // Horizontal rule
                if (line === "---") {
                    return (
                        <div key={key} className="my-12 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
                        </div>
                    );
                }

                // Regular paragraphs
                if (line.trim()) {
                    const shouldDropCap = isFirstParagraph;
                    if (isFirstParagraph) {
                        isFirstParagraph = false;
                    }

                    if (shouldDropCap) {
                        return (
                            <p
                                key={key}
                                className="text-neutral-700 dark:text-neutral-300 leading-[1.85] my-6 text-lg first-letter:text-5xl first-letter:font-bold first-letter:text-[#1E4DB7] dark:first-letter:text-blue-400 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none"
                            >
                                {processInlineMarkdown(line)}
                            </p>
                        );
                    }

                    return (
                        <p
                            key={key}
                            className="text-neutral-700 dark:text-neutral-300 leading-[1.85] my-6 text-lg"
                        >
                            {processInlineMarkdown(line)}
                        </p>
                    );
                }

                return null;
            });
        });
    };

    // Process inline markdown (bold, italic, links, inline code)
    const processInlineMarkdown = (text: string) => {
        // Handle inline code
        text = text.replace(
            /`([^`]+)`/g,
            '<code class="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-blue-400/10 dark:text-blue-400 px-2 py-0.5 rounded-md text-sm font-mono font-medium">$1</code>'
        );
        // Handle bold
        text = text.replace(
            /\*\*([^*]+)\*\*/g,
            '<strong class="font-semibold text-neutral-900 dark:text-white">$1</strong>'
        );
        // Handle italic
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        // Handle inline images within text: ![alt](src)
        text = text.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" class="inline-block max-h-6 align-text-bottom" />'
        );
        // Handle links: [text](url)
        text = text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-[#1E4DB7] dark:text-blue-400 underline underline-offset-2 decoration-[#1E4DB7]/30 dark:decoration-blue-400/30 hover:decoration-[#1E4DB7] dark:hover:decoration-blue-400 hover:text-[#143A8F] dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return <span dangerouslySetInnerHTML={{ __html: text }} />;
    };

    return (
        <div className="prose-custom max-w-none">{processContent(content)}</div>
    );
}

// =============================================================================
// Sticky TOC Sidebar
// =============================================================================

function StickyTOCSidebar({
    headings,
    activeId,
    onHeadingClick,
    tags,
    minLevel = 2,
}: {
    headings: Heading[];
    activeId: string;
    onHeadingClick: (id: string) => void;
    tags?: Array<{ id: string; name: string; slug?: string }>;
    minLevel?: number;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (headings.length < 3) return null;

    return (
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg overflow-hidden"
                >
                    {/* Header */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 dark:from-neutral-800/50 to-white dark:to-neutral-900 hover:from-neutral-100 dark:hover:from-neutral-800 hover:to-neutral-50 dark:hover:to-neutral-900 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1E4DB7]/10 dark:bg-blue-500/10 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                Table of Contents
                            </span>
                        </div>
                        <motion.div
                            animate={{ rotate: isCollapsed ? -90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                        </motion.div>
                    </button>

                    {/* Navigation */}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <nav className="p-4 pt-0">
                                    {/* Progress indicator */}
                                    <div className="mb-4">
                                        <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
                                                style={{
                                                    width: `${((headings.findIndex((h) => h.id === activeId) + 1) / headings.length) * 100}%`,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                                            {headings.findIndex(
                                                (h) => h.id === activeId
                                            ) + 1}{" "}
                                            of {headings.length} sections
                                        </p>
                                    </div>

                                    {/* Heading links */}
                                    <ul className="space-y-1 border-l-2 border-neutral-100 dark:border-neutral-800">
                                        {headings.map((heading, index) => (
                                            <motion.li
                                                key={heading.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.03,
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        onHeadingClick(
                                                            heading.id
                                                        )
                                                    }
                                                    className={cn(
                                                        "w-full text-left text-sm py-2 px-4 transition-all duration-200 -ml-[2px] border-l-2",
                                                        activeId === heading.id
                                                            ? "text-[#1E4DB7] dark:text-blue-400 font-medium border-[#1E4DB7] dark:border-blue-400 bg-[#1E4DB7]/5 dark:bg-blue-500/10"
                                                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                                                    )}
                                                    style={{
                                                        paddingLeft: `${(heading.level - minLevel) * 12 + 16}px`,
                                                    }}
                                                >
                                                    <span className="line-clamp-2 leading-snug">
                                                        {heading.text}
                                                    </span>
                                                </button>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Tags Section */}
                {tags && tags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-5"
                    >
                        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                            <Hash className="h-4 w-4 text-[#F59A23]" />
                            Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/blogs/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="px-3 py-1.5 bg-[#1E4DB7]/5 dark:bg-blue-500/10 text-[#1E4DB7] dark:text-blue-400 text-xs font-medium rounded-full hover:bg-[#1E4DB7]/10 dark:hover:bg-blue-500/20 transition-colors"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Reading Time Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6 bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] rounded-2xl p-5 text-white shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-white/80" />
                        <span className="text-sm font-semibold">
                            Quick Share
                        </span>
                    </div>
                    <p className="text-xs text-white/70 mb-4">
                        Found this helpful? Share it with others.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                window.open(
                                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                                    "_blank"
                                )
                            }
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label="Share on Twitter"
                        >
                            <Twitter className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() =>
                                window.open(
                                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                                    "_blank"
                                )
                            }
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label="Share on LinkedIn"
                        >
                            <Linkedin className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() =>
                                window.open(
                                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                    "_blank"
                                )
                            }
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label="Share on Facebook"
                        >
                            <Facebook className="h-3.5 w-3.5" />
                        </button>
                        <CopyLinkInline />
                    </div>
                </motion.div>
            </div>
        </aside>
    );
}

// Small copy link button for sidebar
function CopyLinkInline() {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Copy link"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <Link2 className="h-3.5 w-3.5" />
            )}
        </button>
    );
}

// =============================================================================
// Article Footer — Tags + Share + Actions
// =============================================================================

function ArticleFooter({
    tags,
    title,
    url,
}: {
    tags?: Array<{ id: string; name: string; slug?: string }>;
    title: string;
    url: string;
}) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700/50"
        >
            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                        Tagged in
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/blogs/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-")}`}
                                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl hover:bg-[#1E4DB7]/10 dark:hover:bg-blue-500/10 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-all duration-200"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Share Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 px-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        Enjoyed this article?
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Share it with your network
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white transition-all duration-300"
                        aria-label="Share on Twitter"
                    >
                        <Twitter className="h-4 w-4" />
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all duration-300"
                        aria-label="Share on LinkedIn"
                    >
                        <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all duration-300"
                        aria-label="Share on Facebook"
                    >
                        <Facebook className="h-4 w-4" />
                    </a>
                    <a
                        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#F59A23] hover:border-[#F59A23] hover:text-white transition-all duration-300"
                        aria-label="Share via Email"
                    >
                        <Mail className="h-4 w-4" />
                    </a>
                    <button
                        onClick={copyLink}
                        className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300",
                            copied
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-[#1E4DB7] hover:border-[#1E4DB7] hover:text-white"
                        )}
                        aria-label={copied ? "Copied!" : "Copy link"}
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Link2 className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#1E4DB7] hover:border-[#1E4DB7] hover:text-white transition-all duration-300"
                        aria-label="Print article"
                    >
                        <Printer className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// Author Bio Section
// =============================================================================

function AuthorBioSection({
    author,
}: {
    author: BlogPostWithRelations["author"];
}) {
    if (!author) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-700/50"
        >
            <div className="bg-gradient-to-br from-[#1E4DB7]/5 dark:from-[#1E4DB7]/10 via-white dark:via-neutral-900 to-[#F59A23]/5 dark:to-[#F59A23]/10 rounded-3xl p-8 md:p-10 border border-neutral-100 dark:border-neutral-800 shadow-lg">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                        {author.avatar ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-neutral-800">
                                <Image
                                    src={author.avatar}
                                    alt={author.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <CartoonAvatar name={author.name} size="xl" />
                        )}
                    </div>

                    {/* Author Info */}
                    <div className="flex-1">
                        <p className="text-sm text-[#F59A23] font-bold uppercase tracking-wider mb-2">
                            About the Author
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                            {author.name}
                        </h3>
                        <p className="text-[#1E4DB7] dark:text-blue-400 font-semibold mb-4">
                            {author.role}
                        </p>
                        {author.bio && (
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                                {author.bio}
                            </p>
                        )}

                        {/* Social Links & CTA */}
                        <div className="flex flex-wrap items-center gap-4">
                            {author.socialLinks?.twitter && (
                                <a
                                    href={author.socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#1DA1F2] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {author.socialLinks?.linkedin && (
                                <a
                                    href={author.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#0A66C2] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                            {author.socialLinks?.email && (
                                <a
                                    href={`mailto:${author.socialLinks.email}`}
                                    className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#F59A23] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300"
                                >
                                    <Mail className="h-5 w-5" />
                                </a>
                            )}

                            <Link
                                href={`/blogs?author=${author.slug}`}
                                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300 group"
                            >
                                More by {author.name.split(" ")[0]}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

// =============================================================================
// Post Navigation — Previous / Next
// =============================================================================

function PostNavigation({
    adjacentPosts,
}: {
    adjacentPosts?: {
        previous?: { slug: string; title: string } | null;
        next?: { slug: string; title: string } | null;
    };
}) {
    if (!adjacentPosts) return null;
    const { previous, next } = adjacentPosts;
    if (!previous && !next) return null;

    return (
        <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4"
            aria-label="Post navigation"
        >
            {/* Previous */}
            {previous ? (
                <Link
                    href={`/blogs/${previous.slug}`}
                    className="group flex items-start gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-[#1E4DB7]/30 dark:hover:border-blue-500/30 hover:shadow-lg transition-all duration-300"
                >
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E4DB7]/10 dark:group-hover:bg-blue-500/10 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-neutral-500 dark:text-neutral-400 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                            Previous
                        </span>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                            {previous.title}
                        </p>
                    </div>
                </Link>
            ) : (
                <div />
            )}

            {/* Next */}
            {next ? (
                <Link
                    href={`/blogs/${next.slug}`}
                    className="group flex items-start gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-[#1E4DB7]/30 dark:hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 text-right"
                >
                    <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                            Next
                        </span>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1 line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                            {next.title}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E4DB7]/10 dark:group-hover:bg-blue-500/10 transition-colors">
                        <ArrowRight className="h-5 w-5 text-neutral-500 dark:text-neutral-400 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                </Link>
            ) : (
                <div />
            )}
        </motion.nav>
    );
}

// =============================================================================
// Related Articles Section
// =============================================================================

function RelatedArticlesSection({
    posts,
}: {
    posts: BlogPostWithRelations[];
}) {
    if (posts.length === 0) return null;

    return (
        <section className="mt-20 pt-16 border-t border-neutral-200 dark:border-neutral-700/50">
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-3 mb-4"
                >
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#1E4DB7]" />
                    <span className="text-sm font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                        Continue Reading
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#1E4DB7]" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white"
                >
                    Related{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                        Articles
                    </span>
                </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                    <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={`/blogs/${post.slug}`}
                            className="group block bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-md hover:shadow-xl transition-all duration-500"
                        >
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                {post.featuredImage ? (
                                    <Image
                                        src={post.featuredImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] to-[#143A8F]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className="px-3 py-1 text-white text-xs font-semibold uppercase rounded-full"
                                        style={{
                                            backgroundColor:
                                                post.category?.accentColor ||
                                                "#1E4DB7",
                                        }}
                                    >
                                        {post.category?.name}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors mb-3">
                                    {post.title}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-4">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                                        {post.readingTime} min read
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E4DB7] dark:text-blue-400 group-hover:text-[#F59A23] transition-colors">
                                        Read More
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>

                            {/* Hover accent line */}
                            <div className="h-1 bg-gradient-to-r from-[#1E4DB7] to-[#F59A23] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </Link>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}

// =============================================================================
// Main Blog Article Client Component
// =============================================================================

export function BlogArticleClient({
    post,
    relatedPosts,
    adjacentPosts,
}: BlogArticleClientProps) {
    const articleRef = useRef<HTMLElement>(null);
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    // Extract headings from content
    useEffect(() => {
        if (!post.content) return;

        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        const extractedHeadings: Heading[] = [];
        let match;

        while ((match = headingRegex.exec(post.content)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = generateId(text);
            extractedHeadings.push({ id, text, level });
        }

        setHeadings(extractedHeadings);
        if (extractedHeadings.length > 0) {
            setActiveId(extractedHeadings[0].id);
        }
    }, [post.content]);

    // Scroll spy for active heading
    useEffect(() => {
        if (headings.length === 0) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;
            let currentHeading = headings[0]?.id || "";

            for (const heading of headings) {
                const element = document.getElementById(heading.id);
                if (element) {
                    const { top } = element.getBoundingClientRect();
                    const absoluteTop = top + window.scrollY;

                    if (absoluteTop <= scrollPosition) {
                        currentHeading = heading.id;
                    }
                }
            }

            setActiveId(currentHeading);
        };

        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", throttledHandleScroll, {
            passive: true,
        });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", throttledHandleScroll);
        };
    }, [headings]);

    // Smooth scroll to heading
    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const top =
                element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({
                top,
                behavior: "smooth",
            });
        }
    }, []);

    const shareUrl =
        typeof window !== "undefined"
            ? window.location.href
            : `https://drkatangablog.com/blogs/${post.slug}`;

    return (
        <LightboxGalleryProvider>
            <section className="w-full py-12 md:py-20 bg-white dark:bg-neutral-950">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Sticky TOC Sidebar - Desktop Only */}
                        <StickyTOCSidebar
                            headings={headings}
                            activeId={activeId}
                            onHeadingClick={scrollToHeading}
                            tags={post.tags}
                        />

                        {/* Main Article Content */}
                        <article
                            ref={articleRef}
                            className={cn(
                                "lg:col-span-9",
                                headings.length < 3 &&
                                    "lg:col-span-8 lg:col-start-3"
                            )}
                            data-content
                        >
                            {/* Breadcrumbs */}
                            <Breadcrumbs
                                category={post.category}
                                title={post.title}
                            />

                            {/* Mobile TOC */}
                            <MobileTOC
                                headings={headings}
                                activeId={activeId}
                                onHeadingClick={scrollToHeading}
                            />

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-wrap gap-2 mb-10"
                                >
                                    {post.tags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/blogs/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="px-4 py-1.5 bg-[#1E4DB7]/10 dark:bg-blue-500/10 text-[#1E4DB7] dark:text-blue-400 text-sm font-medium rounded-full hover:bg-[#1E4DB7]/20 dark:hover:bg-blue-500/20 transition-colors"
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}

                            {/* Article Body */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="max-w-[75ch] mx-auto lg:mx-0"
                                style={{ maxWidth: "75ch" }}
                            >
                                {post.content ? (
                                    <EnhancedMarkdownContent
                                        content={post.content}
                                    />
                                ) : (
                                    <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                                        No content available.
                                    </p>
                                )}
                            </motion.div>

                            {/* Article Footer — Tags + Share */}
                            <ArticleFooter
                                tags={post.tags}
                                title={post.title}
                                url={shareUrl}
                            />

                            {/* Author Bio */}
                            <AuthorBioSection author={post.author} />

                            {/* Previous / Next Navigation */}
                            <PostNavigation adjacentPosts={adjacentPosts} />

                            {/* Related Articles */}
                            <RelatedArticlesSection posts={relatedPosts} />
                        </article>
                    </div>
                </div>
            </section>
        </LightboxGalleryProvider>
    );
}
