"use client";

import { AuthProvider as AuthContextProvider } from "../contexts/auth-context";

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Auth Provider Wrapper
 *
 * This component wraps the application with the authentication context.
 * It should be placed high in the component tree, typically in the root layout.
 *
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
    return <AuthContextProvider>{children}</AuthContextProvider>;
}

export default AuthProvider;
