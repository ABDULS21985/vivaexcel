"use client";

import { useMemo } from "react";
import { useAuthContext, type User } from "../contexts/auth-context";

/**
 * User data with computed properties
 */
export interface UserData extends User {
    initials: string;
    displayName: string;
    isAdmin: boolean;
}

/**
 * useUser Hook
 *
 * A hook for accessing the current user's data with computed properties.
 * Returns null if no user is authenticated.
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useUser();
 *
 *   if (!user) return <p>Not logged in</p>;
 *
 *   return (
 *     <div>
 *       <Avatar initials={user.initials} />
 *       <h2>{user.displayName}</h2>
 *       <p>{user.email}</p>
 *       {user.isAdmin && <AdminBadge />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(): UserData | null {
    const { user } = useAuthContext();

    return useMemo(() => {
        if (!user) return null;

        // Compute initials from name
        const nameParts = user.name?.split(" ") || [];
        const initials =
            nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : (user.name?.substring(0, 2) || user.email.substring(0, 2)).toUpperCase();

        // Compute display name
        const displayName = user.name || user.email.split("@")[0];

        // Check if user is admin
        const isAdmin = user.roles?.some(role =>
            role === "admin" ||
            role === "super_admin" ||
            role === "administrator" ||
            role === "superadmin"
        ) || false;

        return {
            ...user,
            initials,
            displayName,
            isAdmin,
        };
    }, [user]);
}

/**
 * useUserRole Hook
 *
 * Returns the current user's role.
 *
 * @example
 * ```tsx
 * function RoleBasedContent() {
 *   const role = useUserRole();
 *
 *   if (role === 'admin') return <AdminDashboard />;
 *   if (role === 'editor') return <EditorDashboard />;
 *   return <UserDashboard />;
 * }
 * ```
 */
export function useUserRole(): string | null {
    const { user } = useAuthContext();
    return user?.roles && user.roles.length > 0 ? user.roles[0] : null;
}

/**
 * useIsAdmin Hook
 *
 * Returns whether the current user has admin privileges.
 *
 * @example
 * ```tsx
 * function DeleteButton({ onDelete }) {
 *   const isAdmin = useIsAdmin();
 *
 *   if (!isAdmin) return null;
 *
 *   return <button onClick={onDelete}>Delete</button>;
 * }
 * ```
 */
export function useIsAdmin(): boolean {
    const { user } = useAuthContext();

    if (!user || !user.roles) return false;

    return user.roles.some(role =>
        role === "admin" ||
        role === "super_admin" ||
        role === "administrator" ||
        role === "superadmin"
    );
}

/**
 * useHasRole Hook
 *
 * Check if the current user has one of the specified roles.
 *
 * @param allowedRoles - Array of roles to check against
 * @returns boolean indicating if user has one of the allowed roles
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const canAccessSettings = useHasRole(['admin', 'manager']);
 *
 *   if (!canAccessSettings) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <Settings />;
 * }
 * ```
 */
export function useHasRole(allowedRoles: string[]): boolean {
    const { user } = useAuthContext();

    if (!user || !user.roles) return false;

    return user.roles.some(role => allowedRoles.includes(role));
}

export default useUser;
