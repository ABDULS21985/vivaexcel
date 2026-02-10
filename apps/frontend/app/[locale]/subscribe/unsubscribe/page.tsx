"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { cn, Button } from "@ktblog/ui/components";
import { apiPost, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

// =============================================================================
// Newsletter Unsubscribe Page
// =============================================================================
// Handles unsubscription via token (from email link) or manual email entry.
// URL: /subscribe/unsubscribe?token=xxx&email=xxx

type UnsubState = "idle" | "loading" | "success" | "error";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [state, setState] = useState<UnsubState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!email.trim() && !tokenParam) {
        setState("error");
        setErrorMessage("Please enter your email address.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!tokenParam && !emailRegex.test(email)) {
        setState("error");
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      setState("loading");
      setErrorMessage("");

      try {
        await apiPost(
          "/newsletter/unsubscribe",
          {
            email: email.trim() || emailParam || "",
            token: tokenParam || undefined,
          },
          { skipAuth: true }
        );

        setState("success");
        toast.success("You have been unsubscribed successfully.");
      } catch (error) {
        setState("error");
        if (error instanceof ApiError) {
          setErrorMessage(
            error.status === 404
              ? "We couldn't find a subscription with this email address."
              : error.data?.message || "Failed to unsubscribe. Please try again."
          );
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
        }
      }
    },
    [email, emailParam, tokenParam]
  );

  // If we have both token and email from URL params, auto-submit
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  if (tokenParam && emailParam && !autoSubmitted && state === "idle") {
    setAutoSubmitted(true);
    handleUnsubscribe();
  }

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="pt-8 pb-4">
            <nav className="flex items-center gap-2 text-sm text-white/60">
              <Link
                href="/"
                className="hover:text-white/80 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href="/subscribe"
                className="hover:text-white/80 transition-colors"
              >
                Subscribe
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Unsubscribe</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Success State */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                  >
                    <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                </div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Unsubscribed Successfully
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  You won't receive any more emails from us. We're sorry to see
                  you go!
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 rounded-xl"
                  >
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Home
                    </Link>
                  </Button>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Changed your mind?{" "}
                    <Link
                      href="/subscribe"
                      className="text-[#1E4DB7] dark:text-blue-400 hover:underline"
                    >
                      Subscribe again
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Form State */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="px-8 pt-8 pb-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-5">
                    <Mail className="w-7 h-7 text-neutral-400" />
                  </div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-1">
                    Unsubscribe from Newsletter
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    Enter your email to unsubscribe from all newsletter
                    communications.
                  </p>
                </div>

                <form onSubmit={handleUnsubscribe} className="px-8 pb-8 pt-4">
                  <div className="mb-4">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
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
                        placeholder="you@example.com"
                        disabled={isLoading || !!tokenParam}
                        className={cn(
                          "w-full h-12 pl-10 pr-4 rounded-xl border text-sm transition-all",
                          "bg-neutral-50 dark:bg-neutral-800/50",
                          "text-neutral-900 dark:text-white",
                          "placeholder:text-neutral-400",
                          "focus:outline-none focus:ring-2 focus:border-transparent",
                          "disabled:opacity-50",
                          isError
                            ? "border-red-400 focus:ring-red-400"
                            : "border-neutral-200 dark:border-neutral-700 focus:ring-[#1E4DB7]"
                        )}
                        animate={isError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Unsubscribe"
                    )}
                  </Button>

                  <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 mt-4">
                    This will remove you from all newsletter emails. You can
                    always{" "}
                    <Link
                      href="/subscribe"
                      className="text-[#1E4DB7] dark:text-blue-400 hover:underline"
                    >
                      resubscribe
                    </Link>{" "}
                    later.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
