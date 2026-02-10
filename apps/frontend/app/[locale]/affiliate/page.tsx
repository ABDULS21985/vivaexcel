'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Link2,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button } from '@ktblog/ui/components';
import { useMyAffiliateProfile, useApplyAsAffiliate } from '@/hooks/use-affiliates';
import { useAuth } from '@/providers/auth-provider';
import { AffiliateStatus } from '@/types/affiliate';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIMARY = '#1E4DB7';
const SECONDARY = '#143A8F';
const ACCENT = '#F59A23';

const TIERS = [
  { name: 'Standard', rate: '10%', threshold: '$0', color: 'bg-neutral-200 dark:bg-neutral-700' },
  { name: 'Silver', rate: '15%', threshold: '$1,000', color: 'bg-slate-400' },
  { name: 'Gold', rate: '20%', threshold: '$5,000', color: 'bg-amber-400' },
  { name: 'Platinum', rate: '25%', threshold: '$25,000', color: 'bg-purple-400' },
];

const STEPS = [
  { icon: Link2, title: 'Share Your Link', desc: 'Get unique tracking links for any product or the entire store.' },
  { icon: ShoppingCart, title: 'They Buy', desc: '30-day cookie window. You earn commission on any purchase they make.' },
  { icon: DollarSign, title: 'You Earn', desc: 'Commissions are approved automatically after 30 days. Get paid via Stripe.' },
];

