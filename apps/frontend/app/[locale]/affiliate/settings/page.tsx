'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Settings,
  Globe,
  Save,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { cn, Button, Input, Skeleton } from '@ktblog/ui/components';
import {
  useMyAffiliateProfile,
  useUpdateAffiliateProfile,
  useAffiliateStripeStatus,
  useCreateAffiliateStripeConnect,
  useAffiliateDashboardLink,
} from '@/hooks/use-affiliates';
import { toast } from 'sonner';

const PRIMARY = '#1E4DB7';

type TabId = 'profile' | 'payments';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

const PAYOUT_SCHEDULES = [
  { value: 'weekly', label: 'Weekly', description: 'Every Monday' },
  { value: 'biweekly', label: 'Biweekly', description: '1st and 15th' },
  { value: 'monthly', label: 'Monthly', description: '1st of each month' },
];

export default function AffiliateSettingsPage() {
  const { data: profile, isLoading } = useMyAffiliateProfile();
  const updateProfile = useUpdateAffiliateProfile();
  const { data: stripeStatus } = useAffiliateStripeStatus();
  const createStripeConnect = useCreateAffiliateStripeConnect();
  const stripeDashboard = useAffiliateDashboardLink();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    bio: '',
    website: '',
    socialLinks: { twitter: '', youtube: '', instagram: '', linkedin: '' },
    payoutSchedule: 'monthly',
    payoutThreshold: 50,
  });

  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        bio: profile.bio || '',
        website: profile.website || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          youtube: profile.socialLinks?.youtube || '',
          instagram: profile.socialLinks?.instagram || '',
          linkedin: profile.socialLinks?.linkedin || '',
        },
        payoutSchedule: profile.payoutSchedule || 'monthly',
        payoutThreshold: profile.payoutThreshold || 50,
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        bio: form.bio,
        website: form.website,
        socialLinks: form.socialLinks,
        payoutSchedule: form.payoutSchedule as any,
        payoutThreshold: form.payoutThreshold,
      });
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your affiliate profile and payment settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Affiliate Code */}
          {profile && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Affiliate Code</h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-lg text-sm font-mono text-neutral-700 dark:text-neutral-300">
                  {profile.affiliateCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.affiliateCode);
                    toast.success('Copied');
                  }}
                  className="rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {profile.customSlug && (
                <p className="text-xs text-neutral-500 mt-2">Custom slug: {profile.customSlug}</p>
              )}
            </div>
          )}

          {/* Bio */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Profile</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself and your audience..."
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30"
              />
              <p className="text-xs text-neutral-400 text-right">{form.bio.length}/500</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Social Links</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'twitter', label: 'Twitter' },
                  { key: 'youtube', label: 'YouTube' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'linkedin', label: 'LinkedIn' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="text-xs text-neutral-500 mb-1 block">{social.label}</label>
                    <Input
                      value={form.socialLinks[social.key as keyof typeof form.socialLinks]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLinks: { ...form.socialLinks, [social.key]: e.target.value },
                        })
                      }
                      placeholder={social.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="text-white rounded-xl px-8"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
            >
              {updateProfile.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stripe Connect */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#635BFF]" />
              Stripe Connect
            </h3>

            {stripeStatus?.complete ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Connected & Active</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Charges', enabled: stripeStatus.chargesEnabled },
                    { label: 'Payouts', enabled: stripeStatus.payoutsEnabled },
                    { label: 'Details', enabled: stripeStatus.detailsSubmitted },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'rounded-lg p-3 text-center border',
                        item.enabled
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
                      )}
                    >
                      <CheckCircle className={cn('w-4 h-4 mx-auto mb-1.5', item.enabled ? 'text-emerald-500' : 'text-amber-500')} />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                      <p className={cn('text-xs font-medium mt-0.5', item.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                        {item.enabled ? 'Enabled' : 'Pending'}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStripeDashboard}
                  disabled={stripeDashboard.isPending}
                  variant="outline"
                  className="rounded-xl"
                >
                  {stripeDashboard.isPending ? 'Loading...' : (
                    <span className="flex items-center gap-2">
                      Open Stripe Dashboard <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 py-4">
                  {['Create Account', 'Verify Identity', 'Receive Payouts'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        i === 0 ? 'bg-[#1E4DB7] text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700',
                      )}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-neutral-500 hidden sm:block">{step}</span>
                      {i < 2 && <ChevronRight className="w-4 h-4 text-neutral-400" />}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    'Receive commission payouts directly to your bank',
                    'View real-time earnings and analytics',
                    'Automatic payouts on your chosen schedule',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <CheckCircle className="w-4 h-4 text-[#1E4DB7] shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStripeConnect}
                  disabled={createStripeConnect.isPending}
                  className="bg-[#635BFF] hover:bg-[#5851DB] text-white"
                >
                  {createStripeConnect.isPending ? 'Setting up...' : 'Connect with Stripe'}
                </Button>
              </div>
            )}
          </div>

          {/* Payout Preferences */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-5">Payout Preferences</h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                  Payout Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYOUT_SCHEDULES.map((schedule) => (
                    <button
                      key={schedule.value}
                      type="button"
                      onClick={() => setForm({ ...form, payoutSchedule: schedule.value })}
                      className={cn(
                        'rounded-xl p-4 text-left border transition-all',
                        form.payoutSchedule === schedule.value
                          ? 'border-[#1E4DB7] bg-[#1E4DB7]/5 ring-1 ring-[#1E4DB7]/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">{schedule.label}</span>
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          form.payoutSchedule === schedule.value ? 'border-[#1E4DB7]' : 'border-neutral-300 dark:border-neutral-600',
                        )}>
                          {form.payoutSchedule === schedule.value && (
                            <div className="w-2 h-2 rounded-full bg-[#1E4DB7]" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">{schedule.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Minimum Payout Amount
                </label>
                <div className="relative w-full max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    value={form.payoutThreshold}
                    onChange={(e) => setForm({ ...form, payoutThreshold: Number(e.target.value) })}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Min: $10 / Max: $10,000</p>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="text-white rounded-xl px-8"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
              >
                {updateProfile.isPending ? 'Saving...' : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Commission Info */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Commission Rate</h3>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Your Commission</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{profile?.commissionRate ?? 10}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Tier</p>
                <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                  {(profile?.tier ?? 'standard').charAt(0).toUpperCase() + (profile?.tier ?? 'standard').slice(1)}
                </p>
              </div>
            </div>
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY}, #F59A23)`,
                  width: `${profile?.commissionRate ?? 10}%`,
                  maxWidth: '100%',
                }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Increase your commission rate by driving more sales. See the tier breakdown on the dashboard.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
