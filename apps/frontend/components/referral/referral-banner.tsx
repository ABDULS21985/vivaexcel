'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button } from '@ktblog/ui/components';

interface ReferralBannerProps {
  className?: string;
}

export function ReferralBanner({ className }: ReferralBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 bg-gradient-to-r from-[#1E4DB7]/5 to-[#F59A23]/5 dark:from-[#1E4DB7]/10 dark:to-[#F59A23]/10 p-5',
          className,
        )}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E4DB720, #F59A2320)' }}
          >
            <Gift className="w-6 h-6 text-[#1E4DB7]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Invite friends, earn $5 for each purchase
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Share your referral link and earn rewards when friends make their first purchase.
            </p>
          </div>

          <Link href="/account/referrals" className="flex-shrink-0">
            <Button
              size="sm"
              className="text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #1E4DB7, #143A8F)' }}
            >
              Refer Now
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
