"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  ChevronRight,
  Star,
  Gift,
  ShoppingBag,
  TrendingUp,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { LoyaltyProgressBar } from "@/components/store/promotions";
import { useAuth } from "@/providers/auth-provider";
import {
  useLoyaltyTiers,
  useUserLoyaltyTier,
} from "@/hooks/use-promotions";
import type { LoyaltyTier } from "@/hooks/use-promotions";

// =============================================================================
// Account Rewards / Loyalty Page
// =============================================================================
// Shows the user their current loyalty tier, progress, benefits,
// and a full tier comparison table.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMonth(monthStr: string): string {
  try {
    const date = new Date(monthStr + "-01");
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return monthStr;
  }
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function RewardsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="w-full h-[200px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      <Skeleton className="w-full h-[300px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      <Skeleton className="w-full h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Current Tier Card
// -----------------------------------------------------------------------------

interface CurrentTierCardProps {
  tier: LoyaltyTier;
  pointsBalance: number;
  memberSince: string;
}

function CurrentTierCard({
  tier,
  pointsBalance,
  memberSince,
}: CurrentTierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Current Tier
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {tier.name}
                </h2>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Member since</p>
            <p className="text-sm font-semibold text-white/90">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(memberSince))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">Discount</p>
            <p className="text-2xl font-bold text-white">
              {tier.discountPercent}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">Points Balance</p>
            <p className="text-2xl font-bold text-white">
              {pointsBalance.toLocaleString()}
            </p>
          </div>
          <div className="hidden md:block bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">Benefits</p>
            <p className="text-2xl font-bold text-white">
              {tier.benefits?.length ?? 0}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Benefits List
// -----------------------------------------------------------------------------

interface BenefitsListProps {
  title: string;
  benefits: string[];
  color: string;
  icon: React.ReactNode;
  isLocked?: boolean;
}

function BenefitsList({
  title,
  benefits,
  color,
  icon,
  isLocked = false,
}: BenefitsListProps) {
  return (
    <div
      className={`rounded-2xl border p-5 md:p-6 ${
        isLocked
          ? "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 opacity-80"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
            {title}
          </h3>
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
              <Lock className="h-2.5 w-2.5" />
              Unlock with next tier
            </span>
          )}
        </div>
      </div>
      <ul className="space-y-2">
        {benefits.map((benefit, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 text-sm ${
              isLocked
                ? "text-neutral-400 dark:text-neutral-500"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {isLocked ? (
              <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-neutral-300 dark:text-neutral-600" />
            ) : (
              <Check
                className="h-3.5 w-3.5 shrink-0 mt-0.5"
                style={{ color }}
              />
            )}
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tier Comparison Table
// -----------------------------------------------------------------------------

interface TierComparisonTableProps {
  tiers: LoyaltyTier[];
  currentTierId?: string;
}

function TierComparisonTable({ tiers, currentTierId }: TierComparisonTableProps) {
  if (tiers.length === 0) return null;

  // Collect all unique benefits across all tiers
  const allBenefits = Array.from(
    new Set(tiers.flatMap((t) => t.benefits ?? [])),
  );

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              Feature
            </th>
            {tiers.map((tier) => (
              <th
                key={tier.id}
                className={cn(
                  "text-center py-3 px-4 text-sm font-bold border-b",
                  currentTierId === tier.id
                    ? "text-white border-transparent"
                    : "text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800",
                )}
                style={{
                  backgroundColor:
                    currentTierId === tier.id ? tier.color : undefined,
                  borderRadius:
                    currentTierId === tier.id ? "12px 12px 0 0" : undefined,
                }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  {tier.name}
                </div>
                {currentTierId === tier.id && (
                  <span className="text-[10px] font-medium opacity-80">
                    (Current)
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Spend required row */}
          <tr className="border-b border-neutral-100 dark:border-neutral-800/50">
            <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
              Minimum Spend
            </td>
            {tiers.map((tier) => (
              <td
                key={tier.id}
                className={cn(
                  "text-center py-3 px-4 text-sm font-medium",
                  currentTierId === tier.id
                    ? "bg-neutral-50 dark:bg-neutral-800/30"
                    : "",
                )}
              >
                {tier.requiredSpend === 0
                  ? "Free"
                  : formatPrice(tier.requiredSpend)}
              </td>
            ))}
          </tr>

          {/* Discount row */}
          <tr className="border-b border-neutral-100 dark:border-neutral-800/50">
            <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
              Discount
            </td>
            {tiers.map((tier) => (
              <td
                key={tier.id}
                className={cn(
                  "text-center py-3 px-4 text-sm font-bold",
                  currentTierId === tier.id
                    ? "bg-neutral-50 dark:bg-neutral-800/30"
                    : "",
                )}
                style={{ color: tier.color }}
              >
                {tier.discountPercent}%
              </td>
            ))}
          </tr>

          {/* Benefit rows */}
          {allBenefits.map((benefit, i) => (
            <tr
              key={i}
              className="border-b border-neutral-100 dark:border-neutral-800/50"
            >
              <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                {benefit}
              </td>
              {tiers.map((tier) => {
                const hasBenefit = tier.benefits?.includes(benefit);
                return (
                  <td
                    key={tier.id}
                    className={cn(
                      "text-center py-3 px-4",
                      currentTierId === tier.id
                        ? "bg-neutral-50 dark:bg-neutral-800/30"
                        : "",
                    )}
                  >
                    {hasBenefit ? (
                      <Check
                        className="h-4 w-4 mx-auto"
                        style={{ color: tier.color }}
                      />
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600">
                        --
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Spending History
// -----------------------------------------------------------------------------

interface SpendingHistoryProps {
  history: Array<{ month: string; amount: number }>;
  currency?: string;
}

function SpendingHistory({ history, currency = "USD" }: SpendingHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No spending history available yet.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(...history.map((h) => h.amount), 1);

  return (
    <div className="space-y-3">
      {history.map((entry, i) => (
        <motion.div
          key={entry.month}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4"
        >
          <span className="text-xs text-neutral-500 dark:text-neutral-400 w-20 shrink-0">
            {formatMonth(entry.month)}
          </span>
          <div className="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(2, (entry.amount / maxAmount) * 100)}%`,
              }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="h-full bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] rounded-full"
            />
          </div>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-20 text-right shrink-0">
            {formatPrice(entry.amount, currency)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------

export default function RewardsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/rewards");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    data: tiersData,
    isLoading: tiersLoading,
  } = useLoyaltyTiers();

  const {
    data: userTierData,
    isLoading: userTierLoading,
    isError: userTierError,
  } = useUserLoyaltyTier();

  const tiers = tiersData ?? [];
  const isLoading = tiersLoading || userTierLoading;

  // Auth loading state
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Page container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/account/orders">Account</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Rewards & Loyalty</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              Rewards & Loyalty
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Track your loyalty progress and unlock exclusive benefits
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <RewardsSkeleton />}

        {/* Error */}
        {!isLoading && userTierError && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 mx-auto">
              <Gift className="w-8 h-8 text-red-300 dark:text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Unable to Load Rewards
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              We could not load your loyalty information. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Main content */}
        {!isLoading && !userTierError && userTierData && (
          <div className="space-y-10">
            {/* ------------------------------------------------------------- */}
            {/* Section 1: Current Tier Display                                */}
            {/* ------------------------------------------------------------- */}
            <CurrentTierCard
              tier={userTierData.currentTier}
              pointsBalance={userTierData.pointsBalance}
              memberSince={userTierData.memberSince}
            />

            {/* ------------------------------------------------------------- */}
            {/* Section 2: Progress to Next Tier                               */}
            {/* ------------------------------------------------------------- */}
            {tiers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-5 w-5 text-[#1E4DB7]" />
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Progress to Next Tier
                  </h2>
                </div>
                <LoyaltyProgressBar
                  currentSpend={userTierData.currentSpend}
                  currentTier={userTierData.currentTier}
                  nextTier={userTierData.nextTier}
                  tiers={tiers}
                />
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Section 3: Current Tier Benefits + Next Tier Preview            */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                Your Benefits
              </h2>
              <div
                className={cn(
                  "grid gap-4",
                  userTierData.nextTier
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1",
                )}
              >
                {/* Current tier benefits */}
                <BenefitsList
                  title={`${userTierData.currentTier.name} Benefits`}
                  benefits={
                    userTierData.currentTier.benefits ?? [
                      `${userTierData.currentTier.discountPercent}% discount on all products`,
                      "Access to member-only deals",
                    ]
                  }
                  color={userTierData.currentTier.color}
                  icon={
                    <Star
                      className="h-4 w-4"
                      style={{ color: userTierData.currentTier.color }}
                    />
                  }
                />

                {/* Next tier preview */}
                {userTierData.nextTier && (
                  <BenefitsList
                    title={`${userTierData.nextTier.name} Benefits`}
                    benefits={
                      userTierData.nextTier.benefits ?? [
                        `${userTierData.nextTier.discountPercent}% discount on all products`,
                        "Access to exclusive deals",
                        "Priority support",
                      ]
                    }
                    color={userTierData.nextTier.color}
                    icon={
                      <Sparkles
                        className="h-4 w-4"
                        style={{ color: userTierData.nextTier.color }}
                      />
                    }
                    isLocked
                  />
                )}
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* Section 4: All Tiers Comparison Table                          */}
            {/* ------------------------------------------------------------- */}
            {tiers.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Tier Comparison
                </h2>
                <TierComparisonTable
                  tiers={tiers}
                  currentTierId={userTierData.currentTier.id}
                />
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Section 5: Spending History Summary                            */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#1E4DB7]" />
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Spending History
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Lifetime Spend
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {formatPrice(userTierData.lifetimeSpend)}
                  </p>
                </div>
              </div>
              <SpendingHistory
                history={userTierData.spendingHistory ?? []}
              />
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* Bottom CTA                                                     */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button asChild className="gap-2 w-full sm:w-auto">
                <Link href="/store">
                  <ShoppingBag className="h-4 w-4" />
                  Shop to Earn Rewards
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <Link href="/store/deals">
                  <Gift className="h-4 w-4" />
                  View Deals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* No user data and not loading/error - shouldn't normally happen */}
        {!isLoading && !userTierError && !userTierData && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 mx-auto">
              <Crown className="w-8 h-8 text-amber-300 dark:text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Welcome to the Loyalty Program
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
              Start shopping to earn loyalty rewards and unlock exclusive
              tier-based discounts.
            </p>
            <Button asChild className="gap-2">
              <Link href="/store">
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
