"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCreateCheckout } from "@/hooks/use-billing";
import { toast } from "sonner";

// =============================================================================
// Membership / Pricing Page
// =============================================================================
// Pricing page with monthly/annual toggle, 4 tier cards, FAQ, and real
// Stripe checkout integration for authenticated users.

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with public content",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Public articles",
      "Newsletter subscription",
      "Comment on articles",
      "Basic reading experience",
    ],
    cta: "Get Started",
  },
  {
    id: "basic",
    name: "Basic",
    description: "Access members-only content",
    monthlyPrice: 5,
    annualPrice: 48,
    features: [
      "Everything in Free",
      "Members-only articles",
      "Ad-free reading",
      "Reading history sync",
      "Bookmark collections",
    ],
    cta: "Subscribe",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Unlock the full experience",
    monthlyPrice: 15,
    annualPrice: 144,
    features: [
      "Everything in Basic",
      "Premium article series",
      "Downloadable resources",
      "Early access to content",
      "Priority support",
      "Author Q&A sessions",
    ],
    cta: "Subscribe",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium",
    description: "The ultimate membership",
    monthlyPrice: 30,
    annualPrice: 288,
    features: [
      "Everything in Pro",
      "Exclusive insider content",
      "Private community access",
      "1-on-1 Q&A with experts",
      "Custom content requests",
      "Founding member badge",
      "Annual member gift",
    ],
    cta: "Subscribe",
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing period. When downgrading, the change takes effect at the start of your next billing period.",
  },
  {
    question: "How does the annual billing work?",
    answer:
      "Annual billing is charged once per year at the discounted annual rate. This saves you up to 20% compared to monthly billing. Your subscription renews automatically unless cancelled.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your dashboard. You'll continue to have access to your plan's features until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All payments are processed securely through Stripe.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We offer a 14-day free trial on the Basic and Pro plans. No credit card required to start. You can upgrade to a paid plan at any time during or after your trial.",
  },
  {
    question: "What happens to my content access if I cancel?",
    answer:
      "After cancellation, you'll retain access until the end of your billing period. After that, you'll revert to the Free tier and keep access to public articles, your reading history, and bookmarks.",
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden transition-colors hover:border-[var(--primary)]/30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base font-medium text-[var(--foreground)] pr-4">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MembershipPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const createCheckout = useCreateCheckout();
  const searchParams = useSearchParams();

  // Handle cancel callback from Stripe
  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was canceled. You can try again anytime.");
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  async function handleSubscribe(tier: PricingTier) {
    if (tier.id === "free") {
      // Free tier just goes to register
      if (!isAuthenticated) {
        window.location.href = "/register";
      }
      return;
    }

    if (!isAuthenticated) {
      // Redirect to register with plan info
      toast.info("Please create an account first to subscribe.");
      window.location.href = `/register?plan=${tier.id}`;
      return;
    }

    // Already on this plan
    if (user?.plan === tier.id) {
      toast.info("You are already on this plan.");
      return;
    }

    setLoadingTierId(tier.id);

    try {
      await createCheckout.mutateAsync({
        tierId: tier.id,
        interval: isAnnual ? "year" : "month",
      });
      // The mutation's onSuccess will redirect to Stripe
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again.";
      toast.error(message);
      setLoadingTierId(null);
    }
  }

  function getCtaText(tier: PricingTier): string {
    if (isAuthenticated && user?.plan === tier.id) {
      return "Current Plan";
    }
    return tier.cta;
  }

  function isCurrentPlan(tierId: string): boolean {
    return isAuthenticated && user?.plan === tierId;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Membership Plans
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto">
              Unlock premium content, exclusive insights, and more
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isAnnual
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Annual
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isAnnual
                      ? "bg-white/20 text-white"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-16 md:pb-24 -mt-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {TIERS.map((tier, index) => {
              const isCurrent = isCurrentPlan(tier.id);
              const isLoading = loadingTierId === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col rounded-2xl p-6 lg:p-8 transition-all duration-300 animate-fade-in-up ${
                    tier.highlighted
                      ? "bg-[var(--primary)] text-white ring-2 ring-[var(--primary)] shadow-xl scale-[1.02] md:scale-105 z-10"
                      : "bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-lg"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge */}
                  {tier.badge && !isCurrent && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-orange)] text-white text-xs font-semibold shadow-md">
                        <Sparkles className="h-3 w-3" />
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold shadow-md">
                        <Check className="h-3 w-3" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Tier Name */}
                  <h3
                    className={`text-lg font-semibold mb-1 ${
                      tier.highlighted
                        ? "text-white"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm mb-5 ${
                      tier.highlighted
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          tier.highlighted
                            ? "text-white"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        $
                        {isAnnual
                          ? tier.annualPrice === 0
                            ? "0"
                            : Math.round(tier.annualPrice / 12)
                          : tier.monthlyPrice}
                      </span>
                      {tier.monthlyPrice > 0 && (
                        <span
                          className={`text-sm ${
                            tier.highlighted
                              ? "text-white/70"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          /month
                        </span>
                      )}
                    </div>
                    {isAnnual && tier.annualPrice > 0 && (
                      <p
                        className={`text-xs mt-1 ${
                          tier.highlighted
                            ? "text-white/60"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        ${tier.annualPrice} billed annually
                      </p>
                    )}
                    {isAnnual && tier.monthlyPrice > 0 && (
                      <p
                        className={`text-xs mt-0.5 ${
                          tier.highlighted
                            ? "text-green-300"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        Save ${tier.monthlyPrice * 12 - tier.annualPrice}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            tier.highlighted
                              ? "bg-white/20"
                              : "bg-[var(--primary)]/10"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${
                              tier.highlighted
                                ? "text-white"
                                : "text-[var(--primary)]"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            tier.highlighted
                              ? "text-white/90"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleSubscribe(tier)}
                    disabled={isCurrent || isLoading}
                    className={`block w-full text-center py-3 px-4 rounded-xl font-medium text-sm transition-all btn-press ${
                      isCurrent
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default"
                        : tier.highlighted
                          ? "bg-white text-[var(--primary)] hover:bg-white/90 shadow-md"
                          : tier.id === "free"
                            ? "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                            : "bg-[var(--primary)] text-white hover:opacity-90 shadow-md"
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting...
                      </span>
                    ) : (
                      getCtaText(tier)
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[var(--surface-1)]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-[var(--muted-foreground)]">
                Everything you need to know about our membership plans
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FaqAccordion key={faq.question} item={faq} />
              ))}
            </div>

            {/* Support CTA */}
            <div className="mt-12 text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Still have questions?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
