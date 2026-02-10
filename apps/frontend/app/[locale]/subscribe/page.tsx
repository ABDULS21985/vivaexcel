"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  Check,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Gift,
  Zap,
  Shield,
  Clock,
  ChevronDown,
  Send,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button } from "@ktblog/ui/components";
import { useSubscribeNewsletter } from "@/hooks/use-newsletter";
import { toast } from "sonner";

// =============================================================================
// Subscribe Page
// =============================================================================
// Full-page newsletter subscription with interest tags, value props, and FAQ.

// -----------------------------------------------------------------------------
// Interest Tags
// -----------------------------------------------------------------------------

interface InterestTag {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INTEREST_TAGS: InterestTag[] = [
  { id: "product-updates", label: "Product Updates", icon: Sparkles },
  { id: "deals", label: "Deals & Discounts", icon: Gift },
  { id: "tutorials", label: "Tutorials & Tips", icon: TrendingUp },
  { id: "industry-news", label: "Industry News", icon: Zap },
  { id: "new-releases", label: "New Releases", icon: Star },
  { id: "community", label: "Community Highlights", icon: Heart },
];

// -----------------------------------------------------------------------------
// Benefits
// -----------------------------------------------------------------------------

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bg: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: Gift,
    title: "Exclusive Discounts",
    description:
      "Subscribers get early access to sales and exclusive coupon codes not available anywhere else.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Zap,
    title: "Early Access",
    description:
      "Be the first to know about new products, features, and updates before anyone else.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: TrendingUp,
    title: "Expert Insights",
    description:
      "Curated tips, tutorials, and industry trends to help you stay ahead of the curve.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Shield,
    title: "No Spam, Ever",
    description:
      "We respect your inbox. Only valuable content, and you can unsubscribe with one click anytime.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
];

// -----------------------------------------------------------------------------
// FAQ
// -----------------------------------------------------------------------------

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How often will I receive emails?",
    answer:
      "We send 1-2 emails per week at most. You can customize your preferences or switch to a weekly digest at any time from your account settings.",
  },
  {
    question: "Can I unsubscribe at any time?",
    answer:
      "Absolutely. Every email includes a one-click unsubscribe link. You can also manage your subscription from your account settings.",
  },
  {
    question: "Will you share my email with third parties?",
    answer:
      "Never. Your email is used exclusively for our newsletter communications. We do not sell, trade, or share your information with anyone.",
  },
  {
    question: "Do I need an account to subscribe?",
    answer:
      "No account needed. Simply enter your email address and you're all set. If you create an account later, your subscription will be linked automatically.",
  },
  {
    question: "What kind of content will I receive?",
    answer:
      "Product launches, exclusive discounts, tutorials, industry insights, and community highlights — tailored to the interests you select.",
  },
];

// -----------------------------------------------------------------------------
// FAQ Accordion Item
// -----------------------------------------------------------------------------

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Form State Type
// -----------------------------------------------------------------------------

