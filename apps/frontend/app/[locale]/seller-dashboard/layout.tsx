'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  LogOut,
  Store,
  Menu,
  X,
  Home,
  TrendingUp,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button, Badge } from '@ktblog/ui/components';
import { useMySellerProfile } from '@/hooks/use-sellers';
import { useAuth } from '@/providers/auth-provider';

// ─── Navigation Data ────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/seller-dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'PRODUCTS',
    items: [
      { label: 'Products', href: '/seller-dashboard/products', icon: Package },
      { label: 'Orders', href: '/seller-dashboard/orders', icon: ShoppingCart },
    ],
  },
  {
    title: 'SALES',
    items: [
      { label: 'Earnings', href: '/seller-dashboard/earnings', icon: DollarSign },
      { label: 'Analytics', href: '/seller-dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Settings', href: '/seller-dashboard/settings', icon: Settings },
    ],
  },
];

const mobileTabItems: NavItem[] = [
  { label: 'Dashboard', href: '/seller-dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/seller-dashboard/products', icon: Package },
  { label: 'Orders', href: '/seller-dashboard/orders', icon: ShoppingCart },
  { label: 'Earnings', href: '/seller-dashboard/earnings', icon: DollarSign },
  { label: 'Settings', href: '/seller-dashboard/settings', icon: Settings },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const dashIdx = segments.indexOf('seller-dashboard');
  if (dashIdx === -1) return 'Dashboard';
  const sub = segments[dashIdx + 1];
  if (!sub) return 'Dashboard';
  return sub.charAt(0).toUpperCase() + sub.slice(1);
}

// ─── Verification Badge Component ───────────────────────────────────────────

function VerificationIndicator({
  status,
  collapsed,
}: {
  status?: 'unverified' | 'identity_verified' | 'business_verified';
  collapsed: boolean;
}) {
  if (status === 'business_verified') {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0"
        title="Business Verified"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === 'identity_verified') {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"
        title="Identity Verified"
      />
    );
  }
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full bg-neutral-400 flex-shrink-0"
      title="Unverified"
    />
  );
}

// ─── Main Layout ────────────────────────────────────────────────────────────

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { data: seller } = useMySellerProfile();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/seller-dashboard') {
        return pathname === '/seller-dashboard' || pathname.endsWith('/seller-dashboard');
      }
      return pathname.includes(href);
    },
    [pathname],
  );

  const displayName = seller?.displayName ?? user?.firstName ?? 'Seller';
  const avatarUrl = seller?.avatar ?? user?.avatar;
  const initials = getInitials(displayName);
  const breadcrumb = getBreadcrumb(pathname);

  // Don't render until client-side mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1E4DB7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Sidebar Nav Item ──────────────────────────────────────────────────────

  function SidebarNavItem({ item }: { item: NavItem }) {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link href={item.href} className="block relative group">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
            active
              ? 'bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          )}
        >
          {/* Active left border gradient */}
          {active && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #1E4DB7, #F59A23)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}

          <Icon
            className={cn(
              'w-5 h-5 flex-shrink-0',
              active
                ? 'text-[#1E4DB7] dark:text-blue-400'
                : 'text-neutral-500 dark:text-neutral-500',
            )}
          />

          {!collapsed && (
            <span className="text-sm font-medium truncate">{item.label}</span>
          )}
        </div>

        {/* Tooltip when collapsed */}
        {collapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
            {item.label}
          </div>
        )}
      </Link>
    );
  }

  // ── Desktop Sidebar ───────────────────────────────────────────────────────

  function DesktopSidebar() {
    return (
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-40 border-r border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl overflow-hidden"
      >
        {/* Profile mini-card */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-neutral-100 dark:border-neutral-800 min-h-[72px]">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-sm font-bold ring-2 ring-neutral-100 dark:ring-neutral-700">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5">
              <VerificationIndicator
                status={seller?.verificationStatus}
                collapsed={collapsed}
              />
            </div>
          </div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-w-0 flex-1"
            >
              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {displayName}
              </p>
              {seller?.status && (
                <Badge
                  variant={seller.status === 'approved' ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 h-4 mt-0.5"
                >
                  {seller.status === 'approved'
                    ? 'Active'
                    : seller.status.replace('_', ' ')}
                </Badge>
              )}
            </motion.div>
          )}
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-600 uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom area */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-2 py-3 space-y-1">
          {/* Back to Store */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-500 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group relative"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Back to Store</span>
            )}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Back to Store
              </div>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-neutral-500 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group relative"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            </motion.div>
            {!collapsed && (
              <span className="text-sm font-medium">Collapse</span>
            )}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Expand
              </div>
            )}
          </button>
        </div>
      </motion.aside>
    );
  }

  // ── Mobile Overlay Menu ───────────────────────────────────────────────────

  function MobileOverlay() {
    return (
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white dark:bg-neutral-900 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <VerificationIndicator
                        status={seller?.verificationStatus}
                        collapsed={false}
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user?.email ?? 'Seller Account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-600 uppercase">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                              active
                                ? 'bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                            )}
                          >
                            {active && (
                              <div
                                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                                style={{
                                  background: 'linear-gradient(to bottom, #1E4DB7, #F59A23)',
                                }}
                              />
                            )}
                            <Icon
                              className={cn(
                                'w-5 h-5 flex-shrink-0',
                                active
                                  ? 'text-[#1E4DB7] dark:text-blue-400'
                                  : 'text-neutral-500',
                              )}
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 px-3 py-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-sm font-medium">Back to Store</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Top Bar ───────────────────────────────────────────────────────────────

  function TopBar() {
    return (
      <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-neutral-400 dark:text-neutral-600 hidden sm:inline">
              Seller Dashboard
            </span>
            {breadcrumb !== 'Dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 hidden sm:inline" />
                <span className="font-medium text-neutral-900 dark:text-white">
                  {breadcrumb}
                </span>
              </>
            )}
            {breadcrumb === 'Dashboard' && (
              <span className="font-medium text-neutral-900 dark:text-white sm:hidden">
                Dashboard
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:flex items-center">
            <AnimatePresence>
              {searchExpanded && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  onBlur={() => setSearchExpanded(false)}
                  className="absolute right-8 h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30"
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchExpanded((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Search className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
            <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
          </button>

          {/* Profile avatar */}
          <div className="relative ml-1">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700 cursor-pointer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] flex items-center justify-center text-white text-xs font-bold ring-2 ring-neutral-100 dark:ring-neutral-700 cursor-pointer">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── Mobile Bottom Tab Bar ─────────────────────────────────────────────────

  function MobileBottomBar() {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {mobileTabItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2 flex-1"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      active
                        ? 'text-[#1E4DB7] dark:text-blue-400'
                        : 'text-neutral-400 dark:text-neutral-500',
                    )}
                    fill={active ? 'currentColor' : 'none'}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    active
                      ? 'text-[#1E4DB7] dark:text-blue-400'
                      : 'text-neutral-400 dark:text-neutral-500',
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#1E4DB7] dark:bg-blue-400"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // ── Layout Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar />

        {/* Page content with transitions */}
        <main className="flex-1 px-6 py-6 lg:px-8 pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomBar />
    </div>
  );
}
