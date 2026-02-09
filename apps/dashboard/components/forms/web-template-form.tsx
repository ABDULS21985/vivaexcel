'use client';

import { useState, useEffect } from 'react';

const TEMPLATE_TYPES = [
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'SAAS_BOILERPLATE', label: 'SaaS Boilerplate' },
  { value: 'ECOMMERCE_THEME', label: 'E-commerce Theme' },
  { value: 'PORTFOLIO', label: 'Portfolio' },
  { value: 'BLOG_THEME', label: 'Blog Theme' },
  { value: 'ADMIN_DASHBOARD', label: 'Admin Dashboard' },
  { value: 'MOBILE_APP_TEMPLATE', label: 'Mobile App Template' },
  { value: 'EMAIL_TEMPLATE', label: 'Email Template' },
  { value: 'STARTUP_KIT', label: 'Startup Kit' },
  { value: 'COMPONENT_LIBRARY', label: 'Component Library' },
];

const FRAMEWORKS = [
  { value: 'NEXTJS', label: 'Next.js' },
  { value: 'REACT', label: 'React' },
  { value: 'VUE', label: 'Vue' },
  { value: 'NUXT', label: 'Nuxt' },
  { value: 'SVELTE', label: 'Svelte' },
  { value: 'ASTRO', label: 'Astro' },
  { value: 'ANGULAR', label: 'Angular' },
  { value: 'HTML_CSS', label: 'HTML/CSS' },
  { value: 'TAILWIND', label: 'Tailwind CSS' },
  { value: 'BOOTSTRAP', label: 'Bootstrap' },
  { value: 'WORDPRESS', label: 'WordPress' },
  { value: 'SHOPIFY', label: 'Shopify' },
];

const LICENSE_TYPES = [
  { value: 'SINGLE_USE', label: 'Single Use' },
  { value: 'MULTI_USE', label: 'Multi Use' },
  { value: 'EXTENDED', label: 'Extended' },
  { value: 'UNLIMITED', label: 'Unlimited' },
];

const PACKAGE_MANAGERS = [
  { value: 'NPM', label: 'npm' },
  { value: 'YARN', label: 'Yarn' },
  { value: 'PNPM', label: 'pnpm' },
  { value: 'BUN', label: 'Bun' },
];

const FEATURE_OPTIONS = [
  'Authentication', 'Payments', 'Dark Mode', 'i18n', 'SEO Optimized',
  'Responsive', 'TypeScript', 'API Routes', 'Database', 'Email', 'Analytics', 'CMS',
];

const BROWSER_OPTIONS = ['Chrome', 'Firefox', 'Safari', 'Edge'];

