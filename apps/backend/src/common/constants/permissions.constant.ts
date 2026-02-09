import { Role } from './roles.constant';

/**
 * System permissions organized by domain
 */
export enum Permission {
  // User Management
  /** View user profiles */
  USER_READ = 'user:read',
  /** Create new users */
  USER_CREATE = 'user:create',
  /** Update user information */
  USER_UPDATE = 'user:update',
  /** Delete users */
  USER_DELETE = 'user:delete',
  /** Manage user roles */
  USER_MANAGE_ROLES = 'user:manage_roles',
  /** Impersonate users */
  USER_IMPERSONATE = 'user:impersonate',

  // Organization Management
  /** View organization details */
  ORG_READ = 'org:read',
  /** Create organizations */
  ORG_CREATE = 'org:create',
  /** Update organization settings */
  ORG_UPDATE = 'org:update',
  /** Delete organizations */
  ORG_DELETE = 'org:delete',
  /** Manage organization members */
  ORG_MANAGE_MEMBERS = 'org:manage_members',

  // Project Management
  /** View projects */
  PROJECT_READ = 'project:read',
  /** Create projects */
  PROJECT_CREATE = 'project:create',
  /** Update projects */
  PROJECT_UPDATE = 'project:update',
  /** Delete projects */
  PROJECT_DELETE = 'project:delete',
  /** Manage project settings */
  PROJECT_MANAGE_SETTINGS = 'project:manage_settings',
  /** Publish projects */
  PROJECT_PUBLISH = 'project:publish',

  // Content Management
  /** View content */
  CONTENT_READ = 'content:read',
  /** Create content */
  CONTENT_CREATE = 'content:create',
  /** Update content */
  CONTENT_UPDATE = 'content:update',
  /** Delete content */
  CONTENT_DELETE = 'content:delete',
  /** Publish content */
  CONTENT_PUBLISH = 'content:publish',
  /** Archive content */
  CONTENT_ARCHIVE = 'content:archive',

  // Product Management
  /** View products */
  PRODUCT_READ = 'product:read',
  /** Create products */
  PRODUCT_CREATE = 'product:create',
  /** Update products */
  PRODUCT_UPDATE = 'product:update',
  /** Delete products */
  PRODUCT_DELETE = 'product:delete',

  // Service Management
  /** View services */
  SERVICE_READ = 'service:read',
  /** Create services */
  SERVICE_CREATE = 'service:create',
  /** Update services */
  SERVICE_UPDATE = 'service:update',
  /** Delete services */
  SERVICE_DELETE = 'service:delete',

  // Blog Management
  /** View blog posts */
  BLOG_READ = 'blog:read',
  /** Create blog posts */
  BLOG_CREATE = 'blog:create',
  /** Update blog posts */
  BLOG_UPDATE = 'blog:update',
  /** Delete blog posts */
  BLOG_DELETE = 'blog:delete',
  /** Publish blog posts */
  BLOG_PUBLISH = 'blog:publish',

  // Comment Management
  /** View comments */
  COMMENT_READ = 'comment:read',
  /** Create comments */
  COMMENT_CREATE = 'comment:create',
  /** Update comments */
  COMMENT_UPDATE = 'comment:update',
  /** Delete comments */
  COMMENT_DELETE = 'comment:delete',
  /** Moderate comments */
  COMMENT_MODERATE = 'comment:moderate',

  // Contact Management
  /** View contact submissions */
  CONTACT_READ = 'contact:read',
  /** Update contact submissions */
  CONTACT_UPDATE = 'contact:update',
  /** Delete contact submissions */
  CONTACT_DELETE = 'contact:delete',

  // Job Application Management
  /** View job applications */
  APPLICATION_READ = 'application:read',
  /** Update job applications */
  APPLICATION_UPDATE = 'application:update',
  /** Delete job applications */
  APPLICATION_DELETE = 'application:delete',

  // Newsletter Management
  /** View newsletter subscribers */
  NEWSLETTER_READ = 'newsletter:read',
  /** Manage newsletter */
  NEWSLETTER_MANAGE = 'newsletter:manage',

