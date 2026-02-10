import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { ApiKeysService } from '../api-keys.service';
import { API_KEY_SCOPES_KEY } from '../decorators/require-scopes.decorator';
import { ApiKey } from '../entities/api-key.entity';

/**
 * Extend Express Request to include the apiKey property
 */
declare module 'express' {
  interface Request {
    apiKey?: ApiKey;
  }
}

/**
 * Guard that handles API key authentication.
 *
 * Authentication flow:
 * 1. Check for API key in Authorization header ("Bearer kt_...") or query param (?api_key=kt_...)
 * 2. If an API key is found:
 *    a. Validate the key (hash, status, expiry)
 *    b. Check required scopes (from @RequireScopes decorator)
 *    c. Enforce rate limiting
 *    d. Check origin and IP restrictions
 *    e. Set rate-limit headers
 *    f. Attach apiKey to request
 * 3. If no API key is found, fall through to allow JWT auth to handle it (return true)
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract API key from request
    const key = this.extractApiKey(request);

    // If no API key provided, fall through to let JwtAuthGuard handle
    if (!key) {
      return true;
    }

    // Validate the API key
    const apiKey = await this.apiKeysService.validateApiKey(key);

    if (!apiKey) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_API_KEY',
          message: 'The provided API key is invalid, expired, or has exceeded its limits.',
          status: 401,
        },
      });
    }

    // Check required scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      API_KEY_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredScopes && requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every((scope) =>
        apiKey.scopes.includes(scope),
      );

      if (!hasAllScopes) {
        throw new ForbiddenException({
          error: {
            code: 'INSUFFICIENT_SCOPES',
            message: `This API key is missing required scopes: ${requiredScopes.join(', ')}`,
            status: 403,
          },
        });
      }
    }

    // Check origin restriction
    const origin = request.headers.origin as string | undefined;
    if (!this.apiKeysService.checkOrigin(apiKey, origin)) {
      throw new ForbiddenException({
        error: {
          code: 'ORIGIN_NOT_ALLOWED',
          message: 'Request origin is not allowed for this API key.',
          status: 403,
        },
      });
    }

    // Check IP restriction
    const clientIp = request.ip || request.socket.remoteAddress;
    if (!this.apiKeysService.checkIP(apiKey, clientIp)) {
      throw new ForbiddenException({
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Request IP is not allowed for this API key.',
          status: 403,
        },
      });
    }

    // Check rate limit
    const rateLimitResult = await this.apiKeysService.checkRateLimit(
      apiKey.keyPrefix,
      apiKey.rateLimit,
    );

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', String(apiKey.rateLimit));
    response.setHeader('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    response.setHeader('X-RateLimit-Reset', String(rateLimitResult.resetAt));

    if (!rateLimitResult.allowed) {
      throw new ForbiddenException({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Limit: ${apiKey.rateLimit} requests per minute.`,
          status: 429,
        },
      });
    }

    // Attach the API key to the request for downstream use
    request.apiKey = apiKey;

    return true;
  }

  /**
   * Extract the API key from the request.
   * Checks Authorization header first, then query parameter.
   */
  private extractApiKey(request: Request): string | null {
    // Check Authorization header: "Bearer kt_live_..." or "Bearer kt_test_..."
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (
        parts.length === 2 &&
        parts[0].toLowerCase() === 'bearer' &&
        (parts[1].startsWith('kt_live_') || parts[1].startsWith('kt_test_'))
      ) {
        return parts[1];
      }
    }

    // Check query parameter: ?api_key=kt_...
    const queryKey = request.query.api_key as string | undefined;
    if (
      queryKey &&
      (queryKey.startsWith('kt_live_') || queryKey.startsWith('kt_test_'))
    ) {
      return queryKey;
    }

    return null;
  }
}
