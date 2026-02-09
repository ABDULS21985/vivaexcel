"use client";

import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  FolderOpen,
  Cpu,
  Palette,
  Zap,
  Brain,
  Code2,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterSignup } from "@/components/shared/newsletter-signup";
import {
  getFeaturedPost,
  getLatestPosts,
  getTrendingPosts,
  getCategoriesWithCounts,
} from "@/data/blog-posts";

// ============================================
// DATA
// ============================================

const featuredPost = getFeaturedPost();
const latestPosts = getLatestPosts(6);
const trendingPosts = getTrendingPosts(5);
const categoriesWithCounts = getCategoriesWithCounts();

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  technology: Cpu,
  design: Palette,
  productivity: Zap,
  "ai-machine-learning": Brain,
  "web-development": Code2,
  "career-growth": Briefcase,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
  const categoryColor = featuredPost.category?.color || "#1E4DB7";

  return (
    <section className="relative w-full min-h-[70vh] lg:min-h-[80vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {featuredPost.featuredImage ? (
          <Image
            src={featuredPost.featuredImage}
            alt={featuredPost.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pb-12 pt-32 lg:pb-20 lg:pt-40">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Category Badge */}
            {featuredPost.category && (
              <motion.div variants={fadeInUp} custom={0}>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white mb-4"
                  style={{
                    backgroundColor: categoryColor,
                    boxShadow: `0 4px 14px ${categoryColor}40`,
                  }}
                >
                  Featured Article
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4"
            >
              {featuredPost.title}
            </motion.h1>

            {/* Excerpt */}
            {featuredPost.excerpt && (
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-6 max-w-2xl"
              >
                {featuredPost.excerpt}
              </motion.p>
            )}

            {/* Meta & CTA */}
            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              {/* Author + Meta */}
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                {featuredPost.author && (
                  <span className="font-medium text-white">
                    {featuredPost.author.name}
                  </span>
                )}
                {featuredPost.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                )}
                {featuredPost.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.readingTime} min read
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition-colors duration-200 btn-press w-fit"
              >
                Read Article
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// LATEST POSTS GRID
// ============================================

function LatestPostsSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex items-center justify-between mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          custom={0}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Latest Articles
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm sm:text-base">
              Fresh insights and tutorials from our expert writers
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Post Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {latestPosts.map((post, i) => (
            <motion.div key={post.id} variants={fadeInUp} custom={i}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile "View All" link */}
        <div className="flex justify-center mt-8 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// NEWSLETTER CTA SECTION
// ============================================

function NewsletterCTASection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            custom={0}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
          >
            Stay in the loop
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={1}
            className="text-base sm:text-lg text-white/80 mb-8 max-w-lg mx-auto"
          >
            Join 5,000+ developers and designers who get our best articles delivered directly to their inbox every week.
          </motion.p>

          <motion.div variants={fadeInUp} custom={2}>
            <NewsletterSignup
              variant="inline"
              placeholder="Enter your email address"
              buttonText="Subscribe"
              className="max-w-md mx-auto"
            />
          </motion.div>

          <motion.p
            variants={fadeInUp}
            custom={3}
            className="text-xs text-white/50 mt-4"
          >
            No spam. Unsubscribe anytime. We respect your privacy.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// CATEGORIES SECTION
// ============================================

function CategoriesSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          custom={0}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Explore by Category
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm sm:text-base">
            Dive deep into the topics that matter to you
          </p>
        </motion.div>

        {/* Horizontal scrollable categories */}
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:overflow-visible"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {categoriesWithCounts.map((category, i) => {
            const IconComponent = categoryIcons[category.slug] || FolderOpen;
            return (
              <motion.div key={category.id} variants={fadeInUp} custom={i}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center gap-3 min-w-[140px] lg:min-w-0 p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {category.postCount} {category.postCount === 1 ? "article" : "articles"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// TRENDING POSTS SECTION
// ============================================

function TrendingPostsSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex items-center gap-2 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          custom={0}
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Trending Now
          </h2>
        </motion.div>

        {/* Numbered list of trending articles */}
        <motion.div
          className="space-y-0 divide-y divide-neutral-100 dark:divide-neutral-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {trendingPosts.map((post, i) => (
            <motion.div key={post.id} variants={fadeInUp} custom={i}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-4 sm:gap-6 py-5 hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-4 px-4 rounded-xl transition-colors duration-200"
              >
                {/* Number */}
                <span className="text-3xl sm:text-4xl font-bold text-neutral-200 dark:text-neutral-700 group-hover:text-primary/30 transition-colors flex-shrink-0 w-10 sm:w-12 text-right tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {post.category && (
                      <span
                        className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-white"
                        style={{ backgroundColor: post.category.color || "#1E4DB7" }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} min read
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// ABOUT / MISSION SECTION
// ============================================

function AboutSection() {
  const stats = [
    { icon: BookOpen, label: "Articles Published", value: "500+" },
    { icon: Users, label: "Active Subscribers", value: "5,000+" },
    { icon: FolderOpen, label: "Categories", value: "6" },
  ];

  return (
    <section className="w-full py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            custom={0}
            className="overline text-primary mb-3"
          >
            Our Mission
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            custom={1}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4"
          >
            Empowering Builders with Knowledge
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            VivaExcel Blog is dedicated to helping developers, designers, and tech professionals level up their skills through expert-crafted content. We believe that accessible, high-quality knowledge is the foundation of innovation.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                custom={i + 3}
                className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700"
              >
                <stat.icon className="w-6 h-6 text-primary mb-1" />
                <span className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// HOMEPAGE CLIENT COMPONENT
// ============================================

export function HomepageClient() {
  return (
    <>
      {/* Hero Section — featured post with cover image background */}
      <HeroSection />

      {/* Latest Posts Grid — 3x2 responsive grid */}
      <LatestPostsSection />

      {/* Newsletter CTA — full-width gradient */}
      <NewsletterCTASection />

      {/* Categories Showcase — horizontal scrollable */}
      <CategoriesSection />

      {/* Trending Posts — numbered list */}
      <TrendingPostsSection />

      {/* About / Mission — stats */}
      <AboutSection />
    </>
  );
}
