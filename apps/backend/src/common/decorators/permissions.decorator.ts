import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Permission } from '../constants/permissions.constant';

/**
 * Metadata key for storing required permissions
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Metadata key for permission check mode (all vs any)
 */
export const PERMISSIONS_MODE_KEY = 'permissionsMode';

/**
 * Permission check modes
 */
export enum PermissionMode {
  /** User must have ALL specified permissions */
  ALL = 'all',
  /** User must have ANY of the specified permissions */
  ANY = 'any',
}

/**
 * Decorator to require specific permissions for a route
 *
 * By default, requires ALL specified permissions (AND logic).
 * Use @RequireAnyPermission for OR logic.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   @RequirePermissions(Permission.USER_READ)
 *   @Get()
 *   findAll() {
 *     return this.usersService.findAll();
 *   }
 *
 *   @RequirePermissions(Permission.USER_CREATE, Permission.USER_UPDATE)
 *   @Post()
 *   create(@Body() createDto: CreateUserDto) {
 *     return this.usersService.create(createDto);
 *   }
 * }
 * ```
 *
 * @param permissions - One or more permissions required to access the route
 * @returns MethodDecorator & ClassDecorator
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, PermissionMode.ALL),
  );

/**
 * Decorator to require ANY of the specified permissions (OR logic)
 *
 * @example
 * ```typescript
 * @Controller('content')
 * export class ContentController {
 *   @RequireAnyPermission(Permission.CONTENT_CREATE, Permission.CONTENT_UPDATE)
 *   @Post()
 *   saveContent(@Body() dto: SaveContentDto) {
 *     return this.contentService.save(dto);
 *   }
 * }
 * ```
 *
 * @param permissions - Permissions where at least one is required
 * @returns MethodDecorator & ClassDecorator
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, PermissionMode.ANY),
  );

/**
 * Decorator factory for common permission groups
 */
export const PermissionDecorators = {
  /**
   * Requires user read permission
   */
  CanReadUsers: () => RequirePermissions(Permission.USER_READ),

  /**
   * Requires user create permission
   */
  CanCreateUsers: () => RequirePermissions(Permission.USER_CREATE),

  /**
   * Requires user update permission
   */
  CanUpdateUsers: () => RequirePermissions(Permission.USER_UPDATE),

  /**
   * Requires user delete permission
   */
  CanDeleteUsers: () => RequirePermissions(Permission.USER_DELETE),

  /**
   * Requires content read permission
   */
  CanReadContent: () => RequirePermissions(Permission.CONTENT_READ),

  /**
   * Requires content create permission
   */
  CanCreateContent: () => RequirePermissions(Permission.CONTENT_CREATE),

  /**
   * Requires content update permission
   */
  CanUpdateContent: () => RequirePermissions(Permission.CONTENT_UPDATE),

  /**
   * Requires content delete permission
   */
  CanDeleteContent: () => RequirePermissions(Permission.CONTENT_DELETE),

  /**
   * Requires content publish permission
   */
  CanPublishContent: () => RequirePermissions(Permission.CONTENT_PUBLISH),

  /**
   * Requires admin access permission
   */
  CanAccessAdmin: () => RequirePermissions(Permission.ADMIN_ACCESS),

  /**
   * Requires system configuration permission
   */
  CanConfigureSystem: () => RequirePermissions(Permission.SYSTEM_CONFIG),

  /**
   * Requires full content management (create, update, delete, publish)
   */
  FullContentAccess: () =>
    RequirePermissions(
      Permission.CONTENT_CREATE,
      Permission.CONTENT_UPDATE,
      Permission.CONTENT_DELETE,
      Permission.CONTENT_PUBLISH,
    ),

  /**
   * Requires full user management (create, update, delete, manage roles)
   */
  FullUserAccess: () =>
    RequirePermissions(
      Permission.USER_CREATE,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      Permission.USER_MANAGE_ROLES,
    ),
};
