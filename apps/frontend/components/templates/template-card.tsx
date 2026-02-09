'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  WebTemplate,
  TEMPLATE_TYPE_LABELS,
  TEMPLATE_TYPE_COLORS,
  FRAMEWORK_LABELS,
  FRAMEWORK_COLORS,
} from '../../types/web-template';

interface TemplateCardProps {
  template: WebTemplate;
  index?: number;
}

export function TemplateCard({ template, index = 0 }: TemplateCardProps) {
  const typeColor = TEMPLATE_TYPE_COLORS[template.templateType] || '#6B7280';
  const frameworkColor = FRAMEWORK_COLORS[template.framework] || '#6B7280';
  const discount =
    template.compareAtPrice && template.compareAtPrice > template.price
      ? Math.round((1 - template.price / template.compareAtPrice) * 100)
      : null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        href={`/store/templates/${template.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {template.featuredImage ? (
            <img
              src={template.featuredImage}
              alt={template.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: typeColor }}
            >
              {TEMPLATE_TYPE_LABELS[template.templateType]}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: frameworkColor }}
            >
              {FRAMEWORK_LABELS[template.framework]}
            </span>
          </div>

          {/* Discount / Featured badges */}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {discount && (
              <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
            {template.isFeatured && (
              <span className="rounded-md bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
                Featured
              </span>
            )}
          </div>

          {/* Live Preview button overlay */}
          {template.demoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg">
                Live Preview
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {template.category && (
            <span className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              {template.category.name}
            </span>
          )}

          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
            {template.title}
          </h3>

          {template.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {template.shortDescription}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {renderStars(template.averageRating ?? 0)}
              <span className="ml-0.5">({template.totalReviews ?? 0})</span>
            </span>
          </div>

          {/* Feature count + page count */}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {template.features.length > 0 && (
              <span>{template.features.length} features</span>
            )}
            {template.pageCount > 0 && (
              <span>{template.pageCount} pages</span>
            )}
            {template.hasTypeScript && (
              <span className="text-blue-600">TS</span>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${Number(template.price).toFixed(2)}
            </span>
            {template.compareAtPrice && template.compareAtPrice > template.price && (
              <span className="text-sm text-gray-400 line-through">
                ${Number(template.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div
          className="h-1 w-0 transition-all duration-300 group-hover:w-full"
          style={{ backgroundColor: typeColor }}
        />
      </Link>
    </motion.div>
  );
}
