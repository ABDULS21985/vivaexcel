"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  ArrowLeft,
  Check,
  Crown,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Billing Page
// =============================================================================
// Subscription management: current plan, change plan, billing history,
// payment method, and cancel subscription with feedback form.

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  downloadUrl: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-001",
    date: "Feb 1, 2026",
    amount: "$15.00",
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-002",
    date: "Jan 1, 2026",
    amount: "$15.00",
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-003",
    date: "Dec 1, 2025",
    amount: "$15.00",
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-004",
    date: "Nov 1, 2025",
    amount: "$15.00",
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-005",
    date: "Oct 1, 2025",
    amount: "$5.00",
    status: "paid",
    downloadUrl: "#",
  },
];

interface PlanOption {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  highlighted?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    features: ["Public articles", "Newsletter", "Comments"],
  },
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 5,
    features: ["Members-only articles", "Ad-free reading", "Bookmarks"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 15,
    features: ["Premium series", "Downloads", "Early access", "Priority support"],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 30,
    features: ["Exclusive content", "Community", "1-on-1 Q&A", "Custom requests"],
  },
];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function BillingContent() {
  const { user } = useAuth();
  const currentPlan = user?.plan || "free";

  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");

  const currentPlanDetails = PLAN_OPTIONS.find((p) => p.id === currentPlan);

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-8">
          Billing & Subscription
        </h1>

        {/* Current Plan */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--foreground)]">
                  Current Plan
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {currentPlan === "free"
                    ? "You're on the free plan"
                    : "Your subscription is active"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                ${currentPlanDetails?.monthlyPrice || 0}
              </span>
              {currentPlan !== "free" && (
                <span className="text-sm text-[var(--muted-foreground)]">
                  /month
                </span>
              )}
              <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">
                {currentPlanDetails?.name}
              </span>
            </div>
          </div>

          {/* Current Plan Features */}
          {currentPlanDetails && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {currentPlanDetails.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
                >
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowChangePlan(!showChangePlan)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity btn-press"
            >
              <Sparkles className="h-4 w-4" />
              {showChangePlan ? "Hide Plans" : "Change Plan"}
            </button>
            {currentPlan !== "free" && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium hover:text-[var(--error)] hover:border-[var(--error)] transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Change Plan Comparison */}
        {showChangePlan && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-6 animate-fade-in-up">
            <h3 className="font-semibold text-[var(--foreground)] mb-6">
              Choose a Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLAN_OPTIONS.map((plan) => {
                const isCurrent = plan.id === currentPlan;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl p-5 border-2 transition-all ${
                      plan.highlighted && !isCurrent
                        ? "border-[var(--primary)] shadow-md"
                        : isCurrent
                          ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                          : "border-[var(--border)] hover:border-[var(--primary)]/30"
                    }`}
                  >
                    {plan.highlighted && !isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-semibold">
                        Recommended
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-semibold">
                        Current
                      </span>
                    )}

                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline gap-0.5 mb-3">
                      <span className="text-2xl font-bold text-[var(--foreground)]">
                        ${plan.monthlyPrice}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          /mo
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
                        >
                          <Check className="h-3 w-3 text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default"
                          : "bg-[var(--primary)] text-white hover:opacity-90 btn-press"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : "Switch to this plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Method */}
        {currentPlan !== "free" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--muted-foreground)]" />
                <h2 className="font-semibold text-[var(--foreground)]">
                  Payment Method
                </h2>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Update
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
              <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-[8px] text-white font-bold tracking-widest">
                  VISA
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Visa ending in 4242
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Expires 12/2027
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-6">
          <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">
              Billing History
            </h2>
          </div>

          {currentPlan === "free" ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
              <p className="text-[var(--muted-foreground)] text-sm">
                No billing history. Upgrade to a paid plan to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                    <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {MOCK_INVOICES.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-[var(--surface-1)] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm text-[var(--foreground)]">
                          {invoice.date}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {invoice.amount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_STYLES[invoice.status]
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={invoice.downloadUrl}
                          className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCancelModal(false)}
              role="presentation"
            />
            <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in-scale">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  We&apos;re sorry to see you go. You&apos;ll keep access to your
                  {" "}{currentPlanDetails?.name} plan features until the end of
                  your current billing period.
                </p>
              </div>

              {/* Feedback Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="cancelReason"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                  >
                    Why are you cancelling?
                  </label>
                  <select
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                  >
                    <option value="">Select a reason...</option>
                    <option value="too-expensive">Too expensive</option>
                    <option value="not-enough-content">Not enough content</option>
                    <option value="not-using">Not using it enough</option>
                    <option value="found-alternative">Found an alternative</option>
                    <option value="technical-issues">Technical issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cancelFeedback"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                  >
                    Additional feedback (optional)
                  </label>
                  <textarea
                    id="cancelFeedback"
                    value={cancelFeedback}
                    onChange={(e) => setCancelFeedback(e.target.value)}
                    rows={3}
                    placeholder="Help us improve..."
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setCancelFeedback("");
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Keep Subscription
                </button>
                <button
                  type="button"
                  disabled={!cancelReason}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--error)] text-[var(--error)] text-sm font-medium hover:bg-[var(--error)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