  // Media Management
  /** View media files */
  MEDIA_READ = 'media:read',
  /** Upload media files */
  MEDIA_UPLOAD = 'media:upload',
  /** Update media metadata */
  MEDIA_UPDATE = 'media:update',
  /** Delete media files */
  MEDIA_DELETE = 'media:delete',

  // Analytics
  /** View analytics dashboards */
  ANALYTICS_READ = 'analytics:read',
  /** Export analytics data */
  ANALYTICS_EXPORT = 'analytics:export',

  // Settings Management
  /** View system settings */
  SETTINGS_READ = 'settings:read',
  /** Update system settings */
  SETTINGS_UPDATE = 'settings:update',

  // Audit Logs
  /** View audit logs */
  AUDIT_READ = 'audit:read',
  /** Export audit logs */
  AUDIT_EXPORT = 'audit:export',

  // API Management
  /** View API keys */
  API_KEY_READ = 'api_key:read',
  /** Create API keys */
  API_KEY_CREATE = 'api_key:create',
  /** Revoke API keys */
  API_KEY_REVOKE = 'api_key:revoke',

  // Billing
  /** View billing information */
  BILLING_READ = 'billing:read',
  /** Manage billing */
  BILLING_MANAGE = 'billing:manage',

  // System Administration
  /** Access admin panel */
  ADMIN_ACCESS = 'admin:access',
  /** Manage system configuration */
  SYSTEM_CONFIG = 'system:config',
  /** View system health */
  SYSTEM_HEALTH = 'system:health',
  /** Perform maintenance tasks */
  SYSTEM_MAINTENANCE = 'system:maintenance',
}

/**
 * Permission display names for UI
 */
export const PermissionDisplayName: Record<Permission, string> = {
  // User Management
  [Permission.USER_READ]: 'View Users',
  [Permission.USER_CREATE]: 'Create Users',
  [Permission.USER_UPDATE]: 'Update Users',
  [Permission.USER_DELETE]: 'Delete Users',
  [Permission.USER_MANAGE_ROLES]: 'Manage User Roles',
  [Permission.USER_IMPERSONATE]: 'Impersonate Users',

  // Organization Management
  [Permission.ORG_READ]: 'View Organization',
  [Permission.ORG_CREATE]: 'Create Organization',
  [Permission.ORG_UPDATE]: 'Update Organization',
  [Permission.ORG_DELETE]: 'Delete Organization',
  [Permission.ORG_MANAGE_MEMBERS]: 'Manage Organization Members',

  // Project Management
  [Permission.PROJECT_READ]: 'View Projects',
  [Permission.PROJECT_CREATE]: 'Create Projects',
  [Permission.PROJECT_UPDATE]: 'Update Projects',
  [Permission.PROJECT_DELETE]: 'Delete Projects',
  [Permission.PROJECT_MANAGE_SETTINGS]: 'Manage Project Settings',
  [Permission.PROJECT_PUBLISH]: 'Publish Projects',

  // Content Management
  [Permission.CONTENT_READ]: 'View Content',
  [Permission.CONTENT_CREATE]: 'Create Content',
  [Permission.CONTENT_UPDATE]: 'Update Content',
  [Permission.CONTENT_DELETE]: 'Delete Content',
  [Permission.CONTENT_PUBLISH]: 'Publish Content',
  [Permission.CONTENT_ARCHIVE]: 'Archive Content',

  // Product Management
  [Permission.PRODUCT_READ]: 'View Products',
  [Permission.PRODUCT_CREATE]: 'Create Products',
  [Permission.PRODUCT_UPDATE]: 'Update Products',
  [Permission.PRODUCT_DELETE]: 'Delete Products',

  // Service Management
  [Permission.SERVICE_READ]: 'View Services',
  [Permission.SERVICE_CREATE]: 'Create Services',
  [Permission.SERVICE_UPDATE]: 'Update Services',
  [Permission.SERVICE_DELETE]: 'Delete Services',

  // Blog Management
  [Permission.BLOG_READ]: 'View Blog Posts',
  [Permission.BLOG_CREATE]: 'Create Blog Posts',
  [Permission.BLOG_UPDATE]: 'Update Blog Posts',
  [Permission.BLOG_DELETE]: 'Delete Blog Posts',
  [Permission.BLOG_PUBLISH]: 'Publish Blog Posts',

  // Comment Management
  [Permission.COMMENT_READ]: 'View Comments',
  [Permission.COMMENT_CREATE]: 'Create Comments',
  [Permission.COMMENT_UPDATE]: 'Update Comments',
  [Permission.COMMENT_DELETE]: 'Delete Comments',
  [Permission.COMMENT_MODERATE]: 'Moderate Comments',

  // Contact Management
  [Permission.CONTACT_READ]: 'View Contact Submissions',
  [Permission.CONTACT_UPDATE]: 'Update Contact Submissions',
  [Permission.CONTACT_DELETE]: 'Delete Contact Submissions',

  // Job Application Management
  [Permission.APPLICATION_READ]: 'View Job Applications',
  [Permission.APPLICATION_UPDATE]: 'Update Job Applications',
  [Permission.APPLICATION_DELETE]: 'Delete Job Applications',

  // Newsletter Management
  [Permission.NEWSLETTER_READ]: 'View Newsletter Subscribers',
  [Permission.NEWSLETTER_MANAGE]: 'Manage Newsletter',

  // Media Management
  [Permission.MEDIA_READ]: 'View Media',
  [Permission.MEDIA_UPLOAD]: 'Upload Media',
  [Permission.MEDIA_UPDATE]: 'Update Media',
  [Permission.MEDIA_DELETE]: 'Delete Media',

  // Analytics
  [Permission.ANALYTICS_READ]: 'View Analytics',
  [Permission.ANALYTICS_EXPORT]: 'Export Analytics',

  // Settings Management
  [Permission.SETTINGS_READ]: 'View Settings',
  [Permission.SETTINGS_UPDATE]: 'Update Settings',

  // Audit Logs
  [Permission.AUDIT_READ]: 'View Audit Logs',
  [Permission.AUDIT_EXPORT]: 'Export Audit Logs',

  // API Management
  [Permission.API_KEY_READ]: 'View API Keys',
  [Permission.API_KEY_CREATE]: 'Create API Keys',
  [Permission.API_KEY_REVOKE]: 'Revoke API Keys',

  // Billing
  [Permission.BILLING_READ]: 'View Billing',
  [Permission.BILLING_MANAGE]: 'Manage Billing',

  // System Administration
  [Permission.ADMIN_ACCESS]: 'Access Admin Panel',
  [Permission.SYSTEM_CONFIG]: 'System Configuration',
  [Permission.SYSTEM_HEALTH]: 'View System Health',
  [Permission.SYSTEM_MAINTENANCE]: 'System Maintenance',
};

