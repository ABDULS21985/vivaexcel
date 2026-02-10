'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Plus,
  X,
  Loader2,
  FileText,
  Sparkles,
  TrendingUp,
  Globe,
  Send,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import {
  useMyContributorApplication,
  useSubmitContributorApplication,
} from '../../../hooks/use-contributors';

// =============================================================================
// Contribute / Become an Author Page
// =============================================================================

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const benefits = [
  {
    icon: PenTool,
    title: 'Share Your Expertise',
    desc: 'Create templates, guides, and resources that help thousands of professionals worldwide.',
    color: 'from-blue-500/10 to-blue-600/5',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: DollarSign,
    title: 'Earn Revenue',
    desc: 'Keep 80% of every sale. Receive automatic payouts on your preferred schedule via Stripe.',
    color: 'from-green-500/10 to-green-600/5',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Users,
    title: 'Build Your Brand',
    desc: 'Get a public author profile, showcase your work, and grow your professional reputation.',
    color: 'from-purple-500/10 to-purple-600/5',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

const steps = [
  {
    num: '01',
    title: 'Apply',
    desc: 'Fill out the application below with your background and areas of expertise.',
    icon: FileText,
  },
  {
    num: '02',
    title: 'Get Reviewed',
    desc: 'Our team reviews every application to ensure quality for our community.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Start Creating',
    desc: 'Once approved, access the creator dashboard and publish your first product.',
    icon: TrendingUp,
  },
];

const contentTypes = [
  'Excel Templates',
  'PowerPoint Presentations',
  'Business Documents',
  'Financial Models',
  'Web Templates',
  'Design Systems',
  'Blog Articles',
  'Video Tutorials',
];

export default function ContributePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: existingApp, isLoading: loadingApp } = useMyContributorApplication();
  const submitMutation = useSubmitContributorApplication();

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    website: '',
    experienceDescription: '',
    applicationNote: '',
    specialties: [] as string[],
    contentCategories: [] as string[],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { displayName: form.displayName };
    if (form.bio) payload.bio = form.bio;
    if (form.website) payload.website = form.website;
    if (form.experienceDescription) payload.experienceDescription = form.experienceDescription;
    if (form.applicationNote) payload.applicationNote = form.applicationNote;
    if (form.specialties.length > 0) payload.specialties = form.specialties;
    if (form.contentCategories.length > 0) payload.contentCategories = form.contentCategories;

    await submitMutation.mutateAsync(payload as Parameters<typeof submitMutation.mutateAsync>[0]);
    setSubmitted(true);
  };

  const addSpecialty = () => {
    const val = specialtyInput.trim();
    if (val && !form.specialties.includes(val)) {
      setForm({ ...form, specialties: [...form.specialties, val] });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (s: string) => {
    setForm({ ...form, specialties: form.specialties.filter((x) => x !== s) });
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      contentCategories: prev.contentCategories.includes(cat)
        ? prev.contentCategories.filter((c) => c !== cat)
        : [...prev.contentCategories, cat],
    }));
  };

  // ─── Loading State ────────────────────────────────────────────────

  if (authLoading || (isAuthenticated && loadingApp)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </main>
    );
  }

  // ─── Application Status View ──────────────────────────────────────

  if (isAuthenticated && (existingApp || submitted)) {
    const app = existingApp;
    const status = app?.status || 'pending';

    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        label: 'Under Review',
        message: 'Your application is being reviewed by our team. We\'ll notify you once a decision has been made.',
      },
      approved: {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        label: 'Approved',
        message: 'Congratulations! Your application has been approved. You can now access the creator dashboard and start publishing.',
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        label: 'Not Approved',
        message: 'Unfortunately, your application was not approved at this time. You may reapply in the future.',
      },
    };

    const cfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = cfg.icon;

    return (
      <main className="min-h-screen bg-[var(--background)]">
        {/* Compact hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent" />
          <div className="relative container mx-auto px-4 py-16 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3"
            >
              Application Status
            </motion.h1>
          </div>
        </section>

        <section className="container mx-auto px-4 -mt-4 pb-20 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-2xl border p-8 text-center ${cfg.bg}`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <StatusIcon className={`h-14 w-14 mx-auto mb-5 ${cfg.color}`} />
            </motion.div>

            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${cfg.color} bg-white/50 dark:bg-white/5`}>
              {cfg.label}
            </div>

            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              {cfg.message}
            </p>

            {app?.reviewNotes && (
              <div className="mt-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Reviewer Notes</p>
                <p className="text-sm text-[var(--foreground)] italic">{app.reviewNotes}</p>
              </div>
            )}

            {status === 'approved' && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all btn-press"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>
        </section>
      </main>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/8 via-[var(--primary)]/3 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6"
            >
              <Globe className="h-3.5 w-3.5" />
              Open to contributors worldwide
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-tight leading-[1.1] mb-6"
            >
              Become an{' '}
              <span className="text-gradient-primary">Author</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Share your expertise with thousands of professionals. Create premium templates,
              guides, and digital products — and earn revenue doing what you love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                href="#apply"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:brightness-110 transition-all btn-press btn-premium text-base"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BENEFITS
          ============================================================ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
            Why contribute?
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
            Join a growing community of creators earning revenue from their expertise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 card-interactive group"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-1)] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
            How it works
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
            Three simple steps to start sharing your work with the world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-5">
                <step.icon className="h-7 w-7 text-[var(--primary)]" />
              </div>
              <div className="text-xs font-bold text-[var(--primary)] tracking-wider uppercase mb-2">
                Step {step.num}
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          APPLICATION FORM
          ============================================================ */}
      <section id="apply" className="container mx-auto px-4 py-16 md:py-20 scroll-mt-8">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
            Apply to contribute
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
            Tell us about yourself and your expertise. We review every application carefully.
          </p>
        </motion.div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <LogIn className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Sign in to apply
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                You need an account to submit a contributor application.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/login?returnUrl=${encodeURIComponent('/contribute')}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all btn-press"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-1)] transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 space-y-6"
            >
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Display Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200"
                  placeholder="Your author name"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200 resize-none"
                  placeholder="Tell us about yourself and your professional background"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* Content Categories */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  What will you create?
                </label>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  Select the types of content you plan to contribute.
                </p>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((cat) => {
                    const selected = form.contentCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selected
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialties (free-form tags) */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Specialties
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    className="flex-1 h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200"
                    placeholder="e.g. Financial Modeling, Data Analysis"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="h-11 px-4 rounded-xl bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all flex items-center gap-1.5 btn-press"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <AnimatePresence>
                  {form.specialties.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-wrap gap-2"
                    >
                      {form.specialties.map((s) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(s)}
                            className="hover:text-[var(--error)] transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Experience
                </label>
                <textarea
                  rows={3}
                  value={form.experienceDescription}
                  onChange={(e) => setForm({ ...form, experienceDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200 resize-none"
                  placeholder="Describe your experience creating digital products, templates, or educational content"
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Why do you want to contribute?
                </label>
                <textarea
                  rows={3}
                  value={form.applicationNote}
                  onChange={(e) => setForm({ ...form, applicationNote: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)] transition-all duration-200 resize-none"
                  placeholder="Tell us what motivates you to create and share your expertise"
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {submitMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-xl bg-[var(--error-light)] dark:bg-red-900/20 border border-[var(--error)]/20 text-[var(--error-dark)] dark:text-red-400 text-sm"
                  >
                    {submitMutation.error?.message || 'Something went wrong. Please try again.'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitMutation.isPending || !form.displayName.trim()}
                className="w-full h-12 rounded-xl bg-[var(--primary)] text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press btn-premium text-base"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </section>
    </main>
  );
}
