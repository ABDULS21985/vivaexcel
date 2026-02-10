"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Crown,
  Zap,
  Shield,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/providers/auth-provider";
import { useSubscription } from "@/providers/subscription-provider";
import {
  useSubscribe,
  useMarketplacePlans,
} from "@/hooks/use-marketplace-subscription";
import { BillingPeriod, MarketplacePlanSlug } from "@/types/marketplace-subscription";

// ---------------------------------------------------------------------------
// Static fallback plans for rendering while API loads
// ---------------------------------------------------------------------------
const STATIC_PLANS = [
  {
    id: "free",
    slug: MarketplacePlanSlug.FREE,
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyCredits: 5,
    icon: Zap,
    color: "slate",
  },
  {
    id: "starter",
    slug: MarketplacePlanSlug.STARTER,
    name: "Starter",
    monthlyPrice: 9.99,
    annualPrice: 89.99,
    monthlyCredits: 25,
    icon: Sparkles,
    color: "blue",
  },
  {
    id: "professional",
    slug: MarketplacePlanSlug.PROFESSIONAL,
    name: "Professional",
    monthlyPrice: 29.99,
    annualPrice: 269.99,
    monthlyCredits: 100,
    icon: Crown,
    color: "emerald",
    featured: true,
  },
  {
    id: "enterprise",
    slug: MarketplacePlanSlug.ENTERPRISE,
    name: "Enterprise",
    monthlyPrice: 99.99,
    annualPrice: 899.99,
    monthlyCredits: -1, // unlimited
    icon: Shield,
    color: "purple",
  },
];

