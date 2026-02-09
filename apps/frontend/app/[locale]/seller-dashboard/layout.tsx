'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/seller-dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/seller-dashboard/products', icon: Package },
  { label: 'Orders', href: '/seller-dashboard/orders', icon: ShoppingCart },
  { label: 'Earnings', href: '/seller-dashboard/earnings', icon: DollarSign },
  { label: 'Analytics', href: '/seller-dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/seller-dashboard/settings', icon: Settings },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/seller-dashboard') return pathname === '/seller-dashboard' || pathname.endsWith('/seller-dashboard');
    return pathname.includes(href);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Top Nav */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/seller-dashboard" className="font-semibold text-zinc-900 dark:text-white">
              Seller Dashboard
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Back to Store
            </Link>
          </div>
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
