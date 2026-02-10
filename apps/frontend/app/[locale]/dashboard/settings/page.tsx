"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Monitor,
  Moon,
  Sun,
  Loader2,
  Save,
  Smartphone,
  Laptop,
  LogOut,
  Lock,
  AlertTriangle,
  Check,
  X,
  QrCode,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";
import { apiPost, apiClient } from "@/lib/api-client";
import {
  useSettings,
  useUpdateNotifications,
  useUpdatePrivacy,
  useUpdatePreferences,
  useSessions,
  useLogoutAllSessions,
  type SessionData,
} from "@/hooks/use-settings";
import { toast } from "sonner";

// =============================================================================
// Settings Page
// =============================================================================
// Full account settings: appearance, notifications, privacy, sessions,
// two-factor authentication, and language/timezone preferences.

// =============================================================================
// Toggle Switch Component
// =============================================================================

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// =============================================================================
// Section Card Component
// =============================================================================

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  danger,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`bg-[var(--card)] border rounded-xl p-6 md:p-8 ${
        danger
          ? "border-red-200 dark:border-red-900/50"
          : "border-[var(--border)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className={`h-5 w-5 ${
            danger ? "text-[var(--error)]" : "text-[var(--muted-foreground)]"
          }`}
        />
        <h2
          className={`text-lg font-semibold ${
            danger ? "text-[var(--error)]" : "text-[var(--foreground)]"
          }`}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mb-6 ml-7">
          {description}
        </p>
      )}
      {!description && <div className="mb-6" />}
      {children}
    </div>
  );
}

// =============================================================================
// Appearance Section
// =============================================================================

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    {
      key: "light",
      label: "Light",
      icon: Sun,
      desc: "Classic light interface",
    },
    { key: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    {
      key: "system",
      label: "System",
      icon: Monitor,
      desc: "Follows your device",
    },
  ];

  return (
    <SectionCard
      icon={Sun}
      title="Appearance"
      description="Choose how the app looks for you."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map(({ key, label, icon: ThemeIcon, desc }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--surface-1)]"
              }`}
            >
              {active && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-[var(--primary)]" />
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active
                    ? "bg-[var(--primary)]/10"
                    : "bg-[var(--surface-2)]"
                }`}
              >
                <ThemeIcon
                  className={`h-5 w-5 ${
                    active
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {label}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {desc}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

// =============================================================================
// Notification Preferences Section
// =============================================================================

function NotificationsSection() {
  const { data: settings, isLoading } = useSettings();
  const updateNotifications = useUpdateNotifications();

  const notificationItems = [
    {
      key: "emailProductUpdates" as const,
      label: "Product updates",
      desc: "New features and improvements",
    },
    {
      key: "emailWeeklyDigest" as const,
      label: "Weekly digest",
      desc: "Summary of activity and top content",
    },
    {
      key: "emailCommentsReplies" as const,
      label: "Comments & replies",
      desc: "When someone replies to your comments",
    },
    {
      key: "emailMentions" as const,
      label: "Mentions",
      desc: "When someone mentions you",
    },
    {
      key: "emailNewsletter" as const,
      label: "Newsletter",
      desc: "Blog posts and curated content",
    },
    {
      key: "emailMarketing" as const,
      label: "Promotions & offers",
      desc: "Special deals and discounts",
    },
  ];

  function handleToggle(key: string, value: boolean) {
    updateNotifications.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Notification preference updated"),
        onError: () => toast.error("Failed to update preference"),
      }
    );
  }

  if (isLoading) {
    return (
      <SectionCard icon={Bell} title="Notifications">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Bell}
      title="Notifications"
      description="Manage how and when you receive email notifications."
    >
      <div className="space-y-1">
        {notificationItems.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 px-1"
          >
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {label}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
            </div>
            <Toggle
              checked={settings?.[key] ?? true}
              onChange={(val) => handleToggle(key, val)}
              disabled={updateNotifications.isPending}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// =============================================================================
// Privacy Settings Section
// =============================================================================

function PrivacySection() {
  const { data: settings, isLoading } = useSettings();
  const updatePrivacy = useUpdatePrivacy();

  function handleToggle(key: string, value: boolean) {
    updatePrivacy.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Privacy setting updated"),
        onError: () => toast.error("Failed to update setting"),
      }
    );
  }

  function handleVisibilityChange(visibility: string) {
    updatePrivacy.mutate(
      { profileVisibility: visibility },
      {
        onSuccess: () => toast.success("Profile visibility updated"),
        onError: () => toast.error("Failed to update visibility"),
      }
    );
  }

  if (isLoading) {
    return (
      <SectionCard icon={Shield} title="Privacy">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Shield}
      title="Privacy"
      description="Control your profile visibility and data preferences."
    >
      {/* Profile visibility */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Profile visibility
        </label>
        <div className="flex gap-3">
          {[
            { key: "public", label: "Public", icon: Eye, desc: "Anyone can view" },
            {
              key: "private",
              label: "Private",
              icon: EyeOff,
              desc: "Only you",
            },
          ].map(({ key, label, icon: VisIcon, desc }) => {
            const active = settings?.profileVisibility === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleVisibilityChange(key)}
                disabled={updatePrivacy.isPending}
                className={`flex items-center gap-3 flex-1 p-3 rounded-lg border-2 transition-all ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--primary)]/30"
                } disabled:opacity-50`}
              >
                <VisIcon
                  className={`h-4 w-4 ${
                    active
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                />
                <div className="text-left">
                  <p
                    className={`text-sm font-medium ${
                      active
                        ? "text-[var(--primary)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy toggles */}
      <div className="space-y-1">
        {[
          {
            key: "showReadingHistory",
            label: "Show reading history",
            desc: "Let others see what you've read",
          },
          {
            key: "showBookmarks",
            label: "Show bookmarks",
            desc: "Make your bookmarks visible to others",
          },
          {
            key: "allowAnalytics",
            label: "Usage analytics",
            desc: "Help us improve with anonymous usage data",
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 px-1"
          >
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {label}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
            </div>
            <Toggle
              checked={
                settings?.[key as keyof typeof settings] as boolean ?? false
              }
              onChange={(val) => handleToggle(key, val)}
              disabled={updatePrivacy.isPending}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// =============================================================================
// Two-Factor Authentication Section
// =============================================================================

function TwoFactorSection() {
  const { user, refreshUser } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [error, setError] = useState("");

  async function handleSetup() {
    setError("");
    setIsSettingUp(true);
    try {
      const response = await apiPost<{
        secret: string;
        qrCode: string;
        recoveryCodes: string[];
      }>("/auth/2fa/setup");
      setSetupData(response);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to setup 2FA";
      toast.error(msg);
      setIsSettingUp(false);
    }
  }

  async function handleVerify() {
    if (!verifyToken || verifyToken.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      await apiPost("/auth/2fa/verify", { token: verifyToken });
      toast.success("Two-factor authentication enabled!");
      setShowRecoveryCodes(true);
      await refreshUser();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid verification code";
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleDisable() {
    if (!disablePassword) {
      setError("Password is required to disable 2FA");
      return;
    }
    setError("");
    setIsDisabling(true);
    try {
      await apiPost("/auth/2fa/disable", { password: disablePassword });
      toast.success("Two-factor authentication disabled");
      setDisablePassword("");
      setIsDisabling(false);
      await refreshUser();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to disable 2FA";
      setError(msg);
      setIsDisabling(false);
    }
  }

  function handleCancel() {
    setSetupData(null);
    setVerifyToken("");
    setError("");
    setIsSettingUp(false);
    setShowRecoveryCodes(false);
  }

  function copyRecoveryCodes() {
    if (!setupData?.recoveryCodes) return;
    navigator.clipboard.writeText(setupData.recoveryCodes.join("\n"));
    toast.success("Recovery codes copied to clipboard");
  }

  const is2FAEnabled = user?.twoFactorEnabled;

  return (
    <SectionCard
      icon={Lock}
      title="Two-Factor Authentication"
      description="Add an extra layer of security to your account."
    >
      {/* 2FA enabled state */}
      {is2FAEnabled && !isDisabling && (
        <div>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              Two-factor authentication is enabled
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDisabling(true)}
            className="text-sm text-[var(--error)] hover:underline"
          >
            Disable two-factor authentication
          </button>
        </div>
      )}

      {/* Disable 2FA form */}
      {is2FAEnabled && isDisabling && (
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Enter your password to disable two-factor authentication.
          </p>
          {error && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--error-light)] dark:bg-red-900/20 border border-[var(--error)]/20 text-[var(--error-dark)] dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <input
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors mb-3"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDisable}
              disabled={!disablePassword}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisabling && disablePassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Disable 2FA
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDisabling(false);
                setDisablePassword("");
                setError("");
              }}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2FA not enabled - show setup button */}
      {!is2FAEnabled && !setupData && (
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Protect your account by requiring a verification code from your
            authenticator app in addition to your password.
          </p>
          <button
            type="button"
            onClick={handleSetup}
            disabled={isSettingUp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed btn-press"
          >
            {isSettingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4" />
            )}
            Enable 2FA
          </button>
        </div>
      )}

      {/* 2FA setup flow */}
      {!is2FAEnabled && setupData && !showRecoveryCodes && (
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Scan the QR code with your authenticator app (Google Authenticator,
            Authy, etc.), then enter the 6-digit code below.
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-xl border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Manual entry secret */}
          <div className="mb-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Or enter this secret manually:
            </p>
            <div className="flex items-center gap-2">
              <code className="px-3 py-1.5 rounded bg-[var(--surface-1)] text-xs text-[var(--foreground)] font-mono select-all">
                {setupData.secret}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(setupData.secret);
                  toast.success("Secret copied");
                }}
                className="p-1.5 rounded hover:bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Verification code input */}
          {error && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--error-light)] dark:bg-red-900/20 border border-[var(--error)]/20 text-[var(--error-dark)] dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) =>
                  setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="w-36 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || verifyToken.length < 6}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed btn-press"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Verify
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recovery codes */}
      {showRecoveryCodes && setupData?.recoveryCodes && (
        <div>
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Save your recovery codes
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  These codes can be used to access your account if you lose your
                  authenticator device. Each code can only be used once. Store
                  them in a safe place.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-[var(--surface-1)] rounded-lg font-mono text-sm">
            {setupData.recoveryCodes.map((code) => (
              <div
                key={code}
                className="px-2 py-1 text-[var(--foreground)] select-all"
              >
                {code}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={copyRecoveryCodes}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy codes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity btn-press"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// =============================================================================
// Active Sessions Section
// =============================================================================

function SessionsSection() {
  const { data: sessions, isLoading } = useSessions();
  const logoutAll = useLogoutAllSessions();
  const [showAll, setShowAll] = useState(false);

  function parseUserAgent(ua: string): {
    device: string;
    browser: string;
    icon: React.ElementType;
  } {
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const icon = isMobile ? Smartphone : Laptop;

    let browser = "Unknown browser";
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
    else if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";

    let device = "Unknown device";
    if (/windows/i.test(ua)) device = "Windows";
    else if (/macintosh|mac os/i.test(ua)) device = "macOS";
    else if (/linux/i.test(ua) && !isMobile) device = "Linux";
    else if (/android/i.test(ua)) device = "Android";
    else if (/iphone|ipad/i.test(ua)) device = "iOS";

    return { device, browser: `${browser} on ${device}`, icon };
  }

  function formatTimestamp(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function handleLogoutAll() {
    logoutAll.mutate(undefined, {
      onSuccess: () => toast.success("Logged out from all other devices"),
      onError: () => toast.error("Failed to logout from other devices"),
    });
  }

  if (isLoading) {
    return (
      <SectionCard icon={Smartphone} title="Active Sessions">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </SectionCard>
    );
  }

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return b.lastAccessedAt - a.lastAccessedAt;
  });

  const displaySessions = showAll
    ? sortedSessions
    : sortedSessions.slice(0, 3);
  const hasMore = sortedSessions.length > 3;

  return (
    <SectionCard
      icon={Smartphone}
      title="Active Sessions"
      description="Devices where you're currently logged in."
    >
      {sortedSessions.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          No active sessions found.
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {displaySessions.map((session, idx) => {
              const { browser, icon: DeviceIcon } = parseUserAgent(
                session.userAgent
              );
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    session.isCurrent
                      ? "border-[var(--primary)]/30 bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--surface-1)]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      session.isCurrent
                        ? "bg-[var(--primary)]/10"
                        : "bg-[var(--surface-2)]"
                    }`}
                  >
                    <DeviceIcon
                      className={`h-4 w-4 ${
                        session.isCurrent
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {browser}
                      </p>
                      {session.isCurrent && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {session.ipAddress} &middot; Last active{" "}
                      {formatTimestamp(session.lastAccessedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mb-4"
            >
              {showAll ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show all {sortedSessions.length} sessions{" "}
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}

          {sortedSessions.length > 1 && (
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={logoutAll.isPending}
              className="inline-flex items-center gap-2 text-sm text-[var(--error)] hover:underline disabled:opacity-50"
            >
              {logoutAll.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              Log out of all other sessions
            </button>
          )}
        </>
      )}
    </SectionCard>
  );
}

// =============================================================================
// Language & Timezone Section
// =============================================================================

function PreferencesSection() {
  const { data: settings, isLoading } = useSettings();
  const updatePreferences = useUpdatePreferences();

  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLanguage(settings.language || "en");
      setTimezone(
        settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    }
  }, [settings]);

  function handleSave() {
    updatePreferences.mutate(
      { language, timezone },
      {
        onSuccess: () => {
          toast.success("Preferences updated");
          setHasChanges(false);
        },
        onError: () => toast.error("Failed to update preferences"),
      }
    );
  }

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية (Arabic)" },
    { value: "fr", label: "Français (French)" },
    { value: "es", label: "Español (Spanish)" },
    { value: "pt", label: "Português (Portuguese)" },
  ];

  const commonTimezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  if (isLoading) {
    return (
      <SectionCard icon={Globe} title="Preferences">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Globe}
      title="Preferences"
      description="Set your language and timezone."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setHasChanges(true);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors appearance-none"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setHasChanges(true);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors appearance-none"
          >
            {commonTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasChanges && (
        <button
          type="button"
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed btn-press"
        >
          {updatePreferences.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </button>
      )}
    </SectionCard>
  );
}

// =============================================================================
// Account Info Section
// =============================================================================

function AccountInfoSection() {
  const { user } = useAuth();

  if (!user) return null;

  const infoItems = [
    { label: "Email", value: user.email },
    { label: "Account ID", value: user.id.slice(0, 8) + "..." },
    {
      label: "Plan",
      value: (
        <span className="inline-flex items-center gap-1">
          <span className="capitalize">{user.plan}</span>
          {user.plan !== "free" && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
              Active
            </span>
          )}
        </span>
      ),
    },
    {
      label: "Member since",
      value: new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    {
      label: "Email verified",
      value: user.emailVerified ? (
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
          <Check className="h-3.5 w-3.5" /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" /> Not verified
        </span>
      ),
    },
  ];

  return (
    <SectionCard
      icon={Shield}
      title="Account"
      description="Your account information at a glance."
    >
      <div className="space-y-3">
        {infoItems.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 px-1"
          >
            <span className="text-sm text-[var(--muted-foreground)]">
              {label}
            </span>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// =============================================================================
// Main Settings Page
// =============================================================================

function SettingsContent() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-8">
        Settings
      </h1>

      <div className="space-y-6">
        <AccountInfoSection />
        <AppearanceSection />
        <NotificationsSection />
        <PrivacySection />
        <TwoFactorSection />
        <SessionsSection />
        <PreferencesSection />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
