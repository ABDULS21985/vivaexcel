"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@ktblog/ui/components";
import type { Showcase } from "@/types/showcase";

// =============================================================================
// ShowcaseCard
// =============================================================================
// A masonry-style card for the showcase gallery. Displays an image with a
// hover overlay showing title, user info, like count, and comment count.

interface ShowcaseCardProps {
  showcase: Showcase;
}

export function ShowcaseCard({ showcase }: ShowcaseCardProps) {
  const t = useTranslations("showcase");
  const [imageError, setImageError] = useState(false);

  const primaryImage = showcase.images?.[0];
  const userName = showcase.user
    ? `${showcase.user.firstName} ${showcase.user.lastName}`
    : t("anonymousUser");

  return (
    <Link href={`/community/showcases/${showcase.id}`}>
      <motion.div
        className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image */}
        <div className="relative w-full">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={showcase.title}
              width={600}
              height={0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover"
              style={{ aspectRatio: "auto" }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("noImage")}
              </span>
            </div>
          )}

          {/* Featured badge */}
          {showcase.status === "featured" && (
            <div className="absolute start-3 top-3 z-10">
              <Badge className="gap-1 bg-amber-500 text-white hover:bg-amber-600">
                <Star className="h-3 w-3 fill-current" />
                {t("featured")}
              </Badge>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Title */}
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white">
              {showcase.title}
            </h3>

            {/* User info + stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* User avatar */}
                {showcase.user?.avatar ? (
                  <Image
                    src={showcase.user.avatar}
                    alt={userName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/80 text-[10px] font-bold text-white">
                    {showcase.user?.firstName?.[0] ?? "?"}
                  </div>
                )}
                <span className="text-sm text-white/90">{userName}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <Heart className="h-4 w-4" />
                  {showcase.likesCount}
                </span>
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <MessageCircle className="h-4 w-4" />
                  {showcase.commentsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar: product badge + tags (always visible) */}
        <div className="flex flex-wrap items-center gap-2 p-3">
          {/* Product badge */}
          {showcase.product && (
            <Badge variant="secondary" className="text-xs">
              {showcase.product.title}
            </Badge>
          )}

          {/* Tags */}
          {showcase.tags?.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs text-neutral-600 dark:text-neutral-300"
            >
              {tag}
            </Badge>
          ))}
          {showcase.tags && showcase.tags.length > 3 && (
            <span className="text-xs text-neutral-400">
              +{showcase.tags.length - 3}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default ShowcaseCard;