/**
 * Permission categories for grouping in UI
 */
export enum PermissionCategory {
  USER = 'User Management',
  ORGANIZATION = 'Organization',
  PROJECT = 'Project',
  CONTENT = 'Content',
  PRODUCT = 'Product',
  SERVICE = 'Service',
  BLOG = 'Blog',
  COMMENT = 'Comment',
  CONTACT = 'Contact',
  APPLICATION = 'Job Applications',
  NEWSLETTER = 'Newsletter',
  MEDIA = 'Media',
  ANALYTICS = 'Analytics',
  SETTINGS = 'Settings',
  AUDIT = 'Audit',
  API = 'API',
  BILLING = 'Billing',
  SYSTEM = 'System',
}

/**
 * Permission to category mapping
 */
export const PermissionCategoryMap: Record<Permission, PermissionCategory> = {
  [Permission.USER_READ]: PermissionCategory.USER,
  [Permission.USER_CREATE]: PermissionCategory.USER,
  [Permission.USER_UPDATE]: PermissionCategory.USER,
  [Permission.USER_DELETE]: PermissionCategory.USER,
  [Permission.USER_MANAGE_ROLES]: PermissionCategory.USER,
  [Permission.USER_IMPERSONATE]: PermissionCategory.USER,

  [Permission.ORG_READ]: PermissionCategory.ORGANIZATION,
  [Permission.ORG_CREATE]: PermissionCategory.ORGANIZATION,
  [Permission.ORG_UPDATE]: PermissionCategory.ORGANIZATION,
  [Permission.ORG_DELETE]: PermissionCategory.ORGANIZATION,
  [Permission.ORG_MANAGE_MEMBERS]: PermissionCategory.ORGANIZATION,

  [Permission.PROJECT_READ]: PermissionCategory.PROJECT,
  [Permission.PROJECT_CREATE]: PermissionCategory.PROJECT,
  [Permission.PROJECT_UPDATE]: PermissionCategory.PROJECT,
  [Permission.PROJECT_DELETE]: PermissionCategory.PROJECT,
  [Permission.PROJECT_MANAGE_SETTINGS]: PermissionCategory.PROJECT,
  [Permission.PROJECT_PUBLISH]: PermissionCategory.PROJECT,

  [Permission.CONTENT_READ]: PermissionCategory.CONTENT,
  [Permission.CONTENT_CREATE]: PermissionCategory.CONTENT,
  [Permission.CONTENT_UPDATE]: PermissionCategory.CONTENT,
  [Permission.CONTENT_DELETE]: PermissionCategory.CONTENT,
  [Permission.CONTENT_PUBLISH]: PermissionCategory.CONTENT,
  [Permission.CONTENT_ARCHIVE]: PermissionCategory.CONTENT,

  [Permission.PRODUCT_READ]: PermissionCategory.PRODUCT,
  [Permission.PRODUCT_CREATE]: PermissionCategory.PRODUCT,
  [Permission.PRODUCT_UPDATE]: PermissionCategory.PRODUCT,
  [Permission.PRODUCT_DELETE]: PermissionCategory.PRODUCT,

  [Permission.SERVICE_READ]: PermissionCategory.SERVICE,
  [Permission.SERVICE_CREATE]: PermissionCategory.SERVICE,
  [Permission.SERVICE_UPDATE]: PermissionCategory.SERVICE,
  [Permission.SERVICE_DELETE]: PermissionCategory.SERVICE,

  [Permission.BLOG_READ]: PermissionCategory.BLOG,
  [Permission.BLOG_CREATE]: PermissionCategory.BLOG,
  [Permission.BLOG_UPDATE]: PermissionCategory.BLOG,
  [Permission.BLOG_DELETE]: PermissionCategory.BLOG,
  [Permission.BLOG_PUBLISH]: PermissionCategory.BLOG,

  [Permission.COMMENT_READ]: PermissionCategory.COMMENT,
  [Permission.COMMENT_CREATE]: PermissionCategory.COMMENT,
  [Permission.COMMENT_UPDATE]: PermissionCategory.COMMENT,
  [Permission.COMMENT_DELETE]: PermissionCategory.COMMENT,
  [Permission.COMMENT_MODERATE]: PermissionCategory.COMMENT,

  [Permission.CONTACT_READ]: PermissionCategory.CONTACT,
  [Permission.CONTACT_UPDATE]: PermissionCategory.CONTACT,
  [Permission.CONTACT_DELETE]: PermissionCategory.CONTACT,

  [Permission.APPLICATION_READ]: PermissionCategory.APPLICATION,
  [Permission.APPLICATION_UPDATE]: PermissionCategory.APPLICATION,
  [Permission.APPLICATION_DELETE]: PermissionCategory.APPLICATION,

  [Permission.NEWSLETTER_READ]: PermissionCategory.NEWSLETTER,
  [Permission.NEWSLETTER_MANAGE]: PermissionCategory.NEWSLETTER,

  [Permission.MEDIA_READ]: PermissionCategory.MEDIA,
  [Permission.MEDIA_UPLOAD]: PermissionCategory.MEDIA,
  [Permission.MEDIA_UPDATE]: PermissionCategory.MEDIA,
  [Permission.MEDIA_DELETE]: PermissionCategory.MEDIA,

  [Permission.ANALYTICS_READ]: PermissionCategory.ANALYTICS,
  [Permission.ANALYTICS_EXPORT]: PermissionCategory.ANALYTICS,

  [Permission.SETTINGS_READ]: PermissionCategory.SETTINGS,
  [Permission.SETTINGS_UPDATE]: PermissionCategory.SETTINGS,

  [Permission.AUDIT_READ]: PermissionCategory.AUDIT,
  [Permission.AUDIT_EXPORT]: PermissionCategory.AUDIT,

  [Permission.API_KEY_READ]: PermissionCategory.API,
  [Permission.API_KEY_CREATE]: PermissionCategory.API,
  [Permission.API_KEY_REVOKE]: PermissionCategory.API,

  [Permission.BILLING_READ]: PermissionCategory.BILLING,
  [Permission.BILLING_MANAGE]: PermissionCategory.BILLING,

  [Permission.ADMIN_ACCESS]: PermissionCategory.SYSTEM,
  [Permission.SYSTEM_CONFIG]: PermissionCategory.SYSTEM,
  [Permission.SYSTEM_HEALTH]: PermissionCategory.SYSTEM,
  [Permission.SYSTEM_MAINTENANCE]: PermissionCategory.SYSTEM,
};

