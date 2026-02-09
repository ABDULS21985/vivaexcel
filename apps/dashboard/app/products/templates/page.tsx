'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useWebTemplates,
  useDeleteWebTemplate,
  usePublishWebTemplate,
  useArchiveWebTemplate,
} from '../../../hooks/use-web-templates';

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  LANDING_PAGE: 'Landing Page',
  SAAS_BOILERPLATE: 'SaaS Boilerplate',
  ECOMMERCE_THEME: 'E-commerce',
  PORTFOLIO: 'Portfolio',
  BLOG_THEME: 'Blog Theme',
  ADMIN_DASHBOARD: 'Admin Dashboard',
  MOBILE_APP_TEMPLATE: 'Mobile App',
  EMAIL_TEMPLATE: 'Email',
  STARTUP_KIT: 'Startup Kit',
  COMPONENT_LIBRARY: 'Components',
};

const FRAMEWORK_LABELS: Record<string, string> = {
  NEXTJS: 'Next.js',
  REACT: 'React',
  VUE: 'Vue',
  NUXT: 'Nuxt',
  SVELTE: 'Svelte',
  ASTRO: 'Astro',
  ANGULAR: 'Angular',
  HTML_CSS: 'HTML/CSS',
  TAILWIND: 'Tailwind',
  BOOTSTRAP: 'Bootstrap',
  WORDPRESS: 'WordPress',
  SHOPIFY: 'Shopify',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-700',
  COMING_SOON: 'bg-blue-100 text-blue-700',
};

export default function TemplatesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, refetch } = useWebTemplates({
    search: search || undefined,
    status: statusFilter || undefined,
    templateType: typeFilter || undefined,
    framework: frameworkFilter || undefined,
    sortBy,
    sortOrder,
    limit: 50,
  });

  const deleteMutation = useDeleteWebTemplate();
  const publishMutation = usePublishWebTemplate();
  const archiveMutation = useArchiveWebTemplate();

  const templates = data?.items ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === templates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(templates.map((t: any) => t.id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Templates</h1>
          <p className="text-sm text-gray-500">
            Manage your web templates, starter kits, and boilerplates
          </p>
        </div>
        <Link
          href="/products/templates/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Template
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
          <option value="COMING_SOON">Coming Soon</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={frameworkFilter}
          onChange={(e) => setFrameworkFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Frameworks</option>
          {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(':');
            setSortBy(s);
            setSortOrder(o);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="createdAt:DESC">Newest</option>
          <option value="createdAt:ASC">Oldest</option>
          <option value="price:DESC">Price: High to Low</option>
          <option value="price:ASC">Price: Low to High</option>
          <option value="downloadCount:DESC">Most Downloads</option>
          <option value="averageRating:DESC">Top Rated</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.length} selected
          </span>
          <button
            onClick={async () => {
              await Promise.all(selectedIds.map((id) => publishMutation.mutateAsync(id)));
              setSelectedIds([]);
            }}
            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
          >
            Publish
          </button>
          <button
            onClick={async () => {
              await Promise.all(selectedIds.map((id) => archiveMutation.mutateAsync(id)));
              setSelectedIds([]);
            }}
            className="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
          >
            Archive
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete ${selectedIds.length} templates?`)) return;
              await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
              setSelectedIds([]);
            }}
            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20">
          <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-gray-500">No templates yet</p>
          <Link
            href="/products/templates/new"
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === templates.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">Template</th>
                <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 font-medium text-gray-700">Framework</th>
                <th className="px-4 py-3 font-medium text-gray-700">Price</th>
                <th className="px-4 py-3 font-medium text-gray-700">Downloads</th>
                <th className="px-4 py-3 font-medium text-gray-700">Rating</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template: any) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(template.id)}
                      onChange={() => toggleSelect(template.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {template.featuredImage ? (
                        <img
                          src={template.featuredImage}
                          alt=""
                          className="h-10 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-gray-200 text-gray-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{template.title}</p>
                        <p className="text-xs text-gray-500">{template.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[template.status] || 'bg-gray-100 text-gray-700'}`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{TEMPLATE_TYPE_LABELS[template.templateType] || template.templateType}</td>
                  <td className="px-4 py-3 text-xs">{FRAMEWORK_LABELS[template.framework] || template.framework}</td>
                  <td className="px-4 py-3 font-medium">${Number(template.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{template.downloadCount}</td>
                  <td className="px-4 py-3">{Number(template.averageRating).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/templates/${template.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      {template.status === 'DRAFT' && (
                        <button
                          onClick={() => publishMutation.mutate(template.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                        >
                          Publish
                        </button>
                      )}
                      {template.status === 'PUBLISHED' && (
                        <button
                          onClick={() => archiveMutation.mutate(template.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
