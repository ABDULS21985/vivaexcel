'use client';

import { motion } from 'framer-motion';
import {
  ImageIcon,
  FileText,
  Mail,
  Share2,
  Copy,
  Download,
  ExternalLink,
} from 'lucide-react';
import { cn, Button } from '@ktblog/ui/components';
import { useMyAffiliateProfile } from '@/hooks/use-affiliates';
import { toast } from 'sonner';

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SOCIAL_TEMPLATES = [
  {
    platform: 'Twitter',
    text: 'Check out these amazing Excel templates and digital tools! I use them daily and they\'ve saved me hours. Use my link to get started: {link}',
  },
  {
    platform: 'LinkedIn',
    text: 'Looking for professional Excel templates, financial models, and data tools? I highly recommend VivaExcel. Their products have transformed my workflow. Check them out: {link}',
  },
  {
    platform: 'Instagram',
    text: 'Transform your productivity with professional Excel templates and digital tools! Link in bio: {link} #ExcelTemplates #Productivity #DataAnalytics',
  },
];

const EMAIL_TEMPLATE = `Subject: Tools I highly recommend for [productivity/finance/data]

Hi {name},

I wanted to share something that has really helped me with [specific use case].

VivaExcel has an amazing collection of professional Excel templates, financial models, and data tools. I've been using them and they've saved me countless hours.

Here's my personal link if you'd like to check them out:
{link}

Let me know if you have any questions!

Best,
{your_name}`;

export default function AffiliateResourcesPage() {
  const { data: profile } = useMyAffiliateProfile();

  const affiliateLink = profile
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${profile.affiliateCode}`
    : '';

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Resources</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Marketing materials and templates to help you promote
        </p>
      </motion.div>

      {/* Your Affiliate Link */}
      {affiliateLink && (
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
              Your Affiliate Link
            </h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 truncate">
                {affiliateLink}
              </code>
              <Button
                onClick={() => copyText(affiliateLink)}
                variant="outline"
                className="rounded-xl flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Banner Assets */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Banner Assets</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Ready-to-use banners for your website or blog</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { size: '728x90', label: 'Leaderboard' },
              { size: '300x250', label: 'Medium Rectangle' },
              { size: '160x600', label: 'Wide Skyscraper' },
              { size: '320x50', label: 'Mobile Banner' },
              { size: '970x250', label: 'Billboard' },
              { size: '300x600', label: 'Half Page' },
            ].map((banner) => (
              <div
                key={banner.size}
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg h-24 flex items-center justify-center mb-3">
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                    {banner.size}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{banner.label}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{banner.size}px</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full rounded-lg text-xs"
                  onClick={() => toast.info('Banner download coming soon')}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Social Media Templates */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
              <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Social Media Templates</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Copy-paste templates for your social channels</p>
            </div>
          </div>

          <div className="space-y-4">
            {SOCIAL_TEMPLATES.map((template) => {
              const text = template.text.replace('{link}', affiliateLink);
              return (
                <div key={template.platform} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {template.platform}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => copyText(text)} className="text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Email Template */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30">
              <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Email Template</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Personalize and send to your network</p>
            </div>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <pre className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-sans leading-relaxed">
              {EMAIL_TEMPLATE.replace('{link}', affiliateLink)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg"
              onClick={() => copyText(EMAIL_TEMPLATE.replace('{link}', affiliateLink))}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Template
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tips for Success</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Create product-specific links', desc: 'Links to specific products convert 3x better than generic store links.' },
              { title: 'Write honest reviews', desc: 'Authentic reviews and tutorials build trust and drive conversions.' },
              { title: 'Use campaign names', desc: 'Tag your links with campaign names to track which channels perform best.' },
              { title: 'Leverage social proof', desc: 'Share screenshots, results, and testimonials from using the products.' },
              { title: 'Email your audience', desc: 'Email marketing consistently outperforms social in affiliate conversion rates.' },
              { title: 'Create comparison content', desc: 'Compare products to alternatives to help buyers make informed decisions.' },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{tip.title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
