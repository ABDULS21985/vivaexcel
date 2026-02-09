"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  ImageIcon,
  Plus,
  X,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useWebTemplate } from "@/hooks/use-web-templates";
import {
  WebTemplate,
  TemplateType,
  Framework,
  PackageManager,
  LicenseType,
  WebTemplateStatus,
  TechStack,
  TemplateLicense,
  TEMPLATE_TYPE_LABELS,
  FRAMEWORK_LABELS,
  TEMPLATE_FEATURES,
  LICENSE_TYPE_LABELS,
} from "@/types/web-template";

// =============================================================================
// Props
// =============================================================================

interface TemplateEditFormProps {
  templateId: string;
}

// =============================================================================
// Status Badge
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    inactive:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    published:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    draft:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    archived:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// =============================================================================
// Tab definitions
// =============================================================================

const TABS = [
  "General",
  "Media",
  "Demos",
  "Features",
  "Pricing",
  "Licenses",
] as const;

type TabName = (typeof TABS)[number];

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];

const TECH_STACK_SECTIONS: { key: keyof TechStack; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database" },
  { key: "hosting", label: "Hosting" },
  { key: "services", label: "Services" },
];

// =============================================================================
// Component
// =============================================================================

export function TemplateEditForm({ templateId }: TemplateEditFormProps) {
  const { data: template, isLoading } = useWebTemplate(templateId);
  const [activeTab, setActiveTab] = useState<TabName>("General");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Local form state (initialized from template when loaded)
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType | "">("");
  const [framework, setFramework] = useState<Framework | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [hasTypeScript, setHasTypeScript] = useState(false);
  const [nodeVersion, setNodeVersion] = useState("");
  const [packageManager, setPackageManager] = useState<PackageManager | "">(
    "",
  );
  const [status, setStatus] = useState<WebTemplateStatus>(
    WebTemplateStatus.DRAFT,
  );

  // Media
  const [featuredImage, setFeaturedImage] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewImageInput, setPreviewImageInput] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [changelogUrl, setChangelogUrl] = useState("");

  // Demos
  const [demos, setDemos] = useState<
    { name: string; demoUrl: string; screenshotUrl: string; sortOrder: number }[]
  >([]);

  // Features
  const [features, setFeatures] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<TechStack>({
    frontend: [],
    backend: [],
    database: [],
    hosting: [],
    services: [],
  });
  const [techStackInputs, setTechStackInputs] = useState<
    Record<keyof TechStack, string>
  >({
    frontend: "",
    backend: "",
    database: "",
    hosting: "",
    services: "",
  });
  const [browserSupport, setBrowserSupport] = useState<string[]>([]);
  const [responsiveBreakpoints, setResponsiveBreakpoints] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
  });
  const [pageCount, setPageCount] = useState(0);
  const [componentCount, setComponentCount] = useState(0);

  // Pricing
  const [license, setLicense] = useState<LicenseType | "">("");
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [supportDuration, setSupportDuration] = useState(0);

  // Sync form state when template loads
  const [initialized, setInitialized] = useState(false);
  if (template && !initialized) {
    setTitle(template.title ?? "");
    setSlug(template.slug ?? "");
    setTemplateType(template.templateType ?? "");
    setFramework(template.framework ?? "");
    setShortDescription(template.shortDescription ?? "");
    setDescription(template.description ?? "");
    setHasTypeScript(template.hasTypeScript ?? false);
    setNodeVersion(template.nodeVersion ?? "");
    setPackageManager(template.packageManager ?? "");
    setStatus(template.status ?? WebTemplateStatus.DRAFT);
    setFeaturedImage(template.featuredImage ?? "");
    setPreviewImages(template.previewImages ?? []);
    setGithubRepoUrl(template.githubRepoUrl ?? "");
    setDocumentationUrl(template.documentationUrl ?? "");
    setChangelogUrl(template.changelogUrl ?? "");
    setDemos(
      (template.demos ?? []).map((d) => ({
        name: d.name,
        demoUrl: d.demoUrl,
        screenshotUrl: d.screenshotUrl ?? "",
        sortOrder: d.sortOrder,
      })),
    );
    setFeatures(template.features ?? []);
    setTechStack(
      template.techStack ?? {
        frontend: [],
        backend: [],
        database: [],
        hosting: [],
        services: [],
      },
    );
    setBrowserSupport(template.browserSupport ?? []);
    setResponsiveBreakpoints(
      template.responsiveBreakpoints ?? {
        mobile: false,
        tablet: false,
        desktop: false,
      },
    );
    setPageCount(template.pageCount ?? 0);
    setComponentCount(template.componentCount ?? 0);
    setLicense(template.license ?? "");
    setPrice(template.price ?? 0);
    setCompareAtPrice(
      template.compareAtPrice != null ? template.compareAtPrice : 0,
    );
    setSupportDuration(template.supportDuration ?? 0);
    setInitialized(true);
  }

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Template not found
        </h2>
        <Link
          href="/products/templates"
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to Templates
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const licenses: TemplateLicense[] = template.licenses ?? [];

  function toggleFeature(feature: string) {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }

  function addTechStack(category: keyof TechStack) {
    const value = techStackInputs[category].trim();
    if (value) {
      setTechStack((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
      setTechStackInputs((prev) => ({ ...prev, [category]: "" }));
    }
  }

  function removeTechStack(category: keyof TechStack, index: number) {
    setTechStack((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* Back link */}
      <Link
        href="/products/templates"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Templates
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Template
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/products/templates/${templateId}/analytics`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            View Analytics
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Template
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete &quot;{template.title}&quot;? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {/* ============================================================= */}
        {/* General Tab                                                    */}
        {/* ============================================================= */}
        {activeTab === "General" && (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Type
              </label>
              <select
                value={templateType}
                onChange={(e) =>
                  setTemplateType(e.target.value as TemplateType | "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Framework
              </label>
              <select
                value={framework}
                onChange={(e) =>
                  setFramework(e.target.value as Framework | "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select framework...</option>
                {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Short Description
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setShortDescription(e.target.value);
                  }
                }}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                {shortDescription.length}/200 characters
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasTypeScript(!hasTypeScript)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasTypeScript
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasTypeScript ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Has TypeScript
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Node Version
                </label>
                <input
                  type="text"
                  value={nodeVersion}
                  onChange={(e) => setNodeVersion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Package Manager
                </label>
                <select
                  value={packageManager}
                  onChange={(e) =>
                    setPackageManager(e.target.value as PackageManager | "")
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value={PackageManager.NPM}>npm</option>
                  <option value={PackageManager.YARN}>yarn</option>
                  <option value={PackageManager.PNPM}>pnpm</option>
                  <option value={PackageManager.BUN}>bun</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as WebTemplateStatus)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={WebTemplateStatus.DRAFT}>Draft</option>
                <option value={WebTemplateStatus.PUBLISHED}>Published</option>
                <option value={WebTemplateStatus.ARCHIVED}>Archived</option>
                <option value={WebTemplateStatus.COMING_SOON}>
                  Coming Soon
                </option>
              </select>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save General
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* Media Tab                                                      */}
        {/* ============================================================= */}
        {activeTab === "Media" && (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Image URL
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {featuredImage ? (
                <div className="mt-2 h-32 w-48 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2 flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <ImageIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview Images
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={previewImageInput}
                  onChange={(e) => setPreviewImageInput(e.target.value)}
                  placeholder="https://example.com/preview.png"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (previewImageInput.trim()) {
                      setPreviewImages((prev) => [
                        ...prev,
                        previewImageInput.trim(),
                      ]);
                      setPreviewImageInput("");
                    }
                  }}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              {previewImages.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {previewImages.map((url, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700"
                    >
                      <span className="flex-1 truncate text-gray-600 dark:text-gray-300">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImages((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub Repo URL
              </label>
              <input
                type="url"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Documentation URL
              </label>
              <input
                type="url"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Changelog URL
              </label>
              <input
                type="url"
                value={changelogUrl}
                onChange={(e) => setChangelogUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save Media
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* Demos Tab                                                      */}
        {/* ============================================================= */}
        {activeTab === "Demos" && (
          <div className="space-y-6">
            {demos.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No demos added yet.
              </p>
            )}

            {demos.map((demo, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Demo #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDemos((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </label>
                    <input
                      type="text"
                      value={demo.name}
                      onChange={(e) =>
                        setDemos((prev) =>
                          prev.map((d, i) =>
                            i === index ? { ...d, name: e.target.value } : d,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Demo URL
                    </label>
                    <input
                      type="url"
                      value={demo.demoUrl}
                      onChange={(e) =>
                        setDemos((prev) =>
                          prev.map((d, i) =>
                            i === index
                              ? { ...d, demoUrl: e.target.value }
                              : d,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Screenshot URL
                    </label>
                    <input
                      type="url"
                      value={demo.screenshotUrl}
                      onChange={(e) =>
                        setDemos((prev) =>
                          prev.map((d, i) =>
                            i === index
                              ? { ...d, screenshotUrl: e.target.value }
                              : d,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={demo.sortOrder}
                      onChange={(e) =>
                        setDemos((prev) =>
                          prev.map((d, i) =>
                            i === index
                              ? { ...d, sortOrder: Number(e.target.value) }
                              : d,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setDemos((prev) => [
                  ...prev,
                  {
                    name: "",
                    demoUrl: "",
                    screenshotUrl: "",
                    sortOrder: prev.length + 1,
                  },
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Add Demo
            </button>

            <div className="pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Demos
              </button>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* Features Tab                                                   */}
        {/* ============================================================= */}
        {activeTab === "Features" && (
          <div className="space-y-8">
            {/* Feature Checkboxes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Features
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TEMPLATE_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      features.includes(feature)
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tech Stack
              </label>
              <div className="space-y-4">
                {TECH_STACK_SECTIONS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techStackInputs[key]}
                        onChange={(e) =>
                          setTechStackInputs((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTechStack(key);
                          }
                        }}
                        placeholder={`Add ${label.toLowerCase()} technology...`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => addTechStack(key)}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Add
                      </button>
                    </div>
                    {techStack[key].length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {techStack[key].map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeTechStack(key, index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Support */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Browser Support
              </label>
              <div className="flex flex-wrap gap-3">
                {BROWSERS.map((browser) => (
                  <label
                    key={browser}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={browserSupport.includes(browser)}
                      onChange={() =>
                        setBrowserSupport((prev) =>
                          prev.includes(browser)
                            ? prev.filter((b) => b !== browser)
                            : [...prev, browser],
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {browser}
                  </label>
                ))}
              </div>
            </div>

            {/* Responsive */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Responsive
              </label>
              <div className="flex flex-wrap gap-3">
                {(["mobile", "tablet", "desktop"] as const).map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={responsiveBreakpoints[key]}
                      onChange={() =>
                        setResponsiveBreakpoints((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Page & Component Counts */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Component Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={componentCount}
                  onChange={(e) => setComponentCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save Features
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* Pricing Tab                                                    */}
        {/* ============================================================= */}
        {activeTab === "Pricing" && (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                License Type
              </label>
              <select
                value={license}
                onChange={(e) =>
                  setLicense(e.target.value as LicenseType | "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select license type...</option>
                <option value={LicenseType.SINGLE_USE}>Single Use</option>
                <option value={LicenseType.MULTI_USE}>Multi Use</option>
                <option value={LicenseType.EXTENDED}>Extended</option>
                <option value={LicenseType.UNLIMITED}>Unlimited</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compare At Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Support Duration (months)
              </label>
              <input
                type="number"
                min={0}
                value={supportDuration}
                onChange={(e) => setSupportDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save Pricing
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* Licenses Tab                                                   */}
        {/* ============================================================= */}
        {activeTab === "Licenses" && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              License Keys
            </h2>

            {licenses.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No licenses have been issued yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Key
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Activations
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {licenses.map((lic) => (
                      <tr key={lic.id}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                          {lic.licenseKey}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {LICENSE_TYPE_LABELS[lic.licenseType] ??
                            lic.licenseType}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {lic.activationCount}/{lic.maxActivations}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={lic.isActive ? "active" : "inactive"}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {lic.expiresAt
                            ? new Date(lic.expiresAt).toLocaleDateString()
                            : "---"}
                        </td>
                        <td className="px-4 py-3">
                          {lic.isActive && (
                            <button
                              type="button"
                              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue Placeholder */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Revenue
              </h3>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        $0.00
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sales Count
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        0
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Type Breakdown Bar Chart */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Type Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Single Use",
                      color: "bg-blue-500",
                      percentage: 0,
                    },
                    {
                      label: "Multi Use",
                      color: "bg-green-500",
                      percentage: 0,
                    },
                    {
                      label: "Extended",
                      color: "bg-purple-500",
                      percentage: 0,
                    },
                    {
                      label: "Unlimited",
                      color: "bg-orange-500",
                      percentage: 0,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.label}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