/**
 * Default permissions for each role
 */
export const DefaultRolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions

  [Role.ADMIN]: [
    // User Management (except impersonate)
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,

    // Organization Management
    Permission.ORG_READ,
    Permission.ORG_UPDATE,
    Permission.ORG_MANAGE_MEMBERS,

    // Project Management
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_SETTINGS,
    Permission.PROJECT_PUBLISH,

    // Content Management
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.CONTENT_ARCHIVE,

    // Media Management
    Permission.MEDIA_READ,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_UPDATE,
    Permission.MEDIA_DELETE,

    // Analytics
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,

    // Settings
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,

    // Audit
    Permission.AUDIT_READ,
    Permission.AUDIT_EXPORT,

    // API Keys
    Permission.API_KEY_READ,
    Permission.API_KEY_CREATE,
    Permission.API_KEY_REVOKE,

    // Billing
    Permission.BILLING_READ,
    Permission.BILLING_MANAGE,

    // Admin
    Permission.ADMIN_ACCESS,
    Permission.SYSTEM_HEALTH,

    // Job Applications
    Permission.APPLICATION_READ,
    Permission.APPLICATION_UPDATE,
    Permission.APPLICATION_DELETE,
  ],

  [Role.EDITOR]: [
    // User Management (read only)
    Permission.USER_READ,

    // Organization (read only)
    Permission.ORG_READ,

    // Project Management
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_PUBLISH,

    // Content Management
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.CONTENT_ARCHIVE,

    // Media Management
    Permission.MEDIA_READ,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_UPDATE,
    Permission.MEDIA_DELETE,

    // Analytics (read only)
    Permission.ANALYTICS_READ,
  ],

  [Role.VIEWER]: [
    // Read-only permissions
    Permission.USER_READ,
    Permission.ORG_READ,
    Permission.PROJECT_READ,
    Permission.CONTENT_READ,
    Permission.MEDIA_READ,
    Permission.ANALYTICS_READ,
  ],
};

