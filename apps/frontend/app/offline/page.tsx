import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — VivaExcel",
  description: "You are currently offline. Some content may still be available.",
};

/**
 * Small client component for the "Try Again" button, since server components
 * cannot attach browser event handlers.
 */
function TryAgainButton() {
  // We use a simple inline script approach via a form action to avoid
  // needing a separate client component file. However, for proper React
  // hydration we render a client-side script.
  return (
    <button
      id="retry-btn"
      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
      style={{ backgroundColor: "#1E4DB7" }}
    >
      {/* Refresh icon inline SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
      Try Again
    </button>
  );
}

/**
 * Client wrapper that hydrates the retry button with a click handler.
 */
function RetryScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('retry-btn')?.addEventListener('click', function() {
            window.location.reload();
          });
        `,
      }}
    />
  );
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* WifiOff icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1E4DB7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h.01" />
            <path d="M8.5 16.429a5 5 0 0 1 7 0" />
            <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
            <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
            <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
            <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
            <path d="m2 2 20 20" />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className="mb-3 text-3xl font-bold"
          style={{ color: "#1E4DB7" }}
        >
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="mb-8 text-base leading-relaxed text-gray-400">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry,
          some content is available offline.
        </p>

        {/* Try Again button */}
        <TryAgainButton />

        {/* Cached content placeholder grid */}
        <div className="mt-12">
          <p className="mb-4 text-sm font-medium text-gray-500">
            Recently viewed products
          </p>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3h12l4 6-10 13L2 9Z" />
            <path d="M11 3 8 9l4 13 4-13-3-6" />
            <path d="M2 9h20" />
          </svg>
          <span className="text-xs font-medium">VivaExcel</span>
        </div>
      </div>

      {/* Hydration script for the retry button */}
      <RetryScript />
    </div>
  );
}
