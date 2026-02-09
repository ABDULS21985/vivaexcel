import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for marking routes as public
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public (no authentication required)
 *
 * When applied to a controller method, the JWT authentication guard
 * will skip authentication checks for that route.
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login(@Body() loginDto: LoginDto) {
 *     return this.authService.login(loginDto);
 *   }
 * }
 * ```
 *
 * @returns MethodDecorator & ClassDecorator
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
