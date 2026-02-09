import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { CacheService, DEFAULT_TTL } from '../cache/cache.service';
import {
  CACHE_KEY,
  CACHE_TTL,
  CACHE_TAGS,
  SKIP_CACHE,
} from '../decorators/cache.decorator';

// Extend Express Request to include user property
interface RequestWithUser extends Request {
  user?: { id: string; [key: string]: unknown };
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;

    // Skip cache decorator check
    const skipCache = this.reflector.getAllAndOverride<boolean>(SKIP_CACHE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCache) {
      return next.handle();
    }

    // Only cache GET requests
    if (method !== 'GET') {
      // For mutating requests, invalidate related cache
      return next.handle().pipe(
        tap(() => {
          this.handleCacheInvalidation(context, method);
        }),
      );
    }

    // Skip caching for authenticated user-specific data
    if (this.isUserSpecificRequest(request)) {
      this.logger.debug('Skipping cache for user-specific request');
      return next.handle();
    }

    // Get cache configuration from decorators
    const cacheKeyTemplate = this.reflector.getAllAndOverride<string>(
      CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const cacheTtl =
      this.reflector.getAllAndOverride<number>(CACHE_TTL, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_TTL;

    const cacheTags = this.reflector.getAllAndOverride<string[]>(CACHE_TAGS, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Generate cache key
    const cacheKey = this.generateCacheKey(request, cacheKeyTemplate);

    // Try to get cached response
    try {
      const cached = await this.cacheService.get<unknown>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for ${cacheKey}`);
        return of(cached);
      }
    } catch (error) {
      this.logger.warn(`Cache read failed: ${(error as Error).message}`);
    }

    this.logger.debug(`Cache MISS for ${cacheKey}`);

    // Execute handler and cache the result
    return next.handle().pipe(
      tap(async (response) => {
        try {
          if (cacheTags && cacheTags.length > 0) {
            await this.cacheService.wrap(
              cacheKey,
              () => Promise.resolve(response),
              { ttl: cacheTtl, tags: cacheTags },
            );
          } else {
            await this.cacheService.set(cacheKey, response, cacheTtl);
          }
          this.logger.debug(`Cached response for ${cacheKey}`);
        } catch (error) {
          this.logger.warn(`Cache write failed: ${(error as Error).message}`);
        }
      }),
    );
  }

  /**
   * Check if the request is user-specific (should not be cached)
   */
  private isUserSpecificRequest(request: RequestWithUser): boolean {
    // Skip caching if user is authenticated and request appears to be user-specific
    if (request.user) {
      const path = request.path.toLowerCase();
      const userSpecificPatterns = [
        '/me',
        '/profile',
        '/dashboard',
        '/my-',
        '/user/',
        '/account',
      ];

      return userSpecificPatterns.some((pattern) => path.includes(pattern));
    }

    return false;
  }

  /**
   * Generate a cache key for the request
   */
  private generateCacheKey(
    request: RequestWithUser,
    keyTemplate?: string,
  ): string {
    if (keyTemplate) {
      // Replace placeholders with actual values from params
      let key = keyTemplate;
      const params = request.params || {};

      for (const [param, value] of Object.entries(params)) {
        key = key.replace(`:${param}`, String(value));
      }

      return key;
    }

    // Default key generation: method:path:queryString
    const queryString = this.serializeQuery(request.query as Record<string, unknown>);
    const baseKey = `cache:${request.method}:${request.path}`;

    return queryString ? `${baseKey}?${queryString}` : baseKey;
  }

  /**
   * Serialize query parameters for cache key
   */
  private serializeQuery(query: Record<string, unknown>): string {
    if (!query || Object.keys(query).length === 0) {
      return '';
    }

    // Sort keys for consistent cache keys
    const sortedKeys = Object.keys(query).sort();
    return sortedKeys
      .map((key) => `${key}=${String(query[key])}`)
      .join('&');
  }

  /**
   * Handle cache invalidation for mutating requests
   */
  private async handleCacheInvalidation(
    context: ExecutionContext,
    method: string,
  ): Promise<void> {
    const cacheTags = this.reflector.getAllAndOverride<string[]>(CACHE_TAGS, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (cacheTags && cacheTags.length > 0) {
      try {
        await this.cacheService.invalidateByTags(cacheTags);
        this.logger.debug(
          `Invalidated cache for tags: ${cacheTags.join(', ')} after ${method} request`,
        );
      } catch (error) {
        this.logger.warn(
          `Cache invalidation failed: ${(error as Error).message}`,
        );
      }
    }
  }
}
