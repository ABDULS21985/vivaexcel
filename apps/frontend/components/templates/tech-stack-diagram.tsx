'use client';

import { motion } from 'framer-motion';

interface TechStackDiagramProps {
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  };
}

const SECTION_ICONS: Record<string, string> = {
  frontend: '🎨',
  backend: '⚙️',
  database: '🗃️',
  hosting: '☁️',
  services: '🔧',
};

const SECTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  frontend: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
  backend: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
  database: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
  hosting: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  services: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300' },
};

export function TechStackDiagram({ techStack }: TechStackDiagramProps) {
  const sections = Object.entries(techStack).filter(
    ([, items]) => items && items.length > 0,
  );

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map(([key, items], index) => {
        const colors = SECTION_COLORS[key] || SECTION_COLORS.services;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">{SECTION_ICONS[key] || '📦'}</span>
              <h4 className={`text-sm font-semibold capitalize ${colors.text}`}>
                {key}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800/70 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
