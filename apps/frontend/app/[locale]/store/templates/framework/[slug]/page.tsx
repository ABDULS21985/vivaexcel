import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchTemplatesByFramework } from '../../../../../../lib/template-api';
import { TemplateCard } from '../../../../../../components/templates/template-card';
import { Framework, FRAMEWORK_LABELS } from '../../../../../../types/web-template';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const FRAMEWORK_SLUG_MAP: Record<string, Framework> = {
  nextjs: Framework.NEXTJS,
  react: Framework.REACT,
  vue: Framework.VUE,
  nuxt: Framework.NUXT,
  svelte: Framework.SVELTE,
  astro: Framework.ASTRO,
  angular: Framework.ANGULAR,
  'html-css': Framework.HTML_CSS,
  tailwind: Framework.TAILWIND,
  bootstrap: Framework.BOOTSTRAP,
  wordpress: Framework.WORDPRESS,
  shopify: Framework.SHOPIFY,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const framework = FRAMEWORK_SLUG_MAP[slug];
  if (!framework) return { title: 'Framework Not Found' };

  const label = FRAMEWORK_LABELS[framework];
  return {
    title: `${label} Templates | KTBlog Store`,
    description: `Browse premium ${label} templates, boilerplates, and starter kits.`,
  };
}

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const framework = FRAMEWORK_SLUG_MAP[slug];
  if (!framework) notFound();

  const label = FRAMEWORK_LABELS[framework];
  const templates = await fetchTemplatesByFramework(framework, 24);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/store" className="hover:text-gray-700">Store</Link>
            <span>/</span>
            <Link href="/store/templates" className="hover:text-gray-700">Templates</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{label}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {label} Templates
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {templates.length} templates built with {label}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {templates.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              No templates found
            </h2>
            <p className="mt-2 text-gray-500">
              No {label} templates available yet.
            </p>
            <Link
              href="/store/templates"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse All Templates
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
