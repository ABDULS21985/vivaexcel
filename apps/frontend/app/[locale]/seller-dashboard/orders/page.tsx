'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Download,
  Clock,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@ktblog/ui/components';
import { Button } from '@ktblog/ui/components';
import { Badge } from '@ktblog/ui/components';
import { Skeleton } from '@ktblog/ui/components';
import { Input } from '@ktblog/ui/components';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  productTitle: string;
  productType: string;
  productSlug: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: 'completed' | 'pending' | 'processing' | 'refunded' | 'failed';
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const now = new Date();

function daysAgo(days: number, hours = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

const MOCK_ORDERS: SellerOrder[] = [
  {
    id: 'ord_001',
    orderNumber: 'ORD-2025-1847',
    customerName: 'Alice Nakamura',
    customerEmail: 'alice.n@example.com',
    productTitle: 'Financial Dashboard Template',
    productType: 'Excel Template',
    productSlug: 'financial-dashboard-template',
    grossAmount: 49.99,
    platformFee: 10.0,
    netAmount: 39.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(0, 2),
  },
  {
    id: 'ord_002',
    orderNumber: 'ORD-2025-1846',
    customerName: 'Marcus Chen',
    customerEmail: 'marcus.chen@gmail.com',
    productTitle: 'Project Tracker Pro',
    productType: 'Google Sheets',
    productSlug: 'project-tracker-pro',
    grossAmount: 29.99,
    platformFee: 6.0,
    netAmount: 23.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(0, 5),
  },
  {
    id: 'ord_003',
    orderNumber: 'ORD-2025-1845',
    customerName: 'Sofia Rodriguez',
    customerEmail: 'sofia.r@outlook.com',
    productTitle: 'Budget Planner Bundle',
    productType: 'Excel Template',
    productSlug: 'budget-planner-bundle',
    grossAmount: 39.99,
    platformFee: 8.0,
    netAmount: 31.99,
    currency: 'USD',
    status: 'pending',
    createdAt: daysAgo(0, 8),
  },
  {
    id: 'ord_004',
    orderNumber: 'ORD-2025-1840',
    customerName: 'James Okonkwo',
    customerEmail: 'james.ok@company.co',
    productTitle: 'Sales Pipeline Dashboard',
    productType: 'Notion Template',
    productSlug: 'sales-pipeline-dashboard',
    grossAmount: 24.99,
    platformFee: 5.0,
    netAmount: 19.99,
    currency: 'USD',
    status: 'processing',
    createdAt: daysAgo(1, 3),
  },
  {
    id: 'ord_005',
    orderNumber: 'ORD-2025-1835',
    customerName: 'Emma Johansson',
    customerEmail: 'emma.j@mail.se',
    productTitle: 'Financial Dashboard Template',
    productType: 'Excel Template',
    productSlug: 'financial-dashboard-template',
    grossAmount: 49.99,
    platformFee: 10.0,
    netAmount: 39.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(2, 1),
  },
  {
    id: 'ord_006',
    orderNumber: 'ORD-2025-1830',
    customerName: 'Raj Patel',
    customerEmail: 'raj.patel@techfirm.in',
    productTitle: 'Inventory Management System',
    productType: 'Excel Template',
    productSlug: 'inventory-management-system',
    grossAmount: 59.99,
    platformFee: 12.0,
    netAmount: 47.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(3, 6),
  },
  {
    id: 'ord_007',
    orderNumber: 'ORD-2025-1825',
    customerName: 'Olivia Thompson',
    customerEmail: 'olivia.t@startup.io',
    productTitle: 'Project Tracker Pro',
    productType: 'Google Sheets',
    productSlug: 'project-tracker-pro',
    grossAmount: 29.99,
    platformFee: 6.0,
    netAmount: 23.99,
    currency: 'USD',
    status: 'refunded',
    createdAt: daysAgo(5, 4),
  },
  {
    id: 'ord_008',
    orderNumber: 'ORD-2025-1820',
    customerName: 'Liam O\'Brien',
    customerEmail: 'liam.ob@email.ie',
    productTitle: 'Budget Planner Bundle',
    productType: 'Excel Template',
    productSlug: 'budget-planner-bundle',
    grossAmount: 39.99,
    platformFee: 8.0,
    netAmount: 31.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(7, 2),
  },
  {
    id: 'ord_009',
    orderNumber: 'ORD-2025-1815',
    customerName: 'Yuki Tanaka',
    customerEmail: 'yuki.t@webmail.jp',
    productTitle: 'Sales Pipeline Dashboard',
    productType: 'Notion Template',
    productSlug: 'sales-pipeline-dashboard',
    grossAmount: 24.99,
    platformFee: 5.0,
    netAmount: 19.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(10, 5),
  },
  {
    id: 'ord_010',
    orderNumber: 'ORD-2025-1810',
    customerName: 'Carlos Mendez',
    customerEmail: 'carlos.m@empresa.mx',
    productTitle: 'Inventory Management System',
    productType: 'Excel Template',
    productSlug: 'inventory-management-system',
    grossAmount: 59.99,
    platformFee: 12.0,
    netAmount: 47.99,
    currency: 'USD',
    status: 'failed',
    createdAt: daysAgo(14, 7),
  },
  {
    id: 'ord_011',
    orderNumber: 'ORD-2025-1805',
    customerName: 'Fatima Al-Rashid',
    customerEmail: 'fatima.ar@domain.ae',
    productTitle: 'Financial Dashboard Template',
    productType: 'Excel Template',
    productSlug: 'financial-dashboard-template',
    grossAmount: 49.99,
    platformFee: 10.0,
    netAmount: 39.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(20, 3),
  },
  {
    id: 'ord_012',
    orderNumber: 'ORD-2025-1800',
    customerName: 'Hannah Müller',
    customerEmail: 'hannah.m@unternehmen.de',
    productTitle: 'Project Tracker Pro',
    productType: 'Google Sheets',
    productSlug: 'project-tracker-pro',
    grossAmount: 29.99,
    platformFee: 6.0,
    netAmount: 23.99,
    currency: 'USD',
    status: 'completed',
    createdAt: daysAgo(25, 1),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type StatusType = SellerOrder['status'];
type DateRange = 'today' | '7days' | '30days' | 'all';

const STATUS_OPTIONS: { label: string; value: StatusType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Refunded', value: 'refunded' },
];

const DATE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7days' },
  { label: '30 days', value: '30days' },
  { label: 'All time', value: 'all' },
];

const statusConfig: Record<StatusType, { color: string; icon: React.ElementType }> = {
  completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle },
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: Loader2 },
  refunded: { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icon: AlertCircle },
  failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icon: AlertCircle },
};

