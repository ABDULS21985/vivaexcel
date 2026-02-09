"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Send, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useNewsletterSubscription } from "@/hooks/use-posts";

export function StoreNewsletter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const { mutate: subscribe, isPending, isSuccess, isError, error } = useNewsletterSubscription();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe({ email: email.trim() });
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B]" />

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Floating orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delay-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          {/* Glassmorphism Card */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Card shine effect */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div
                className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer-slide"
                style={{ animationDuration: "4s" }}
              />
            </div>

            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-white/80 uppercase">
                  Stay Updated
                </span>
                <Sparkles className="h-4 w-4 text-[#F59A23]" />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Notified About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                  New Products
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto">
                Subscribe to our newsletter and be the first to know when we
                release new digital products and exclusive discounts.
              </p>

              {/* Form */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-lg font-semibold text-white">
                    You&apos;re subscribed!
                  </p>
                  <p className="text-sm text-white/60">
                    Check your inbox for a confirmation email.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
                >
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F59A23]/20 to-[#E86A1D]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="relative w-full px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#F59A23]/50 focus:bg-white/15 transition-all duration-300"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-premium px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Error */}
              {isError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-300 mt-3"
                >
                  {(error as Error)?.message ||
                    "Something went wrong. Please try again."}
                </motion.p>
              )}

              {/* Trust line */}
              <p className="text-sm text-white/40 mt-6">
                Join 5,000+ professionals. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default StoreNewsletter;
