import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Interface representing the authenticated user payload from JWT
 */
export interface JwtUserPayload {
  /** User's unique identifier */
  sub: string;
  /** User's ID (returned by JWT strategy validate) */
  userId: string;
  /** User's email address */
  email: string;
  /** User's role */
  role: string;
  /** User's permissions */
  permissions?: string[];
  /** Organization ID (if applicable) */
  organizationId?: string;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
}

/**
 * Extended Request interface with user property
 */
export interface RequestWithUser extends Request {
  user: JwtUserPayload;
}

/**
 * Parameter decorator to extract the current authenticated user from the request
 *
 * @example
 * // Get the entire user object
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtUserPayload) {
 *   return this.userService.findById(user.sub);
 * }
 * ```
 *
 * @example
 * // Get a specific property from the user object
 * ```typescript
 * @Get('my-items')
 * getMyItems(@CurrentUser('sub') userId: string) {
 *   return this.itemService.findByUserId(userId);
 * }
 * ```
 *
 * @example
 * // Get multiple properties
 * ```typescript
 * @Post('create')
 * create(
 *   @CurrentUser('sub') userId: string,
 *   @CurrentUser('organizationId') orgId: string,
 *   @Body() createDto: CreateDto,
 * ) {
 *   return this.service.create(createDto, userId, orgId);
 * }
 * ```
 *
 * @param data - Optional property key to extract from the user object
 * @returns The user object or specified property value
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Decorator to get the current user's ID (sub claim)
 *
 * @example
 * ```typescript
 * @Get('my-profile')
 * getMyProfile(@UserId() userId: string) {
 *   return this.userService.findById(userId);
 * }
 * ```
 */
export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.sub ?? null;
  },
);

/**
 * Decorator to get the current user's email
 *
 * @example
 * ```typescript
 * @Post('send-verification')
 * sendVerification(@UserEmail() email: string) {
 *   return this.emailService.sendVerification(email);
 * }
 * ```
 */
export const UserEmail = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.email ?? null;
  },
);

/**
 * Decorator to get the current user's role
 *
 * @example
 * ```typescript
 * @Get('dashboard')
 * getDashboard(@UserRole() role: string) {
 *   return this.dashboardService.getForRole(role);
 * }
 * ```
 */
export const UserRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.role ?? null;
  },
);

/**
 * Decorator to get the current user's organization ID
 *
 * @example
 * ```typescript
 * @Get('team')
 * getTeam(@UserOrganizationId() orgId: string) {
 *   return this.teamService.findByOrganization(orgId);
 * }
 * ```
 */
export const UserOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.organizationId ?? null;
  },
);

/**
 * Decorator to get the current user's permissions
 *
 * @example
 * ```typescript
 * @Get('features')
 * getFeatures(@UserPermissions() permissions: string[]) {
 *   return this.featureService.getAvailable(permissions);
 * }
 * ```
 */
export const UserPermissions = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.permissions ?? [];
  },
);
