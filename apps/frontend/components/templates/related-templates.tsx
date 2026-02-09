'use client';

import { WebTemplate } from '../../types/web-template';
import { TemplateCard } from './template-card';

interface RelatedTemplatesProps {
  templates: WebTemplate[];
  title?: string;
}

export function RelatedTemplates({
  templates,
  title = 'Related Templates',
}: RelatedTemplatesProps) {
  if (!templates || templates.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </section>
  );
}
