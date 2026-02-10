'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Search,
} from 'lucide-react';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import {
  useAffiliateLinks,
  useCreateAffiliateLink,
  useDeleteAffiliateLink,
} from '@/hooks/use-affiliates';
import { toast } from 'sonner';

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AffiliateLinksPage() {
  const [cursor, setCursor] = useState<string | undefined>();
  const { data: linksData, isLoading } = useAffiliateLinks({ cursor, limit: 20 });
  const createLink = useCreateAffiliateLink();
  const deleteLink = useDeleteAffiliateLink();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ fullUrl: '', customCampaign: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const links = linksData?.items ?? [];
  const meta = linksData?.meta;

  const filteredLinks = searchQuery
    ? links.filter(
        (l) =>
          l.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.customCampaign?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.fullUrl.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : links;

  const handleCreate = useCallback(async () => {
    if (!createForm.fullUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    try {
      await createLink.mutateAsync({
        fullUrl: createForm.fullUrl,
        customCampaign: createForm.customCampaign || undefined,
      });
      toast.success('Link created successfully');
      setCreateForm({ fullUrl: '', customCampaign: '' });
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create link');
    }
  }, [createForm, createLink]);

  const handleDelete = useCallback(
    async (linkId: string) => {
      try {
        await deleteLink.mutateAsync(linkId);
        toast.success('Link deleted');
      } catch {
        toast.error('Failed to delete link');
      }
    },
    [deleteLink],
  );

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Affiliate Links</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Create and manage your tracking links
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="text-white font-medium rounded-xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search links..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clicks', value: links.reduce((s, l) => s + l.clicks, 0).toLocaleString(), icon: MousePointerClick, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Total Conversions', value: links.reduce((s, l) => s + l.conversions, 0).toLocaleString(), icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { label: 'Total Commission', value: `$${links.reduce((s, l) => s + l.commission, 0).toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className={cn(GLASS_CARD, 'p-12 text-center')}>
          <Link2 className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No links yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Create your first tracking link to start earning commissions.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="text-white rounded-xl"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filteredLinks.map((link) => {
            const conversionRate = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0';
            const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${link.shortCode}`;

            return (
              <motion.div
                key={link.id}
                variants={itemVariants}
                className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {link.customCampaign || link.shortCode}
                      </h3>
                      {!link.isActive && (
                        <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded truncate max-w-[300px]">
                        {shortUrl}
                      </code>
                      <button onClick={() => copyToClipboard(shortUrl)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors flex-shrink-0">
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 truncate">
                      Target: {link.fullUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{link.clicks}</p>
                      <p className="text-[10px] text-neutral-500">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{link.conversions}</p>
                      <p className="text-[10px] text-neutral-500">Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{conversionRate}%</p>
                      <p className="text-[10px] text-neutral-500">Conv.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${link.commission.toFixed(2)}</p>
                      <p className="text-[10px] text-neutral-500">Earned</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a href={link.fullUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4 text-neutral-400" />
                      </a>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deleteLink.isPending}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {meta && (meta.hasNextPage || meta.hasPreviousPage) && (
        <div className="flex items-center justify-center gap-3">
          {meta.hasPreviousPage && meta.previousCursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(meta.previousCursor)}>
              Previous
            </Button>
          )}
          {meta.hasNextPage && meta.nextCursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(meta.nextCursor)}>
              Next
            </Button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Create Tracking Link</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Target URL *
                </label>
                <input
                  type="url"
                  value={createForm.fullUrl}
                  onChange={(e) => setCreateForm({ ...createForm, fullUrl: e.target.value })}
                  placeholder="https://vivaexcel.com/store/product-name"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  The URL you want to promote. Leave as store URL for a general link.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Campaign Name (optional)
                </label>
                <input
                  type="text"
                  value={createForm.customCampaign}
                  onChange={(e) => setCreateForm({ ...createForm, customCampaign: e.target.value })}
                  placeholder="e.g. youtube-video-1, blog-post"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-neutral-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createLink.isPending || !createForm.fullUrl.trim()}
                className="flex-1 text-white rounded-xl"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, #143A8F)` }}
              >
                {createLink.isPending ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
