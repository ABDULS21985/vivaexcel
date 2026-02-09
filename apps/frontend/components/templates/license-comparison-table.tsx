'use client';

import { TemplateLicenseType, LICENSE_TYPE_LABELS } from '../../types/web-template';

interface LicenseComparisonTableProps {
  basePrice: number;
  currency?: string;
  currentLicense?: TemplateLicenseType;
  onSelect?: (license: TemplateLicenseType) => void;
}

const LICENSE_TIERS = [
  {
    type: TemplateLicenseType.SINGLE_USE,
    multiplier: 1,
    activations: 1,
    support: '6 months',
    features: ['Single project', 'Free updates for 6 months', 'Basic support'],
  },
  {
    type: TemplateLicenseType.MULTI_USE,
    multiplier: 2.5,
    activations: 5,
    support: '12 months',
    features: [
      'Up to 5 projects',
      'Free updates for 12 months',
      'Priority support',
      'Team usage',
    ],
    popular: true,
  },
  {
    type: TemplateLicenseType.EXTENDED,
    multiplier: 5,
    activations: 25,
    support: '24 months',
    features: [
      'Up to 25 projects',
      'Free updates for 24 months',
      'Priority support',
      'Team usage',
      'SaaS/product usage',
      'Resale rights',
    ],
  },
  {
    type: TemplateLicenseType.UNLIMITED,
    multiplier: 10,
    activations: 999,
    support: 'Lifetime',
    features: [
      'Unlimited projects',
      'Lifetime updates',
      'Premium support',
      'Team usage',
      'SaaS/product usage',
      'Resale rights',
      'White-label rights',
    ],
  },
];

export function LicenseComparisonTable({
  basePrice,
  currency = 'USD',
  currentLicense,
  onSelect,
}: LicenseComparisonTableProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {LICENSE_TIERS.map((tier) => {
        const price = basePrice * tier.multiplier;
        const isSelected = currentLicense === tier.type;

        return (
          <div
            key={tier.type}
            className={`relative flex flex-col rounded-xl border-2 p-5 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50/50 shadow-lg dark:border-blue-400 dark:bg-blue-950/20'
                : tier.popular
                  ? 'border-purple-300 dark:border-purple-600'
                  : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {LICENSE_TYPE_LABELS[tier.type]}
            </h3>

            <div className="mt-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {formatter.format(price)}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tier.activations === 999
                ? 'Unlimited'
                : `Up to ${tier.activations}`}{' '}
              activations
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tier.support} support
            </p>

            <ul className="mt-4 flex-1 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {onSelect && (
              <button
                onClick={() => onSelect(tier.type)}
                className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : tier.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                }`}
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