/**
 * Array of all permissions
 */
export const AllPermissions: Permission[] = Object.values(Permission);

/**
 * Checks if a role has a specific permission by default
 * @param role - The role to check
 * @param permission - The permission to check for
 * @returns True if the role has the permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return DefaultRolePermissions[role].includes(permission);
}

/**
 * Gets all permissions for a role
 * @param role - The role
 * @returns Array of permissions
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return DefaultRolePermissions[role];
}

/**
 * Gets permissions by category
 * @param category - The category to filter by
 * @returns Array of permissions in that category
 */
export function getPermissionsByCategory(
  category: PermissionCategory,
): Permission[] {
  return AllPermissions.filter(
    (permission) => PermissionCategoryMap[permission] === category,
  );
}

/**
 * Validates if a permission string is a valid Permission enum value
 * @param permission - The permission string to validate
 * @returns True if the permission is valid
 */
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission);
}

/**
 * Checks if a user has all required permissions
 * @param userPermissions - Array of user's permissions
 * @param requiredPermissions - Array of required permissions
 * @returns True if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Checks if a user has any of the required permissions
 * @param userPermissions - Array of user's permissions
 * @param requiredPermissions - Array of required permissions
 * @returns True if user has at least one required permission
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Gets the difference between two permission sets
 * @param basePermissions - Base set of permissions
 * @param comparePermissions - Set to compare against
 * @returns Permissions in base but not in compare
 */
export function getPermissionDifference(
  basePermissions: Permission[],
  comparePermissions: Permission[],
): Permission[] {
  return basePermissions.filter(
    (permission) => !comparePermissions.includes(permission),
  );
}
