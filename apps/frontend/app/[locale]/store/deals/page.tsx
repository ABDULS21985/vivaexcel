"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Package,
  Crown,
  ChevronRight,
  Sparkles,
  Tag,
  Gift,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import {
  FlashSaleBanner,
  BundleDealCard,
  LoyaltyProgressBar,
} from "@/components/store/promotions";
import {
  useActiveFlashSales,
  useBundleDiscounts,
  useLoyaltyTiers,
  useUserLoyaltyTier,
} from "@/hooks/use-promotions";

// =============================================================================
// Deals & Promotions Page
// =============================================================================
// Lists all active promotions: flash sales, bundle deals, and loyalty program.

// -----------------------------------------------------------------------------
// Loading Skeletons
// -----------------------------------------------------------------------------

function FlashSalesSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          className="min-w-[320px] max-w-[400px] h-[280px] rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0"
        />
      ))}
    </div>
  );
}

function BundlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-[380px] rounded-2xl bg-neutral-200 dark:bg-neutral-800"
        />
      ))}
    </div>
  );
}

function LoyaltySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-[180px] rounded-2xl bg-neutral-200 dark:bg-neutral-800"
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty States
// -----------------------------------------------------------------------------

function EmptyFlashSales() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
        <Zap className="w-8 h-8 text-orange-300 dark:text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        No Active Flash Sales
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
        Check back soon! Flash sales appear here when they go live. They are
        limited-time offers with steep discounts.
      </p>
    </div>
  );
}

function EmptyBundles() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-purple-300 dark:text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        No Bundle Deals Available
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
        Bundle deals let you save when purchasing multiple products together.
        Check back later for new offers.
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Section Wrapper
// -----------------------------------------------------------------------------

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-16 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// -----------------------------------------------------------------------------
// Tier Card Component
// -----------------------------------------------------------------------------

interface TierCardProps {
  tier: {
    id: string;
    name: string;
    requiredSpend: number;
    discountPercent: number;
    color: string;
    benefits?: string[];
  };
  isCurrentTier?: boolean;
}

function TierCard({ tier, isCurrentTier = false }: TierCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl border p-5 transition-all ${
        isCurrentTier
          ? "border-2 bg-white dark:bg-neutral-900 shadow-lg"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      }`}
      style={{
        borderColor: isCurrentTier ? tier.color : undefined,
      }}
    >
      {isCurrentTier && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: tier.color }}
        >
          Your Tier
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tier.color}20` }}
        >
          <Crown className="h-5 w-5" style={{ color: tier.color }} />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white">
            {tier.name}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {tier.discountPercent}% discount
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        {tier.requiredSpend === 0
          ? "Free to join"
          : `Spend $${tier.requiredSpend.toLocaleString()}+`}
      </p>

      {tier.benefits && tier.benefits.length > 0 && (
        <ul className="space-y-1">
          {tier.benefits.slice(0, 3).map((benefit, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
            >
              <Sparkles
                className="h-3 w-3 shrink-0 mt-0.5"
                style={{ color: tier.color }}
              />
              <span>{benefit}</span>
            </li>
          ))}
          {tier.benefits.length > 3 && (
            <li className="text-xs text-neutral-400 dark:text-neutral-500 pl-4">
              +{tier.benefits.length - 3} more benefits
            </li>
          )}
        </ul>
      )}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------

