"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Badge } from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { useDiscussionCategories, useDiscussionThreads } from "@/hooks/use-discussions";
import { useShowcases } from "@/hooks/use-showcases";
import { CategoryCard } from "@/components/community/category-card";
import { ThreadCard } from "@/components/community/thread-card";

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// =============================================================================
// Component
// =============================================================================

export default function CommunityClient() {
  const t = useTranslations("community");
  const { isAuthenticated } = useAuth();

  // Fetch data
  const categoriesQuery = useDiscussionCategories();
  const threadsQuery = useDiscussionThreads({ limit: 5 });
  const showcasesQuery = useShowcases({ limit: 6 });

  const categories = categoriesQuery.data ?? [];
  const recentThreads = useMemo(() => {
    if (!threadsQuery.data?.pages) return [];
    return threadsQuery.data.pages.flatMap((page) => page.items).slice(0, 5);
  }, [threadsQuery.data]);

  const latestShowcases = useMemo(() => {
    if (!showcasesQuery.data?.pages) return [];
    return showcasesQuery.data.pages.flatMap((page) => page.items).slice(0, 6);
  }, [showcasesQuery.data]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ================================================================= */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================= */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B]" />

        {/* Decorative overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, #6366F1 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, #F59A23 0%, transparent 50%)",
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#F59A23]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <Users className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                  {t("badge")}
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              {t("heroTitle")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t("heroSubtitle")}
            </motion.p>

            {/* Quick action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/community/showcases">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <ImageIcon className="h-4 w-4 me-2" />
                  {t("browseShowcases")}
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link href="/community/discussions/new">
                  <Button
                    size="lg"
                    className="bg-[#F59A23] hover:bg-[#E08A13] text-white border-0"
                  >
                    <Plus className="h-4 w-4 me-2" />
                    {t("startDiscussion")}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-[#F59A23] hover:bg-[#E08A13] text-white border-0"
                  >
                    <Plus className="h-4 w-4 me-2" />
                    {t("startDiscussion")}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* DISCUSSION CATEGORIES GRID                                         */}
      {/* ================================================================= */}
      <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px bg-[#1E4DB7]" />
                <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                  {t("discussionCategoriesLabel")}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {t("discussionCategoriesTitle")}
              </h2>
            </div>
            <Link
              href="/community/discussions"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Grid */}
          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-1" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
                  <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {categories.map((category) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
              <p>{t("noCategories")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* LATEST SHOWCASES — Horizontal scroll                               */}
      {/* ================================================================= */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px bg-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-[#F59A23] uppercase">
                  <Sparkles className="inline h-3 w-3 me-1" />
                  {t("latestShowcasesLabel")}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {t("latestShowcasesTitle")}
              </h2>
            </div>
            <Link
              href="/community/showcases"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll */}
          {showcasesQuery.isLoading ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 h-40 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : latestShowcases.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              {latestShowcases.map((showcase) => (
                <Link
                  key={showcase.id}
                  href={`/community/showcases/${showcase.id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="relative w-64 h-40 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    {showcase.images?.[0] ? (
                      <img
                        src={showcase.images[0]}
                        alt={showcase.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-neutral-400" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {showcase.title}
                      </h4>
                      {showcase.user && (
                        <p className="text-xs text-white/70 mt-0.5">
                          {showcase.user.firstName} {showcase.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
              <p>{t("noShowcases")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* RECENT DISCUSSIONS                                                 */}
      {/* ================================================================= */}
      <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px bg-emerald-500" />
                <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  {t("recentDiscussionsLabel")}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {t("recentDiscussionsTitle")}
              </h2>
            </div>
            <Link
              href="/community/discussions"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors"
            >
              {t("viewAllDiscussions")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Thread list */}
          {threadsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded mt-0.5" />
                    <div className="flex-1">
                      <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
                      <div className="flex gap-4">
                        <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentThreads.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentThreads.map((thread) => (
                <motion.div key={thread.id} variants={itemVariants}>
                  <ThreadCard thread={thread} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
              <p>{t("noDiscussions")}</p>
            </div>
          )}

          {/* View all link (mobile) */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/community/discussions">
              <Button variant="outline">
                {t("viewAllDiscussions")}
                <ArrowRight className="h-4 w-4 ms-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
