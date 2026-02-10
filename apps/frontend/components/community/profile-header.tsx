"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Globe,
  Calendar,
  Twitter,
  Linkedin,
  Github,
  Shield,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { UserStats } from "./user-stats";

// =============================================================================
// Types
// =============================================================================

interface ProfileHeaderProps {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    level?: {
      name: string;
      badge?: string;
    };
    stats?: {
      showcases: number;
      reviews: number;
      threads: number;
      answers: number;
    };
    createdAt: string;
  };
}

// =============================================================================
// Helpers
// =============================================================================

function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getDisplayName(firstName?: string, lastName?: string, username?: string): string {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || username || "Anonymous";
}

// =============================================================================
// Animation Variants
// =============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 16,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const t = useTranslations("profile");

  const displayName = getDisplayName(
    profile.firstName,
    profile.lastName,
    profile.username,
  );

  const hasSocialLinks =
    profile.socialLinks?.twitter ||
    profile.socialLinks?.linkedin ||
    profile.socialLinks?.github;

  const defaultStats = {
    showcases: 0,
    reviews: 0,
    threads: 0,
    answers: 0,
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* ================================================================= */}
      {/* Cover Image                                                       */}
      {/* ================================================================= */}
      <div className="relative h-48 md:h-56 rounded-t-2xl overflow-hidden">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(135deg, #1E4DB7 0%, #6366F1 40%, #F59A23 100%)",
            }}
          />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ================================================================= */}
      {/* Profile Info                                                      */}
      {/* ================================================================= */}
      <div className="relative px-5 md:px-8 pb-6">
        {/* Avatar */}
        <motion.div
          variants={fadeInUp}
          className="relative -mt-16 mb-4 inline-block"
        >
          {profile.avatar ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-lg">
              <Image
                src={profile.avatar}
                alt={displayName}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-neutral-900 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #1E4DB7 0%, #F59A23 100%)",
              }}
            >
              <span className="text-3xl font-bold text-white">
                {getUserInitials(profile.firstName, profile.lastName)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Name + Level badge */}
        <motion.div variants={fadeInUp} className="mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {displayName}
            </h1>
            {profile.level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                <Shield className="h-3.5 w-3.5" />
                {profile.level.name}
              </span>
            )}
          </div>
          {profile.username && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              @{profile.username}
            </p>
          )}
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.p
            variants={fadeInUp}
            className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mb-4 whitespace-pre-wrap"
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Website + Social Links + Member since */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-4 flex-wrap text-sm mb-6"
        >
          {/* Website */}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#1E4DB7] dark:text-blue-400 hover:underline"
            >
              <Globe className="h-4 w-4" />
              <span className="truncate max-w-[200px]">
                {profile.website.replace(/^https?:\/\//, "")}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex items-center gap-2">
              {profile.socialLinks?.twitter && (
                <a
                  href={`https://x.com/${profile.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.socialLinks?.github && (
                <a
                  href={`https://github.com/${profile.socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Member since */}
          <span className="inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <Calendar className="h-4 w-4" />
            {t("memberSince", { date: formatDate(profile.createdAt) })}
          </span>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeInUp}>
          <UserStats stats={profile.stats ?? defaultStats} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
