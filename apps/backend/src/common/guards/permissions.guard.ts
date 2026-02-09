import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PERMISSIONS_MODE_KEY,
  PermissionMode,
} from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Permission, hasAllPermissions, hasAnyPermission } from '../constants/permissions.constant';
import { AuthErrorCode } from '../constants/error-codes.constant';
import { JwtUserPayload } from '../decorators/current-user.decorator';

/**
 * Permission-based access control guard.
 *
 * Checks if the authenticated user has the required permissions
 * to access the route. Supports both ALL (AND) and ANY (OR) modes.
 *
 * Features:
 * - Supports @Public() decorator to bypass checks
 * - ALL mode: User must have all specified permissions
 * - ANY mode: User must have at least one specified permission
 * - Custom error messages with error codes
 * - Permission list in JWT payload
 *
 * @example
 * // Require all permissions (AND logic)
 * ```typescript
 * @RequirePermissions(Permission.USER_READ, Permission.USER_UPDATE)
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Put('users/:id')
 * updateUser() {}
 * ```
 *
 * @example
 * // Require any permission (OR logic)
 * ```typescript
 * @RequireAnyPermission(Permission.CONTENT_CREATE, Permission.CONTENT_UPDATE)
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Post('content')
 * saveContent() {}
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current request should be allowed based on permissions
   * @param context - Execution context containing request details
   * @returns True if access is allowed
   * @throws ForbiddenException if user doesn't have required permissions
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get permission check mode (default to ALL)
    const mode = this.reflector.getAllAndOverride<PermissionMode>(
      PERMISSIONS_MODE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? PermissionMode.ALL;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    // No user on request means not authenticated
    if (!user) {
      this.logger.warn('PermissionsGuard: No user found on request');
      throw new ForbiddenException({
        message: 'Access denied',
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    const userPermissions = (user.permissions || []) as Permission[];

    // Check permissions based on mode
    const hasPermission = this.checkPermissions(
      userPermissions,
      requiredPermissions,
      mode,
    );

    if (!hasPermission) {
      const modeText = mode === PermissionMode.ALL ? 'all of' : 'any of';
      this.logger.warn(
        `PermissionsGuard: User ${user.sub} denied access. Required ${modeText}: ${requiredPermissions.join(', ')}. Has: ${userPermissions.join(', ')}`,
      );
      throw new ForbiddenException({
        message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    return true;
  }

  /**
   * Checks if user has required permissions based on mode
   * @param userPermissions - User's permissions array
   * @param requiredPermissions - Required permissions array
   * @param mode - Check mode (ALL or ANY)
   * @returns True if user has required permissions
   */
  private checkPermissions(
    userPermissions: Permission[],
    requiredPermissions: Permission[],
    mode: PermissionMode,
  ): boolean {
    if (mode === PermissionMode.ALL) {
      return hasAllPermissions(userPermissions, requiredPermissions);
    }
    return hasAnyPermission(userPermissions, requiredPermissions);
  }
}

/**
 * Combined roles and permissions guard.
 *
 * Checks both role and permission requirements.
 * User must satisfy BOTH role and permission checks.
 *
 * @example
 * ```typescript
 * @Roles(Role.ADMIN)
 * @RequirePermissions(Permission.USER_DELETE)
 * @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
 * @Delete('users/:id')
 * deleteUser() {}
 * ```
 */
@Injectable()
export class RolesAndPermissionsGuard implements CanActivate {
  private readonly logger = new Logger(RolesAndPermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    if (!user) {
      throw new ForbiddenException({
        message: 'Access denied',
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    // Check roles (imported from roles.constant to avoid circular dependency)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        this.logger.warn(
          `RolesAndPermissionsGuard: User ${user.sub} role check failed`,
        );
        throw new ForbiddenException({
          message: 'Access denied. Insufficient role.',
          code: AuthErrorCode.ROLE_NOT_ALLOWED,
        });
      }
    }

    // Check permissions
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const mode =
        this.reflector.getAllAndOverride<PermissionMode>(PERMISSIONS_MODE_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) ?? PermissionMode.ALL;

      const userPermissions = (user.permissions || []) as Permission[];

      const hasPermission =
        mode === PermissionMode.ALL
          ? hasAllPermissions(userPermissions, requiredPermissions)
          : hasAnyPermission(userPermissions, requiredPermissions);

      if (!hasPermission) {
        this.logger.warn(
          `RolesAndPermissionsGuard: User ${user.sub} permission check failed`,
        );
        throw new ForbiddenException({
          message: 'Access denied. Insufficient permissions.',
          code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        });
      }
    }

    return true;
  }
}
