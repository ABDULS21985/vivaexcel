import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role, hasRolePrivilege, RoleHierarchy } from '../constants/roles.constant';
import { AuthErrorCode } from '../constants/error-codes.constant';
import { JwtUserPayload } from '../decorators/current-user.decorator';

/**
 * Role-based access control guard.
 *
 * Checks if the authenticated user has one of the required roles
 * to access the route. Supports role hierarchy where higher roles
 * automatically have access to lower role requirements.
 *
 * Features:
 * - Supports @Public() decorator to bypass checks
 * - Role hierarchy support (SUPER_ADMIN > ADMIN > EDITOR > VIEWER)
 * - Multiple roles with OR logic
 * - Custom error messages with error codes
 *
 * @example
 * // Apply with RolesGuard
 * ```typescript
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin/users')
 * getAdminUsers() {}
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current request should be allowed based on roles
   * @param context - Execution context containing request details
   * @returns True if access is allowed
   * @throws ForbiddenException if user doesn't have required role
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

    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    // No user on request means not authenticated
    if (!user) {
      this.logger.warn('RolesGuard: No user found on request');
      throw new ForbiddenException({
        message: 'Access denied',
        code: AuthErrorCode.ROLE_NOT_ALLOWED,
      });
    }

    const userRole = user.role as Role;

    // Check if user has any of the required roles (with hierarchy)
    const hasRole = this.checkRoleWithHierarchy(userRole, requiredRoles);

    if (!hasRole) {
      this.logger.warn(
        `RolesGuard: User ${user.sub} with role ${userRole} denied access. Required: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException({
        message: `Access denied. Required role: ${requiredRoles.join(' or ')}`,
        code: AuthErrorCode.ROLE_NOT_ALLOWED,
      });
    }

    return true;
  }

  /**
   * Checks if user role matches any required role, considering hierarchy
   * @param userRole - The user's role
   * @param requiredRoles - Array of acceptable roles
   * @returns True if user has sufficient role privilege
   */
  private checkRoleWithHierarchy(
    userRole: Role,
    requiredRoles: Role[],
  ): boolean {
    // If user role is not in hierarchy, deny
    if (!(userRole in RoleHierarchy)) {
      return false;
    }

    // Check if user role meets any of the required roles
    return requiredRoles.some((requiredRole) =>
      hasRolePrivilege(userRole, requiredRole),
    );
  }
}

/**
 * Strict role guard that requires exact role match (no hierarchy)
 *
 * @example
 * ```typescript
 * @Roles(Role.EDITOR)
 * @UseGuards(JwtAuthGuard, StrictRolesGuard)
 * @Get('editor-only')
 * editorOnly() {} // Only EDITOR role, not ADMIN or SUPER_ADMIN
 * ```
 */
@Injectable()
export class StrictRolesGuard implements CanActivate {
  private readonly logger = new Logger(StrictRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    if (!user) {
      throw new ForbiddenException({
        message: 'Access denied',
        code: AuthErrorCode.ROLE_NOT_ALLOWED,
      });
    }

    const hasRole = requiredRoles.includes(user.role as Role);

    if (!hasRole) {
      this.logger.warn(
        `StrictRolesGuard: User ${user.sub} with role ${user.role} denied access. Required: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException({
        message: `Access denied. Required role: ${requiredRoles.join(' or ')}`,
        code: AuthErrorCode.ROLE_NOT_ALLOWED,
      });
    }

    return true;
  }
}
