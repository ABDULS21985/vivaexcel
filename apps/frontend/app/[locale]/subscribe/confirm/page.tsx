"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  Loader2,
  Mail,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { cn, Button } from "@ktblog/ui/components";
import { apiPost, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

// =============================================================================
// Newsletter Confirmation Page
// =============================================================================
// Handles the double opt-in confirmation flow.
// URL: /subscribe/confirm?token=xxx

type ConfirmState = "loading" | "success" | "error" | "invalid";

export default function ConfirmSubscriptionPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<ConfirmState>(
    token ? "loading" : "invalid"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    async function confirmSubscription() {
      try {
        await apiPost(`/newsletter/confirm/${token}`, {}, { skipAuth: true });
        setState("success");
        toast.success("Your subscription has been confirmed!");
      } catch (error) {
        setState("error");
        if (error instanceof ApiError) {
          setErrorMessage(
            error.status === 404
              ? "This confirmation link is invalid or has already been used."
              : error.data?.message || "Failed to confirm your subscription."
          );
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
        }
      }
    }

    confirmSubscription();
  }, [token]);

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
              <span className="text-white">Confirm</span>
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
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-8 text-center"
        >
          {/* Loading */}
          {state === "loading" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-[#1E4DB7] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Confirming your subscription...
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Please wait while we verify your email.
              </p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div>
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
                Subscription Confirmed!
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Welcome aboard! You'll start receiving our newsletter with
                exclusive content, deals, and updates.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-2 rounded-xl"
                >
                  <Link href="/store">
                    Browse Store
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <Link href="/blogs">Read Blog</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Confirmation Failed
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                {errorMessage}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-2 rounded-xl"
                >
                  <Link href="/subscribe">
                    <Mail className="w-4 h-4" />
                    Try Again
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Invalid Token */}
          {state === "invalid" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Invalid Link
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                This confirmation link appears to be invalid or missing. Please
                check your email for the correct link, or subscribe again.
              </p>
              <Button
                asChild
                className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-2 rounded-xl"
              >
                <Link href="/subscribe">
                  <Mail className="w-4 h-4" />
                  Subscribe
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
