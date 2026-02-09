import { Metadata } from 'next';
import { fetchStarterKits } from '../../../../../lib/template-api';
import { TemplateCard } from '../../../../../components/templates/template-card';

export const metadata: Metadata = {
  title: 'Startup Starter Kits | KTBlog Store',
  description:
    'Curated startup solution packages - everything you need to launch your startup fast.',
};

export default async function StarterKitsPage() {
  const starterKits = await fetchStarterKits(24);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Startup Starter Kits
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Curated solution packages with everything you need to launch your startup.
            Pre-built authentication, payments, dashboards, and more.
          </p>
        </div>
      </section>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {starterKits.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Coming Soon
            </h2>
            <p className="mt-2 text-gray-500">
              Starter kits are being prepared. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {starterKits.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