const productTypeColor: Record<string, string> = {
  'Excel Template': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'Google Sheets': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  'Notion Template': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function relativeTime(iso: string): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isWithinRange(iso: string, range: DateRange): boolean {
  if (range === 'all') return true;
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  const dayMs = 86400000;
  if (range === 'today') return diff < dayMs;
  if (range === '7days') return diff < 7 * dayMs;
  return diff < 30 * dayMs;
}

const ITEMS_PER_PAGE = 6;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OrderStatusTimeline({ status }: { status: StatusType }) {
  const steps = [
    { label: 'Order Placed', done: true },
    { label: 'Payment Confirmed', done: status !== 'pending' && status !== 'failed' },
    { label: 'Delivered', done: status === 'completed' },
  ];

  const currentIdx = status === 'refunded' ? -1 : steps.findIndex((s) => !s.done);

  return (
    <div className="flex items-center gap-1 py-3">
      {steps.map((step, i) => {
        const isActive = i === currentIdx;
        const isDone = step.done;
        return (
          <div key={step.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2 transition-colors',
                  isDone && 'bg-emerald-500 border-emerald-500',
                  isActive && 'bg-amber-400 border-amber-400 animate-pulse',
                  !isDone && !isActive && 'bg-neutral-300 dark:bg-neutral-600 border-neutral-300 dark:border-neutral-600',
                )}
              />
              <span className="text-[10px] mt-1 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mb-4',
                  isDone ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60 p-4"
        >
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
        <ShoppingCart className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        No orders yet
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
        When customers purchase your products, orders will appear here.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SellerOrdersPage() {
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateRange>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Unique product titles for the filter dropdown
  const productTitles = useMemo(
    () => Array.from(new Set(MOCK_ORDERS.map((o) => o.productTitle))),
    [],
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = [...MOCK_ORDERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.productTitle.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      list = list.filter((o) => isWithinRange(o.createdAt, dateFilter));
    }

    if (productFilter !== 'all') {
      list = list.filter((o) => o.productTitle === productFilter);
    }

    return list;
  }, [searchQuery, statusFilter, dateFilter, productFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [searchQuery, statusFilter, dateFilter, productFilter]);

  // Summary stats
  const todayOrders = MOCK_ORDERS.filter((o) => isWithinRange(o.createdAt, 'today'));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.netAmount, 0);
  const weekOrders = MOCK_ORDERS.filter((o) => isWithinRange(o.createdAt, '7days'));
  const pendingOrders = MOCK_ORDERS.filter((o) => o.status === 'pending');
  const refundedCount = MOCK_ORDERS.filter((o) => o.status === 'refunded').length;
  const refundRate = MOCK_ORDERS.length ? ((refundedCount / MOCK_ORDERS.length) * 100).toFixed(1) : '0';

  const summaryCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      label: "This Week's Sales",
      value: String(weekOrders.length),
      icon: ShoppingCart,
      trend: '+8.3%',
      trendUp: true,
      color: 'text-[#1E4DB7] dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      label: 'Pending Orders',
      value: String(pendingOrders.length),
      icon: Clock,
      trend: '-2',
      trendUp: false,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/40',
    },
    {
      label: 'Refund Rate',
      value: `${refundRate}%`,
      icon: AlertCircle,
      trend: '-0.4%',
      trendUp: true,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/40',
    },
  ];

  // Export CSV
  function handleExportCSV() {
    const header = [
      'Order #',
      'Customer',
      'Email',
      'Product',
      'Type',
      'Gross',
      'Fee',
      'Net',
      'Currency',
      'Status',
      'Date',
    ].join(',');

    const rows = filteredOrders.map((o) =>
      [
        o.orderNumber,
        `"${o.customerName}"`,
        o.customerEmail,
        `"${o.productTitle}"`,
        o.productType,
        o.grossAmount.toFixed(2),
        o.platformFee.toFixed(2),
        o.netAmount.toFixed(2),
        o.currency,
        o.status,
        new Date(o.createdAt).toISOString(),
      ].join(','),
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Pagination helpers
  function pageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-neutral-900 dark:text-white"
          >
            Sales &amp; Orders
          </motion.h1>
          <Badge className="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-blue-300 border-0">
            {MOCK_ORDERS.length} total
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            {todayOrders.length} orders today &bull; {formatCurrency(todayRevenue)} revenue
          </span>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60 py-3 px-4"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', card.bg)}>
                <Icon className={cn('w-4.5 h-4.5', card.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{card.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                    {card.value}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      card.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
                    )}
                  >
                    {card.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        {/* Search + product dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search by order #, customer, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/60 dark:border-neutral-700/60"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-md border border-neutral-200/60 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl text-sm text-neutral-700 dark:text-neutral-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30"
            >
              <option value="all">All Products</option>
              {productTitles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status + Date filter chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  statusFilter === opt.value
                    ? 'bg-[#1E4DB7] text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          <div className="flex flex-wrap items-center gap-1.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  dateFilter === opt.value
                    ? 'bg-[#143A8F] text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Orders table / content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_140px_100px_100px_40px] gap-4 px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            <span>Customer</span>
            <span>Product</span>
            <span>Revenue</span>
            <span>Status</span>
            <span>Date</span>
            <span />
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {paginatedOrders.map((order, idx) => {
                const isExpanded = expandedRow === order.id;
                const stCfg = statusConfig[order.status];
                const StatusIcon = stCfg.icon;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    {/* Main row */}
                    <div
                      onClick={() => setExpandedRow(isExpanded ? null : order.id)}
                      className={cn(
                        'grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_100px_100px_40px] gap-3 md:gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-colors',
                        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                        isExpanded && 'rounded-b-none border-b-0',
                      )}
                    >
                      {/* Customer */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[#1E4DB7] dark:text-blue-300">
                            {initials(order.customerName)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {order.customerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Product */}
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                          {order.productTitle}
                        </p>
                        <span
                          className={cn(
                            'inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium',
                            productTypeColor[order.productType] ?? 'bg-neutral-100 text-neutral-600',
                          )}
                        >
                          {order.productType}
                        </span>
                      </div>

                      {/* Revenue */}
                      <div className="text-right md:text-left">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(order.netAmount)}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {formatCurrency(order.grossAmount)} - {formatCurrency(order.platformFee)} fee
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                            stCfg.color,
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {relativeTime(order.createdAt)}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRow(isExpanded ? null : order.id);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#1E4DB7] hover:bg-[#1E4DB7]/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-t-0 border-neutral-200/60 dark:border-neutral-700/60 rounded-b-xl px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Order details */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" /> Order Details
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Order #</span>
                                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{order.orderNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Product</span>
                                    <Link
                                      href={`/marketplace/${order.productSlug}`}
                                      className="font-medium text-[#1E4DB7] hover:underline"
                                    >
                                      {order.productTitle}
                                    </Link>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Gross Amount</span>
                                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{formatCurrency(order.grossAmount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Platform Fee</span>
                                    <span className="font-medium text-red-500">{formatCurrency(order.platformFee)}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-1.5">
                                    <span className="text-neutral-500 dark:text-neutral-400">Net Earnings</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(order.netAmount)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Customer info */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" /> Customer Info
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Name</span>
                                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{order.customerName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Email</span>
                                    <span className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">{order.customerEmail}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Download Token</span>
                                    <span className="font-mono text-xs text-neutral-600 dark:text-neutral-300">
                                      {order.id.replace('ord_', 'tk_')}_dl
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Status timeline */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                                  <Package className="w-3.5 h-3.5" /> Delivery Timeline
                                </h4>
                                <OrderStatusTimeline status={order.status} />
                                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Ordered on {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing{' '}
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              -
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {filteredOrders.length}
              </span>{' '}
              orders
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>

              {pageNumbers().map((pg, i) =>
                pg === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-1.5 text-neutral-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      pg === currentPage
                        ? 'bg-[#1E4DB7] text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    {pg}
                  </button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
