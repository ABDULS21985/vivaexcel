"use client";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Clock,
  Compass,
  Crown,
  Trophy,
  BarChart3,
} from "lucide-react";

const actions = [
  {
    label: "Profile Settings",
    href: "/dashboard/profile",
    icon: User,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    fg: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Security & 2FA",
    href: "/dashboard/settings",
    icon: Shield,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Billing & Invoices",
    href: "/dashboard/billing",
    icon: CreditCard,
    bg: "bg-purple-100 dark:bg-purple-900/30",
    fg: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "Reading History",
    href: "/dashboard/history",
    icon: Clock,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    fg: "text-orange-600 dark:text-orange-400",
  },
  {
    label: "Browse Articles",
    href: "/blogs",
    icon: Compass,
    bg: "bg-teal-100 dark:bg-teal-900/30",
    fg: "text-teal-600 dark:text-teal-400",
  },
  {
    label: "Membership Plans",
    href: "/membership",
    icon: Crown,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    fg: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Achievements",
    href: "/dashboard/achievements",
    icon: Trophy,
    bg: "bg-rose-100 dark:bg-rose-900/30",
    fg: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Leaderboard",
    href: "/dashboard/achievements",
    icon: BarChart3,
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    fg: "text-indigo-600 dark:text-indigo-400",
  },
] as const;

export function QuickActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      aria-label="Quick Actions"
    >
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map(({ label, href, icon: Icon, bg, fg }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--ring)] transition-all"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center ${bg}`}
            >
              <Icon className={`h-5 w-5 ${fg}`} />
            </div>
            <span className="text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] text-center transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
