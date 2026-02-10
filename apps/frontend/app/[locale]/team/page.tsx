"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Users,
  Library,
  DollarSign,
  TrendingUp,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import { useTeamStats, useTeamPurchases } from "@/hooks/use-teams";

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamDashboardPage() {
  const t = useTranslations("team.dashboard");
  const { activeTeam } = useTeamContext();
  const teamId = activeTeam?.id || "";
  const { data: stats } = useTeamStats(teamId);
  const { data: recentPurchases = [] } = useTeamPurchases(teamId, { limit: 5 });

  if (!activeTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">{t("noTeam")}</h2>
        <p className="mt-2 text-muted-foreground">{t("createTeamPrompt")}</p>
        <Link href="/team/settings">
          <Button className="mt-4">{t("createTeam")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{activeTeam.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t("overview")} &middot;{" "}
            <Badge variant="outline" className="text-xs">
              {activeTeam.plan?.replace("team_", "").toUpperCase()}
            </Badge>
          </p>
        </div>
        <Link href="/team/members">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("inviteMembers")}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label={t("totalMembers")}
          value={stats?.memberCount ?? 0}
          subtext={`${t("of")} ${stats?.maxMembers ?? 0} ${t("max")}`}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={Library}
          label={t("libraryProducts")}
          value={0}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          icon={DollarSign}
          label={t("monthlySpend")}
          value={`$${Number(stats?.currentMonthSpend ?? 0).toFixed(2)}`}
          subtext={
            stats?.monthlyBudget
              ? `${t("budget")}: $${Number(stats.monthlyBudget).toFixed(2)}`
              : t("noBudgetSet")
          }
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          icon={TrendingUp}
          label={t("remainingBudget")}
          value={
            stats?.remainingBudget !== null && stats?.remainingBudget !== undefined
              ? `$${Number(stats.remainingBudget).toFixed(2)}`
              : t("unlimited")
          }
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">{t("recentActivity")}</h2>
        </div>
        <div className="divide-y divide-border/50">
          {recentPurchases.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t("noRecentActivity")}
            </div>
          ) : (
            recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center gap-4 px-5 py-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {purchase.digitalProduct?.title || t("unknownProduct")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${Number(purchase.amount).toFixed(2)} &middot;{" "}
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    purchase.status === "approved"
                      ? "default"
                      : purchase.status === "rejected"
                        ? "destructive"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {purchase.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