export default function DealsPage() {
  const {
    data: flashSalesData,
    isLoading: flashSalesLoading,
    isError: flashSalesError,
  } = useActiveFlashSales();

  const {
    data: bundlesData,
    isLoading: bundlesLoading,
    isError: bundlesError,
  } = useBundleDiscounts();

  const {
    data: loyaltyTiersData,
    isLoading: tiersLoading,
  } = useLoyaltyTiers();

  const {
    data: userTierData,
    isLoading: userTierLoading,
  } = useUserLoyaltyTier();

  const flashSales = flashSalesData?.items ?? [];
  const bundles = bundlesData?.items ?? [];
  const loyaltyTiers = loyaltyTiersData ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/60 hover:text-white">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/store" className="text-white/60 hover:text-white">
                    Store
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  Deals & Promotions
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-3xl">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <Gift className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                  Special Offers
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Deals &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                Promotions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/70 max-w-xl">
              Discover flash sales, bundle deals, and exclusive loyalty rewards.
              Save more on premium digital products.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium">
                  {flashSales.length} Flash Sale
                  {flashSales.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Package className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium">
                  {bundles.length} Bundle Deal
                  {bundles.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Crown className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium">
                  {loyaltyTiers.length} Loyalty Tier
                  {loyaltyTiers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-7xl">
        {/* ----------------------------------------------------------------- */}
        {/* Section 1: Active Flash Sales                                      */}
        {/* ----------------------------------------------------------------- */}
        <Section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  Flash Sales
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Limited-time offers with steep discounts
                </p>
              </div>
            </div>
          </div>

          {flashSalesLoading && <FlashSalesSkeleton />}

          {flashSalesError && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 dark:text-red-400">
                Failed to load flash sales. Please try again later.
              </p>
            </div>
          )}

          {!flashSalesLoading && !flashSalesError && flashSales.length === 0 && (
            <EmptyFlashSales />
          )}

          {!flashSalesLoading && !flashSalesError && flashSales.length > 0 && (
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
              {flashSales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FlashSaleBanner sale={sale} />
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* ----------------------------------------------------------------- */}
        {/* Section 2: Bundle Deals                                            */}
        {/* ----------------------------------------------------------------- */}
        <Section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  Bundle Deals
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Save more by purchasing products together
                </p>
              </div>
            </div>
          </div>

          {bundlesLoading && <BundlesSkeleton />}

          {bundlesError && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 dark:text-red-400">
                Failed to load bundle deals. Please try again later.
              </p>
            </div>
          )}

          {!bundlesLoading && !bundlesError && bundles.length === 0 && (
            <EmptyBundles />
          )}

          {!bundlesLoading && !bundlesError && bundles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BundleDealCard bundle={bundle} />
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* ----------------------------------------------------------------- */}
        {/* Section 3: Loyalty Program                                         */}
        {/* ----------------------------------------------------------------- */}
        <Section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  Loyalty Program
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Earn rewards and unlock exclusive discounts
                </p>
              </div>
            </div>
            <Link
              href="/account/rewards"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline"
            >
              View My Rewards
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* User progress bar (if logged in and data available) */}
          {!userTierLoading && userTierData && loyaltyTiers.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Your Loyalty Progress
                </span>
              </div>
              <LoyaltyProgressBar
                currentSpend={userTierData.currentSpend}
                currentTier={userTierData.currentTier}
                nextTier={userTierData.nextTier}
                tiers={loyaltyTiers}
              />
            </div>
          )}

          {(tiersLoading || userTierLoading) && <LoyaltySkeleton />}

          {!tiersLoading && loyaltyTiers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-amber-300 dark:text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Loyalty Program Coming Soon
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                Our loyalty program is being set up. Stay tuned for exclusive
                tier-based discounts and rewards.
              </p>
            </div>
          )}

          {!tiersLoading && loyaltyTiers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loyaltyTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TierCard
                    tier={tier}
                    isCurrentTier={userTierData?.currentTier.id === tier.id}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Mobile link to rewards */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/account/rewards"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline"
            >
              View My Rewards
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>

        {/* ----------------------------------------------------------------- */}
        {/* Coupon CTA                                                         */}
        {/* ----------------------------------------------------------------- */}
        <Section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#F59A23]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Have a Coupon Code?
                </h3>
                <p className="text-white/70">
                  Apply your coupon code at checkout to get an additional
                  discount on your purchase.
                </p>
              </div>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#1E4DB7] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
