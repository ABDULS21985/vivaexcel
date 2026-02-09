"use client";

import { useReducer, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageIcon,
  Plus,
  X,
} from "lucide-react";
import {
  TemplateType,
  Framework,
  PackageManager,
  LicenseType,
  WebTemplateStatus,
  TechStack,
  TEMPLATE_TYPE_LABELS,
  FRAMEWORK_LABELS,
  TEMPLATE_FEATURES,
} from "@/types/web-template";

// =============================================================================
// Types
// =============================================================================

interface DemoEntry {
  name: string;
  demoUrl: string;
  screenshotUrl: string;
  sortOrder: number;
}

interface WizardState {
  // Step 1 - Basic Info
  title: string;
  slug: string;
  templateType: TemplateType | "";
  framework: Framework | "";
  shortDescription: string;
  description: string;
  hasTypeScript: boolean;
  nodeVersion: string;
  packageManager: PackageManager | "";

  // Step 2 - Media
  featuredImage: string;
  previewImages: string[];
  githubRepoUrl: string;
  documentationUrl: string;
  changelogUrl: string;

  // Step 3 - Demos
  demos: DemoEntry[];

  // Step 4 - Features & Tech
  features: string[];
  techStack: TechStack;
  browserSupport: string[];
  responsiveBreakpoints: { mobile: boolean; tablet: boolean; desktop: boolean };
  pageCount: number;
  componentCount: number;

  // Step 5 - Pricing & Publish
  license: LicenseType | "";
  price: number;
  compareAtPrice: number;
  supportDuration: number;
  status: WebTemplateStatus;
}

type WizardAction =
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "ADD_PREVIEW_IMAGE"; url: string }
  | { type: "REMOVE_PREVIEW_IMAGE"; index: number }
  | { type: "ADD_DEMO" }
  | { type: "UPDATE_DEMO"; index: number; field: string; value: unknown }
  | { type: "REMOVE_DEMO"; index: number }
  | { type: "TOGGLE_FEATURE"; feature: string }
  | {
      type: "ADD_TECH_STACK";
      category: keyof TechStack;
      value: string;
    }
  | {
      type: "REMOVE_TECH_STACK";
      category: keyof TechStack;
      index: number;
    }
  | { type: "TOGGLE_BROWSER"; browser: string }
  | {
      type: "TOGGLE_RESPONSIVE";
      key: "mobile" | "tablet" | "desktop";
    };

// =============================================================================
// Initial State
// =============================================================================

const initialState: WizardState = {
  title: "",
  slug: "",
  templateType: "",
  framework: "",
  shortDescription: "",
  description: "",
  hasTypeScript: false,
  nodeVersion: "",
  packageManager: "",
  featuredImage: "",
  previewImages: [],
  githubRepoUrl: "",
  documentationUrl: "",
  changelogUrl: "",
  demos: [],
  features: [],
  techStack: {
    frontend: [],
    backend: [],
    database: [],
    hosting: [],
    services: [],
  },
  browserSupport: [],
  responsiveBreakpoints: { mobile: false, tablet: false, desktop: false },
  pageCount: 0,
  componentCount: 0,
  license: "",
  price: 0,
  compareAtPrice: 0,
  supportDuration: 0,
  status: WebTemplateStatus.DRAFT,
};

// =============================================================================
// Reducer
// =============================================================================

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "ADD_PREVIEW_IMAGE":
      return {
        ...state,
        previewImages: [...state.previewImages, action.url],
      };

    case "REMOVE_PREVIEW_IMAGE":
      return {
        ...state,
        previewImages: state.previewImages.filter(
          (_, i) => i !== action.index,
        ),
      };

    case "ADD_DEMO":
      return {
        ...state,
        demos: [
          ...state.demos,
          {
            name: "",
            demoUrl: "",
            screenshotUrl: "",
            sortOrder: state.demos.length + 1,
          },
        ],
      };

    case "UPDATE_DEMO":
      return {
        ...state,
        demos: state.demos.map((d, i) =>
          i === action.index ? { ...d, [action.field]: action.value } : d,
        ),
      };

    case "REMOVE_DEMO":
      return {
        ...state,
        demos: state.demos.filter((_, i) => i !== action.index),
      };

    case "TOGGLE_FEATURE": {
      const has = state.features.includes(action.feature);
      return {
        ...state,
        features: has
          ? state.features.filter((f) => f !== action.feature)
          : [...state.features, action.feature],
      };
    }

    case "ADD_TECH_STACK":
      return {
        ...state,
        techStack: {
          ...state.techStack,
          [action.category]: [
            ...state.techStack[action.category],
            action.value,
          ],
        },
      };

    case "REMOVE_TECH_STACK":
      return {
        ...state,
        techStack: {
          ...state.techStack,
          [action.category]: state.techStack[action.category].filter(
            (_, i) => i !== action.index,
          ),
        },
      };

    case "TOGGLE_BROWSER": {
      const has = state.browserSupport.includes(action.browser);
      return {
        ...state,
        browserSupport: has
          ? state.browserSupport.filter((b) => b !== action.browser)
          : [...state.browserSupport, action.browser],
      };
    }

    case "TOGGLE_RESPONSIVE":
      return {
        ...state,
        responsiveBreakpoints: {
          ...state.responsiveBreakpoints,
          [action.key]: !state.responsiveBreakpoints[action.key],
        },
      };

    default:
      return state;
  }
}

