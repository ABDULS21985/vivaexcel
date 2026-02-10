'use client';

import { Gift, Copy, Share2, Mail } from 'lucide-react';
import { cn, Button } from '@ktblog/ui/components';
import { useMyReferralCode } from '@/hooks/use-referrals';
import { toast } from 'sonner';

interface ReferralShareCardProps {
  compact?: boolean;
  className?: string;
}

export function ReferralShareCard({ compact = false, className }: ReferralShareCardProps) {
  const { data: referralCode } = useMyReferralCode();

  if (!referralCode) return null;

  const shareUrl = referralCode.shareUrl;
  const code = referralCode.code;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const shareVia = (platform: string) => {
    const text = 'Join VivaExcel and get a discount on your first purchase!';
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out VivaExcel!')}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900', className)}>
        <Gift className="w-5 h-5 text-[#F59A23] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-900 dark:text-white">Refer a friend, earn $5</p>
          <code className="text-[10px] text-neutral-500 truncate block">{code}</code>
        </div>
        <Button variant="outline" size="sm" onClick={() => copyText(shareUrl)} className="rounded-lg text-xs h-7 px-2">
          <Copy className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-5', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1E4DB7]/10 to-[#F59A23]/10">
          <Gift className="w-5 h-5 text-[#1E4DB7]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Invite Friends</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Earn $5 for each purchase</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate">
          {shareUrl}
        </code>
        <Button variant="outline" size="sm" onClick={() => copyText(shareUrl)} className="rounded-lg">
          <Copy className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {[
          { key: 'email', icon: Mail, label: 'Email' },
          { key: 'twitter', icon: Share2, label: 'Twitter' },
          { key: 'whatsapp', icon: Share2, label: 'WhatsApp' },
        ].map((s) => (
          <Button key={s.key} variant="ghost" size="sm" onClick={() => shareVia(s.key)} className="text-xs flex-1">
            <s.icon className="w-3 h-3 mr-1" />
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
