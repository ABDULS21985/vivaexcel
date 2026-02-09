'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Camera,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Mail,
  Smartphone,
  Laptop,
  Save,
  ChevronRight,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button, Badge, Input, Switch, Skeleton } from '@ktblog/ui/components';
import {
  useMySellerProfile,
  useUpdateSellerProfile,
  useStripeConnectStatus,
  useCreateStripeConnect,
  useStripeDashboardLink,
} from '@/hooks/use-sellers';
import {
  VerificationStatus,
  VERIFICATION_LABELS,
  VERIFICATION_COLORS,
} from '@/types/seller';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

type TabId = 'profile' | 'payments' | 'notifications' | 'security';

interface SettingsTab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const PAYOUT_SCHEDULES = [
  { value: 'weekly', label: 'Weekly', description: 'Every Friday' },
  { value: 'biweekly', label: 'Biweekly', description: 'Every other Friday' },
  { value: 'monthly', label: 'Monthly', description: '1st of each month' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerSettingsPage() {
  const { data: profile, isLoading } = useMySellerProfile();
  const updateProfile = useUpdateSellerProfile();
  const { data: stripeStatus } = useStripeConnectStatus();
  const createStripeConnect = useCreateStripeConnect();
  const stripeDashboard = useStripeDashboardLink();

  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile form state
  const [form, setForm] = useState({
    displayName: '',
    slug: '',
    bio: '',
    website: '',
    socialLinks: { twitter: '', github: '', linkedin: '', youtube: '' },
    payoutSchedule: 'monthly',
    minimumPayout: 50,
  });

  // Notification preferences (mock state)
  const [notifications, setNotifications] = useState({
    newOrderEmail: true,
    newOrderPush: true,
    productReview: true,
    payoutNotification: true,
    marketing: false,
    weeklySummary: true,
  });

  // Security mock state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [initialized, setInitialized] = useState(false);

  // Initialize form from profile data
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        displayName: profile.displayName || '',
        slug: profile.slug || '',
        bio: profile.bio || '',
        website: profile.website || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          github: profile.socialLinks?.github || '',
          linkedin: profile.socialLinks?.linkedin || '',
          youtube: profile.socialLinks?.youtube || '',
        },
        payoutSchedule: profile.payoutSchedule || 'monthly',
        minimumPayout: Number(profile.minimumPayout) || 50,
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        displayName: form.displayName,
        bio: form.bio,
        website: form.website,
        socialLinks: form.socialLinks,
        payoutSchedule: form.payoutSchedule as any,
        minimumPayout: form.minimumPayout,
      });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  }, [form, updateProfile]);

  const handleStripeConnect = useCallback(async () => {
    try {
      const result = await createStripeConnect.mutateAsync();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error('Failed to start Stripe onboarding');
    }
  }, [createStripeConnect]);

  const handleStripeDashboard = useCallback(async () => {
    try {
      const result = await stripeDashboard.mutateAsync();
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch {
      toast.error('Failed to open Stripe dashboard');
    }
  }, [stripeDashboard]);

  const updateForm = useCallback(
    (key: string, value: string | number) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateSocialLink = useCallback(
    (platform: string, value: string) => {
      setForm((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platform]: value },
      }));
    },
    [],
  );

  // ── Tab Content Components ──────────────────────────────────────────────────

  function ProfileSection() {
    if (isLoading) return <ProfileSkeleton />;

    const displayInitials = getInitials(form.displayName || 'S');

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={form.displayName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/10">
                {displayInitials}
              </div>
            )}
            <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {form.displayName || 'Your Name'}
            </h3>
            <p className="text-sm text-neutral-400">
              Click the avatar to upload a new photo
            </p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
          {profile?.coverImage ? (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-[200px] object-cover"
            />
          ) : (
            <div className="w-full h-[200px] bg-gradient-to-br from-[#1E4DB7]/30 to-[#143A8F]/30 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">
                  Upload a cover image (16:9 recommended)
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Display Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300">
                Display Name
              </label>
              <span className="text-xs text-neutral-500">
                {form.displayName.length}/50
              </span>
            </div>
            <Input
              value={form.displayName}
              onChange={(e) => updateForm('displayName', e.target.value)}
              maxLength={50}
              placeholder="Your store name"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#1E4DB7] focus:ring-[#1E4DB7]/20"
            />
          </div>

          {/* Store Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Store URL
            </label>
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              <span className="px-3 py-2.5 text-sm text-neutral-500 bg-white/5 border-r border-white/10 shrink-0">
                /sellers/
              </span>
              <input
                value={form.slug}
                readOnly
                className="flex-1 px-3 py-2.5 text-sm bg-transparent text-neutral-400 outline-none cursor-default"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/sellers/${form.slug}`,
                  );
                  toast.success('Store URL copied!');
                }}
                className="px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <Copy className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300">Bio</label>
              <span className="text-xs text-neutral-500">
                {form.bio.length}/500
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => updateForm('bio', e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell customers about yourself and your products..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/20 outline-none resize-none transition-colors"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                value={form.website}
                onChange={(e) => updateForm('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#1E4DB7] focus:ring-[#1E4DB7]/20"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300">
              Social Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'twitter', label: 'Twitter', prefix: 'twitter.com/' },
                { key: 'github', label: 'GitHub', prefix: 'github.com/' },
                { key: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/in/' },
                { key: 'youtube', label: 'YouTube', prefix: 'youtube.com/@' },
              ].map((social) => (
                <div key={social.key} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                    {social.prefix}
                  </span>
                  <Input
                    value={
                      form.socialLinks[
                        social.key as keyof typeof form.socialLinks
                      ]
                    }
                    onChange={(e) =>
                      updateSocialLink(social.key, e.target.value)
                    }
                    placeholder={social.label}
                    className="pl-[120px] bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#1E4DB7] focus:ring-[#1E4DB7]/20"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white px-8"
          >
            {updateProfile.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  function PaymentsSection() {
    if (isLoading) return <PaymentsSkeleton />;

    const commissionRate = profile?.commissionRate ?? 15;
    const platformFee = 100 - commissionRate;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Stripe Connection Status */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#635BFF]" />
              Stripe Connect
            </h3>

            {stripeStatus?.complete ? (
              <div className="space-y-5">
                {/* Connected Status */}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400">
                    Connected & Active
                  </span>
                </div>

                {/* Status Pills */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Charges',
                      enabled: stripeStatus.chargesEnabled,
                      icon: CheckCircle,
                    },
                    {
                      label: 'Payouts',
                      enabled: stripeStatus.payoutsEnabled,
                      icon: CheckCircle,
                    },
                    {
                      label: 'Details',
                      enabled: stripeStatus.detailsSubmitted,
                      icon: CheckCircle,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'rounded-lg p-3 text-center border',
                        item.enabled
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-amber-500/20 bg-amber-500/5',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-4 h-4 mx-auto mb-1.5',
                          item.enabled
                            ? 'text-emerald-400'
                            : 'text-amber-400',
                        )}
                      />
                      <p className="text-xs text-neutral-400">{item.label}</p>
                      <p
                        className={cn(
                          'text-xs font-medium mt-0.5',
                          item.enabled
                            ? 'text-emerald-400'
                            : 'text-amber-400',
                        )}
                      >
                        {item.enabled
                          ? item.label === 'Details'
                            ? 'Submitted'
                            : 'Enabled'
                          : item.label === 'Details'
                            ? 'Pending'
                            : 'Disabled'}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStripeDashboard}
                  disabled={stripeDashboard.isPending}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  {stripeDashboard.isPending ? (
                    'Loading...'
                  ) : (
                    <span className="flex items-center gap-2">
                      Open Stripe Dashboard
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Setup Steps */}
                <div className="flex items-center justify-center gap-2 py-4">
                  {['Create Account', 'Verify Identity', 'Start Selling'].map(
                    (step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                            i === 0
                              ? 'bg-[#1E4DB7] text-white'
                              : 'bg-white/5 text-neutral-500 border border-white/10',
                          )}
                        >
                          {i + 1}
                        </div>
                        <span className="text-xs text-neutral-400 hidden sm:block">
                          {step}
                        </span>
                        {i < 2 && (
                          <ChevronRight className="w-4 h-4 text-neutral-600" />
                        )}
                      </div>
                    ),
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  {[
                    'Receive payouts directly to your bank account',
                    'View real-time earnings and analytics',
                    'Manage refunds and disputes',
                  ].map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-2 text-sm text-neutral-400"
                    >
                      <CheckCircle className="w-4 h-4 text-[#1E4DB7] shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStripeConnect}
                  disabled={createStripeConnect.isPending}
                  className="bg-[#635BFF] hover:bg-[#5851DB] text-white w-full sm:w-auto"
                >
                  {createStripeConnect.isPending
                    ? 'Setting up...'
                    : 'Connect with Stripe'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Payout Preferences */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="text-base font-semibold text-white mb-5">
            Payout Preferences
          </h3>

          {/* Schedule Radio Cards */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-neutral-300">
              Payout Schedule
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYOUT_SCHEDULES.map((schedule) => (
                <button
                  key={schedule.value}
                  type="button"
                  onClick={() => updateForm('payoutSchedule', schedule.value)}
                  className={cn(
                    'rounded-xl p-4 text-left border transition-all',
                    form.payoutSchedule === schedule.value
                      ? 'border-[#1E4DB7] bg-[#1E4DB7]/10 ring-1 ring-[#1E4DB7]/30'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {schedule.label}
                    </span>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                        form.payoutSchedule === schedule.value
                          ? 'border-[#1E4DB7]'
                          : 'border-white/20',
                      )}
                    >
                      {form.payoutSchedule === schedule.value && (
                        <div className="w-2 h-2 rounded-full bg-[#1E4DB7]" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {schedule.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Payout */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-neutral-300">
              Minimum Payout Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                $
              </span>
              <Input
                type="number"
                min={10}
                max={10000}
                value={form.minimumPayout}
                onChange={(e) =>
                  updateForm('minimumPayout', Number(e.target.value))
                }
                className="pl-7 bg-white/5 border-white/10 text-white focus:border-[#1E4DB7] focus:ring-[#1E4DB7]/20"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Min: $10 / Max: $10,000
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Currency
            </label>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-400">
              USD (United States Dollar) -- set by Stripe
            </div>
          </div>
        </div>

        {/* Commission Info Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Commission Split
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-neutral-400">Your Earnings</p>
              <p className="text-2xl font-bold text-white">{commissionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Platform Fee</p>
              <p className="text-2xl font-bold text-neutral-500">
                {platformFee}%
              </p>
            </div>
          </div>
          {/* Visual split bar */}
          <div className="h-3 rounded-full overflow-hidden flex bg-white/5">
            <div
              className="bg-gradient-to-r from-[#1E4DB7] to-[#F59A23] rounded-l-full transition-all"
              style={{ width: `${commissionRate}%` }}
            />
            <div
              className="bg-white/10 rounded-r-full transition-all"
              style={{ width: `${platformFee}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#F59A23]">You receive</span>
            <span className="text-xs text-neutral-500">Platform</span>
          </div>
        </div>
      </motion.div>
    );
  }

  function NotificationsSection() {
    const salesNotifications = [
      {
        key: 'newOrderEmail',
        icon: Mail,
        title: 'New Order (Email)',
        description: 'Get an email when someone purchases your product',
      },
      {
        key: 'newOrderPush',
        icon: Bell,
        title: 'New Order (Push)',
        description: 'Browser push notification for new orders',
      },
      {
        key: 'productReview',
        icon: CheckCircle,
        title: 'Product Reviews',
        description: 'When someone reviews one of your products',
      },
    ];

    const accountNotifications = [
      {
        key: 'payoutNotification',
        icon: CreditCard,
        title: 'Payout Notifications',
        description: 'When a payout is processed or fails',
      },
      {
        key: 'marketing',
        icon: Mail,
        title: 'Marketing & Newsletter',
        description: 'Tips, feature updates, and promotional content',
      },
      {
        key: 'weeklySummary',
        icon: Settings,
        title: 'Weekly Summary',
        description: 'A weekly email digest of your store performance',
      },
    ];

    function NotificationToggle({
      item,
    }: {
      item: {
        key: string;
        icon: React.ElementType;
        title: string;
        description: string;
      };
    }) {
      const Icon = item.icon;
      return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-neutral-500 truncate">
                {item.description}
              </p>
            </div>
          </div>
          <Switch
            checked={
              notifications[item.key as keyof typeof notifications]
            }
            onCheckedChange={(checked) =>
              setNotifications((prev) => ({
                ...prev,
                [item.key]: checked,
              }))
            }
          />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Sales Notifications */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="text-base font-semibold text-white mb-2">
            Sales Notifications
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Stay informed about your store activity
          </p>
          <div>
            {salesNotifications.map((item) => (
              <NotificationToggle key={item.key} item={item} />
            ))}
          </div>
        </div>

        {/* Account Notifications */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="text-base font-semibold text-white mb-2">
            Account Notifications
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Important updates about your account and payouts
          </p>
          <div>
            {accountNotifications.map((item) => (
              <NotificationToggle key={item.key} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  function SecuritySection() {
    const verificationStatus =
      profile?.verificationStatus ?? VerificationStatus.UNVERIFIED;

    const mockSessions = [
      {
        id: '1',
        device: 'MacBook Pro',
        icon: Laptop,
        location: 'San Francisco, CA',
        time: 'Active now',
        current: true,
      },
      {
        id: '2',
        device: 'iPhone 15',
        icon: Smartphone,
        location: 'San Francisco, CA',
        time: '2 hours ago',
        current: false,
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Verification Status */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Verification Status
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  verificationStatus === VerificationStatus.UNVERIFIED
                    ? 'bg-amber-500/10'
                    : 'bg-emerald-500/10',
                )}
              >
                {verificationStatus === VerificationStatus.UNVERIFIED ? (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {VERIFICATION_LABELS[verificationStatus]}
                </p>
                <p className="text-xs text-neutral-500">
                  {verificationStatus === VerificationStatus.UNVERIFIED
                    ? 'Verify your identity to increase buyer trust'
                    : 'Your identity has been verified'}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                'text-xs',
                VERIFICATION_COLORS[verificationStatus],
              )}
            >
              {VERIFICATION_LABELS[verificationStatus]}
            </Badge>
          </div>
          {verificationStatus === VerificationStatus.UNVERIFIED && (
            <Button
              className="mt-4 bg-[#F59A23] hover:bg-[#F59A23]/80 text-white"
              size="sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify Identity
            </Button>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <Shield className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-neutral-500">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">
              Active Sessions
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Sign out all
            </Button>
          </div>
          <div className="space-y-3">
            {mockSessions.map((session) => {
              const DeviceIcon = session.icon;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                      <DeviceIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {session.device}
                        </p>
                        {session.current && (
                          <Badge
                            variant="default"
                            className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {session.location} -- {session.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1 ml-[52px]">
          Manage your seller profile, payments, and preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation -- sidebar on desktop, horizontal scroll on mobile */}
        <div className="lg:w-56 shrink-0">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0',
                    isActive
                      ? 'bg-[#1E4DB7]/10 text-[#1E4DB7]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical sidebar tabs */}
          <nav className="hidden lg:flex flex-col gap-1 sticky top-24">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                    isActive
                      ? 'bg-white/[0.05] text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settings-tab-indicator"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                      style={{
                        background:
                          'linear-gradient(to bottom, #1E4DB7, #F59A23)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 ml-auto transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'payments' && <PaymentsSection />}
              {activeTab === 'notifications' && <NotificationsSection />}
              {activeTab === 'security' && <SecuritySection />}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
