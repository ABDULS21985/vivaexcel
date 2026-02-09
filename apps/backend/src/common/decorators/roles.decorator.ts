import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles.constant';

/**
 * Metadata key for storing required roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 *
 * When applied to a controller method, the RolesGuard will check
 * if the authenticated user has at least one of the specified roles.
 *
 * @example
 * ```typescript
 * @Controller('admin')
 * export class AdminController {
 *   @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 *   @Get('dashboard')
 *   getDashboard() {
 *     return this.adminService.getDashboard();
 *   }
 * }
 * ```
 *
 * @example
 * // Apply to entire controller
 * ```typescript
 * @Controller('admin')
 * @Roles(Role.ADMIN)
 * export class AdminController {
 *   // All routes require ADMIN role
 * }
 * ```
 *
 * @param roles - One or more roles that are allowed to access the route
 * @returns MethodDecorator & ClassDecorator
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to require admin roles (ADMIN or SUPER_ADMIN)
 *
 * @example
 * ```typescript
 * @AdminOnly()
 * @Get('settings')
 * getSettings() {
 *   return this.settingsService.getAll();
 * }
 * ```
 *
 * @returns MethodDecorator & ClassDecorator
 */
export const AdminOnly = () => Roles(Role.ADMIN, Role.SUPER_ADMIN);

/**
 * Decorator to require super admin role
 *
 * @example
 * ```typescript
 * @SuperAdminOnly()
 * @Delete('users/:id')
 * deleteUser(@Param('id') id: string) {
 *   return this.userService.delete(id);
 * }
 * ```
 *
 * @returns MethodDecorator & ClassDecorator
 */
export const SuperAdminOnly = () => Roles(Role.SUPER_ADMIN);

/**
 * Decorator to require content management roles (EDITOR, ADMIN, or SUPER_ADMIN)
 *
 * @example
 * ```typescript
 * @ContentManagerOnly()
 * @Post('articles')
 * createArticle(@Body() createDto: CreateArticleDto) {
 *   return this.articleService.create(createDto);
 * }
 * ```
 *
 * @returns MethodDecorator & ClassDecorator
 */
export const ContentManagerOnly = () =>
  Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN);
