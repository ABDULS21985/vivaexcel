"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/* ===========================================
   ERROR PAGE
   Clean, blog-branded error boundary
   =========================================== */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-error/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error icon */}
        <div className="relative mx-auto w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-error/10 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-error/20" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-error to-error-dark flex items-center justify-center shadow-lg shadow-error/20">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Please try again, or return to the
          homepage if the problem persists.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-[#2558C8] hover:to-[#1945A0] transition-all shadow-md shadow-primary/20 btn-press"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary bg-transparent rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
