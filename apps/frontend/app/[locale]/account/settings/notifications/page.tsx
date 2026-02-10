"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  Smartphone,
  Monitor,
  Send,
  Loader2,
  Save,
  Check,
  ShoppingCart,
  Star,
  Package,
  Megaphone,
  Users,
  Trophy,
  Tag,
  ArrowLeft,
  Shield,
  Newspaper,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Switch, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { EmailDigestFrequency, NotificationChannel } from "@/types/notification";
import {
  useNotificationPreferences,
  useUpdatePreferences,
  useTestPush,
} from "@/hooks/use-notifications";

// =============================================================================
// Notification Preferences Page
// =============================================================================
// Matrix layout for channel toggles per category, quiet hours, and digest settings.

// -----------------------------------------------------------------------------
// Category Configuration
// -----------------------------------------------------------------------------

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  securityLocked?: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "orders",
    label: "Orders",
    description: "Order confirmations, shipping updates, delivery notices",
    icon: ShoppingCart,
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "New reviews on your products, review responses",
    icon: Star,
  },
  {
    key: "productUpdates",
    label: "Product Updates",
    description: "Version updates, new features, compatibility changes",
    icon: Package,
  },
  {
    key: "promotions",
    label: "Promotions",
    description: "Sales, discount codes, special offers",
    icon: Megaphone,
  },
  {
    key: "community",
    label: "Community",
    description: "Discussion replies, mentions, new followers",
    icon: Users,
  },
  {
    key: "achievements",
    label: "Achievements",
    description: "Badges earned, level ups, streak milestones",
    icon: Trophy,
  },
  {
    key: "priceDrops",
    label: "Price Drops",
    description: "Price reductions on wishlist and followed items",
    icon: Tag,
  },
  {
    key: "backInStock",
    label: "Back in Stock",
    description: "Items you wanted are available again",
    icon: Package,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Weekly digest, featured products, platform news",
    icon: Newspaper,
  },
  {
    key: "security",
    label: "Security",
    description: "Login alerts, password changes, suspicious activity",
    icon: Shield,
    securityLocked: true,
  },
];

// Channel configuration
const CHANNELS = [
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
  { key: "inApp", label: "In-App", icon: Monitor },
];

