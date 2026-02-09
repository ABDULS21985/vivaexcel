"use client";

import { useState } from "react";
import { Loader2, Check, Mail, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscribeNewsletter } from "@/hooks/use-newsletter";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

type NewsletterState = "idle" | "loading" | "success" | "error";

interface NewsletterSignupProps {
  /** Layout variant: 'inline' for horizontal, 'stacked' for vertical */
  variant?: "inline" | "stacked";
  /** Custom heading text */
  heading?: string;
  /** Custom subtext */
  subtext?: string;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom button text */
  buttonText?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// NEWSLETTER SIGNUP COMPONENT
// ============================================

export function NewsletterSignup({
  variant = "inline",
  heading,
  subtext,
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const subscribeMutation = useSubscribeNewsletter();

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setState("error");
      setErrorMessage("Please enter your email address.");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    if (!validateEmail(email)) {
      setState("error");
      setErrorMessage("Please enter a valid email address.");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("loading");

    try {
      const result = await subscribeMutation.mutateAsync({ email });

      setState("success");
      toast.success(result.message || "Successfully subscribed to the newsletter!");

      // Reset after showing success
      setTimeout(() => {
        setState("idle");
        setEmail("");
        setErrorMessage("");
      }, 4000);
    } catch (error) {
      setState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  const isInline = variant === "inline";

  return (
    <div className={className}>
      {/* Heading & Subtext (optional, only shown if provided) */}
      {heading && (
        <h3 className="text-lg font-bold text-white mb-1">{heading}</h3>
      )}
      {subtext && (
        <p className="text-sm text-neutral-400 mb-4">{subtext}</p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`flex ${isInline ? "flex-row" : "flex-col"} gap-3`}
      >
        {/* Email Input */}
        <div className={`relative ${isInline ? "flex-1" : "w-full"}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <Mail className="w-4 h-4" />
          </div>
          <motion.input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (isError) {
                setState("idle");
                setErrorMessage("");
              }
            }}
            placeholder={placeholder}
            disabled={isLoading || isSuccess}
            className={`w-full h-12 pl-10 pr-4 bg-white/10 border rounded-xl text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 disabled:opacity-50 ${
              isError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-neutral-700 hover:border-neutral-600"
            }`}
            animate={isError ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`h-12 px-6 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 touch-manipulation whitespace-nowrap ${
            isSuccess
              ? "bg-green-500 text-white"
              : "bg-primary hover:bg-primary/90 text-white"
          } ${isInline ? "flex-shrink-0" : "w-full"}`}
          whileHover={!isLoading && !isSuccess ? { scale: 1.02 } : {}}
          whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : {}}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Subscribing...</span>
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Subscribed!</span>
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {buttonText}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* Feedback Messages */}
      <AnimatePresence>
        {isSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1.5 text-xs text-green-400 mt-2"
          >
            <Check className="w-3 h-3" />
            You have been subscribed successfully. Welcome aboard!
          </motion.p>
        )}
        {isError && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1.5 text-xs text-red-400 mt-2"
          >
            <AlertCircle className="w-3 h-3" />
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
