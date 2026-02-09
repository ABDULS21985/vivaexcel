import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";

/* ===========================================
   404 NOT FOUND PAGE
   Blog-branded, clean, minimal design
   =========================================== */

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent-orange/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full text-center relative z-10">
        {/* CSS-based illustration — stacked books with a question mark */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          {/* Floating question mark */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-7xl font-bold text-primary/20 animate-float select-none">
            ?
          </div>

          {/* Book stack */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <div className="w-24 h-4 rounded-sm bg-primary/30 rotate-[-3deg]" />
            <div className="w-28 h-4 rounded-sm bg-accent-orange/30 rotate-[2deg]" />
            <div className="w-20 h-4 rounded-sm bg-info/30 rotate-[-1deg]" />
            <div className="w-26 h-4 rounded-sm bg-success/30 rotate-[1deg]" />
          </div>

          {/* Orbiting dot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-40 h-40 animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40" />
            </div>
          </div>
        </div>

        {/* Large 404 */}
        <div className="relative mb-6">
          <p className="text-[8rem] md:text-[10rem] font-bold leading-none text-foreground/5 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-5xl md:text-6xl font-bold text-gradient-primary">
              404
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Search hint */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-1 dark:bg-surface-1 rounded-full border border-border text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>Try searching for what you need</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-[#2558C8] hover:to-[#1945A0] transition-all shadow-md shadow-primary/20 btn-press"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary bg-transparent rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Browse All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