// Digest frequency options
const DIGEST_OPTIONS: { value: EmailDigestFrequency; label: string; description: string }[] = [
  {
    value: EmailDigestFrequency.INSTANT,
    label: "Instant",
    description: "Receive emails as events happen",
  },
  {
    value: EmailDigestFrequency.DAILY,
    label: "Daily",
    description: "One summary email per day",
  },
  {
    value: EmailDigestFrequency.WEEKLY,
    label: "Weekly",
    description: "One summary email per week",
  },
  {
    value: EmailDigestFrequency.NONE,
    label: "None",
    description: "No digest emails at all",
  },
];

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// Time options for quiet hours
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      options.push(`${hour}:${min}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function PreferencesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <Skeleton className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
            <div className="flex gap-6">
              <Skeleton className="w-10 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="w-10 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="w-10 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function NotificationPreferencesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Local preferences state (matrix: categoryKey -> channelKey -> boolean)
  const [categoryToggles, setCategoryToggles] = useState<
    Record<string, Record<string, boolean>>
  >(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    CATEGORIES.forEach((cat) => {
      initial[cat.key] = {
        email: true,
        push: true,
        inApp: true,
      };
      // Security is always on for all channels
      if (cat.securityLocked) {
        initial[cat.key] = { email: true, push: true, inApp: true };
      }
    });
    return initial;
  });

  // Quiet hours state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [timezone, setTimezone] = useState("UTC");

  // Email digest state
  const [emailDigest, setEmailDigest] = useState<EmailDigestFrequency>(
    EmailDigestFrequency.DAILY
  );

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/settings/notifications");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch existing preferences
  const { data: preferences, isLoading: prefsLoading } =
    useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();
  const testPush = useTestPush();

  // Hydrate state from fetched preferences
  useEffect(() => {
    if (preferences && Array.isArray(preferences) && preferences.length > 0) {
      const pref = preferences[0];
      if (pref) {
        // Hydrate category toggles from preferences.categories
        if (pref.categories) {
          setCategoryToggles((prev) => {
            const updated = { ...prev };
            Object.entries(pref.categories).forEach(([key, value]) => {
              // Categories may be stored as "orders.email", "orders.push", etc.
              const parts = key.split(".");
              if (parts.length === 2) {
                const [cat, channel] = parts;
                if (cat && channel && updated[cat]) {
                  updated[cat] = { ...updated[cat], [channel]: !!value };
                }
              }
            });
            return updated;
          });
        }

        if (pref.quietHoursEnabled !== undefined) {
          setQuietHoursEnabled(pref.quietHoursEnabled);
        }
        if (pref.quietHoursStart) setQuietHoursStart(pref.quietHoursStart);
        if (pref.quietHoursEnd) setQuietHoursEnd(pref.quietHoursEnd);
        if (pref.timezone) setTimezone(pref.timezone);
        if (pref.emailDigest) setEmailDigest(pref.emailDigest);
      }
    }
  }, [preferences]);

  // Toggle handler
  const handleToggle = useCallback(
    (categoryKey: string, channelKey: string) => {
      setCategoryToggles((prev) => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          [channelKey]: !prev[categoryKey]?.[channelKey],
        },
      }));
      setIsSaved(false);
    },
    []
  );

  // Save handler
  const handleSave = useCallback(() => {
    // Flatten category toggles into preferences format
    const categories: Record<string, boolean> = {};
    Object.entries(categoryToggles).forEach(([cat, channels]) => {
      Object.entries(channels).forEach(([channel, enabled]) => {
        categories[`${cat}.${channel}`] = enabled;
      });
    });

    updatePreferences.mutate(
      {
        channel: NotificationChannel.IN_APP,
        categories,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        timezone,
        emailDigest,
      },
      {
        onSuccess: () => {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        },
      }
    );
  }, [
    categoryToggles,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    timezone,
    emailDigest,
    updatePreferences,
  ]);

  // Auth loading state
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/70 hover:text-white">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/account"
                    className="text-white/70 hover:text-white"
                  >
                    Account
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/account/notifications"
                    className="text-white/70 hover:text-white"
                  >
                    Notifications
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  Preferences
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Notification Preferences
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Control what notifications you receive and how they are delivered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl">
        {/* Back Link */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 mb-6 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Link href="/account/notifications">
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </Link>
        </Button>

        {prefsLoading ? (
          <PreferencesSkeleton />
        ) : (
          <div className="space-y-6">
            {/* ============================================================= */}
            {/* Channel Toggles Matrix                                        */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Notification Channels
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Choose how you want to be notified for each category
                </p>
              </div>

              {/* Column Headers */}
              <div className="px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center">
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 sm:gap-8">
                    {CHANNELS.map((channel) => {
                      const ChannelIcon = channel.icon;
                      return (
                        <div
                          key={channel.key}
                          className="flex flex-col items-center w-14 sm:w-16"
                        >
                          <ChannelIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mb-1" />
                          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                            {channel.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Rows */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <div
                      key={category.key}
                      className="flex items-center px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      {/* Category Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                            category.securityLocked
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          )}
                        >
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {category.label}
                            </span>
                            {category.securityLocked && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      {/* Channel Toggles */}
                      <div className="flex items-center gap-2 sm:gap-8">
                        {CHANNELS.map((channel) => (
                          <div
                            key={channel.key}
                            className="flex items-center justify-center w-14 sm:w-16"
                          >
                            <Switch
                              checked={
                                category.securityLocked
                                  ? true
                                  : categoryToggles[category.key]?.[channel.key] ?? true
                              }
                              onCheckedChange={() => {
                                if (!category.securityLocked) {
                                  handleToggle(category.key, channel.key);
                                }
                              }}
                              disabled={category.securityLocked}
                              className={cn(
                                category.securityLocked && "opacity-50 cursor-not-allowed"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* ============================================================= */}
            {/* Quiet Hours                                                   */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#F59A23]" />
                      Quiet Hours
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Pause non-urgent notifications during specific hours
                    </p>
                  </div>
                  <Switch
                    checked={quietHoursEnabled}
                    onCheckedChange={(checked) => {
                      setQuietHoursEnabled(checked);
                      setIsSaved(false);
                    }}
                  />
                </div>
              </div>

              {quietHoursEnabled && (
                <div className="px-6 py-5 space-y-5">
                  {/* Time Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Start Time
                      </label>
                      <select
                        value={quietHoursStart}
                        onChange={(e) => {
                          setQuietHoursStart(e.target.value);
                          setIsSaved(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl border text-sm",
                          "bg-neutral-50 dark:bg-neutral-800",
                          "border-neutral-200 dark:border-neutral-700",
                          "text-neutral-900 dark:text-white",
                          "focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent"
                        )}
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={`start-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        End Time
                      </label>
                      <select
                        value={quietHoursEnd}
                        onChange={(e) => {
                          setQuietHoursEnd(e.target.value);
                          setIsSaved(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl border text-sm",
                          "bg-neutral-50 dark:bg-neutral-800",
                          "border-neutral-200 dark:border-neutral-700",
                          "text-neutral-900 dark:text-white",
                          "focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent"
                        )}
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={`end-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      <Globe className="inline w-3.5 h-3.5 mr-1" />
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => {
                        setTimezone(e.target.value);
                        setIsSaved(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border text-sm",
                        "bg-neutral-50 dark:bg-neutral-800",
                        "border-neutral-200 dark:border-neutral-700",
                        "text-neutral-900 dark:text-white",
                        "focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent"
                      )}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info Note */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      During quiet hours, only urgent and security notifications
                      will be delivered. All other notifications will be queued
                      and delivered when quiet hours end.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* ============================================================= */}
            {/* Email Digest Frequency                                        */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#1E4DB7]" />
                  Email Digest Frequency
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  How often should we send you email summaries
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIGEST_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setEmailDigest(option.value);
                        setIsSaved(false);
                      }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                        emailDigest === option.value
                          ? "border-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                          emailDigest === option.value
                            ? "border-[#1E4DB7] bg-[#1E4DB7]"
                            : "border-neutral-300 dark:border-neutral-600"
                        )}
                      >
                        {emailDigest === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            emailDigest === option.value
                              ? "text-[#1E4DB7] dark:text-blue-400"
                              : "text-neutral-900 dark:text-white"
                          )}
                        >
                          {option.label}
                        </span>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ============================================================= */}
            {/* Push Notifications Test                                        */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    Push Notifications
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Test your push notification setup
                  </p>
                </div>
                <Button
                  onClick={() => testPush.mutate()}
                  disabled={testPush.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  {testPush.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : testPush.isSuccess ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {testPush.isPending
                    ? "Sending..."
                    : testPush.isSuccess
                      ? "Sent!"
                      : "Send Test Notification"}
                </Button>
              </div>
            </motion.div>

            {/* ============================================================= */}
            {/* Save Button                                                   */}
            {/* ============================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-end gap-3 pt-2"
            >
              <Button
                variant="outline"
                asChild
                className="gap-1.5"
              >
                <Link href="/account/notifications">Cancel</Link>
              </Button>
              <Button
                onClick={handleSave}
                disabled={updatePreferences.isPending}
                className={cn(
                  "gap-2 min-w-[140px]",
                  isSaved
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#1E4DB7] hover:bg-[#143A8F]"
                )}
              >
                {updatePreferences.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updatePreferences.isPending
                  ? "Saving..."
                  : isSaved
                    ? "Saved!"
                    : "Save Preferences"}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
