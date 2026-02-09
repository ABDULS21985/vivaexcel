'use client';

import { motion } from 'framer-motion';

interface FeatureGridProps {
  features: string[];
  columns?: 2 | 3 | 4;
}

const FEATURE_ICONS: Record<string, string> = {
  Authentication: '🔐',
  Payments: '💳',
  'Dark Mode': '🌙',
  i18n: '🌍',
  'SEO Optimized': '🔍',
  Responsive: '📱',
  TypeScript: '📘',
  'API Routes': '🔗',
  Database: '🗄️',
  Email: '📧',
  Analytics: '📊',
  CMS: '📝',
};

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-3 ${gridCols[columns]}`}>
      {features.map((feature, index) => (
        <motion.div
          key={feature}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <span className="text-lg">
            {FEATURE_ICONS[feature] || '✅'}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {feature}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
