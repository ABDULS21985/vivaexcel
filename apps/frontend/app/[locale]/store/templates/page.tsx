import { Metadata } from 'next';
import { fetchTemplates, fetchTemplateCategories } from '../../../../lib/template-api';
import { TemplateListingClient } from '../../../../components/templates/template-listing-client';

export const metadata: Metadata = {
  title: 'Web Templates & Starter Kits | KTBlog Store',
  description:
    'Browse premium website templates, SaaS boilerplates, landing page kits, and startup toolkits. Built with Next.js, React, Vue, and more.',
  openGraph: {
    title: 'Web Templates & Starter Kits | KTBlog Store',
    description:
      'Browse premium website templates, SaaS boilerplates, landing page kits, and startup toolkits.',
  },
};

export default async function TemplatesPage() {
  const [templatesData, categories] = await Promise.all([
    fetchTemplates({ limit: 24, sortBy: 'createdAt', sortOrder: 'DESC' }),
    fetchTemplateCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Web Templates &amp; Starter Kits
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Premium website templates, SaaS boilerplates, landing page kits, and
            startup toolkits. Launch your next project in minutes, not months.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-white/90">
            <div className="text-center">
              <span className="block text-3xl font-bold">
                {templatesData.meta?.total ?? templatesData.items.length}+
              </span>
              <span className="text-sm">Templates</span>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <span className="block text-3xl font-bold">12+</span>
              <span className="text-sm">Frameworks</span>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <span className="block text-3xl font-bold">{categories.length}+</span>
              <span className="text-sm">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Listing */}
      <TemplateListingClient
        initialTemplates={templatesData.items}
        initialTotal={templatesData.meta?.total ?? templatesData.items.length}
      />
    </div>
  );
}