// ---------------------------------------------------------------------------
// Comparison matrix features
// ---------------------------------------------------------------------------
const COMPARISON_FEATURES = [
  { key: "creditsPerMonth", values: ["5", "25", "100", "Unlimited"] },
  { key: "freeProducts", values: [true, true, true, true] },
  { key: "standardProducts", values: [false, true, true, true] },
  { key: "allProductTypes", values: [false, false, true, true] },
  { key: "rolloverCredits", values: [false, "Up to 50", "Up to 200", "Unlimited"] },
  { key: "simultaneousDownloads", values: ["1", "2", "5", "Unlimited"] },
  { key: "communitySupport", values: [true, true, true, true] },
  { key: "emailSupport", values: [false, true, true, true] },
  { key: "prioritySupport", values: [false, false, true, true] },
  { key: "dedicatedManager", values: [false, false, false, true] },
  { key: "earlyAccess", values: [false, false, true, true] },
  { key: "apiAccess", values: [false, false, false, true] },
  { key: "teamSeats", values: [false, false, false, true] },
  { key: "basicAnalytics", values: [true, true, true, true] },
  { key: "advancedAnalytics", values: [false, false, true, true] },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const faqVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PricingPageClient() {
  const t = useTranslations("pricing");
  const { isAuthenticated } = useAuth();
  const { currentPlanSlug, isSubscribed } = useSubscription();
  const { data: apiPlans } = useMarketplacePlans();
  const subscribe = useSubscribe();

  const [isAnnual, setIsAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Merge API plans with static fallback
  const plans = useMemo(() => {
    if (!apiPlans?.length) return STATIC_PLANS;
    return STATIC_PLANS.map((sp) => {
      const apiPlan = apiPlans.find((ap) => ap.slug === sp.slug);
      if (apiPlan) {
        return {
          ...sp,
          id: apiPlan.id,
          monthlyPrice: apiPlan.monthlyPrice,
          annualPrice: apiPlan.annualPrice,
          monthlyCredits: apiPlan.monthlyCredits,
        };
      }
      return sp;
    });
  }, [apiPlans]);

  const handleSubscribe = (planSlug: MarketplacePlanSlug, planId: string) => {
    if (planSlug === MarketplacePlanSlug.FREE) {
      // Free plan — redirect to register or dashboard
      if (!isAuthenticated) {
        window.location.href = "/register";
      }
      return;
    }

    if (planSlug === MarketplacePlanSlug.ENTERPRISE) {
      window.location.href = "/contact";
      return;
    }

    subscribe.mutate({
      planId,
      billingPeriod: isAnnual ? BillingPeriod.ANNUAL : BillingPeriod.MONTHLY,
    });
  };

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return isAnnual
      ? Math.round((plan.annualPrice / 12) * 100) / 100
      : plan.monthlyPrice;
  };

  const getPlanTranslationKey = (slug: MarketplacePlanSlug) => {
    const map: Record<MarketplacePlanSlug, string> = {
      [MarketplacePlanSlug.FREE]: "free",
      [MarketplacePlanSlug.STARTER]: "starter",
      [MarketplacePlanSlug.PROFESSIONAL]: "professional",
      [MarketplacePlanSlug.ENTERPRISE]: "enterprise",
    };
    return map[slug];
  };

  const faqItems = t.raw("faq.items") as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <div className="min-h-screen">
      {/* ================================================================= */}
      {/* Hero Section                                                       */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F2B6B] via-[#143A8F] to-[#1E4DB7] py-20 sm:py-28">
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#F59A23]/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F59A23]/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F59A23]/30 bg-[#F59A23]/10 px-4 py-1.5 text-sm font-medium text-amber-300"
          >
            <Sparkles className="h-4 w-4" />
            {t("hero.badge")}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
          >
            {(
              ["cancelAnytime", "noCreditCard", "moneyBack"] as const
            ).map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <Check className="h-4 w-4 text-[#F59A23]" />
                {t(`hero.trustBadges.${badge}`)}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Billing Toggle + Plan Cards                                        */}
      {/* ================================================================= */}
      <section className="relative -mt-12 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12 flex items-center justify-center gap-4"
          >
            <span
              className={`text-sm font-medium transition-colors ${!isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              {t("billing.monthly")}
            </span>
            <button
              onClick={() => setIsAnnual((prev) => !prev)}
              className="relative h-8 w-14 rounded-full bg-slate-200 transition-colors dark:bg-slate-700"
              aria-label="Toggle billing period"
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-[#1E4DB7] shadow-md"
                animate={{ left: isAnnual ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              {t("billing.annual")}
            </span>
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  {t("billing.savePercent")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Plan cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {plans.map((plan) => {
              const planKey = getPlanTranslationKey(plan.slug);
              const price = getPrice(plan);
              const isCurrent = currentPlanSlug === plan.slug;
              const isFeatured = "featured" in plan && plan.featured;

              return (
                <motion.div
                  key={plan.slug}
                  variants={cardVariants}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-xl ${
                    isFeatured
                      ? "border-[#1E4DB7]/50 bg-white/80 shadow-lg shadow-[#1E4DB7]/10 ring-2 ring-[#1E4DB7] backdrop-blur-xl dark:bg-slate-800/80"
                      : "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  {/* Featured badge */}
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F59A23] px-4 py-1 text-xs font-semibold text-white shadow-md">
                        <Crown className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan icon and name */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isFeatured
                          ? "bg-blue-100 text-[#1E4DB7] dark:bg-blue-900/40 dark:text-blue-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <plan.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t(`plans.${planKey}.name`)}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {t(`plans.${planKey}.description`)}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      {price === 0 ? (
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          {t("billing.free")}
                        </span>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            $
                          </span>
                          <motion.span
                            key={`${plan.slug}-${isAnnual}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl font-bold text-slate-900 dark:text-white"
                          >
                            {price.toFixed(2)}
                          </motion.span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {t("billing.perMonth")}
                          </span>
                        </>
                      )}
                    </div>
                    {isAnnual && price > 0 && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {t("billing.billedAnnually")}
                      </p>
                    )}
                  </div>

                  {/* Credits */}
                  <div className="mb-6 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">
                        {t("features.creditsPerMonth")}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {plan.monthlyCredits === -1
                          ? t("features.unlimitedCredits")
                          : plan.monthlyCredits}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="mb-8 flex-1 space-y-3">
                    {(
                      t.raw(`plans.${planKey}.features`) as string[]
                    ).map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isFeatured
                              ? "text-[#1E4DB7]"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button
                    onClick={() => handleSubscribe(plan.slug, plan.id)}
                    disabled={isCurrent || subscribe.isPending}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isCurrent
                        ? "cursor-default bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                        : isFeatured
                          ? "bg-[#F59A23] text-white shadow-md hover:shadow-lg hover:bg-[#e08b1a]"
                          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    }`}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : subscribe.isPending
                        ? "Processing..."
                        : t(`plans.${planKey}.cta`)}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Feature Comparison Matrix                                          */}
      {/* ================================================================= */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t("comparison.title")}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {t("comparison.subtitle")}
            </p>
            <button
              onClick={() => setShowComparison((prev) => !prev)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400"
            >
              {showComparison
                ? t("comparison.hideComparison")
                : t("comparison.showComparison")}
              <motion.span
                animate={{ rotate: showComparison ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="mt-8 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr>
                        <th className="py-3 pr-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                          Feature
                        </th>
                        {STATIC_PLANS.map((plan) => (
                          <th
                            key={plan.slug}
                            className={`px-4 py-3 text-center text-sm font-semibold ${
                              plan.slug === MarketplacePlanSlug.PROFESSIONAL
                                ? "text-[#1E4DB7] dark:text-blue-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {t(
                              `plans.${getPlanTranslationKey(plan.slug)}.name`,
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {COMPARISON_FEATURES.map((feature) => (
                        <tr key={feature.key}>
                          <td className="py-3 pr-4 text-sm text-slate-600 dark:text-slate-300">
                            {t(`features.${feature.key}`)}
                          </td>
                          {feature.values.map((val, idx) => (
                            <td
                              key={idx}
                              className="px-4 py-3 text-center text-sm"
                            >
                              {typeof val === "boolean" ? (
                                val ? (
                                  <Check className="mx-auto h-5 w-5 text-[#1E4DB7]" />
                                ) : (
                                  <X className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600" />
                                )
                              ) : (
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {val}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FAQ Section                                                        */}
      {/* ================================================================= */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t("faq.title")}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="pr-4 text-sm font-medium text-slate-900 dark:text-white">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      variants={faqVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-sm text-slate-500 dark:text-slate-400">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA Banner                                                         */}
      {/* ================================================================= */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-[#1E4DB7] to-[#0F2B6B] py-16 dark:border-slate-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            {t("cta.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-blue-100"
          >
            {t("cta.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            {isSubscribed ? (
              <Link
                href="/account/subscription"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#1E4DB7] shadow-md transition-shadow hover:shadow-lg"
              >
                {t("subscription.manageBilling")}
              </Link>
            ) : (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#1E4DB7] shadow-md transition-shadow hover:shadow-lg"
              >
                {t("cta.button")}
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
