'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Archive,
  BarChart3,
  Star,
  Download,
  TrendingUp,
  DollarSign,
  Grid,
  List,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  cn,
  Button,
  Badge,
  Skeleton,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Checkbox,
} from '@ktblog/ui/components';
import { useMySellerProfile } from '@/hooks/use-sellers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SellerProduct {
  id: string;
  title: string;
  slug: string;
  type: 'powerpoint' | 'document' | 'web_template' | 'spreadsheet';
  status: 'published' | 'draft' | 'archived';
  price: number;
  currency: string;
  featuredImage?: string;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'published' | 'draft' | 'archived';
type TypeFilter = 'all' | SellerProduct['type'];
type SortKey = 'newest' | 'revenue' | 'sales' | 'rating';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: SellerProduct[] = [
  {
    id: 'prod-001',
    title: 'Modern Business Pitch Deck Template',
    slug: 'modern-business-pitch-deck',
    type: 'powerpoint',
    status: 'published',
    price: 29.99,
    currency: 'USD',
    featuredImage: '/images/products/pitch-deck.jpg',
    totalSales: 342,
    totalRevenue: 10256.58,
    totalViews: 8920,
    averageRating: 4.8,
    totalReviews: 89,
    createdAt: '2025-08-15T10:30:00Z',
    updatedAt: '2025-12-01T14:20:00Z',
  },
  {
    id: 'prod-002',
    title: 'Financial Report Spreadsheet Bundle',
    slug: 'financial-report-spreadsheet',
    type: 'spreadsheet',
    status: 'published',
    price: 19.99,
    currency: 'USD',
    featuredImage: '/images/products/finance-sheet.jpg',
    totalSales: 218,
    totalRevenue: 4357.82,
    totalViews: 5430,
    averageRating: 4.6,
    totalReviews: 54,
    createdAt: '2025-09-10T08:00:00Z',
    updatedAt: '2025-11-20T09:15:00Z',
  },
  {
    id: 'prod-003',
    title: 'SaaS Landing Page Template Kit',
    slug: 'saas-landing-page-kit',
    type: 'web_template',
    status: 'published',
    price: 49.99,
    currency: 'USD',
    featuredImage: '/images/products/saas-landing.jpg',
    totalSales: 156,
    totalRevenue: 7798.44,
    totalViews: 12340,
    averageRating: 4.9,
    totalReviews: 41,
    createdAt: '2025-07-22T12:00:00Z',
    updatedAt: '2025-12-05T16:45:00Z',
  },
  {
    id: 'prod-004',
    title: 'Professional Resume & CV Pack',
    slug: 'professional-resume-cv-pack',
    type: 'document',
    status: 'draft',
    price: 14.99,
    currency: 'USD',
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0,
    averageRating: 0,
    totalReviews: 0,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2025-12-08T11:30:00Z',
  },
  {
    id: 'prod-005',
    title: 'Startup Investor Presentation',
    slug: 'startup-investor-presentation',
    type: 'powerpoint',
    status: 'published',
    price: 34.99,
    currency: 'USD',
    featuredImage: '/images/products/investor-deck.jpg',
    totalSales: 98,
    totalRevenue: 3429.02,
    totalViews: 3210,
    averageRating: 4.5,
    totalReviews: 22,
    createdAt: '2025-10-05T14:00:00Z',
    updatedAt: '2025-11-28T10:00:00Z',
  },
  {
    id: 'prod-006',
    title: 'E-commerce Dashboard Template',
    slug: 'ecommerce-dashboard-template',
    type: 'web_template',
    status: 'archived',
    price: 39.99,
    currency: 'USD',
    featuredImage: '/images/products/ecommerce-dash.jpg',
    totalSales: 67,
    totalRevenue: 2679.33,
    totalViews: 2100,
    averageRating: 4.2,
    totalReviews: 15,
    createdAt: '2025-05-18T07:30:00Z',
    updatedAt: '2025-09-15T13:00:00Z',
  },
  {
    id: 'prod-007',
    title: 'Project Management Spreadsheet',
    slug: 'project-management-spreadsheet',
    type: 'spreadsheet',
    status: 'draft',
    price: 24.99,
    currency: 'USD',
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0,
    averageRating: 0,
    totalReviews: 0,
    createdAt: '2025-12-03T16:00:00Z',
    updatedAt: '2025-12-07T18:20:00Z',
  },
  {
    id: 'prod-008',
    title: 'Legal Contract Templates Collection',
    slug: 'legal-contract-templates',
    type: 'document',
    status: 'published',
    price: 44.99,
    currency: 'USD',
    featuredImage: '/images/products/legal-docs.jpg',
    totalSales: 189,
    totalRevenue: 8503.11,
    totalViews: 6780,
    averageRating: 4.7,
    totalReviews: 63,
    createdAt: '2025-06-30T10:00:00Z',
    updatedAt: '2025-11-25T08:45:00Z',
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 8;

const TYPE_LABELS: Record<SellerProduct['type'], string> = {
  powerpoint: 'PowerPoint',
  document: 'Document',
  web_template: 'Web Template',
  spreadsheet: 'Spreadsheet',
};

const TYPE_COLORS: Record<SellerProduct['type'], string> = {
  powerpoint: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  web_template: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  spreadsheet: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const STATUS_COLORS: Record<SellerProduct['status'], string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  archived: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatCompact(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700/60 p-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700/60"
        >
          <Skeleton className="h-[200px] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
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
      <svg
        className="w-32 h-32 text-neutral-300 dark:text-neutral-600 mb-6"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="24" y="40" width="80" height="64" rx="8" stroke="currentColor" strokeWidth="4" />
        <path d="M24 56L64 76L104 56" stroke="currentColor" strokeWidth="4" />
        <rect x="44" y="24" width="40" height="20" rx="4" stroke="currentColor" strokeWidth="4" />
        <line x1="64" y1="24" x2="64" y2="16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1="20" x2="48" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="76" y1="20" x2="80" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
        No products yet
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
        Start selling by creating your first product. Showcase your templates and digital assets to
        thousands of buyers.
      </p>
      <Link href="/seller-dashboard/products/create">
        <Button className="bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white gap-2">
          <Plus className="w-4 h-4" />
          Create Product
        </Button>
      </Link>
    </motion.div>
  );
}

function ProductActionsMenu({ product }: { product: SellerProduct }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <MoreVertical className="w-4 h-4 text-neutral-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Edit className="w-4 h-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Copy className="w-4 h-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Archive className="w-4 h-4" />
          {product.status === 'archived' ? 'Unarchive' : 'Archive'}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
          <Archive className="w-4 h-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductCard({
  product,
  index,
  isSelected,
  onToggleSelect,
}: {
  product: SellerProduct;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        'group relative rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200 dark:border-neutral-700/60',
        'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
        isSelected && 'ring-2 ring-[#1E4DB7]'
      )}
    >
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(product.id)}
          className="bg-white/90 dark:bg-neutral-800/90 border-neutral-300 dark:border-neutral-600"
        />
      </div>

      {/* Image area */}
      <div className="relative h-[200px] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {product.featuredImage ? (
          <div
            className="w-full h-full bg-gradient-to-br from-[#1E4DB7]/10 to-[#F59A23]/10 flex items-center justify-center"
          >
            <Package className="w-12 h-12 text-[#1E4DB7]/40 dark:text-[#1E4DB7]/30" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
            <Package className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}

        {/* Status overlay (top-left) */}
        <span
          className={cn(
            'absolute top-3 left-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize',
            STATUS_COLORS[product.status]
          )}
        >
          {product.status}
        </span>

        {/* Type badge (top-right) */}
        <span
          className={cn(
            'absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
            TYPE_COLORS[product.type]
          )}
        >
          {TYPE_LABELS[product.type]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-snug truncate">
            {product.title}
          </h3>
          <ProductActionsMenu product={product} />
        </div>

        <p className="text-[#1E4DB7] dark:text-[#6B9AFF] font-bold text-base mb-3">
          {formatCurrency(product.price, product.currency)}
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1" title="Views">
            <Eye className="w-3 h-3" />
            <span>{formatCompact(product.totalViews)}</span>
          </div>
          <div className="flex items-center gap-1" title="Sales">
            <Download className="w-3 h-3" />
            <span>{formatCompact(product.totalSales)}</span>
          </div>
          <div className="flex items-center gap-1" title="Rating">
            <Star className="w-3 h-3 text-[#F59A23]" />
            <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : '-'}</span>
          </div>
          <div className="flex items-center gap-1" title="Revenue">
            <DollarSign className="w-3 h-3" />
            <span>{formatCompact(product.totalRevenue)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductListRow({
  product,
  index,
  isSelected,
  onToggleSelect,
}: {
  product: SellerProduct;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        'flex items-center gap-4 rounded-xl px-4 py-3',
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200 dark:border-neutral-700/60',
        'hover:shadow-md transition-all duration-200',
        isSelected && 'ring-2 ring-[#1E4DB7]'
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(product.id)}
        className="border-neutral-300 dark:border-neutral-600"
      />

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <Package className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
          {product.title}
        </p>
      </div>

      {/* Type */}
      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0', TYPE_COLORS[product.type])}>
        {TYPE_LABELS[product.type]}
      </span>

      {/* Status */}
      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize flex-shrink-0', STATUS_COLORS[product.status])}>
        {product.status}
      </span>

      {/* Price */}
      <p className="text-sm font-bold text-[#1E4DB7] dark:text-[#6B9AFF] w-20 text-right flex-shrink-0">
        {formatCurrency(product.price, product.currency)}
      </p>

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
        <span className="flex items-center gap-1 w-14" title="Views">
          <Eye className="w-3.5 h-3.5" />
          {formatCompact(product.totalViews)}
        </span>
        <span className="flex items-center gap-1 w-14" title="Sales">
          <Download className="w-3.5 h-3.5" />
          {formatCompact(product.totalSales)}
        </span>
        <span className="flex items-center gap-1 w-14" title="Revenue">
          <DollarSign className="w-3.5 h-3.5" />
          {formatCompact(product.totalRevenue)}
        </span>
        <span className="flex items-center gap-1 w-10" title="Rating">
          <Star className="w-3.5 h-3.5 text-[#F59A23]" />
          {product.averageRating > 0 ? product.averageRating.toFixed(1) : '-'}
        </span>
      </div>

      <ProductActionsMenu product={product} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function SellerProductsPage() {
  const { data: profile, isLoading: loadingProfile } = useMySellerProfile();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);

  // Simulating data being ready
  const products = MOCK_PRODUCTS;

  // -- Counts by status -------------------------------------------------------
  const statusCounts = useMemo(() => {
    const counts = { all: products.length, published: 0, draft: 0, archived: 0 };
    for (const p of products) {
      counts[p.status]++;
    }
    return counts;
  }, [products]);

  // -- Filtering & sorting ----------------------------------------------------
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }

    // status
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // type
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.type === typeFilter);
    }

    // sort
    switch (sortKey) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'revenue':
        result.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
      case 'sales':
        result.sort((a, b) => b.totalSales - a.totalSales);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
    }

    return result;
  }, [products, searchQuery, statusFilter, typeFilter, sortKey]);

  // -- Pagination -------------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const paginationStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const paginationEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  // -- Selection helpers ------------------------------------------------------
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortKey('newest');
    setCurrentPage(1);
  }, []);

  // -- Reset page on filter change --------------------------------------------
  const handleStatusChange = useCallback((s: StatusFilter) => {
    setStatusFilter(s);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((t: TypeFilter) => {
    setTypeFilter(t);
    setCurrentPage(1);
  }, []);

  // -- Loading state ----------------------------------------------------------
  if (isLoading || loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <LoadingSkeleton viewMode={viewMode} />
      </div>
    );
  }

  // -- Empty state (no products at all) ---------------------------------------
  if (products.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Products</h1>
        </div>
        <EmptyState />
      </div>
    );
  }

  // -- Main render ------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Products</h1>
          <Badge className="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-[#6B9AFF] border-0 text-xs">
            {products.length}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-[#1E4DB7] text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-[#1E4DB7] text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add new product */}
          <Link href="/seller-dashboard/products/create">
            <Button className="bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white gap-2 shadow-md shadow-[#1E4DB7]/20">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200 dark:border-neutral-700"
                >
                  <Filter className="w-4 h-4" />
                  {typeFilter === 'all' ? 'All Types' : TYPE_LABELS[typeFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                <DropdownMenuItem onClick={() => handleTypeChange('all')} className="cursor-pointer">
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleTypeChange('powerpoint')} className="cursor-pointer">
                  PowerPoint
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeChange('document')} className="cursor-pointer">
                  Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeChange('web_template')} className="cursor-pointer">
                  Web Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeChange('spreadsheet')} className="cursor-pointer">
                  Spreadsheet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200 dark:border-neutral-700"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortKey === 'newest' && 'Newest'}
                  {sortKey === 'revenue' && 'Revenue'}
                  {sortKey === 'sales' && 'Sales'}
                  {sortKey === 'rating' && 'Rating'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                <DropdownMenuItem onClick={() => setSortKey('newest')} className="cursor-pointer">
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey('revenue')} className="cursor-pointer">
                  Revenue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey('sales')} className="cursor-pointer">
                  Sales
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey('rating')} className="cursor-pointer">
                  Rating
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear filters */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={clearAllFilters}
                className="text-sm text-[#1E4DB7] dark:text-[#6B9AFF] hover:underline font-medium px-2"
              >
                Clear filters
              </motion.button>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2',
                statusFilter === status
                  ? 'bg-[#1E4DB7] text-white shadow-md shadow-[#1E4DB7]/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <span className="capitalize">{status}</span>
              <span
                className={cn(
                  'text-[11px] px-1.5 py-0.5 rounded-full font-semibold',
                  statusFilter === status
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                )}
              >
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Product Display ─────────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            No products found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearAllFilters}
            className="text-sm font-medium text-[#1E4DB7] dark:text-[#6B9AFF] hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ─────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Add new product card */}
          <Link href="/seller-dashboard/products/create" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl h-full min-h-[340px] flex flex-col items-center justify-center gap-3',
                'border-dashed border-2 border-neutral-300 dark:border-neutral-600',
                'hover:border-[#1E4DB7] hover:bg-[#1E4DB7]/5 dark:hover:border-[#6B9AFF] dark:hover:bg-[#1E4DB7]/10',
                'transition-all duration-300 cursor-pointer group'
              )}
            >
              <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-[#1E4DB7]/10 dark:group-hover:bg-[#1E4DB7]/20 flex items-center justify-center transition-colors">
                <Plus className="w-7 h-7 text-neutral-400 group-hover:text-[#1E4DB7] dark:group-hover:text-[#6B9AFF] transition-colors" />
              </div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-[#1E4DB7] dark:group-hover:text-[#6B9AFF] transition-colors">
                Add New Product
              </p>
            </motion.div>
          </Link>

          <AnimatePresence mode="popLayout">
            {paginatedProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── List View ─────────────────────────────────────────────────── */
        <div className="space-y-2">
          {/* List header */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <div className="w-4" />
            <div className="w-12" />
            <div className="flex-1">Title</div>
            <div className="w-24 text-center">Type</div>
            <div className="w-20 text-center">Status</div>
            <div className="w-20 text-right">Price</div>
            <div className="flex items-center gap-4">
              <span className="w-14">Views</span>
              <span className="w-14">Sales</span>
              <span className="w-14">Revenue</span>
              <span className="w-10">Rating</span>
            </div>
            <div className="w-8" />
          </div>

          <AnimatePresence mode="popLayout">
            {paginatedProducts.map((product, i) => (
              <ProductListRow
                key={product.id}
                product={product}
                index={i}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────────────────────── */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing{' '}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {paginationStart}-{paginationEnd}
            </span>{' '}
            of{' '}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {filteredProducts.length}
            </span>{' '}
            products
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                    page === currentPage
                      ? 'bg-[#1E4DB7] text-white shadow-md shadow-[#1E4DB7]/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Bulk Actions Bar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-neutral-900/95 dark:bg-white/95 backdrop-blur-xl shadow-2xl border border-neutral-700 dark:border-neutral-300">
              <span className="text-sm font-medium text-white dark:text-neutral-900">
                {selectedIds.size} selected
              </span>

              <div className="w-px h-5 bg-neutral-700 dark:bg-neutral-300" />

              <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors">
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-red-400 dark:text-red-500 hover:text-red-300 dark:hover:text-red-600 transition-colors">
                <TrendingUp className="w-4 h-4" />
                Delete
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors">
                <ArrowUpDown className="w-4 h-4" />
                Change Status
              </button>

              <div className="w-px h-5 bg-neutral-700 dark:bg-neutral-300" />

              <button
                onClick={clearSelection}
                className="text-sm font-medium text-neutral-400 dark:text-neutral-500 hover:text-white dark:hover:text-neutral-900 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
