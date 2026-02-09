import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtUserPayload } from '../decorators/current-user.decorator';

/**
 * Content access guard for blog posts.
 *
 * This guard works as a pass-through that enriches the request with
 * content access metadata. It does NOT block access; instead, it sets
 * `req.contentAccessLevel` so downstream services can decide how much
 * content to return (full vs. gated preview).
 *
 * Access levels:
 * - 'full': The user can see the complete post content
 * - 'preview': The user can only see a gated preview (title, excerpt,
 *   first 3 paragraphs, cover image)
 *
 * The actual gating logic (checking visibility, subscription tier, etc.)
 * is performed by `PostsService.applyContentGating()`. This guard simply
 * ensures the user identity is available on the request and signals that
 * content gating should be applied.
 *
 * Usage:
 * ```typescript
 * @UseGuards(ContentAccessGuard)
 * @Get('slug/:slug')
 * findBySlug(@Param('slug') slug: string, @CurrentUser('sub') userId?: string) { ... }
 * ```
 */
@Injectable()
export class ContentAccessGuard implements CanActivate {
  private readonly logger = new Logger(ContentAccessGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    // Mark the request so the service knows content gating is active
    request.contentGatingEnabled = true;

    if (isPublic && !user) {
      // Anonymous user on a public route - service will handle gating
      request.contentAccessLevel = 'preview';
      this.logger.debug('ContentAccessGuard: Anonymous access, gating may apply');
    } else if (user) {
      // Authenticated user - service will check tier access
      request.contentAccessLevel = 'full';
      this.logger.debug(
        `ContentAccessGuard: Authenticated user ${user.sub}, service will verify tier`,
      );
    } else {
      // No user and not public - should be caught by JwtAuthGuard first
      request.contentAccessLevel = 'preview';
    }

    // Always allow the request through; content gating is handled at the
    // service/response level, not by blocking the request.
    return true;
  }
}
