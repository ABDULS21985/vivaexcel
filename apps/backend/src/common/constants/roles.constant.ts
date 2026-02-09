/**
 * User roles in the system
 * Ordered from highest to lowest privilege
 */
export enum Role {
  /** Super administrator with full system access */
  SUPER_ADMIN = 'super_admin',
  /** Administrator with organization-level access */
  ADMIN = 'admin',
  /** Editor with content modification rights */
  EDITOR = 'editor',
  /** Viewer with read-only access */
  VIEWER = 'viewer',
}

/**
 * Role hierarchy levels (higher number = more privileges)
 */
export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.ADMIN]: 75,
  [Role.EDITOR]: 50,
  [Role.VIEWER]: 25,
};

/**
 * Role display names for UI
 */
export const RoleDisplayName: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Administrator',
  [Role.ADMIN]: 'Administrator',
  [Role.EDITOR]: 'Editor',
  [Role.VIEWER]: 'Viewer',
};

/**
 * Role descriptions
 */
export const RoleDescription: Record<Role, string> = {
  [Role.SUPER_ADMIN]:
    'Full system access including user management and system configuration',
  [Role.ADMIN]:
    'Organization-level access including team and project management',
  [Role.EDITOR]: 'Can create, edit, and delete content within assigned scope',
  [Role.VIEWER]: 'Read-only access to assigned content',
};

/**
 * Array of all roles ordered by hierarchy (highest to lowest)
 */
export const AllRoles: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EDITOR,
  Role.VIEWER,
];

/**
 * Array of admin roles (super_admin and admin)
 */
export const AdminRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

/**
 * Array of content management roles (editor and above)
 */
export const ContentRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR];

/**
 * Default role for new users
 */
export const DefaultRole: Role = Role.VIEWER;

/**
 * Checks if a role has equal or higher privilege than another role
 * @param userRole - The user's role
 * @param requiredRole - The required role
 * @returns True if userRole has equal or higher privilege
 */
export function hasRolePrivilege(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

/**
 * Checks if a role is an admin role (super_admin or admin)
 * @param role - The role to check
 * @returns True if the role is an admin role
 */
export function isAdminRole(role: Role): boolean {
  return AdminRoles.includes(role);
}

/**
 * Checks if a role can manage content (editor or higher)
 * @param role - The role to check
 * @returns True if the role can manage content
 */
export function canManageContent(role: Role): boolean {
  return ContentRoles.includes(role);
}

/**
 * Gets all roles that a user with the given role can assign
 * A user can only assign roles lower than their own
 * @param userRole - The user's role
 * @returns Array of assignable roles
 */
export function getAssignableRoles(userRole: Role): Role[] {
  const userLevel = RoleHierarchy[userRole];
  return AllRoles.filter((role) => RoleHierarchy[role] < userLevel);
}

/**
 * Gets all roles that a user with the given role can manage
 * A user can manage roles equal to or lower than their own
 * @param userRole - The user's role
 * @returns Array of manageable roles
 */
export function getManageableRoles(userRole: Role): Role[] {
  const userLevel = RoleHierarchy[userRole];
  return AllRoles.filter((role) => RoleHierarchy[role] <= userLevel);
}

/**
 * Validates if a role string is a valid Role enum value
 * @param role - The role string to validate
 * @returns True if the role is valid
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

/**
 * Gets the highest role from an array of roles
 * @param roles - Array of roles
 * @returns The highest privileged role, or undefined if array is empty
 */
export function getHighestRole(roles: Role[]): Role | undefined {
  if (roles.length === 0) return undefined;

  return roles.reduce((highest, current) =>
    RoleHierarchy[current] > RoleHierarchy[highest] ? current : highest,
  );
}

/**
 * Gets the lowest role from an array of roles
 * @param roles - Array of roles
 * @returns The lowest privileged role, or undefined if array is empty
 */
export function getLowestRole(roles: Role[]): Role | undefined {
  if (roles.length === 0) return undefined;

  return roles.reduce((lowest, current) =>
    RoleHierarchy[current] < RoleHierarchy[lowest] ? current : lowest,
  );
}
