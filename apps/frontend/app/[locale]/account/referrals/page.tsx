'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Gift,
  Copy,
  Mail,
  Share2,
  CheckCircle,
  Clock,
  ShoppingCart,
  Award,
} from 'lucide-react';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import { useMyReferralCode, useMyReferrals, useMyReferralStats } from '@/hooks/use-referrals';
import { ReferralStatus } from '@/types/affiliate';
import { toast } from 'sonner';

const PRIMARY = '#1E4DB7';
const ACCENT = '#F59A23';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getStatusStyle(status: ReferralStatus) {
  switch (status) {
    case ReferralStatus.PENDING:
      return { label: 'Pending', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock };
    case ReferralStatus.SIGNUP_COMPLETE:
      return { label: 'Signed Up', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Users };
    case ReferralStatus.FIRST_PURCHASE:
      return { label: 'First Purchase', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: ShoppingCart };
    case ReferralStatus.REWARDED:
      return { label: 'Rewarded', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: Award };
    default:
      return { label: status, color: 'text-neutral-700', bg: 'bg-neutral-50', icon: Clock };
  }
}

export default function AccountReferralsPage() {
  const { data: referralCode, isLoading: loadingCode } = useMyReferralCode();
  const { data: stats, isLoading: loadingStats } = useMyReferralStats();
  const [cursor, setCursor] = useState<string | undefined>();
  const { data: referralsData, isLoading: loadingReferrals } = useMyReferrals({ cursor, limit: 20 });

  const referrals = referralsData?.items ?? [];
  const meta = referralsData?.meta;

  const shareUrl = referralCode?.shareUrl ?? '';
  const code = referralCode?.code ?? '';

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const shareVia = (platform: string) => {
    const text = `Join VivaExcel and get a discount on your first purchase! Use my referral link:`;
    const url = shareUrl;

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out VivaExcel!')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  if (loadingCode || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Referrals</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Invite friends and earn rewards when they make their first purchase
        </p>
      </motion.div>

      {/* Share Card */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'relative overflow-hidden p-6')} style={{ borderTop: `3px solid ${ACCENT}` }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-[0.06] -translate-y-1/3 translate-x-1/4" style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)` }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${ACCENT}20)` }}>
                <Gift className="w-6 h-6" style={{ color: PRIMARY }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Invite Friends, Earn Rewards
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Get $5 credit for each friend who makes a purchase
                </p>
              </div>
            </div>

            {/* Code & Link */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Your Referral Code</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-xl text-sm font-mono font-bold text-neutral-900 dark:text-white tracking-wider">
                    {code}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyText(code)} className="rounded-xl">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Share Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 truncate">
                    {shareUrl}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyText(shareUrl)} className="rounded-xl">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1">Share via:</span>
              {[
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'twitter', label: 'Twitter', icon: Share2 },
                { key: 'linkedin', label: 'LinkedIn', icon: Share2 },
                { key: 'whatsapp', label: 'WhatsApp', icon: Share2 },
              ].map((s) => (
                <Button
                  key={s.key}
                  variant="outline"
                  size="sm"
                  onClick={() => shareVia(s.key)}
                  className="rounded-lg text-xs"
                >
                  <s.icon className="w-3 h-3 mr-1" />
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Referrals', value: stats?.totalReferrals ?? 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Successful', value: stats?.successfulReferrals ?? 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
            { label: 'Rewards Earned', value: `$${(stats?.rewardsEarned ?? 0).toFixed(2)}`, icon: Gift, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Referral History */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">Referral History</h2>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No referrals yet</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Share your referral link and start earning rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => {
                const style = getStatusStyle(referral.status);
                const StatusIcon = style.icon;

                return (
                  <div
                    key={referral.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {referral.referredUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {referral.referredUser?.name ?? 'Unknown User'}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Reward */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        +${referral.referrerReward.toFixed(2)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium flex-shrink-0', style.bg, style.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {style.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {meta && (meta.hasNextPage || meta.hasPreviousPage) && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {meta.hasPreviousPage && meta.previousCursor && (
                <Button variant="outline" size="sm" onClick={() => setCursor(meta.previousCursor)}>Previous</Button>
              )}
              {meta.hasNextPage && meta.nextCursor && (
                <Button variant="outline" size="sm" onClick={() => setCursor(meta.nextCursor)}>Next</Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Send your unique referral link or code to friends.' },
              { step: 2, title: 'They Sign Up & Buy', desc: 'Your friend creates an account and makes their first purchase.' },
              { step: 3, title: 'You Both Earn', desc: 'You get $5 credit, and they get a discount on their first order.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
                >
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
