"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

// =============================================================================
// Protected Route Wrapper
// =============================================================================
// Wraps pages that require authentication.
// Shows a loading spinner while checking auth, redirects to /login if
// the user is not authenticated, and passes user data to children.

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional: required subscription tier to access this content */
  requiredPlan?: "basic" | "pro" | "premium";
}

export function ProtectedRoute({
  children,
  requiredPlan,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Check plan access if required
    if (requiredPlan && user) {
      const planHierarchy = ["free", "basic", "pro", "premium"];
      const userLevel = planHierarchy.indexOf(user.plan);
      const requiredLevel = planHierarchy.indexOf(requiredPlan);

      if (userLevel < requiredLevel) {
        router.push("/membership");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredPlan, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Plan check failed
  if (requiredPlan && user) {
    const planHierarchy = ["free", "basic", "pro", "premium"];
    const userLevel = planHierarchy.indexOf(user.plan);
    const requiredLevel = planHierarchy.indexOf(requiredPlan);

    if (userLevel < requiredLevel) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[var(--muted-foreground)]">
              Redirecting to membership page...
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
