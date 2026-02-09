"use client";

import { Lock, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";

interface ContentGateProps {
  /** Membership tier required to view content */
  tier?: "free" | "pro" | "enterprise";
  /** Additional CSS classes */
  className?: string;
}

const tierLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  free: { label: "Free", color: "#10B981", bgColor: "bg-emerald-500" },
  pro: { label: "Pro", color: "#1E4DB7", bgColor: "bg-[#1E4DB7]" },
  enterprise: { label: "Enterprise", color: "#F59A23", bgColor: "bg-[#F59A23]" },
};

export function ContentGate({ tier = "pro", className = "" }: ContentGateProps) {
  const tierInfo = tierLabels[tier] || tierLabels.pro;

  return (
    <div className={`relative ${className}`}>
      {/* Blur overlay that sits on top of remaining content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-neutral-900/80 dark:to-neutral-900 backdrop-blur-sm z-10 pointer-events-none" />

      {/* CTA Card */}
      <div className="relative z-20 mx-auto max-w-2xl mt-8">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${tierInfo.color} 0%, #F59A23 100%)`,
            }}
          />

          <div className="p-8 md:p-10 text-center">
            {/* Lock icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${tierInfo.color}15` }}
              >
                <Lock className="h-8 w-8" style={{ color: tierInfo.color }} />
              </div>
            </div>

            {/* Tier badge */}
            <div className="flex justify-center mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${tierInfo.bgColor}`}
              >
                <Sparkles className="h-3 w-3" />
                {tierInfo.label} Members Only
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              Continue reading with a {tierInfo.label} membership
            </h3>

            {/* Description */}
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 max-w-md mx-auto">
              This article is available exclusively for {tierInfo.label} members.
              Subscribe to unlock this article and get access to all premium content,
              expert analysis, and in-depth reports.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${tierInfo.color} 0%, #143A8F 100%)`,
                  boxShadow: `0 4px 14px ${tierInfo.color}40`,
                }}
              >
                <Sparkles className="h-4 w-4" />
                Subscribe Now
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </div>

            {/* Benefits list */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                What you get with {tierInfo.label}
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                {[
                  "Unlimited articles",
                  "Expert analysis",
                  "Weekly newsletter",
                  "Community access",
                ].map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-full"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tierInfo.color }}
                    />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