type FormState = "idle" | "loading" | "success" | "error";

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const subscribeMutation = useSubscribeNewsletter();

  const isLoading = formState === "loading";
  const isSuccess = formState === "success";
  const isError = formState === "error";

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setFormState("error");
      setErrorMessage("Please enter your email address.");
      setTimeout(() => setFormState("idle"), 3000);
      return;
    }

    if (!validateEmail(email)) {
      setFormState("error");
      setErrorMessage("Please enter a valid email address.");
      setTimeout(() => setFormState("idle"), 3000);
      return;
    }

    setFormState("loading");
    setErrorMessage("");

    try {
      const result = await subscribeMutation.mutateAsync({
        email: email.trim(),
        name: name.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      setFormState("success");
      toast.success(
        result.message ||
          "You're in! Check your email to confirm your subscription."
      );
    } catch (error) {
      setFormState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* ================================================================= */}
      {/* Hero Section                                                      */}
      {/* ================================================================= */}
      <div className="relative bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
          {/* Breadcrumb */}
          <div className="pt-8">
            <nav className="flex items-center gap-2 text-sm text-white/60">
              <Link
                href="/"
                className="hover:text-white/80 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Subscribe</span>
            </nav>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 pt-12 pb-20 lg:pb-28">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-6">
                <Mail className="w-4 h-4 text-[#F59A23]" />
                Join 10,000+ subscribers
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
                Stay Ahead.
                <br />
                <span className="text-[#F59A23]">Stay Inspired.</span>
              </h1>

              <p className="text-lg text-white/70 max-w-lg mx-auto lg:mx-0 mb-8">
                Get exclusive product updates, expert tutorials, and insider
                deals delivered to your inbox. No spam, just value.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>1-2 emails / week</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full max-w-md lg:max-w-lg flex-shrink-0"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-black/20 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {/* Form Header */}
                <div className="px-6 sm:px-8 pt-8 pb-2">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                    Subscribe to our newsletter
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Fill in your details and pick your interests below.
                  </p>
                </div>

                {/* Success State */}
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="px-6 sm:px-8 py-12 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            delay: 0.2,
                          }}
                        >
                          <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        You're almost there!
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-6">
                        We've sent a confirmation email to{" "}
                        <strong className="text-neutral-700 dark:text-neutral-300">
                          {email}
                        </strong>
                        . Click the link inside to activate your subscription.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                        <Mail className="w-3.5 h-3.5" />
                        Check your spam folder if you don't see it
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="px-6 sm:px-8 py-6 space-y-5"
                    >
                      {/* Name Field (optional) */}
                      <div>
                        <label
                          htmlFor="subscribe-name"
                          className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2"
                        >
                          Name{" "}
                          <span className="text-neutral-400 dark:text-neutral-500 normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                          <input
                            id="subscribe-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            disabled={isLoading}
                            className={cn(
                              "w-full h-12 pl-10 pr-4 rounded-xl border text-sm transition-all",
                              "bg-neutral-50 dark:bg-neutral-800/50",
                              "border-neutral-200 dark:border-neutral-700",
                              "text-neutral-900 dark:text-white",
                              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                              "focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent",
                              "disabled:opacity-50"
                            )}
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label
                          htmlFor="subscribe-email"
                          className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2"
                        >
                          Email Address{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                          <motion.input
                            id="subscribe-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (isError) {
                                setFormState("idle");
                                setErrorMessage("");
                              }
                            }}
                            placeholder="you@example.com"
                            disabled={isLoading}
                            required
                            className={cn(
                              "w-full h-12 pl-10 pr-4 rounded-xl border text-sm transition-all",
                              "bg-neutral-50 dark:bg-neutral-800/50",
                              "text-neutral-900 dark:text-white",
                              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                              "focus:outline-none focus:ring-2 focus:border-transparent",
                              "disabled:opacity-50",
                              isError
                                ? "border-red-400 focus:ring-red-400"
                                : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]"
                            )}
                            animate={
                              isError ? { x: [0, -6, 6, -6, 6, 0] } : {}
                            }
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        {/* Error message */}
                        <AnimatePresence>
                          {isError && errorMessage && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {errorMessage}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Interest Tags */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                          I'm interested in{" "}
                          <span className="text-neutral-400 dark:text-neutral-500 normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {INTEREST_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);
                            const TagIcon = tag.icon;
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                disabled={isLoading}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                  isSelected
                                    ? "bg-[#1E4DB7]/10 border-[#1E4DB7]/30 text-[#1E4DB7] dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-400"
                                    : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600",
                                  "disabled:opacity-50"
                                )}
                              >
                                <TagIcon className="w-3 h-3" />
                                {tag.label}
                                {isSelected && (
                                  <Check className="w-3 h-3 ml-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.div
                        whileHover={!isLoading ? { scale: 1.01 } : {}}
                        whileTap={!isLoading ? { scale: 0.99 } : {}}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl font-semibold text-sm gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Subscribing...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Subscribe Now
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Privacy Note */}
                      <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                        By subscribing you agree to receive marketing emails.
                        <br />
                        We respect your privacy. Unsubscribe at any time.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Benefits Section                                                  */}
      {/* ================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
            Why Subscribe?
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Here's what you get when you join our newsletter community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((benefit, index) => {
            const BenefitIcon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    benefit.bg
                  )}
                >
                  <BenefitIcon className={cn("w-6 h-6", benefit.color)} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1.5">
                  {benefit.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Social Proof Strip                                                */}
      {/* ================================================================= */}
      <div className="bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1E4DB7]">10,000+</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Active subscribers
              </p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-neutral-200 dark:bg-neutral-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1E4DB7]">98%</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Satisfaction rate
              </p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-neutral-200 dark:bg-neutral-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1E4DB7]">2x/week</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Max frequency
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FAQ Section                                                       */}
      {/* ================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {FAQ_ITEMS.map((item) => (
            <FAQAccordionItem key={item.question} item={item} />
          ))}
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* Bottom CTA                                                        */}
      {/* ================================================================= */}
      <div className="bg-gradient-to-r from-[#1E4DB7] to-[#0F2B6B]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to join?
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Don't miss out on exclusive content and deals. Scroll back up to
            subscribe, or click below.
          </p>
          <Button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="bg-white text-[#1E4DB7] hover:bg-white/90 font-semibold gap-2 h-11 px-8 rounded-xl"
          >
            Subscribe Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