const FAQS = [
  { q: 'How much can I earn?', a: 'You start at 10% commission and can earn up to 25% as you grow. There\'s no cap on earnings.' },
  { q: 'How long is the cookie window?', a: 'Our affiliate cookies last 30 days. If someone clicks your link and purchases within 30 days, you earn the commission.' },
  { q: 'When do I get paid?', a: 'Commissions are auto-approved 30 days after the order. Payouts are processed weekly, biweekly, or monthly based on your preference via Stripe Connect.' },
  { q: 'Can I promote specific products?', a: 'Yes! You can create tracking links for specific products or use a general link that tracks any purchase on the platform.' },
  { q: 'What if a customer requests a refund?', a: 'If an order is refunded before the commission is approved, the commission is reversed. After approval, commissions are final.' },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── FAQ Accordion Item ─────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-white">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AffiliateJoinPage() {
  const { isAuthenticated } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useMyAffiliateProfile();
  const applyMutation = useApplyAsAffiliate();

  const [form, setForm] = useState({
    customSlug: '',
    bio: '',
    website: '',
    socialLinks: { twitter: '', youtube: '', instagram: '', tiktok: '' },
    promotionMethods: [] as string[],
    applicationNote: '',
  });
  const [methodInput, setMethodInput] = useState('');

  const addMethod = () => {
    if (methodInput.trim() && !form.promotionMethods.includes(methodInput.trim())) {
      setForm({ ...form, promotionMethods: [...form.promotionMethods, methodInput.trim()] });
      setMethodInput('');
    }
  };

  const removeMethod = (m: string) => {
    setForm({ ...form, promotionMethods: form.promotionMethods.filter((x) => x !== m) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      socialLinks: Object.fromEntries(
        Object.entries(form.socialLinks).filter(([, v]) => v.trim()),
      ),
    };
    await applyMutation.mutateAsync(payload);
  };

  if (loadingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4DB7]" />
      </main>
    );
  }

  // Show status if already applied
  if (profile) {
    const statusMap: Record<string, { label: string; color: string; message: string }> = {
      [AffiliateStatus.PENDING_APPROVAL]: {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        message: 'Your affiliate application is being reviewed. We\'ll notify you once a decision is made.',
      },
      [AffiliateStatus.ACTIVE]: {
        label: 'Active',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        message: 'Your affiliate account is active! Visit your dashboard to start earning.',
      },
      [AffiliateStatus.SUSPENDED]: {
        label: 'Suspended',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        message: 'Your affiliate account has been suspended. Please contact support.',
      },
      [AffiliateStatus.REJECTED]: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        message: 'Unfortunately, your affiliate application was not approved.',
      },
    };

    const s = statusMap[profile.status] ?? statusMap[AffiliateStatus.PENDING_APPROVAL];

    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Affiliate Application Status
          </h1>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-8">
            <div className={cn('inline-block px-4 py-2 rounded-full text-sm font-medium', s.color)}>
              {s.label}
            </div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">{s.message}</p>
            {profile.status === AffiliateStatus.ACTIVE && (
              <Link href="/affiliate/dashboard" className="inline-block mt-6">
                <Button
                  className="text-white font-medium"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ background: `radial-gradient(ellipse at 30% 20%, ${PRIMARY}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${ACCENT}, transparent 60%)` }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white mb-6"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
            >
              <TrendingUp className="w-4 h-4" />
              Earn up to 25% commission
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
              Turn Your Audience Into{' '}
              <span style={{ color: PRIMARY }}>Revenue</span>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
              Join our affiliate program and earn commissions by sharing products you love.
              Tiered rewards, 30-day cookies, and instant Stripe payouts.
            </p>
            <a href="#apply">
              <Button
                size="lg"
                className="text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow px-8"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
              >
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-12"
        >
          How It Works
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
                >
                  <Icon className="w-7 h-7" style={{ color: PRIMARY }} />
                </div>
                <div className="text-xs font-bold text-neutral-400 mb-1">STEP {i + 1}</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── Tier Table ────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-12"
          >
            Commission Tiers
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 text-center bg-neutral-50 dark:bg-neutral-800"
              >
                <div className={cn('w-3 h-3 rounded-full mx-auto mb-3', tier.color)} />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{tier.name}</h3>
                <p className="text-3xl font-bold mt-2 mb-1" style={{ color: PRIMARY }}>{tier.rate}</p>
                <p className="text-xs text-neutral-500">commission per sale</p>
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500">Lifetime sales threshold</p>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{tier.threshold}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Application Form ──────────────────────────────────────────────── */}
      <section id="apply" className="container mx-auto px-4 py-16 max-w-2xl">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
          Apply to Become an Affiliate
        </h2>

        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              You need to be signed in to apply.{' '}
              <Link href="/login" className="font-semibold underline">Sign in</Link> or{' '}
              <Link href="/register" className="font-semibold underline">create an account</Link>.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Custom Slug (optional)
            </label>
            <input
              type="text"
              value={form.customSlug}
              onChange={(e) => setForm({ ...form, customSlug: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
              placeholder="my-brand"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Optional custom URL slug for your affiliate links
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
              placeholder="Tell us about yourself and your audience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Social Media
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'twitter', placeholder: 'Twitter handle' },
                { key: 'youtube', placeholder: 'YouTube channel' },
                { key: 'instagram', placeholder: 'Instagram handle' },
                { key: 'tiktok', placeholder: 'TikTok handle' },
              ].map((s) => (
                <input
                  key={s.key}
                  type="text"
                  value={form.socialLinks[s.key as keyof typeof form.socialLinks]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socialLinks: { ...form.socialLinks, [s.key]: e.target.value },
                    })
                  }
                  className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
                  placeholder={s.placeholder}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Promotion Methods
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={methodInput}
                onChange={(e) => setMethodInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMethod())}
                className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
                placeholder="e.g. Blog, YouTube, Email Newsletter"
              />
              <button
                type="button"
                onClick={addMethod}
                className="px-4 py-2.5 text-white rounded-lg text-sm font-medium"
                style={{ background: PRIMARY }}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.promotionMethods.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  style={{ background: `${PRIMARY}15`, color: PRIMARY }}
                >
                  {m}
                  <button type="button" onClick={() => removeMethod(m)} className="ml-1 hover:text-red-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Why do you want to join?
            </label>
            <textarea
              rows={3}
              value={form.applicationNote}
              onChange={(e) => setForm({ ...form, applicationNote: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
              placeholder="Tell us how you plan to promote products"
            />
          </div>

          {applyMutation.isError && (
            <p className="text-red-500 text-sm">{applyMutation.error?.message}</p>
          )}

          <button
            type="submit"
            disabled={applyMutation.isPending || !isAuthenticated}
            className="w-full py-3 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
          >
            {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20 max-w-2xl">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>
    </main>
  );
}
