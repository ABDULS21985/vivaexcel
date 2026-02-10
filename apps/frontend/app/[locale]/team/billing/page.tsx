"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  Zap,
  Crown,
  Percent,
} from "lucide-react";
import { Button, Badge } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import { useTeamStats, useVolumeDiscountTiers } from "@/hooks/use-teams";
import { TeamPlan } from "@/types/team";

// ─── Plan Info ──────────────────────────────────────────────────────────────

const planInfo: Record<
  TeamPlan,
  { name: string; icon: React.ElementType; features: string[] }
> = {
  [TeamPlan.TEAM_STARTER]: {
    name: "Starter",
    icon: Zap,
    features: [
      "Up to 5 members",
      "Shared library",
      "Basic analytics",
      "Email support",
    ],
  },
  [TeamPlan.TEAM_PROFESSIONAL]: {
    name: "Professional",
    icon: TrendingUp,
    features: [
      "Up to 25 members",
      "Shared library",
      "Advanced analytics",
      "Purchase approvals",
      "Budget management",
      "Priority support",
    ],
  },
  [TeamPlan.TEAM_ENTERPRISE]: {
    name: "Enterprise",
    icon: Crown,
    features: [
      "Up to 250 members",
      "SSO / SAML integration",
      "Domain verification",
      "Custom volume pricing",
      "Invoice billing",
      "Dedicated support",
      "API access",
    ],
  },
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamBillingPage() {
  const t = useTranslations("team.billing");
  const { activeTeam, isAdmin } = useTeamContext();
  const teamId = activeTeam?.id || "";
  const { data: stats } = useTeamStats(teamId);
  const { data: discountTiers = [] } = useVolumeDiscountTiers();

  const currentPlan = activeTeam?.plan || TeamPlan.TEAM_STARTER;
  const info = planInfo[currentPlan];
  const PlanIcon = info.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <PlanIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {info.name} {t("plan")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {stats?.memberCount ?? 0} / {stats?.maxMembers ?? 0}{" "}
                {t("membersUsed")}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button variant="outline">{t("changePlan")}</Button>
          )}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {info.features.map((feature) => (
            <p key={feature} className="flex items-center gap-2 text-sm">
              <span className="text-green-500">&#10003;</span>
              {feature}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Budget Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            {t("monthlySpend")}
          </div>
          <p className="mt-2 text-2xl font-bold">
            ${Number(stats?.currentMonthSpend ?? 0).toFixed(2)}
          </p>
          {stats?.monthlyBudget && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("budget")}</span>
                <span>${Number(stats.monthlyBudget).toFixed(2)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (Number(stats.currentMonthSpend) / Number(stats.monthlyBudget)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {t("remainingBudget")}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {stats?.remainingBudget !== null && stats?.remainingBudget !== undefined
              ? `$${Number(stats.remainingBudget).toFixed(2)}`
              : t("unlimited")}
          </p>
        </div>
      </div>

      {/* Volume Discounts */}
      {discountTiers.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Percent className="h-4 w-4" />
              {t("volumeDiscounts")}
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {discountTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-lg border border-border/50 p-4 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {tier.minQuantity}
                    {tier.maxQuantity ? `-${tier.maxQuantity}` : "+"}{" "}
                    {t("licenses")}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {Number(tier.discountPercentage)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{t("off")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
