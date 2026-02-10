"use client";

import { Link } from "@/i18n/routing";
import { useAuth } from "@/providers/auth-provider";
import {
  Crown,
  ArrowRight,
  Calendar,
  Sparkles,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  free: { name: "Free", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  basic: { name: "Basic", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  pro: { name: "Pro", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  premium: { name: "Premium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const PREMIUM_FEATURES = [
  "Unlimited premium articles",
  "Ad-free reading experience",
  "Exclusive content & early access",
  "Priority support",
];

function getDaysRemaining(endDate: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function SubscriptionCard() {
  const { user } = useAuth();
  const plan = user?.plan || "free";
  const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.free;
  const isFree = plan === "free" || !user?.plan;
  const daysRemaining = user?.subscriptionEndDate
    ? getDaysRemaining(user.subscriptionEndDate)
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-8"
      aria-label="Subscription"
    >
      {isFree ? (
        /* Upgrade CTA for free users */
        <div className="relative overflow-hidden rounded-xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 via-purple-500/5 to-transparent p-6">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-semibold text-[var(--foreground)]">
                Unlock Premium
              </h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Upgrade your experience with premium features
            </p>
            <ul className="space-y-2 mb-5">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Link
                href="/membership"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade Plan
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
              >
                Compare Plans
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Active subscription card */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-[var(--foreground)]">
                Subscription
              </h2>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${planInfo.color}`}
            >
              {planInfo.name} Plan
            </span>
          </div>

          {daysRemaining !== null && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-[var(--muted-foreground)]">
                {user?.subscriptionStatus === "active"
                  ? `Renews in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`
                  : `Expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}

          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            You have full access to {planInfo.name} features. Manage your
            subscription from billing settings.
          </p>

          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
          >
            Manage Billing
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </motion.section>
  );
}