// =============================================================================
// Helpers
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const STEP_LABELS = ["Info", "Media", "Demos", "Features", "Pricing"];

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

export function TemplateCreationWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewImageInput, setPreviewImageInput] = useState("");
  const [techStackInputs, setTechStackInputs] = useState<
    Record<keyof TechStack, string>
  >({
    frontend: "",
    backend: "",
    database: "",
    hosting: "",
    services: "",
  });

  // ---------------------------------------------------------------------------
  // Step Navigation
  // ---------------------------------------------------------------------------

  function handleNext() {
    if (currentStep < STEP_LABELS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleTitleChange(value: string) {
    dispatch({ type: "SET_FIELD", field: "title", value });
    dispatch({ type: "SET_FIELD", field: "slug", value: slugify(value) });
  }

  function handleAddPreviewImage() {
    if (previewImageInput.trim()) {
      dispatch({ type: "ADD_PREVIEW_IMAGE", url: previewImageInput.trim() });
      setPreviewImageInput("");
    }
  }

  function handleAddTechStack(category: keyof TechStack) {
    const value = techStackInputs[category].trim();
    if (value) {
      dispatch({ type: "ADD_TECH_STACK", category, value });
      setTechStackInputs((prev) => ({ ...prev, [category]: "" }));
    }
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

      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Create Template
      </h1>

      {/* --------------------------------------------------------------- */}
      {/* Step Indicator                                                   */}
      {/* --------------------------------------------------------------- */}
      <div className="mb-10 flex items-center justify-center">
        {STEP_LABELS.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    isActive
                      ? "font-medium text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 sm:w-20 ${
                    index < currentStep
                      ? "bg-green-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Step Content                                                     */}
      {/* --------------------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {/* ============================================================= */}
        {/* Step 1: Basic Info                                             */}
        {/* ============================================================= */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Awesome Template"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                type="text"
                value={state.slug}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "slug",
                    value: e.target.value,
                  })
                }
                placeholder="my-awesome-template"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Template Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Type
              </label>
              <select
                value={state.templateType}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "templateType",
                    value: e.target.value,
                  })
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

            {/* Framework */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Framework
              </label>
              <select
                value={state.framework}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "framework",
                    value: e.target.value,
                  })
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

            {/* Short Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Short Description
              </label>
              <textarea
                value={state.shortDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    dispatch({
                      type: "SET_FIELD",
                      field: "shortDescription",
                      value: e.target.value,
                    });
                  }
                }}
                rows={2}
                placeholder="A brief overview of the template..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                {state.shortDescription.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={state.description}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "description",
                    value: e.target.value,
                  })
                }
                rows={5}
                placeholder="Detailed description of the template..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* TypeScript toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "hasTypeScript",
                    value: !state.hasTypeScript,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.hasTypeScript ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    state.hasTypeScript ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Has TypeScript
              </span>
            </div>

            {/* Node Version */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Node Version
              </label>
              <input
                type="text"
                value={state.nodeVersion}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "nodeVersion",
                    value: e.target.value,
                  })
                }
                placeholder="18.x"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Package Manager */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Package Manager
              </label>
              <select
                value={state.packageManager}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "packageManager",
                    value: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select package manager...</option>
                <option value={PackageManager.NPM}>npm</option>
                <option value={PackageManager.YARN}>yarn</option>
                <option value={PackageManager.PNPM}>pnpm</option>
                <option value={PackageManager.BUN}>bun</option>
              </select>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* Step 2: Media                                                  */}
        {/* ============================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Media & Links
            </h2>

            {/* Featured Image URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Image URL
              </label>
              <input
                type="url"
                value={state.featuredImage}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "featuredImage",
                    value: e.target.value,
                  })
                }
                placeholder="https://example.com/image.png"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {state.featuredImage ? (
                <div className="mt-2 h-32 w-48 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.featuredImage}
                    alt="Featured preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2 flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <ImageIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>

            {/* Preview Images */}
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
                  onClick={handleAddPreviewImage}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              {state.previewImages.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {state.previewImages.map((url, index) => (
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
                          dispatch({
                            type: "REMOVE_PREVIEW_IMAGE",
                            index,
                          })
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

            {/* GitHub Repo URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub Repo URL
              </label>
              <input
                type="url"
                value={state.githubRepoUrl}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "githubRepoUrl",
                    value: e.target.value,
                  })
                }
                placeholder="https://github.com/user/repo"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Documentation URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Documentation URL
              </label>
              <input
                type="url"
                value={state.documentationUrl}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "documentationUrl",
                    value: e.target.value,
                  })
                }
                placeholder="https://docs.example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Changelog URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Changelog URL
              </label>
              <input
                type="url"
                value={state.changelogUrl}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "changelogUrl",
                    value: e.target.value,
                  })
                }
                placeholder="https://example.com/changelog"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* Step 3: Demos                                                  */}
        {/* ============================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Demos
            </h2>

            {state.demos.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No demos added yet. Click the button below to add one.
              </p>
            )}

            {state.demos.map((demo, index) => (
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
                      dispatch({ type: "REMOVE_DEMO", index })
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
                        dispatch({
                          type: "UPDATE_DEMO",
                          index,
                          field: "name",
                          value: e.target.value,
                        })
                      }
                      placeholder="Main Demo"
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
                        dispatch({
                          type: "UPDATE_DEMO",
                          index,
                          field: "demoUrl",
                          value: e.target.value,
                        })
                      }
                      placeholder="https://demo.example.com"
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
                        dispatch({
                          type: "UPDATE_DEMO",
                          index,
                          field: "screenshotUrl",
                          value: e.target.value,
                        })
                      }
                      placeholder="https://example.com/screenshot.png"
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
                        dispatch({
                          type: "UPDATE_DEMO",
                          index,
                          field: "sortOrder",
                          value: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => dispatch({ type: "ADD_DEMO" })}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Add Demo
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* Step 4: Features & Tech                                        */}
        {/* ============================================================= */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Features & Technology
            </h2>

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
                      state.features.includes(feature)
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-750"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={state.features.includes(feature)}
                      onChange={() =>
                        dispatch({ type: "TOGGLE_FEATURE", feature })
                      }
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
                            handleAddTechStack(key);
                          }
                        }}
                        placeholder={`Add ${label.toLowerCase()} technology...`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTechStack(key)}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Add
                      </button>
                    </div>
                    {state.techStack[key].length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {state.techStack[key].map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "REMOVE_TECH_STACK",
                                  category: key,
                                  index,
                                })
                              }
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
                      checked={state.browserSupport.includes(browser)}
                      onChange={() =>
                        dispatch({ type: "TOGGLE_BROWSER", browser })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {browser}
                  </label>
                ))}
              </div>
            </div>

            {/* Responsive Breakpoints */}
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
                      checked={state.responsiveBreakpoints[key]}
                      onChange={() =>
                        dispatch({ type: "TOGGLE_RESPONSIVE", key })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Page Count & Component Count */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={state.pageCount}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "pageCount",
                      value: Number(e.target.value),
                    })
                  }
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
                  value={state.componentCount}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "componentCount",
                      value: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* Step 5: Pricing & Publish                                      */}
        {/* ============================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pricing & Publish
            </h2>

            {/* License Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                License Type
              </label>
              <select
                value={state.license}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "license",
                    value: e.target.value,
                  })
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

            {/* Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={state.price}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "price",
                      value: Number(e.target.value),
                    })
                  }
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
                  value={state.compareAtPrice}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "compareAtPrice",
                      value: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Support Duration */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Support Duration (months)
              </label>
              <input
                type="number"
                min={0}
                value={state.supportDuration}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "supportDuration",
                    value: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={state.status}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "status",
                    value: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={WebTemplateStatus.DRAFT}>Draft</option>
                <option value={WebTemplateStatus.PUBLISHED}>Published</option>
                <option value={WebTemplateStatus.COMING_SOON}>
                  Coming Soon
                </option>
              </select>
            </div>

            {/* Summary Preview */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Summary
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Title</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.title || "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Slug</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.slug || "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.templateType
                      ? TEMPLATE_TYPE_LABELS[
                          state.templateType as TemplateType
                        ]
                      : "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Framework
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.framework
                      ? FRAMEWORK_LABELS[state.framework as Framework]
                      : "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    ${state.price.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">License</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.license || "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Features
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.features.length > 0
                      ? state.features.join(", ")
                      : "---"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Demos</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.demos.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {state.status}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Create Button */}
            <button
              type="button"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Navigation Buttons                                               */}
      {/* --------------------------------------------------------------- */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            currentStep === 0
              ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < STEP_LABELS.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
