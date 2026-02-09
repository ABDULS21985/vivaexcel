"use client";

import { useAuthContext, type AuthContextType } from "../contexts/auth-context";

/**
 * useAuth Hook
 *
 * A convenience hook for accessing the authentication context.
 * Provides access to authentication state and methods.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, login, logout, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login({ email, password })}>Login</button>;
 *   }
 *
 *   return <button onClick={logout}>Logout</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
    return useAuthContext();
}

/**
 * useIsAuthenticated Hook
 *
 * A simplified hook that only returns the authentication status.
 * Useful for conditional rendering based on auth state.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const isAuthenticated = useIsAuthenticated();
 *
 *   return (
 *     <nav>
 *       {isAuthenticated ? <UserMenu /> : <LoginButton />}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
    const { isAuthenticated } = useAuthContext();
    return isAuthenticated;
}

/**
 * useAuthLoading Hook
 *
 * Returns the loading state of authentication operations.
 * Useful for showing loading indicators during auth actions.
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const isLoading = useAuthLoading();
 *   return <button disabled={isLoading}>Login</button>;
 * }
 * ```
 */
export function useAuthLoading(): boolean {
    const { isLoading } = useAuthContext();
    return isLoading;
}

/**
 * useAuthError Hook
 *
 * Returns the current authentication error, if any.
 *
 * @example
 * ```tsx
 * function ErrorDisplay() {
 *   const error = useAuthError();
 *   if (!error) return null;
 *   return <div className="error">{error}</div>;
 * }
 * ```
 */
export function useAuthError(): string | null {
    const { error } = useAuthContext();
    return error;
}

export default useAuth;
