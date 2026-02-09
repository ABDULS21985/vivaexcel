import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthErrorCode } from '../constants/error-codes.constant';

/**
 * JWT authentication guard that protects routes requiring authentication.
 *
 * Features:
 * - Extends Passport JWT strategy
 * - Supports @Public() decorator to bypass authentication
 * - Custom error handling with error codes
 * - Token validation and user extraction
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * const reflector = app.get(Reflector);
 * app.useGlobalGuards(new JwtAuthGuard(reflector));
 * ```
 *
 * @example
 * // Apply to specific controller
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Controller('users')
 * export class UsersController {}
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the current request should be allowed
   * @param context - Execution context containing request details
   * @returns Boolean or Promise/Observable of boolean
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Delegate to Passport JWT strategy
    return super.canActivate(context);
  }

  /**
   * Handles the result of authentication
   * @param err - Error from Passport
   * @param user - Authenticated user payload
   * @param info - Additional info from Passport
   * @param _context - Execution context
   * @param _status - Status (unused)
   * @returns The authenticated user
   * @throws UnauthorizedException if authentication fails
   */
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    // Handle Passport errors
    if (err) {
      this.logger.warn(`Authentication error: ${err.message}`);
      throw new UnauthorizedException({
        message: 'Authentication failed',
        code: AuthErrorCode.INVALID_TOKEN,
      });
    }

    // Handle missing user (invalid token)
    if (!user) {
      const message = this.getErrorMessage(info);
      const code = this.getErrorCode(info);

      this.logger.warn(`Authentication failed: ${message}`);
      throw new UnauthorizedException({
        message,
        code,
      });
    }

    return user;
  }

  /**
   * Gets a user-friendly error message from Passport info
   * @param info - Error info from Passport
   * @returns Human-readable error message
   */
  private getErrorMessage(info: Error | undefined): string {
    if (!info) {
      return 'Invalid access token';
    }

    // Handle JWT-specific errors
    if (info.name === 'TokenExpiredError') {
      return 'Access token has expired';
    }

    if (info.name === 'JsonWebTokenError') {
      return 'Invalid access token';
    }

    if (info.name === 'NotBeforeError') {
      return 'Token not yet valid';
    }

    if (info.message === 'No auth token') {
      return 'No authorization token provided';
    }

    return info.message || 'Authentication failed';
  }

  /**
   * Gets the appropriate error code from Passport info
   * @param info - Error info from Passport
   * @returns Error code
   */
  private getErrorCode(info: Error | undefined): string {
    if (!info) {
      return AuthErrorCode.INVALID_TOKEN;
    }

    if (info.name === 'TokenExpiredError') {
      return AuthErrorCode.TOKEN_EXPIRED;
    }

    return AuthErrorCode.INVALID_TOKEN;
  }
}

/**
 * Optional JWT auth guard that doesn't fail on missing tokens.
 * Useful for routes that work for both authenticated and anonymous users.
 *
 * @example
 * ```typescript
 * @UseGuards(OptionalJwtAuthGuard)
 * @Get('posts')
 * findAll(@CurrentUser() user?: JwtUserPayload) {
 *   // user is undefined for anonymous requests
 * }
 * ```
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Always allows the request through, but attempts authentication
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles authentication result without throwing on failure
   * @param _err - Error from Passport (ignored)
   * @param user - Authenticated user payload
   * @returns The user or null
   */
  handleRequest<TUser = unknown>(
    _err: Error | null,
    user: TUser | false,
  ): TUser | null {
    // Return user if authenticated, null otherwise (don't throw)
    return user || null;
  }
}
