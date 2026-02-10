"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Login Page — Premium Split-Screen Layout
// =============================================================================

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Premium templates ready in seconds",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Bank-grade encryption for your data",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    desc: "Smart tools that work for you",
  },
];

export default function LoginPage() {
  const { login, loginWithProvider, loginWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push(decodeURIComponent(returnUrl));
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!magicEmail.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithMagicLink(magicEmail);
      setMagicLinkSent(true);
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ================================================================
          LEFT PANEL — Branded / Visual
          ================================================================ */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0c2d6b]" />

        {/* Animated floating orbs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-float1"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)",
              top: "-10%",
              left: "-10%",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float2"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
              bottom: "-5%",
              right: "-5%",
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-10 animate-float3"
            style={{
              background:
                "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)",
              top: "40%",
              left: "50%",
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="VivaExcel"
                width={220}
                height={53}
                className="brightness-0 invert h-[53px] w-auto"
                priority
              />
            </Link>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
            >
              Your digital
              <br />
              toolkit awaits
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-blue-200/80 text-base xl:text-lg leading-relaxed mb-10 max-w-sm"
            >
              Access premium templates, tools, and resources to power your
              business forward.
            </motion.p>

            {/* Feature pills */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.12,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-4 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300">
                    <feature.icon className="h-5 w-5 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {feature.title}
                    </p>
                    <p className="text-blue-300/60 text-xs">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial / social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="border-t border-white/10 pt-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#1E4DB7] bg-gradient-to-br from-blue-300 to-blue-500"
                    style={{
                      background: `linear-gradient(135deg, hsl(${200 + i * 30}, 70%, 65%), hsl(${220 + i * 30}, 80%, 50%))`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              &ldquo;Transformed our workflow completely. The templates saved us
              weeks of work.&rdquo;
            </p>
            <p className="text-white/50 text-xs mt-2">
              Trusted by 10,000+ professionals
            </p>
          </motion.div>
        </div>
      </div>

      {/* ================================================================
          RIGHT PANEL — Login Form
          ================================================================ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10 bg-[var(--background)] relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo (hidden on lg+) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center mb-8 lg:hidden"
          >
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="VivaExcel"
                width={180}
                height={43}
                className="h-[43px] w-auto"
                priority
              />
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm mt-2">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Social Login — at top for quick access */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <button
              type="button"
              onClick={() => loginWithProvider("google")}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] hover:border-[var(--foreground)]/20 transition-all duration-200 btn-press"
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => loginWithProvider("github")}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] hover:border-[var(--foreground)]/20 transition-all duration-200 btn-press"
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative mb-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--background)] px-3 text-[var(--muted-foreground)]">
                or continue with email
              </span>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mb-5 p-3.5 rounded-xl bg-[var(--error-light)] dark:bg-red-900/20 border border-[var(--error)]/20 flex items-start gap-2.5"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--error)]/10 flex items-center justify-center mt-0.5">
                  <span className="text-[var(--error)] text-xs font-bold">!</span>
                </div>
                <p className="text-[var(--error-dark)] dark:text-red-400 text-sm leading-snug">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showMagicLink ? (
              // ============================================================
              // Magic Link Form
              // ============================================================
              <motion.div
                key="magic-link"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {magicLinkSent ? (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--success-light)] dark:bg-green-900/30 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-[var(--success-dark)] dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      Check your email
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
                      We sent a sign-in link to{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {magicEmail}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMagicLink(false);
                        setMagicLinkSent(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline font-medium"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <div>
                      <label
                        htmlFor="magic-email"
                        className="block text-sm font-medium text-[var(--foreground)] mb-2"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                        <input
                          id="magic-email"
                          type="email"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-xl bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press btn-premium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send magic link
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMagicLink(false)}
                      className="w-full flex items-center justify-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to password sign in
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              // ============================================================
              // Standard Login Form
              // ============================================================
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--foreground)] mb-2"
                    >
                      Email address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors duration-200" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-[var(--foreground)]"
                      >
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-[var(--primary)] hover:text-[var(--secondary)] transition-colors font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors duration-200" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-10 pr-11 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-0.5"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-xl bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press btn-premium group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                {/* Magic Link Option */}
                <motion.div
                  custom={6}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="mt-4"
                >
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(true)}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 hover:bg-[var(--surface-1)] transition-all duration-200"
                  >
                    <Mail className="h-4 w-4" />
                    Sign in with email link instead
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign Up Link */}
          <motion.p
            custom={7}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 text-center text-sm text-[var(--muted-foreground)]"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
            >
              Create an account
            </Link>
          </motion.p>

          {/* Terms */}
          <motion.p
            custom={8}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 text-center text-xs text-[var(--muted-foreground)]/60 leading-relaxed"
          >
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--muted-foreground)]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--muted-foreground)]">
              Privacy Policy
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
