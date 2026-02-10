"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Globe,
  Calendar,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Sparkles,
  Pencil,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@ktblog/ui/lib/utils";
import { formatDate } from "@/lib/format";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Types
// =============================================================================

interface PublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  coverImageUrl?: string;
  isCreator?: boolean;
  specialties?: string[];
  createdAt: string;
  stats: {
    showcaseCount: number;
    reviewCount: number;
    threadCount: number;
    replyCount: number;
    questionCount: number;
    answerCount: number;
  };
  gamification?: {
    level: number;
    currentXP: number;
    nextLevelXP: number;
  };
}

interface ProfileHeaderProps {
  profile: PublicProfile;
}

// =============================================================================
// Helpers
// =============================================================================

function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getDisplayName(
  firstName?: string,
  lastName?: string,
  username?: string,
): string {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || username || "Anonymous";
}

// =============================================================================
// Specialty Colors
// =============================================================================

const SPECIALTY_COLORS = [
  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
];

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
  const { user } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  const displayName = getDisplayName(
    profile.firstName,
    profile.lastName,
    profile.username,
  );

  const hasSocialLinks =
    profile.socialLinks?.twitter ||
    profile.socialLinks?.linkedin ||
    profile.socialLinks?.github;

  const isOwnProfile =
    user?.username && profile.username && user.username === profile.username;

  const xpProgress =
    profile.gamification && profile.gamification.nextLevelXP > 0
      ? (profile.gamification.currentXP / profile.gamification.nextLevelXP) *
        100
      : 0;

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
      <div className="relative h-[300px] overflow-hidden">
        {profile.coverImageUrl ? (
          <Image
            src={profile.coverImageUrl}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Edit Profile button (top-right, only for own profile) */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4"
          >
            <Link
              href="/dashboard/profile"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
                "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm",
                "text-neutral-900 dark:text-white",
                "hover:bg-white dark:hover:bg-neutral-800",
                "border border-white/20 dark:border-neutral-700/50",
                "shadow-lg transition-all duration-200",
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("editProfile")}
            </Link>
          </motion.div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Profile Info                                                      */}
      {/* ================================================================= */}
      <div className="relative px-5 md:px-8 pb-6">
        {/* Avatar */}
        <motion.div
          variants={fadeInUp}
          className="relative -mt-12 mb-4 inline-block"
        >
          {profile.avatar && !avatarError ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-lg">
              <Image
                src={profile.avatar}
                alt={displayName}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                priority
                onError={() => setAvatarError(true)}
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-neutral-900 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #1E4DB7 0%, #F59A23 100%)",
              }}
            >
              <span className="text-2xl font-bold text-white">
                {getUserInitials(profile.firstName, profile.lastName)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Name + Badges */}
        <motion.div variants={fadeInUp} className="mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {displayName}
            </h1>

            {/* Creator badge */}
            {profile.isCreator && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                  "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
                  "text-amber-700 dark:text-amber-400",
                  "border border-amber-200/50 dark:border-amber-700/30",
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("creator")}
              </span>
            )}

            {/* Gamification Level Badge */}
            {profile.gamification && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                  "bg-indigo-50 dark:bg-indigo-900/20",
                  "text-indigo-700 dark:text-indigo-400",
                  "border border-indigo-200/50 dark:border-indigo-700/30",
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                {t("level", { level: profile.gamification.level })}
              </span>
            )}
          </div>

          {/* Username */}
          {profile.username && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              @{profile.username}
            </p>
          )}
        </motion.div>

        {/* Gamification XP Progress Bar */}
        {profile.gamification && (
          <motion.div variants={fadeInUp} className="mb-4 max-w-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
              <span className="font-medium">
                {t("xpProgress", {
                  current: profile.gamification.currentXP.toLocaleString(),
                  next: profile.gamification.nextLevelXP.toLocaleString(),
                })}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                transition={{
                  duration: 1,
                  delay: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Bio */}
        {profile.bio && (
          <motion.p
            variants={fadeInUp}
            className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mb-4 whitespace-pre-wrap"
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-2 flex-wrap mb-4"
          >
            {profile.specialties.map((specialty, index) => (
              <span
                key={specialty}
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                  SPECIALTY_COLORS[index % SPECIALTY_COLORS.length],
                )}
              >
                {specialty}
              </span>
            ))}
          </motion.div>
        )}

        {/* Website + Social Links + Member since */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-4 flex-wrap text-sm"
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
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