interface WebTemplateFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function WebTemplateForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
}: WebTemplateFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [templateType, setTemplateType] = useState(initialData?.templateType || 'LANDING_PAGE');
  const [framework, setFramework] = useState(initialData?.framework || 'NEXTJS');
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || '');
  const [githubRepoUrl, setGithubRepoUrl] = useState(initialData?.githubRepoUrl || '');
  const [pageCount, setPageCount] = useState(initialData?.pageCount || 0);
  const [componentCount, setComponentCount] = useState(initialData?.componentCount || 0);
  const [hasTypeScript, setHasTypeScript] = useState(initialData?.hasTypeScript || false);
  const [nodeVersion, setNodeVersion] = useState(initialData?.nodeVersion || '');
  const [packageManager, setPackageManager] = useState(initialData?.packageManager || '');
  const [license, setLicense] = useState(initialData?.license || 'SINGLE_USE');
  const [supportDuration, setSupportDuration] = useState(initialData?.supportDuration || 6);
  const [documentationUrl, setDocumentationUrl] = useState(initialData?.documentationUrl || '');
  const [changelogUrl, setChangelogUrl] = useState(initialData?.changelogUrl || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice || '');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.previewImages || []);
  const [browserSupport, setBrowserSupport] = useState<string[]>(initialData?.browserSupport || ['Chrome', 'Firefox', 'Safari', 'Edge']);
  const [responsiveBreakpoints, setResponsiveBreakpoints] = useState(
    initialData?.responsiveBreakpoints || { mobile: true, tablet: true, desktop: true },
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isBestseller, setIsBestseller] = useState(initialData?.isBestseller || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [newPreviewImage, setNewPreviewImage] = useState('');

  // Demo management
  const [demos, setDemos] = useState<Array<{ name: string; demoUrl: string; screenshotUrl: string }>>(
    initialData?.demos || [],
  );
  const [newDemoName, setNewDemoName] = useState('');
  const [newDemoUrl, setNewDemoUrl] = useState('');

  // Tech stack
  const [techFrontend, setTechFrontend] = useState(initialData?.techStack?.frontend?.join(', ') || '');
  const [techBackend, setTechBackend] = useState(initialData?.techStack?.backend?.join(', ') || '');
  const [techDatabase, setTechDatabase] = useState(initialData?.techStack?.database?.join(', ') || '');
  const [techHosting, setTechHosting] = useState(initialData?.techStack?.hosting?.join(', ') || '');
  const [techServices, setTechServices] = useState(initialData?.techStack?.services?.join(', ') || '');

  // Auto-generate slug
  useEffect(() => {
    if (mode === 'create' && title && !initialData?.slug) {
      setSlug(generateSlug(title));
    }
  }, [title, mode, initialData?.slug]);

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature],
    );
  };

  const toggleBrowser = (browser: string) => {
    setBrowserSupport((prev) =>
      prev.includes(browser) ? prev.filter((b) => b !== browser) : [...prev, browser],
    );
  };

  const addPreviewImage = () => {
    if (newPreviewImage) {
      setPreviewImages((prev) => [...prev, newPreviewImage]);
      setNewPreviewImage('');
    }
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addDemo = () => {
    if (newDemoName && newDemoUrl) {
      setDemos((prev) => [...prev, { name: newDemoName, demoUrl: newDemoUrl, screenshotUrl: '' }]);
      setNewDemoName('');
      setNewDemoUrl('');
    }
  };

  const removeDemo = (index: number) => {
    setDemos((prev) => prev.filter((_, i) => i !== index));
  };

  const parseTechList = (str: string): string[] =>
    str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    const data: any = {
      title,
      slug,
      description,
      shortDescription,
      templateType,
      framework,
      features,
      demoUrl: demoUrl || undefined,
      githubRepoUrl: githubRepoUrl || undefined,
      techStack: {
        frontend: parseTechList(techFrontend),
        backend: parseTechList(techBackend),
        database: parseTechList(techDatabase),
        hosting: parseTechList(techHosting),
        services: parseTechList(techServices),
      },
      browserSupport,
      responsiveBreakpoints,
      pageCount,
      componentCount,
      hasTypeScript,
      nodeVersion: nodeVersion || undefined,
      packageManager: packageManager || undefined,
      license,
      supportDuration,
      documentationUrl: documentationUrl || undefined,
      changelogUrl: changelogUrl || undefined,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      status,
      featuredImage: featuredImage || undefined,
      previewImages: previewImages.length > 0 ? previewImages : undefined,
      isFeatured,
      isBestseller,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: seoKeywords || undefined,
    };

    await onSubmit(data);
  };

  const stepLabels = ['Info', 'Details', 'Demos', 'Pricing', 'Publish'];

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i + 1)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === i + 1
                  ? 'bg-blue-600 text-white'
                  : step > i + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? '✓' : i + 1}
            </button>
            <span className={`text-xs font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div className={`h-px w-8 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Basic Information</h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="My Awesome Template"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Template Type *</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Framework *</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {FRAMEWORKS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Features</label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    features.includes(feature)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Technical Details */}
      {step === 2 && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Technical Details</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Page Count</label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Component Count</label>
              <input
                type="number"
                value={componentCount}
                onChange={(e) => setComponentCount(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasTypeScript}
                  onChange={(e) => setHasTypeScript(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">TypeScript</span>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Node Version</label>
              <input
                type="text"
                value={nodeVersion}
                onChange={(e) => setNodeVersion(e.target.value)}
                placeholder="18.x"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Package Manager</label>
              <select
                value={packageManager}
                onChange={(e) => setPackageManager(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {PACKAGE_MANAGERS.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Browser Support</label>
            <div className="flex flex-wrap gap-2">
              {BROWSER_OPTIONS.map((browser) => (
                <button
                  key={browser}
                  type="button"
                  onClick={() => toggleBrowser(browser)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    browserSupport.includes(browser)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {browser}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Responsive Breakpoints</label>
            <div className="flex gap-4">
              {['mobile', 'tablet', 'desktop'].map((bp) => (
                <label key={bp} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={responsiveBreakpoints[bp as keyof typeof responsiveBreakpoints]}
                    onChange={(e) =>
                      setResponsiveBreakpoints((prev: any) => ({ ...prev, [bp]: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{bp}</span>
                </label>
              ))}
            </div>
          </div>

          <h3 className="text-md font-semibold">Tech Stack</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Frontend (comma-separated)</label>
              <input type="text" value={techFrontend} onChange={(e) => setTechFrontend(e.target.value)} placeholder="React, Tailwind CSS, Framer Motion" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Backend</label>
              <input type="text" value={techBackend} onChange={(e) => setTechBackend(e.target.value)} placeholder="Node.js, Express" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Database</label>
              <input type="text" value={techDatabase} onChange={(e) => setTechDatabase(e.target.value)} placeholder="PostgreSQL, Redis" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hosting</label>
              <input type="text" value={techHosting} onChange={(e) => setTechHosting(e.target.value)} placeholder="Vercel, AWS" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Services</label>
              <input type="text" value={techServices} onChange={(e) => setTechServices(e.target.value)} placeholder="Stripe, SendGrid, Cloudflare" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">GitHub Repo URL</label>
              <input type="url" value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Documentation URL</label>
              <input type="url" value={documentationUrl} onChange={(e) => setDocumentationUrl(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Changelog URL</label>
            <input type="url" value={changelogUrl} onChange={(e) => setChangelogUrl(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      )}

      {/* Step 3: Demos & Media */}
      {step === 3 && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Demos & Media</h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Primary Demo URL</label>
            <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://demo.example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>

          {/* Demo Variants */}
          <div>
            <label className="mb-2 block text-sm font-medium">Demo Variants</label>
            {demos.map((demo, index) => (
              <div key={index} className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{demo.name}</p>
                  <p className="text-xs text-gray-500">{demo.demoUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDemo(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Demo name (e.g. Dark Mode)"
                value={newDemoName}
                onChange={(e) => setNewDemoName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="url"
                placeholder="Demo URL"
                value={newDemoUrl}
                onChange={(e) => setNewDemoUrl(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addDemo}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="mb-1 block text-sm font-medium">Featured Image URL</label>
            <input type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {featuredImage && (
              <img src={featuredImage} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
            )}
          </div>

          {/* Preview Images */}
          <div>
            <label className="mb-2 block text-sm font-medium">Preview Images</label>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {previewImages.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img} alt="" className="h-20 w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreviewImage(index)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Image URL"
                value={newPreviewImage}
                onChange={(e) => setNewPreviewImage(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button type="button" onClick={addPreviewImage} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {step === 4 && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Pricing & License</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Price *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                step={0.01}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Compare At Price</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                min={0}
                step={0.01}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">License Type</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {LICENSE_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Support Duration (months)</label>
            <input
              type="number"
              value={supportDuration}
              onChange={(e) => setSupportDuration(Number(e.target.value))}
              min={0}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Step 5: Publish */}
      {step === 5 && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Publish Settings</h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-48"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} className="rounded" />
              <span className="text-sm">Bestseller</span>
            </label>
          </div>

          <h3 className="text-md font-semibold">SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">SEO Title</label>
              <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={255} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SEO Description</label>
              <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} maxLength={500} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SEO Keywords</label>
              <input type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="template, nextjs, saas" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700">SEO Preview</h3>
            <div className="mt-2">
              <p className="text-lg font-medium text-blue-700">{seoTitle || title || 'Page Title'}</p>
              <p className="text-sm text-green-700">ktblog.com/store/templates/{slug}</p>
              <p className="text-sm text-gray-600">{seoDescription || shortDescription || 'Page description...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(Math.min(totalSteps, step + 1))}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !title}
              className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
