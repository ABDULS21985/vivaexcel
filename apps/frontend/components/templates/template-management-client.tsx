"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Package,
  Globe,
  DollarSign,
  Key,
  Pencil,
  Trash2,
} from "lucide-react";
import { useWebTemplates } from "@/hooks/use-web-templates";
import {
  WebTemplate,
  WebTemplateStatus,
  Framework,
  TEMPLATE_TYPE_LABELS,
  FRAMEWORK_LABELS,
} from "@/types/web-template";

// =============================================================================
// Status Badge Helper
// =============================================================================

function StatusBadge({ status }: { status: WebTemplateStatus }) {
  const config: Record<
    WebTemplateStatus,
    { label: string; className: string }
  > = {
    [WebTemplateStatus.PUBLISHED]: {
      label: "Published",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    [WebTemplateStatus.DRAFT]: {
      label: "Draft",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    [WebTemplateStatus.ARCHIVED]: {
      label: "Archived",
      className:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    [WebTemplateStatus.COMING_SOON]: {
      label: "Coming Soon",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TemplateManagementClient() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    WebTemplateStatus | ""
  >("");
  const [selectedFramework, setSelectedFramework] = useState<Framework | "">(
    "",
  );

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: selectedStatus || undefined,
      framework: selectedFramework || undefined,
      limit: 50,
    }),
    [search, selectedStatus, selectedFramework],
  );

  const { data, isLoading } = useWebTemplates(filters);

  const templates = data?.items ?? [];
  const total = data?.meta?.total ?? templates.length;

  const publishedCount = templates.filter(
    (t) => t.status === WebTemplateStatus.PUBLISHED,
  ).length;

  return (
    <div>
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Web Templates
        </h1>
        <Link
          href="/products/templates/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Link>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Stats Cards                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Templates
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Published
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {publishedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                $0
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Licenses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filters                                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as WebTemplateStatus | "")
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value={WebTemplateStatus.PUBLISHED}>Published</option>
          <option value={WebTemplateStatus.DRAFT}>Draft</option>
          <option value={WebTemplateStatus.ARCHIVED}>Archived</option>
          <option value={WebTemplateStatus.COMING_SOON}>Coming Soon</option>
        </select>

        <select
          value={selectedFramework}
          onChange={(e) =>
            setSelectedFramework(e.target.value as Framework | "")
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Frameworks</option>
          {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Table                                                             */}
      {/* ----------------------------------------------------------------- */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 dark:border-gray-700 dark:bg-gray-800">
          <Package className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || selectedStatus || selectedFramework
              ? "Try adjusting your filters or search query."
              : "Get started by creating your first template."}
          </p>
          {!search && !selectedStatus && !selectedFramework && (
            <Link
              href="/products/templates/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Image
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Framework
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template: WebTemplate) => (
                <tr
                  key={template.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <td className="px-4 py-3">
                    {template.featuredImage ? (
                      <Image
                        src={template.featuredImage}
                        alt={template.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {template.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {FRAMEWORK_LABELS[template.framework] ??
                        template.framework}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {TEMPLATE_TYPE_LABELS[template.templateType] ??
                      template.templateType}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    ${template.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={template.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/templates/${template.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
