/* ===========================================
   LOADING PAGE
   Blog-branded loading state with spinner
   =========================================== */

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {/* Spinner */}
      <div className="relative w-12 h-12 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-surface-3 dark:border-surface-3" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>

      {/* Brand text */}
      <p className="text-lg font-semibold text-foreground tracking-tight">
        KTBlog
      </p>
      <p className="text-sm text-muted-foreground mt-1">Loading...</p>
    </div>
  );
}
