'use client';

interface DeployButtonProps {
  provider: 'vercel' | 'netlify' | 'railway';
  repoUrl?: string;
  templateUrl?: string;
  className?: string;
}

const PROVIDERS = {
  vercel: {
    label: 'Deploy to Vercel',
    baseUrl: 'https://vercel.com/new/clone',
    bg: 'bg-black hover:bg-gray-900',
    text: 'text-white',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    ),
  },
  netlify: {
    label: 'Deploy to Netlify',
    baseUrl: 'https://app.netlify.com/start/deploy',
    bg: 'bg-[#00C7B7] hover:bg-[#00B4A6]',
    text: 'text-white',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.934 8.519a1.044 1.044 0 0 1 .303.23l2.349-1.045-.002-.063a1.529 1.529 0 0 0-.376-.95l-1.06-1.06a1.527 1.527 0 0 0-.94-.371l-.063-.002-1.05 2.353a1.038 1.038 0 0 1 .233.299l.606.61z" />
        <path d="M12.076 9.26l-.007.06a1.535 1.535 0 0 0 1.574 1.574l.06-.007 3.996-1.78-1.1-1.1z" />
        <path d="M17.678 11.267l-1.04-1.04-3.544 1.577a1.527 1.527 0 0 0 .386.456l3.478 3.478 1.2-.534-.004-.062a1.524 1.524 0 0 0-.377-.947z" />
        <path d="M7.636 12.088l1.532 1.532 1.574-3.547a1.527 1.527 0 0 0-.457-.387L6.81 6.21l-.534 1.2.062.004c.374.04.714.201.947.377z" />
      </svg>
    ),
  },
  railway: {
    label: 'Deploy on Railway',
    baseUrl: 'https://railway.app/template',
    bg: 'bg-[#0B0D0E] hover:bg-[#1A1C1E]',
    text: 'text-white',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.113 11.587c0 .223.146.867.18 1.04l8.59 1.604-.18-3.464-8.59.82z" />
        <path d="M1.063 15.511c.063.122.746 1.255.834 1.377L12.25 13.2l-.575-3.64z" />
        <path d="M13.191 16.94l9.746-5.627c.063-.304.063-.82.063-1.125 0-.162 0-.446-.009-.593l-9.352.737z" />
      </svg>
    ),
  },
};

export function DeployButton({
  provider,
  repoUrl,
  templateUrl,
  className = '',
}: DeployButtonProps) {
  const config = PROVIDERS[provider];
  if (!config) return null;

  let deployUrl = config.baseUrl;
  if (provider === 'vercel' && repoUrl) {
    deployUrl = `${config.baseUrl}?repository-url=${encodeURIComponent(repoUrl)}`;
  } else if (provider === 'netlify' && repoUrl) {
    deployUrl = `${config.baseUrl}?repository=${encodeURIComponent(repoUrl)}`;
  } else if (templateUrl) {
    deployUrl = templateUrl;
  }

  return (
    <a
      href={deployUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${config.bg} ${config.text} ${className}`}
    >
      {config.icon}
      {config.label}
    </a>
  );
}
