'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebTemplates, useTemplateCategories } from '../../hooks/use-web-templates';
import {
  WebTemplate,
  WebTemplateFilters,
  TemplateType,
  Framework,
  TEMPLATE_TYPE_LABELS,
  FRAMEWORK_LABELS,
  TEMPLATE_FEATURES,
} from '../../types/web-template';
import { TemplateCard } from './template-card';
import { FrameworkBadge } from './framework-badge';

interface TemplateListingClientProps {
  initialTemplates?: WebTemplate[];
  initialTotal?: number;
}

const SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Newest' },
  { value: 'createdAt:ASC', label: 'Oldest' },
  { value: 'price:ASC', label: 'Price: Low to High' },
  { value: 'price:DESC', label: 'Price: High to Low' },
  { value: 'downloadCount:DESC', label: 'Most Popular' },
  { value: 'averageRating:DESC', label: 'Top Rated' },
];

export function TemplateListingClient({
  initialTemplates = [],
  initialTotal = 0,
}: TemplateListingClientProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | ''>('');
  const [selectedFramework, setSelectedFramework] = useState<Framework | ''>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [sort, setSort] = useState('createdAt:DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [sortBy, sortOrder] = sort.split(':') as [string, 'ASC' | 'DESC'];

  const filters: WebTemplateFilters = useMemo(
    () => ({
      search: search || undefined,
      templateType: selectedType || undefined,
      framework: selectedFramework || undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy,
      sortOrder,
      limit: 24,
    }),
    [search, selectedType, selectedFramework, selectedFeatures, priceRange, sortBy, sortOrder],
  );

  const { data, isLoading } = useWebTemplates(filters);
  const { data: categories } = useTemplateCategories();

  const templates = data?.items ?? initialTemplates;
  const total = data?.meta?.total ?? initialTotal;
  const hasNextPage = data?.meta?.hasNextPage ?? false;

  const activeFiltersCount = [
    selectedType,
    selectedFramework,
    selectedFeatures.length > 0,
    priceRange.min !== undefined,
    priceRange.max !== undefined,
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedType('');
    setSelectedFramework('');
    setSelectedFeatures([]);
    setPriceRange({});
    setSort('createdAt:DESC');
  }, []);

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {total} templates
          </span>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !selectedType
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          All Types
        </button>
        {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key as TemplateType)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedType === key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Framework Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFramework('')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !selectedFramework
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          All Frameworks
        </button>
        {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedFramework(key as Framework)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedFramework === key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Feature Checkboxes */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      selectedFeatures.includes(feature)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="hidden"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Price Range
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min ?? ''}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max ?? ''}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
