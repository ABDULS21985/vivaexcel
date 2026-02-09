import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  fetchTemplateBySlug,
  fetchRelatedTemplates,
} from '../../../../../lib/template-api';
import { LivePreviewFrame } from '../../../../../components/templates/live-preview-frame';
import { FeatureGrid } from '../../../../../components/templates/feature-grid';
import { TechStackDiagram } from '../../../../../components/templates/tech-stack-diagram';
import { LicenseComparisonTable } from '../../../../../components/templates/license-comparison-table';
import { DeployButton } from '../../../../../components/templates/deploy-button';
import { FrameworkBadge } from '../../../../../components/templates/framework-badge';
import { RelatedTemplates } from '../../../../../components/templates/related-templates';
import {
  TEMPLATE_TYPE_LABELS,
  LICENSE_TYPE_LABELS,
} from '../../../../../types/web-template';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await fetchTemplateBySlug(slug);
  if (!template) return { title: 'Template Not Found' };

  return {
    title: `${template.title} | KTBlog Templates`,
    description: template.seoDescription || template.shortDescription || template.description?.slice(0, 160),
    keywords: template.seoKeywords,
    openGraph: {
      title: template.seoTitle || template.title,
      description: template.seoDescription || template.shortDescription || '',
      images: template.featuredImage ? [{ url: template.featuredImage }] : [],
    },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await fetchTemplateBySlug(slug);
  if (!template) notFound();

  const relatedTemplates = await fetchRelatedTemplates(template, 4);

  const discount =
    template.compareAtPrice && template.compareAtPrice > template.price
      ? Math.round((1 - template.price / template.compareAtPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/store" className="hover:text-gray-700 dark:hover:text-gray-300">
              Store
            </Link>
            <span>/</span>
            <Link href="/store/templates" className="hover:text-gray-700 dark:hover:text-gray-300">
              Templates
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{template.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <FrameworkBadge framework={template.framework} />
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {TEMPLATE_TYPE_LABELS[template.templateType]}
              </span>
              {template.isFeatured && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  Featured
                </span>
              )}
              {template.hasTypeScript && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  TypeScript
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white lg:text-4xl">
              {template.title}
            </h1>
            {template.shortDescription && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {template.shortDescription}
              </p>
            )}
            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{template.downloadCount} downloads</span>
              <span>{template.viewCount} views</span>
              <span>{template.totalReviews} reviews</span>
              {template.pageCount > 0 && <span>{template.pageCount} pages</span>}
              {template.componentCount > 0 && <span>{template.componentCount} components</span>}
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col items-end gap-3 lg:min-w-[250px]">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${Number(template.price).toFixed(2)}
              </span>
              {template.compareAtPrice && template.compareAtPrice > template.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${Number(template.compareAtPrice).toFixed(2)}
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-700">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {LICENSE_TYPE_LABELS[template.license]} license • {template.supportDuration || 6}mo support
            </span>
            <button className="w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
              Add to Cart
            </button>
            <button className="w-full rounded-lg border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              Buy Now
            </button>

            {/* Deploy Buttons */}
            {template.githubRepoUrl && (
              <div className="flex w-full gap-2">
                <DeployButton provider="vercel" repoUrl={template.githubRepoUrl} className="flex-1 justify-center text-xs" />
                <DeployButton provider="netlify" repoUrl={template.githubRepoUrl} className="flex-1 justify-center text-xs" />
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        {template.demoUrl && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Live Preview
            </h2>
            <LivePreviewFrame url={template.demoUrl} title={template.title} />

            {/* Demo Variants */}
            {template.demos && template.demos.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {template.demos.map((demo) => (
                  <a
                    key={demo.id}
                    href={demo.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {demo.name}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Description */}
        {template.description && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Description
            </h2>
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: template.description }}
            />
          </section>
        )}

        {/* Features */}
        {template.features.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Features
            </h2>
            <FeatureGrid features={template.features} columns={4} />
          </section>
        )}

        {/* Tech Stack */}
        {template.techStack && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Tech Stack
            </h2>
            <TechStackDiagram techStack={template.techStack} />
          </section>
        )}

        {/* Template Info */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Template Details
          </h2>
          <div className="grid gap-4 rounded-xl border border-gray-200 p-6 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3">
            {template.pageCount > 0 && (
              <div>
                <span className="text-sm text-gray-500">Pages</span>
                <p className="font-semibold text-gray-900 dark:text-white">{template.pageCount}</p>
              </div>
            )}
            {template.componentCount > 0 && (
              <div>
                <span className="text-sm text-gray-500">Components</span>
                <p className="font-semibold text-gray-900 dark:text-white">{template.componentCount}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">TypeScript</span>
              <p className="font-semibold text-gray-900 dark:text-white">{template.hasTypeScript ? 'Yes' : 'No'}</p>
            </div>
            {template.nodeVersion && (
              <div>
                <span className="text-sm text-gray-500">Node Version</span>
                <p className="font-semibold text-gray-900 dark:text-white">{template.nodeVersion}</p>
              </div>
            )}
            {template.packageManager && (
              <div>
                <span className="text-sm text-gray-500">Package Manager</span>
                <p className="font-semibold text-gray-900 dark:text-white">{template.packageManager}</p>
              </div>
            )}
            {template.browserSupport.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Browser Support</span>
                <p className="font-semibold text-gray-900 dark:text-white">{template.browserSupport.join(', ')}</p>
              </div>
            )}
            {template.responsiveBreakpoints && (
              <div>
                <span className="text-sm text-gray-500">Responsive</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {[
                    template.responsiveBreakpoints.mobile && 'Mobile',
                    template.responsiveBreakpoints.tablet && 'Tablet',
                    template.responsiveBreakpoints.desktop && 'Desktop',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Support Duration</span>
              <p className="font-semibold text-gray-900 dark:text-white">{template.supportDuration || 6} months</p>
            </div>
            {template.documentationUrl && (
              <div>
                <span className="text-sm text-gray-500">Documentation</span>
                <a href={template.documentationUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold text-blue-600 hover:underline">
                  View Docs
                </a>
              </div>
            )}
            {template.changelogUrl && (
              <div>
                <span className="text-sm text-gray-500">Changelog</span>
                <a href={template.changelogUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold text-blue-600 hover:underline">
                  View Changes
                </a>
              </div>
            )}
          </div>
        </section>

        {/* License Comparison */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            License Options
          </h2>
          <LicenseComparisonTable
            basePrice={Number(template.price)}
            currency={template.currency}
            currentLicense={template.license}
          />
        </section>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/store/templates?tagSlug=${tag.slug}`}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Templates */}
        <RelatedTemplates templates={relatedTemplates} />
      </div>
    </div>
  );
}
